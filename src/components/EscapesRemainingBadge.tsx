import React from 'react';
import { Ticket, Clock, AlertTriangle, Infinity, ShoppingCart } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';

interface EscapesRemainingBadgeProps {
  variant?: 'compact' | 'full' | 'minimal';
  showPurchaseButton?: boolean;
  onPurchaseClick?: () => void;
  className?: string;
}

const EscapesRemainingBadge: React.FC<EscapesRemainingBadgeProps> = ({
  variant = 'compact',
  showPurchaseButton = false,
  onPurchaseClick,
  className = '',
}) => {
  const { escapePass, escapesRemaining, hasEscapeAccess, activePass } = useAppContext();

  // Check for legacy unlimited pass
  const isLegacyUnlimited = activePass?.pass_type === 'annual' || 
    activePass?.pass_type === 'day' || 
    activePass?.pass_type === 'weekend';

  // Calculate days remaining
  const getDaysRemaining = () => {
    const pass = escapePass || activePass;
    if (!pass?.expires_at) return null;
    const now = new Date();
    const expiry = new Date(pass.expires_at);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const daysRemaining = getDaysRemaining();
  const isLowOnEscapes = escapesRemaining <= 2 && escapesRemaining > 0;
  const isOutOfEscapes = escapesRemaining === 0 && !isLegacyUnlimited;
  const isPendingActivation = escapePass && !escapePass.activated_at;

  // Minimal variant - just the count
  if (variant === 'minimal') {
    if (isLegacyUnlimited) {
      return (
        <div className={`flex items-center gap-1 text-[#D4AF37] ${className}`}>
          <Infinity className="w-4 h-4" />
          <span className="text-sm font-medium">Unlimited</span>
        </div>
      );
    }

    return (
      <div className={`flex items-center gap-1 ${
        isOutOfEscapes ? 'text-red-400' : isLowOnEscapes ? 'text-amber-400' : 'text-[#D4AF37]'
      } ${className}`}>
        <Ticket className="w-4 h-4" />
        <span className="text-sm font-bold">{escapesRemaining}</span>
      </div>
    );
  }

  // Compact variant - badge style
  if (variant === 'compact') {
    if (!hasEscapeAccess && !escapePass) {
      return (
        <button
          onClick={onPurchaseClick}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-pink-500/20 to-rose-500/20 border border-pink-500/30 text-pink-400 text-sm font-medium hover:from-pink-500/30 hover:to-rose-500/30 transition-all ${className}`}
        >
          <ShoppingCart className="w-4 h-4" />
          Get Pass
        </button>
      );
    }

    if (isLegacyUnlimited) {
      return (
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#D4AF37]/20 to-amber-500/20 border border-[#D4AF37]/30 ${className}`}>
          <Infinity className="w-4 h-4 text-[#D4AF37]" />
          <span className="text-[#D4AF37] text-sm font-medium">Unlimited Escapes</span>
        </div>
      );
    }

    return (
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
        isOutOfEscapes 
          ? 'bg-red-500/20 border border-red-500/30' 
          : isLowOnEscapes 
            ? 'bg-amber-500/20 border border-amber-500/30'
            : 'bg-gradient-to-r from-[#D4AF37]/20 to-amber-500/20 border border-[#D4AF37]/30'
      } ${className}`}>
        {isOutOfEscapes ? (
          <AlertTriangle className="w-4 h-4 text-red-400" />
        ) : (
          <Ticket className="w-4 h-4 text-[#D4AF37]" />
        )}
        <span className={`text-sm font-bold ${
          isOutOfEscapes ? 'text-red-400' : isLowOnEscapes ? 'text-amber-400' : 'text-[#D4AF37]'
        }`}>
          {escapesRemaining}
        </span>
        <span className={`text-sm ${
          isOutOfEscapes ? 'text-red-300' : isLowOnEscapes ? 'text-amber-300' : 'text-gray-300'
        }`}>
          escape{escapesRemaining !== 1 ? 's' : ''} left
        </span>
        {isPendingActivation && (
          <span className="text-xs text-gray-400 ml-1">(not started)</span>
        )}
      </div>
    );
  }

  // Full variant - detailed card
  return (
    <div className={`bg-[#2D1B4E]/50 rounded-xl p-4 border border-white/10 ${className}`}>
      {!hasEscapeAccess && !escapePass ? (
        // No pass state
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500/20 to-rose-500/20 flex items-center justify-center mx-auto mb-3">
            <Ticket className="w-6 h-6 text-pink-400" />
          </div>
          <h4 className="text-white font-semibold mb-1">No Active Pass</h4>
          <p className="text-gray-400 text-sm mb-3">Get an escape pass to start your adventures</p>
          {showPurchaseButton && (
            <button
              onClick={onPurchaseClick}
              className="w-full py-2 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold text-sm hover:shadow-lg hover:shadow-pink-500/30 transition-all"
            >
              Purchase Pass
            </button>
          )}
        </div>
      ) : isLegacyUnlimited ? (
        // Legacy unlimited pass
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#D4AF37]/20 to-amber-500/20 flex items-center justify-center">
                <Infinity className="w-5 h-5 text-[#D4AF37]" />
              </div>
              <div>
                <h4 className="text-white font-semibold">Unlimited Escapes</h4>
                <p className="text-gray-400 text-xs capitalize">{activePass?.pass_type} Pass</p>
              </div>
            </div>
          </div>
          {daysRemaining !== null && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Clock className="w-4 h-4" />
              <span>{daysRemaining} day{daysRemaining !== 1 ? 's' : ''} remaining</span>
            </div>
          )}
        </div>
      ) : (
        // Regular escape pass
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isOutOfEscapes 
                  ? 'bg-red-500/20' 
                  : isLowOnEscapes 
                    ? 'bg-amber-500/20'
                    : 'bg-gradient-to-r from-[#D4AF37]/20 to-amber-500/20'
              }`}>
                {isOutOfEscapes ? (
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                ) : (
                  <Ticket className="w-5 h-5 text-[#D4AF37]" />
                )}
              </div>
              <div>
                <h4 className="text-white font-semibold">
                  {isOutOfEscapes ? 'No Escapes Left' : `${escapesRemaining} Escape${escapesRemaining !== 1 ? 's' : ''} Left`}
                </h4>
                <p className="text-gray-400 text-xs">
                  {escapePass?.escapes_total ? `of ${escapePass.escapes_total} total` : 'Escape Pass'}
                </p>
              </div>
            </div>
            {isPendingActivation && (
              <span className="px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-medium">
                Not Started
              </span>
            )}
          </div>

          {/* Progress bar */}
          {escapePass?.escapes_total && (
            <div className="mb-3">
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    isOutOfEscapes
                      ? 'bg-red-500'
                      : isLowOnEscapes
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                        : 'bg-gradient-to-r from-[#D4AF37] to-amber-500'
                  }`}
                  style={{ width: `${(escapesRemaining / escapePass.escapes_total) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Expiration info */}
          {daysRemaining !== null && !isPendingActivation && (
            <div className={`flex items-center gap-2 text-sm ${
              daysRemaining <= 7 ? 'text-amber-400' : 'text-gray-400'
            }`}>
              <Clock className="w-4 h-4" />
              <span>{daysRemaining} day{daysRemaining !== 1 ? 's' : ''} remaining</span>
            </div>
          )}

          {isPendingActivation && (
            <div className="flex items-center gap-2 text-sm text-blue-400">
              <Clock className="w-4 h-4" />
              <span>30-day timer starts on first use</span>
            </div>
          )}

          {/* Purchase more button */}
          {(isOutOfEscapes || isLowOnEscapes) && showPurchaseButton && (
            <button
              onClick={onPurchaseClick}
              className={`w-full mt-3 py-2 rounded-lg font-bold text-sm transition-all ${
                isOutOfEscapes
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:shadow-lg hover:shadow-pink-500/30'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {isOutOfEscapes ? 'Purchase More Escapes' : 'Get More Escapes'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default EscapesRemainingBadge;
