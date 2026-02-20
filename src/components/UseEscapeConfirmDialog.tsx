import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Sparkles, AlertTriangle, Clock, Ticket } from 'lucide-react';

interface UseEscapeConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  adventureName: string;
  escapesRemaining: number;
  escapesTotal: number;
  isFirstUse: boolean;
  expiresAt?: string | null;
  isLoading?: boolean;
}

const UseEscapeConfirmDialog: React.FC<UseEscapeConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  adventureName,
  escapesRemaining,
  escapesTotal,
  isFirstUse,
  expiresAt,
  isLoading = false,
}) => {
  const isLastEscape = escapesRemaining === 1;
  const usagePercentage = ((escapesTotal - escapesRemaining + 1) / escapesTotal) * 100;

  // Format expiration date
  const formatExpirationDate = () => {
    if (!expiresAt) return null;
    const date = new Date(expiresAt);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Calculate days remaining
  const getDaysRemaining = () => {
    if (!expiresAt) return null;
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = getDaysRemaining();

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="bg-[#2D1B4E] border border-white/10 text-white max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-xl">
            {isLastEscape ? (
              <>
                <AlertTriangle className="w-6 h-6 text-amber-400" />
                Last Escape!
              </>
            ) : isFirstUse ? (
              <>
                <Sparkles className="w-6 h-6 text-[#D4AF37]" />
                Start Your Adventure
              </>
            ) : (
              <>
                <Ticket className="w-6 h-6 text-[#D4AF37]" />
                Use an Escape
              </>
            )}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-300 space-y-4">
            {/* Adventure Name */}
            <div className="bg-white/5 rounded-xl p-4 mt-4">
              <p className="text-sm text-gray-400 mb-1">Starting Adventure</p>
              <p className="text-white font-semibold text-lg">{adventureName}</p>
            </div>

            {/* First Use Warning */}
            {isFirstUse && (
              <div className="bg-gradient-to-r from-[#D4AF37]/20 to-amber-500/20 border border-[#D4AF37]/30 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[#D4AF37] font-medium mb-1">30-Day Countdown Starts</p>
                    <p className="text-sm text-gray-300">
                      This is your first escape! Starting this adventure will activate your 30-day pass timer.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Last Escape Warning */}
            {isLastEscape && (
              <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-amber-400 font-medium mb-1">This is Your Last Escape!</p>
                    <p className="text-sm text-gray-300">
                      Make it count! After this, you'll need to purchase more escapes to continue your adventures.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Escapes Remaining */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Escapes Remaining</span>
                <span className={`font-bold ${isLastEscape ? 'text-amber-400' : 'text-white'}`}>
                  {escapesRemaining} of {escapesTotal}
                </span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    isLastEscape
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                      : 'bg-gradient-to-r from-[#D4AF37] to-amber-500'
                  }`}
                  style={{ width: `${100 - usagePercentage + (100 / escapesTotal)}%` }}
                />
              </div>
            </div>

            {/* Expiration Info */}
            {expiresAt && daysRemaining !== null && (
              <div className="flex items-center justify-between text-sm bg-white/5 rounded-lg px-3 py-2">
                <span className="text-gray-400 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Pass Expires
                </span>
                <span className={`font-medium ${daysRemaining <= 7 ? 'text-amber-400' : 'text-white'}`}>
                  {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} left
                </span>
              </div>
            )}

            {/* Confirmation Text */}
            <p className="text-center text-sm pt-2">
              {isFirstUse
                ? 'Ready to begin your intimate journey?'
                : `This will use 1 of your ${escapesRemaining} remaining escape${escapesRemaining !== 1 ? 's' : ''}.`}
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-3 sm:gap-3">
          <AlertDialogCancel
            onClick={onClose}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
            disabled={isLoading}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className={`font-bold ${
              isLastEscape
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'
                : 'bg-gradient-to-r from-[#D4AF37] to-amber-500 hover:from-[#c9a432] hover:to-amber-600'
            } text-[#2D1B4E]`}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Starting...
              </span>
            ) : isFirstUse ? (
              'Start Adventure'
            ) : (
              'Use Escape'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default UseEscapeConfirmDialog;
