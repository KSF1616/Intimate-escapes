import React, { useState } from 'react';
import { X, Mail, Lock, User, Heart, Eye, EyeOff, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { LOGO_URL, APP_NAME, APP_TAGLINE } from '@/lib/constants';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type AuthMode = 'login' | 'signup' | 'forgot';

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
            partner_name: partnerName,
          },
        },
      });

      if (error) throw error;

      // Create profile
      if (data.user) {
        await supabase.from('profiles').insert({
          id: data.user.id,
          email,
          display_name: displayName,
          partner_name: partnerName,
        });

        // Create initial game progress
        await supabase.from('game_progress').insert({
          user_id: data.user.id,
        });
      }

      setMessage('Account created! You can now sign in.');
      setMode('login');
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setMessage('Check your email for a password reset link');
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setDisplayName('');
    setPartnerName('');
    setError('');
    setMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-gradient-to-br from-[#2D1B4E] to-[#1a0f2e] rounded-3xl border border-[#D4AF37]/30 shadow-2xl overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Logo */}
        <div className="bg-gradient-to-r from-[#8B1538] to-pink-600 p-6">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center overflow-hidden">
              <img 
                src={LOGO_URL} 
                alt={APP_NAME}
                className="w-full h-full object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.parentElement!.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>';
                }}
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {mode === 'login' ? 'Welcome Back' : mode === 'signup' ? 'Join the Adventure' : 'Reset Password'}
              </h2>
              <p className="text-white/80 text-sm">
                {mode === 'login' ? 'Sign in to continue your journey' : mode === 'signup' ? 'Create your couple\'s account' : 'We\'ll send you a reset link'}
              </p>
            </div>
          </div>
        </div>


        {/* Form */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-sm">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-4 p-3 rounded-xl bg-green-500/20 border border-green-500/30 text-green-300 text-sm">
              {message}
            </div>
          )}

          <form onSubmit={mode === 'login' ? handleLogin : mode === 'signup' ? handleSignup : handleForgotPassword}>
            {mode === 'signup' && (
              <>
                <div className="mb-4">
                  <label className="block text-gray-400 text-sm mb-2">Your Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/10 text-white placeholder-gray-400 border border-white/10 focus:border-[#D4AF37] focus:outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-400 text-sm mb-2">Partner's Name (Optional)</label>
                  <div className="relative">
                    <Heart className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={partnerName}
                      onChange={(e) => setPartnerName(e.target.value)}
                      placeholder="Enter your partner's name"
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/10 text-white placeholder-gray-400 border border-white/10 focus:border-[#D4AF37] focus:outline-none transition-all"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="mb-4">
              <label className="block text-gray-400 text-sm mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/10 text-white placeholder-gray-400 border border-white/10 focus:border-[#D4AF37] focus:outline-none transition-all"
                  required
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div className="mb-6">
                <label className="block text-gray-400 text-sm mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-12 pr-12 py-3 rounded-xl bg-white/10 text-white placeholder-gray-400 border border-white/10 focus:border-[#D4AF37] focus:outline-none transition-all"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}

            {mode === 'login' && (
              <button
                type="button"
                onClick={() => {
                  setMode('forgot');
                  resetForm();
                }}
                className="text-[#D4AF37] text-sm hover:underline mb-4 block"
              >
                Forgot your password?
              </button>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-[#D4AF37] to-amber-500 text-[#2D1B4E] font-bold text-lg hover:shadow-lg hover:shadow-amber-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {mode === 'login' ? 'Signing In...' : mode === 'signup' ? 'Creating Account...' : 'Sending...'}
                </>
              ) : (
                mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'
              )}
            </button>
          </form>

          {/* Mode Switch */}
          <div className="mt-6 text-center">
            {mode === 'login' ? (
              <p className="text-gray-400">
                Don't have an account?{' '}
                <button
                  onClick={() => {
                    setMode('signup');
                    resetForm();
                  }}
                  className="text-[#D4AF37] font-medium hover:underline"
                >
                  Sign Up
                </button>
              </p>
            ) : (
              <p className="text-gray-400">
                Already have an account?{' '}
                <button
                  onClick={() => {
                    setMode('login');
                    resetForm();
                  }}
                  className="text-[#D4AF37] font-medium hover:underline"
                >
                  Sign In
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
