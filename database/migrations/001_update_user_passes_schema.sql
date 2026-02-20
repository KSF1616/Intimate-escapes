-- Migration: Update user_passes table for new pass system
-- This migration adds support for escape passes with usage tracking and 30-day activation

-- Add pass_category column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_passes' AND column_name = 'pass_category') THEN
        ALTER TABLE user_passes ADD COLUMN pass_category TEXT DEFAULT 'legacy';
    END IF;
END $$;

-- Add check constraint for pass_category
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.constraint_column_usage 
                   WHERE constraint_name = 'user_passes_pass_category_check') THEN
        ALTER TABLE user_passes ADD CONSTRAINT user_passes_pass_category_check 
            CHECK (pass_category IN ('escape', 'game', 'legacy'));
    END IF;
END $$;

-- Add escapes_remaining column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_passes' AND column_name = 'escapes_remaining') THEN
        ALTER TABLE user_passes ADD COLUMN escapes_remaining INTEGER DEFAULT 0;
    END IF;
END $$;

-- Add escapes_total column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_passes' AND column_name = 'escapes_total') THEN
        ALTER TABLE user_passes ADD COLUMN escapes_total INTEGER DEFAULT 0;
    END IF;
END $$;

-- Add activated_at column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_passes' AND column_name = 'activated_at') THEN
        ALTER TABLE user_passes ADD COLUMN activated_at TIMESTAMPTZ;
    END IF;
END $$;

-- Add linked_pass_id column for linking game passes to escape passes (Ultimate pack)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_passes' AND column_name = 'linked_pass_id') THEN
        ALTER TABLE user_passes ADD COLUMN linked_pass_id UUID REFERENCES user_passes(id);
    END IF;
END $$;

-- Add updated_at column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_passes' AND column_name = 'updated_at') THEN
        ALTER TABLE user_passes ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- Create index for faster queries on pass_category
CREATE INDEX IF NOT EXISTS idx_user_passes_pass_category ON user_passes(pass_category);

-- Create index for active passes lookup
CREATE INDEX IF NOT EXISTS idx_user_passes_active ON user_passes(user_id, is_active, expires_at);

-- Create index for escape passes with remaining escapes
CREATE INDEX IF NOT EXISTS idx_user_passes_escapes ON user_passes(user_id, pass_category, escapes_remaining) 
    WHERE pass_category = 'escape';

-- Update existing passes to have correct pass_category based on pass_type
UPDATE user_passes 
SET pass_category = CASE 
    WHEN pass_type IN ('escape_1_3', 'escape_4_6', 'escape_7_10', 'starter', 'explorer', 'ultimate') THEN 'escape'
    WHEN pass_type IN ('game_24h', 'game_14d', 'game_30d_free', 'game-24h', 'game-14d', 'game-30d', 'game-annual') THEN 'game'
    ELSE 'legacy'
END
WHERE pass_category IS NULL OR pass_category = 'legacy';

-- Set activated_at for existing passes that have expires_at but no activated_at
UPDATE user_passes 
SET activated_at = created_at
WHERE activated_at IS NULL AND expires_at IS NOT NULL AND is_active = true;

-- Helper function to get escape count based on pass type
CREATE OR REPLACE FUNCTION get_escape_count(p_pass_type TEXT)
RETURNS INTEGER AS $$
BEGIN
    RETURN CASE p_pass_type
        WHEN 'escape_1_3' THEN 3
        WHEN 'escape_4_6' THEN 6
        WHEN 'escape_7_10' THEN 10
        WHEN 'starter' THEN 3
        WHEN 'explorer' THEN 6
        WHEN 'ultimate' THEN 10
        ELSE 0
    END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Helper function to activate a user's pass (starts 30-day countdown)
CREATE OR REPLACE FUNCTION activate_user_pass(p_pass_id UUID)
RETURNS TABLE(
    success BOOLEAN,
    activated_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    message TEXT
) AS $$
DECLARE
    v_pass RECORD;
    v_now TIMESTAMPTZ := NOW();
    v_expires_at TIMESTAMPTZ;
BEGIN
    -- Get the pass
    SELECT * INTO v_pass FROM user_passes WHERE id = p_pass_id;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, NULL::TIMESTAMPTZ, NULL::TIMESTAMPTZ, 'Pass not found'::TEXT;
        RETURN;
    END IF;
    
    -- Check if already activated
    IF v_pass.activated_at IS NOT NULL THEN
        RETURN QUERY SELECT TRUE, v_pass.activated_at, v_pass.expires_at, 'Pass already activated'::TEXT;
        RETURN;
    END IF;
    
    -- Calculate expiration (30 days from now for escape passes)
    v_expires_at := v_now + INTERVAL '30 days';
    
    -- Update the pass
    UPDATE user_passes 
    SET activated_at = v_now, 
        expires_at = v_expires_at,
        updated_at = v_now
    WHERE id = p_pass_id;
    
    -- Also activate any linked game pass
    UPDATE user_passes 
    SET activated_at = v_now, 
        expires_at = v_expires_at,
        updated_at = v_now
    WHERE linked_pass_id = p_pass_id AND activated_at IS NULL;
    
    RETURN QUERY SELECT TRUE, v_now, v_expires_at, 'Pass activated successfully'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Helper function to use an escape (decrement count)
CREATE OR REPLACE FUNCTION use_escape(p_pass_id UUID)
RETURNS TABLE(
    success BOOLEAN,
    escapes_remaining INTEGER,
    message TEXT
) AS $$
DECLARE
    v_pass RECORD;
    v_new_remaining INTEGER;
BEGIN
    -- Get the pass with lock
    SELECT * INTO v_pass FROM user_passes WHERE id = p_pass_id FOR UPDATE;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, 0, 'Pass not found'::TEXT;
        RETURN;
    END IF;
    
    -- Check if pass is active
    IF NOT v_pass.is_active THEN
        RETURN QUERY SELECT FALSE, 0, 'Pass is not active'::TEXT;
        RETURN;
    END IF;
    
    -- Check if pass has expired
    IF v_pass.expires_at IS NOT NULL AND v_pass.expires_at < NOW() THEN
        RETURN QUERY SELECT FALSE, 0, 'Pass has expired'::TEXT;
        RETURN;
    END IF;
    
    -- Check if there are escapes remaining
    IF COALESCE(v_pass.escapes_remaining, 0) <= 0 THEN
        RETURN QUERY SELECT FALSE, 0, 'No escapes remaining'::TEXT;
        RETURN;
    END IF;
    
    -- Decrement the escape count
    v_new_remaining := v_pass.escapes_remaining - 1;
    
    UPDATE user_passes 
    SET escapes_remaining = v_new_remaining,
        updated_at = NOW()
    WHERE id = p_pass_id;
    
    RETURN QUERY SELECT TRUE, v_new_remaining, 
        CASE WHEN v_new_remaining = 0 THEN 'Last escape used!' 
             ELSE v_new_remaining || ' escapes remaining' 
        END::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Create a view for active user passes with computed fields
CREATE OR REPLACE VIEW active_user_passes AS
SELECT 
    up.*,
    CASE 
        WHEN up.expires_at IS NULL THEN TRUE
        WHEN up.expires_at > NOW() THEN TRUE
        ELSE FALSE
    END AS is_valid,
    CASE 
        WHEN up.expires_at IS NULL THEN NULL
        ELSE EXTRACT(DAY FROM (up.expires_at - NOW()))::INTEGER
    END AS days_remaining,
    CASE 
        WHEN up.escapes_total > 0 THEN 
            ROUND((up.escapes_remaining::NUMERIC / up.escapes_total::NUMERIC) * 100, 1)
        ELSE NULL
    END AS escapes_percentage_remaining
FROM user_passes up
WHERE up.is_active = TRUE;

-- Grant permissions
GRANT SELECT ON active_user_passes TO authenticated;
GRANT SELECT ON active_user_passes TO anon;
