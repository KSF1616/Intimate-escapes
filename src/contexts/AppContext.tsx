import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';

export type EscapePassType = 'escape_1_3' | 'escape_4_6' | 'escape_7_10';
export type GamePassType = 'game_24h' | 'game_14d' | 'game_30d_free';
export type LegacyPassType = 'day' | 'weekend' | 'annual';
export type PassType = EscapePassType | GamePassType | LegacyPassType;

export interface UserPass {
  id: string;
  pass_type: PassType;
  pass_category: 'escape' | 'game' | 'legacy';
  purchased_at: string;
  activated_at: string | null;
  expires_at: string;
  is_active: boolean;
  escapes_remaining?: number;
  escapes_total?: number;
}

export interface CoupleRewards {
  id: string;
  user_id: string;
  total_points: number;
  lifetime_points: number;
  couple_title: string;
  couple_badge: string;
  created_at: string;
  updated_at: string;
}

export interface PointsHistoryItem {
  id: string;
  user_id: string;
  points: number;
  action_type: string;
  description: string;
  multiplier: number;
  adventure_id: string | null;
  created_at: string;
}

export interface SpecialDate {
  id: string;
  user_id: string;
  date_type: string;
  date_value: string;
  label: string;
  created_at: string;
}

export interface RedeemedReward {
  id: string;
  user_id: string;
  reward_id: string;
  reward_name: string;
  points_spent: number;
  reward_data: any;
  redeemed_at: string;
}

export interface RewardItem {
  id: string;
  name: string;
  description: string;
  points: number;
  category: string;
  data?: any;
}

export interface BonusPointsResult {
  basePoints: number;
  timeBonus: number;
  hintsBonus: number;
  perfectBonus: number;
  firstEscapeBonus: number;
  stopPoints: number;
  totalPoints: number;
  breakdown: string[];
}

// Helper to get escape count from pass type
export const getEscapeCount = (passType: EscapePassType): { min: number; max: number } => {
  switch (passType) {
    case 'escape_1_3':
      return { min: 1, max: 3 };
    case 'escape_4_6':
      return { min: 4, max: 6 };
    case 'escape_7_10':
      return { min: 7, max: 10 };
    default:
      return { min: 0, max: 0 };
  }
};

// Helper to get pass duration in days
export const getPassDuration = (passType: PassType): number => {
  switch (passType) {
    case 'escape_1_3':
    case 'escape_4_6':
    case 'escape_7_10':
    case 'game_30d_free':
      return 30;
    case 'game_24h':
      return 1;
    case 'game_14d':
      return 14;
    case 'day':
      return 1;
    case 'weekend':
      return 2;
    case 'annual':
      return 365;
    default:
      return 30;
  }
};

interface AppContextType {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  userId: string | null;
  setUserId: (id: string | null) => void;
  // Legacy pass support
  activePass: UserPass | null;
  hasActivePass: boolean;
  loadingPass: boolean;
  refreshPass: () => Promise<void>;
  checkPassAccess: () => boolean;
  // New pass system
  escapePass: UserPass | null;
  gamePass: UserPass | null;
  hasEscapeAccess: boolean;
  hasGameAccess: boolean;
  escapesRemaining: number;
  useEscape: (adventureId?: string, adventureName?: string) => Promise<boolean>;
  completeEscape: (adventureId: string, adventureName: string, hintsUsed: number, timeMinutes: number, stopsCompleted: number, totalStops: number) => Promise<{ success: boolean; bonusPoints?: BonusPointsResult; isFirstEscape?: boolean }>;
  // Rewards system
  rewards: CoupleRewards | null;
  pointsHistory: PointsHistoryItem[];
  specialDates: SpecialDate[];
  redeemedRewards: RedeemedReward[];
  rewardsCatalog: Record<string, RewardItem>;
  loadingRewards: boolean;
  refreshRewards: () => Promise<void>;
  earnPoints: (actionType: string, description: string, adventureId?: string) => Promise<{ pointsEarned: number; multiplier: number; multiplierReason: string } | null>;
  redeemReward: (rewardId: string) => Promise<boolean>;
  setSpecialDate: (dateType: string, dateValue: string, label: string) => Promise<boolean>;
  deleteSpecialDate: (dateType: string) => Promise<boolean>;
  updateTitleBadge: (title?: string, badge?: string) => Promise<boolean>;
}

const defaultAppContext: AppContextType = {
  sidebarOpen: false,
  toggleSidebar: () => {},
  userId: null,
  setUserId: () => {},
  activePass: null,
  hasActivePass: false,
  loadingPass: true,
  refreshPass: async () => {},
  checkPassAccess: () => false,
  // New pass system defaults
  escapePass: null,
  gamePass: null,
  hasEscapeAccess: false,
  hasGameAccess: false,
  escapesRemaining: 0,
  useEscape: async () => false,
  completeEscape: async () => ({ success: false }),
  // Rewards defaults
  rewards: null,
  pointsHistory: [],
  specialDates: [],
  redeemedRewards: [],
  rewardsCatalog: {},
  loadingRewards: true,
  refreshRewards: async () => {},
  earnPoints: async () => null,
  redeemReward: async () => false,
  setSpecialDate: async () => false,
  deleteSpecialDate: async () => false,
  updateTitleBadge: async () => false,
};

const AppContext = createContext<AppContextType>(defaultAppContext);

export const useAppContext = () => useContext(AppContext);

// Generate or retrieve a persistent user ID
const getOrCreateUserId = (): string => {
  const stored = localStorage.getItem('intimate_escapes_user_id');
  if (stored) return stored;
  
  const newId = crypto.randomUUID();
  localStorage.setItem('intimate_escapes_user_id', newId);
  return newId;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userId, setUserIdState] = useState<string | null>(null);
  const [activePass, setActivePass] = useState<UserPass | null>(null);
  const [escapePass, setEscapePass] = useState<UserPass | null>(null);
  const [gamePass, setGamePass] = useState<UserPass | null>(null);
  const [loadingPass, setLoadingPass] = useState(true);
  
  // Rewards state
  const [rewards, setRewards] = useState<CoupleRewards | null>(null);
  const [pointsHistory, setPointsHistory] = useState<PointsHistoryItem[]>([]);
  const [specialDates, setSpecialDates] = useState<SpecialDate[]>([]);
  const [redeemedRewards, setRedeemedRewards] = useState<RedeemedReward[]>([]);
  const [rewardsCatalog, setRewardsCatalog] = useState<Record<string, RewardItem>>({});
  const [loadingRewards, setLoadingRewards] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  const setUserId = (id: string | null) => {
    setUserIdState(id);
    if (id) {
      localStorage.setItem('intimate_escapes_user_id', id);
    }
  };

  const refreshPass = async () => {
    if (!userId) {
      setActivePass(null);
      setEscapePass(null);
      setGamePass(null);
      setLoadingPass(false);
      return;
    }

    try {
      setLoadingPass(true);
      const now = new Date().toISOString();
      
      // Fetch all active passes
      const { data: passes, error } = await supabase
        .from('user_passes')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .gt('expires_at', now)
        .order('expires_at', { ascending: false });

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching passes:', error);
      }

      if (passes && passes.length > 0) {
        // Find escape pass
        const escapePassData = passes.find(p => 
          p.pass_category === 'escape' || 
          ['escape_1_3', 'escape_4_6', 'escape_7_10'].includes(p.pass_type)
        );
        
        // Find game pass
        const gamePassData = passes.find(p => 
          p.pass_category === 'game' || 
          ['game_24h', 'game_14d', 'game_30d_free'].includes(p.pass_type)
        );
        
        // Find legacy pass (annual, day, weekend)
        const legacyPass = passes.find(p => 
          p.pass_category === 'legacy' || 
          ['day', 'weekend', 'annual'].includes(p.pass_type)
        );

        setEscapePass(escapePassData || null);
        setGamePass(gamePassData || null);
        
        // For backward compatibility, set activePass to the most relevant pass
        setActivePass(legacyPass || escapePassData || gamePassData || null);
      } else {
        setActivePass(null);
        setEscapePass(null);
        setGamePass(null);
      }
    } catch (error) {
      console.error('Error refreshing pass:', error);
      setActivePass(null);
      setEscapePass(null);
      setGamePass(null);
    } finally {
      setLoadingPass(false);
    }
  };

  // Check if user has active escape access
  const hasEscapeAccess = (() => {
    // Legacy annual pass gives full access
    if (activePass?.pass_type === 'annual' && new Date(activePass.expires_at) > new Date()) {
      return true;
    }
    // Check escape pass
    if (escapePass && new Date(escapePass.expires_at) > new Date()) {
      return (escapePass.escapes_remaining ?? 0) > 0;
    }
    // Legacy day/weekend passes
    if (activePass && ['day', 'weekend'].includes(activePass.pass_type) && new Date(activePass.expires_at) > new Date()) {
      return true;
    }
    return false;
  })();

  // Check if user has active game access
  const hasGameAccess = (() => {
    // Legacy annual pass gives full access
    if (activePass?.pass_type === 'annual' && new Date(activePass.expires_at) > new Date()) {
      return true;
    }
    // Check game pass
    if (gamePass && new Date(gamePass.expires_at) > new Date()) {
      return true;
    }
    // Users with escape_7_10 get free game access
    if (escapePass?.pass_type === 'escape_7_10' && new Date(escapePass.expires_at) > new Date()) {
      return true;
    }
    // Legacy day/weekend passes
    if (activePass && ['day', 'weekend'].includes(activePass.pass_type) && new Date(activePass.expires_at) > new Date()) {
      return true;
    }
    return false;
  })();

  // Get remaining escapes
  const escapesRemaining = (() => {
    // Legacy annual pass gives unlimited
    if (activePass?.pass_type === 'annual' && new Date(activePass.expires_at) > new Date()) {
      return 999;
    }
    // Legacy day/weekend passes
    if (activePass && ['day', 'weekend'].includes(activePass.pass_type) && new Date(activePass.expires_at) > new Date()) {
      return 999;
    }
    // Check escape pass
    if (escapePass && new Date(escapePass.expires_at) > new Date()) {
      return escapePass.escapes_remaining ?? 0;
    }
    return 0;
  })();

  const hasActivePass = activePass !== null && new Date(activePass.expires_at) > new Date();

  const checkPassAccess = (): boolean => {
    if (!activePass) return false;
    return new Date(activePass.expires_at) > new Date();
  };

  // Use an escape (decrement remaining count) via edge function
  const useEscape = async (adventureId?: string, adventureName?: string): Promise<boolean> => {
    if (!userId) return false;
    
    // Legacy passes don't need to decrement
    if (activePass && ['day', 'weekend', 'annual'].includes(activePass.pass_type)) {
      return true;
    }

    // Check if user has an escape pass
    if (!escapePass) {
      toast({
        title: 'No Escape Pass',
        description: 'Purchase an escape pass to start your adventures!',
        variant: 'destructive',
      });
      return false;
    }

    const currentRemaining = escapePass.escapes_remaining ?? 0;
    if (currentRemaining <= 0) {
      toast({
        title: 'No Escapes Remaining',
        description: 'Purchase more escapes to continue your adventures!',
        variant: 'destructive',
      });
      return false;
    }

    try {
      const { data, error } = await supabase.functions.invoke('use-escape', {
        body: { 
          userId, 
          adventureId: adventureId || 'unknown',
          adventureName: adventureName || 'Unknown Adventure',
          action: 'start'
        }
      });

      if (error) {
        console.error('Error using escape:', error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to use escape',
          variant: 'destructive',
        });
        return false;
      }

      if (!data.success) {
        toast({
          title: data.error === 'no_escapes' ? 'No Escapes Remaining' : 
                 data.error === 'pass_expired' ? 'Pass Expired' : 'Error',
          description: data.message,
          variant: 'destructive',
        });
        return false;
      }

      // Show success message
      if (data.firstUse) {
        toast({
          title: '30-Day Pass Activated!',
          description: data.activationMessage,
        });
      } else {
        toast({
          title: 'Escape Started!',
          description: data.message,
        });
      }

      // Refresh pass data
      await refreshPass();
      return true;
    } catch (error) {
      console.error('Error using escape:', error);
      toast({
        title: 'Error',
        description: 'Failed to start escape. Please try again.',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Complete an escape and award bonus points
  const completeEscape = async (
    adventureId: string,
    adventureName: string,
    hintsUsed: number,
    timeMinutes: number,
    stopsCompleted: number,
    totalStops: number
  ): Promise<{ success: boolean; bonusPoints?: BonusPointsResult; isFirstEscape?: boolean }> => {
    if (!userId) return { success: false };

    try {
      const { data, error } = await supabase.functions.invoke('use-escape', {
        body: {
          userId,
          adventureId,
          adventureName,
          action: 'complete',
          hintsUsed,
          timeMinutes,
          stopsCompleted,
          totalStops
        }
      });

      if (error) {
        console.error('Error completing escape:', error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to complete escape',
          variant: 'destructive',
        });
        return { success: false };
      }

      if (!data.success) {
        toast({
          title: 'Error',
          description: data.message || 'Failed to complete escape',
          variant: 'destructive',
        });
        return { success: false };
      }

      // Refresh rewards to get updated totals
      await refreshRewards();

      return {
        success: true,
        bonusPoints: data.bonusPoints,
        isFirstEscape: data.isFirstEscape
      };
    } catch (error) {
      console.error('Error completing escape:', error);
      return { success: false };
    }
  };

  // Rewards functions
  const refreshRewards = async () => {
    if (!userId) {
      setLoadingRewards(false);
      return;
    }
    
    try {
      setLoadingRewards(true);
      const { data, error } = await supabase.functions.invoke('rewards-system', {
        body: { action: 'get_rewards_status', userId }
      });

      if (error) {
        console.error('Error fetching rewards:', error);
        // Don't return early - still set loadingRewards to false in finally
      } else if (data && !data.error) {
        setRewards(data.rewards);
        setSpecialDates(data.specialDates || []);
        setRedeemedRewards(data.redeemedRewards || []);
        setRewardsCatalog(data.catalog || {});
      }

      // Also fetch points history (non-blocking)
      try {
        const { data: historyData } = await supabase.functions.invoke('rewards-system', {
          body: { action: 'get_points_history', userId, limit: 100 }
        });

        if (historyData?.history) {
          setPointsHistory(historyData.history);
        }
      } catch (historyError) {
        console.error('Error fetching points history:', historyError);
        // Non-critical, don't propagate
      }
    } catch (error) {
      console.error('Error refreshing rewards:', error);
    } finally {
      setLoadingRewards(false);
    }
  };


  const earnPoints = async (actionType: string, description: string, adventureId?: string) => {
    if (!userId) return null;
    
    try {
      const { data, error } = await supabase.functions.invoke('rewards-system', {
        body: { action: 'earn_points', userId, actionType, description, adventureId }
      });

      if (error) {
        console.error('Error earning points:', error);
        return null;
      }

      // Refresh rewards to get updated totals
      await refreshRewards();

      if (data.pointsEarned) {
        toast({
          title: `+${data.pointsEarned} Points!`,
          description: data.multiplierReason || description,
        });
      }

      return data;
    } catch (error) {
      console.error('Error earning points:', error);
      return null;
    }
  };

  const redeemReward = async (rewardId: string): Promise<boolean> => {
    if (!userId) return false;
    
    try {
      const { data, error } = await supabase.functions.invoke('rewards-system', {
        body: { action: 'redeem_reward', userId, rewardId }
      });

      if (error || data?.error) {
        toast({
          title: 'Redemption Failed',
          description: data?.error || error?.message || 'Unable to redeem reward',
          variant: 'destructive',
        });
        return false;
      }

      toast({
        title: 'Reward Redeemed!',
        description: `You've unlocked ${data.reward.name}`,
      });

      await refreshRewards();
      return true;
    } catch (error) {
      console.error('Error redeeming reward:', error);
      return false;
    }
  };

  const setSpecialDate = async (dateType: string, dateValue: string, label: string): Promise<boolean> => {
    if (!userId) return false;
    
    try {
      const { data, error } = await supabase.functions.invoke('rewards-system', {
        body: { action: 'set_special_date', userId, dateType, dateValue, label }
      });

      if (error) {
        console.error('Error setting special date:', error);
        return false;
      }

      await refreshRewards();
      toast({
        title: 'Special Date Saved!',
        description: `${label} has been set for bonus points`,
      });
      return true;
    } catch (error) {
      console.error('Error setting special date:', error);
      return false;
    }
  };

  const deleteSpecialDate = async (dateType: string): Promise<boolean> => {
    if (!userId) return false;
    
    try {
      const { error } = await supabase.functions.invoke('rewards-system', {
        body: { action: 'delete_special_date', userId, dateType }
      });

      if (error) {
        console.error('Error deleting special date:', error);
        return false;
      }

      await refreshRewards();
      return true;
    } catch (error) {
      console.error('Error deleting special date:', error);
      return false;
    }
  };

  const updateTitleBadge = async (title?: string, badge?: string): Promise<boolean> => {
    if (!userId) return false;
    
    try {
      const { error } = await supabase.functions.invoke('rewards-system', {
        body: { action: 'update_title_badge', userId, title, badge }
      });

      if (error) {
        console.error('Error updating title/badge:', error);
        return false;
      }

      await refreshRewards();
      return true;
    } catch (error) {
      console.error('Error updating title/badge:', error);
      return false;
    }
  };


  // Initialize user ID on mount
  useEffect(() => {
    const id = getOrCreateUserId();
    setUserIdState(id);
  }, []);

  // Refresh pass and rewards when userId changes
  useEffect(() => {
    if (userId) {
      refreshPass();
      refreshRewards();
    }
  }, [userId]);

  return (
    <AppContext.Provider
      value={{
        sidebarOpen,
        toggleSidebar,
        userId,
        setUserId,
        activePass,
        hasActivePass,
        loadingPass,
        refreshPass,
        checkPassAccess,
        // New pass system
        escapePass,
        gamePass,
        hasEscapeAccess,
        hasGameAccess,
        escapesRemaining,
        useEscape,
        completeEscape,
        // Rewards
        rewards,
        pointsHistory,
        specialDates,
        redeemedRewards,
        rewardsCatalog,
        loadingRewards,
        refreshRewards,
        earnPoints,
        redeemReward,
        setSpecialDate,
        deleteSpecialDate,
        updateTitleBadge,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
