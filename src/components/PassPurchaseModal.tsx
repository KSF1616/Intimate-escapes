import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { supabase } from '@/lib/supabase';
import { useAppContext } from '@/contexts/AppContext';
import { X, Clock, Sparkles, Crown, Check, Lock, Flame, Gift, Map, Gamepad2, Star, Zap, Calendar, Trophy, AlertTriangle, RefreshCw, ExternalLink, Mail } from 'lucide-react';

const stripePromise = loadStripe('pk_live_51OJhJBHdGQpsHqInIzu7c6PzGPSH0yImD4xfpofvxvFZs0VFhPRXZCyEgYkkhOtBOXFWvssYASs851mflwQvjnrl00T6DbUwWZ', {
  stripeAccount: 'acct_1Sle9dHc165viLYv'
});

interface EscapePassOption {
  type: 'escape_1_3' | 'escape_4_6' | 'escape_7_10';
  name: string;
  price: number;
  escapeCount: string;
  description: string;
  icon: React.ReactNode;
  popular?: boolean;
  bestValue?: boolean;
  bonus?: string;
  includesFreeGames?: boolean;
}

interface GamePassOption {
  type: 'game_24h' | 'game_14d';
  name: string;
  price: number;
  duration: string;
  description: string;
  icon: React.ReactNode;
  popular?: boolean;
}

const escapePassOptions: EscapePassOption[] = [
  {
    type: 'escape_1_3',
    name: 'Starter Pack',
    price: 20.00,
    escapeCount: '1-3 Escapes',
    description: 'Perfect for trying out your first adventures',
    icon: <Map className="w-6 h-6" />
  },
  {
    type: 'escape_4_6',
    name: 'Explorer Pack',
    price: 40.00,
    escapeCount: '4-6 Escapes',
    description: 'Great for couples ready to dive deeper',
    icon: <Sparkles className="w-6 h-6" />,
    popular: true
  },
  {
    type: 'escape_7_10',
    name: 'Ultimate Pack',
    price: 60.00,
    escapeCount: '7-10 Escapes',
    description: 'All escapes + 10th escape FREE!',
    icon: <Crown className="w-6 h-6" />,
    bestValue: true,
    bonus: '10th Escape FREE!',
    includesFreeGames: true
  }
];

const gamePassOptions: GamePassOption[] = [
  {
    type: 'game_24h',
    name: '24-Hour Game Pass',
    price: 10.00,
    duration: '24 hours',
    description: 'Perfect for a game night',
    icon: <Clock className="w-6 h-6" />
  },
  {
    type: 'game_14d',
    name: '14-Day Game Pass',
    price: 20.00,
    duration: '14 days',
    description: 'Extended access to all games',
    icon: <Calendar className="w-6 h-6" />,
    popular: true
  }
];

interface PaymentFormProps {
  passType: string;
  passCategory: 'escape' | 'game';
  price: number;
  onSuccess: () => void;
  onCancel: () => void;
}

function PaymentForm({ passType, passCategory, price, onSuccess, onCancel }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { userId, refreshPass } = useAppContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || !userId) return;
    
    setLoading(true);
    setError(null);

    try {
      const { error: paymentError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin,
        },
        redirect: 'if_required',
      });

      if (paymentError) {
        setError(paymentError.message || 'Payment failed');
        setLoading(false);
        return;
      }

      if (paymentIntent?.status === 'succeeded') {
        // Activate the pass
        const { data, error: activateError } = await supabase.functions.invoke('activate-pass', {
          body: {
            passType,
            passCategory,
            userId,
            paymentIntentId: paymentIntent.id
          }
        });

        if (activateError || data?.error) {
          setError(data?.error || activateError?.message || 'Payment succeeded but pass activation failed. Please contact support with your payment confirmation.');
          setLoading(false);
          return;
        }

        await refreshPass();
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getPassName = () => {
    if (passCategory === 'escape') {
      return escapePassOptions.find(p => p.type === passType)?.name || 'Escape Pass';
    }
    return gamePassOptions.find(p => p.type === passType)?.name || 'Game Pass';
  };

  return (
    <div className="p-6">
      <div className="mb-6 p-4 bg-gradient-to-r from-pink-500/10 to-rose-500/10 rounded-xl border border-pink-500/20">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg text-white">
            {passCategory === 'escape' ? <Map className="w-6 h-6" /> : <Gamepad2 className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="font-bold text-white">{getPassName()}</h3>
            <p className="text-sm text-gray-400">30 days from first login</p>
          </div>
        </div>
        <div className="text-2xl font-bold text-white">${price.toFixed(2)}</div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-gray-800/50 rounded-xl p-4 mb-4">
          <PaymentElement options={{ layout: 'tabs' }} />
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={!stripe || loading}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </span>
            ) : (
              `Pay $${price.toFixed(2)}`
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

// Error fallback component with retry and alternative options
function PaymentErrorFallback({ 
  error, 
  onRetry, 
  onBack, 
  passName, 
  price 
}: { 
  error: string; 
  onRetry: () => void; 
  onBack: () => void;
  passName: string;
  price: number;
}) {
  return (
    <div className="p-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/20 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-amber-400" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Payment Setup Issue</h3>
        <p className="text-gray-400 text-sm max-w-sm mx-auto">
          We're having trouble setting up the payment for <span className="text-white font-medium">{passName}</span> (${price.toFixed(2)}). This is usually temporary.
        </p>
      </div>

      {/* Error details */}
      <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
        <p className="text-red-300 text-sm flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </p>
      </div>

      {/* Action buttons */}
      <div className="space-y-3">
        <button
          onClick={onRetry}
          className="w-full px-4 py-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-5 h-5" />
          Try Again
        </button>

        <a
          href="https://ksf1616.wixsite.com/intimate-escapes"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full px-4 py-3 bg-gradient-to-r from-[#D4AF37] to-amber-500 text-[#2D1B4E] rounded-xl font-semibold transition-all flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-amber-500/20"
        >
          <ExternalLink className="w-5 h-5" />
          Purchase on Our Website
        </a>

        <a
          href="mailto:intimateescapesfl@gmail.com?subject=Pass%20Purchase%20Issue&body=Hi%2C%20I%20tried%20to%20purchase%20a%20pass%20but%20encountered%20an%20error.%20Please%20help."
          className="w-full px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2 border border-white/10"
        >
          <Mail className="w-5 h-5" />
          Contact Support
        </a>

        <button
          onClick={onBack}
          className="w-full px-4 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl transition-colors text-sm"
        >
          Go Back
        </button>
      </div>

      {/* Help text */}
      <p className="text-center text-gray-500 text-xs mt-4">
        If the issue persists, please email us at{' '}
        <a href="mailto:intimateescapesfl@gmail.com" className="text-pink-400 hover:underline">
          intimateescapesfl@gmail.com
        </a>
      </p>
    </div>
  );
}

interface PassPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onGiftClick?: () => void;
  onRedeemClick?: () => void;
}

export default function PassPurchaseModal({ isOpen, onClose, onSuccess, onGiftClick, onRedeemClick }: PassPurchaseModalProps) {
  const [selectedPass, setSelectedPass] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'escape' | 'game'>('escape');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showErrorFallback, setShowErrorFallback] = useState(false);
  const [retryPassInfo, setRetryPassInfo] = useState<{ type: string; category: 'escape' | 'game'; price: number } | null>(null);
  const [activeTab, setActiveTab] = useState<'escapes' | 'games'>('escapes');
  const { userId, hasActivePass, activePass } = useAppContext();

  // Check if user has all escapes (7-10 pack) for free games
  const hasAllEscapes = activePass?.pass_type === 'escape_7_10';
  const hasAnnualPass = activePass?.pass_type === 'annual';

  const handleSelectPass = async (passType: string, category: 'escape' | 'game', price: number) => {
    if (!userId) {
      setError('Please wait while we set up your account...');
      return;
    }

    // If user has all escapes and is trying to get games, it's free
    if (category === 'game' && hasAllEscapes && !hasAnnualPass) {
      // Activate free game pass
      try {
        setLoading(true);
        setError(null);
        setShowErrorFallback(false);
        const { data, error: activateError } = await supabase.functions.invoke('activate-pass', {
          body: {
            passType: 'game_30d_free',
            passCategory: 'game',
            userId,
            isFreeWithEscapes: true
          }
        });

        if (activateError || data?.error) {
          const errMsg = data?.error || activateError?.message || 'Failed to activate free game pass';
          setError(errMsg);
          setShowErrorFallback(true);
          setRetryPassInfo({ type: passType, category, price });
          return;
        }

        onSuccess?.();
        onClose();
        return;
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred');
        setShowErrorFallback(true);
        setRetryPassInfo({ type: passType, category, price });
      } finally {
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    setError(null);
    setShowErrorFallback(false);
    setSelectedPass(passType);
    setSelectedCategory(category);
    setRetryPassInfo({ type: passType, category, price });

    try {
      const { data, error: fnError } = await supabase.functions.invoke('create-pass-payment', {
        body: { passType, passCategory: category, userId, price }
      });

      if (fnError) {
        // Edge function returned non-2xx or network error
        const errorMessage = fnError.message || 'Unable to connect to payment service';
        console.error('Payment setup error:', fnError);
        setError(errorMessage);
        setShowErrorFallback(true);
        setSelectedPass(null);
        setLoading(false);
        return;
      }

      if (data?.error) {
        setError(data.error);
        setShowErrorFallback(true);
        setSelectedPass(null);
        setLoading(false);
        return;
      }

      if (!data?.clientSecret) {
        setError('Payment service did not return the expected response. Please try again.');
        setShowErrorFallback(true);
        setSelectedPass(null);
        setLoading(false);
        return;
      }

      setClientSecret(data.clientSecret);
    } catch (err: any) {
      console.error('Payment creation error:', err);
      setError(err.message || 'An unexpected error occurred while setting up payment');
      setShowErrorFallback(true);
      setSelectedPass(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    if (retryPassInfo) {
      setShowErrorFallback(false);
      setError(null);
      handleSelectPass(retryPassInfo.type, retryPassInfo.category, retryPassInfo.price);
    }
  };

  const handleSuccess = () => {
    setClientSecret(null);
    setSelectedPass(null);
    setShowErrorFallback(false);
    setError(null);
    onSuccess?.();
    onClose();
  };

  const handleBack = () => {
    setClientSecret(null);
    setSelectedPass(null);
    setError(null);
    setShowErrorFallback(false);
  };

  const formatExpiryDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const getSelectedPrice = () => {
    if (selectedCategory === 'escape') {
      return escapePassOptions.find(p => p.type === selectedPass)?.price || 0;
    }
    return gamePassOptions.find(p => p.type === selectedPass)?.price || 0;
  };

  const getRetryPassName = () => {
    if (!retryPassInfo) return 'Pass';
    if (retryPassInfo.category === 'escape') {
      return escapePassOptions.find(p => p.type === retryPassInfo.type)?.name || 'Escape Pass';
    }
    return gamePassOptions.find(p => p.type === retryPassInfo.type)?.name || 'Game Pass';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-pink-500/20 shadow-2xl shadow-pink-500/10">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 p-6 border-b border-gray-800 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Flame className="w-6 h-6 text-pink-500" />
              {hasActivePass ? 'Your Passes' : 'Get Access'}
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              {hasActivePass ? 'Manage your active passes' : 'Unlock adventures & games'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        {showErrorFallback && error ? (
          <PaymentErrorFallback
            error={error}
            onRetry={handleRetry}
            onBack={handleBack}
            passName={getRetryPassName()}
            price={retryPassInfo?.price || 0}
          />
        ) : clientSecret && selectedPass ? (
          <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'night' } }}>
            <PaymentForm
              passType={selectedPass}
              passCategory={selectedCategory}
              price={getSelectedPrice()}
              onSuccess={handleSuccess}
              onCancel={handleBack}
            />
          </Elements>
        ) : (
          <div className="p-6">
            {error && !showErrorFallback && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Tab Navigation */}
            <div className="flex gap-2 mb-6 p-1 bg-gray-800/50 rounded-xl">
              <button
                onClick={() => setActiveTab('escapes')}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'escapes'
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Map className="w-5 h-5" />
                Escape Passes
              </button>
              <button
                onClick={() => setActiveTab('games')}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'games'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Gamepad2 className="w-5 h-5" />
                Game Passes
              </button>
            </div>

            {/* Escape Passes Tab */}
            {activeTab === 'escapes' && (
              <div className="space-y-4">
                {/* Info Banner */}
                <div className="p-4 bg-gradient-to-r from-pink-500/10 to-amber-500/10 rounded-xl border border-pink-500/20">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-pink-500/20 rounded-lg">
                      <Zap className="w-5 h-5 text-pink-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white text-sm">30-Day Access</h4>
                      <p className="text-xs text-gray-400 mt-1">
                        All escape passes are valid for 30 days from your first login. Complete adventures at your own pace!
                      </p>
                    </div>
                  </div>
                </div>

                {/* Escape Pass Options */}
                <div className="space-y-3">
                  {escapePassOptions.map((pass) => (
                    <button
                      key={pass.type}
                      onClick={() => handleSelectPass(pass.type, 'escape', pass.price)}
                      disabled={loading}
                      className={`w-full p-4 rounded-xl border transition-all text-left relative overflow-hidden ${
                        pass.popular
                          ? 'border-pink-500 bg-gradient-to-r from-pink-500/10 to-rose-500/10'
                          : pass.bestValue
                          ? 'border-amber-500 bg-gradient-to-r from-amber-500/10 to-orange-500/10'
                          : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                      } ${loading ? 'opacity-60 cursor-wait' : ''}`}
                    >
                      {pass.popular && (
                        <div className="absolute top-0 right-0 bg-pink-500 text-white text-xs px-2 py-1 rounded-bl-lg font-semibold">
                          POPULAR
                        </div>
                      )}
                      {pass.bestValue && (
                        <div className="absolute top-0 right-0 bg-amber-500 text-white text-xs px-2 py-1 rounded-bl-lg font-semibold">
                          BEST VALUE
                        </div>
                      )}
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${
                          pass.popular
                            ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white'
                            : pass.bestValue
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                            : 'bg-gray-700 text-gray-300'
                        }`}>
                          {pass.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-bold text-white">{pass.name}</h3>
                            <span className="text-xl font-bold text-white">${pass.price.toFixed(2)}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm font-semibold text-pink-400">{pass.escapeCount}</span>
                            {pass.bonus && (
                              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                                {pass.bonus}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-400 mt-1">{pass.description}</p>
                          {pass.includesFreeGames && (
                            <div className="flex items-center gap-1 mt-2 text-xs text-amber-400">
                              <Trophy className="w-3 h-3" />
                              <span>Includes FREE 30-day game access!</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Games Tab */}
            {activeTab === 'games' && (
              <div className="space-y-4">
                {/* Free Games Banner (if user has all escapes) */}
                {hasAllEscapes && !hasAnnualPass && (
                  <div className="p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl border border-green-500/30">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-500/30 rounded-lg">
                        <Trophy className="w-6 h-6 text-green-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-green-400">FREE Game Access!</h4>
                        <p className="text-xs text-gray-300 mt-1">
                          You have the Ultimate Escape Pack - enjoy 30 days of free game access!
                        </p>
                      </div>
                      <button
                        onClick={() => handleSelectPass('game_30d_free', 'game', 0)}
                        disabled={loading}
                        className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-all"
                      >
                        Activate
                      </button>
                    </div>
                  </div>
                )}

                {/* Info Banner */}
                <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <Gamepad2 className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white text-sm">Unlimited Games</h4>
                      <p className="text-xs text-gray-400 mt-1">
                        Access Truth or Dare, Never Have I Ever, and all intimate games during your pass period.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Game Pass Options */}
                <div className="space-y-3">
                  {gamePassOptions.map((pass) => (
                    <button
                      key={pass.type}
                      onClick={() => handleSelectPass(pass.type, 'game', pass.price)}
                      disabled={loading || (hasAllEscapes && !hasAnnualPass)}
                      className={`w-full p-4 rounded-xl border transition-all text-left relative overflow-hidden ${
                        hasAllEscapes && !hasAnnualPass
                          ? 'border-gray-700 bg-gray-800/30 opacity-50 cursor-not-allowed'
                          : pass.popular
                          ? 'border-purple-500 bg-gradient-to-r from-purple-500/10 to-pink-500/10'
                          : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                      } ${loading ? 'opacity-60 cursor-wait' : ''}`}
                    >
                      {pass.popular && !hasAllEscapes && (
                        <div className="absolute top-0 right-0 bg-purple-500 text-white text-xs px-2 py-1 rounded-bl-lg font-semibold">
                          POPULAR
                        </div>
                      )}
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${
                          pass.popular
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                            : 'bg-gray-700 text-gray-300'
                        }`}>
                          {pass.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-bold text-white">{pass.name}</h3>
                            <span className="text-xl font-bold text-white">${pass.price.toFixed(2)}</span>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-sm text-gray-400">{pass.description}</p>
                            <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">{pass.duration}</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Tip for free games */}
                {!hasAllEscapes && (
                  <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                    <p className="text-xs text-amber-300 flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      <span>
                        <strong>Pro tip:</strong> Purchase the Ultimate Escape Pack (7-10 escapes) to get 30 days of FREE game access!
                      </span>
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Gift Options */}
            <div className="mt-6 pt-6 border-t border-gray-700">
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    onClose();
                    onGiftClick?.();
                  }}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 hover:border-purple-500/50 text-white rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <Gift className="w-5 h-5 text-purple-400" />
                  Gift a Pass
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onRedeemClick?.();
                  }}
                  className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  Redeem Code
                </button>
              </div>
            </div>

            {/* Alternative purchase option */}
            <div className="mt-4 p-4 bg-[#D4AF37]/10 rounded-xl border border-[#D4AF37]/20">
              <div className="flex items-center gap-3">
                <ExternalLink className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">Having trouble?</p>
                  <p className="text-gray-400 text-xs mt-0.5">You can also purchase passes directly on our website.</p>
                </div>
                <a
                  href="https://ksf1616.wixsite.com/intimate-escapes"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-[#D4AF37] text-[#2D1B4E] rounded-lg text-sm font-semibold hover:bg-amber-400 transition-colors whitespace-nowrap"
                >
                  Visit Site
                </a>
              </div>
            </div>

            {loading && (
              <div className="mt-4 flex items-center justify-center gap-2 text-gray-400">
                <div className="w-5 h-5 border-2 border-pink-500/30 border-t-pink-500 rounded-full animate-spin" />
                <span>Preparing payment...</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
