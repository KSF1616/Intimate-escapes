import React from 'react';
import { 
  Trophy, Clock, Lightbulb, Star, Sparkles, 
  CheckCircle, Target, Zap, Award, X 
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface BonusPoints {
  basePoints: number;
  timeBonus: number;
  hintsBonus: number;
  perfectBonus: number;
  firstEscapeBonus: number;
  stopPoints: number;
  totalPoints: number;
  breakdown: string[];
}

interface AdventureSummaryProps {
  isOpen: boolean;
  onClose: () => void;
  adventureName: string;
  timeMinutes: number;
  hintsUsed: number;
  stopsCompleted: number;
  totalStops: number;
  bonusPoints: BonusPoints | null;
  isFirstEscape?: boolean;
}

const AdventureSummary: React.FC<AdventureSummaryProps> = ({
  isOpen,
  onClose,
  adventureName,
  timeMinutes,
  hintsUsed,
  stopsCompleted,
  totalStops,
  bonusPoints,
  isFirstEscape = false,
}) => {
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins} minutes`;
  };

  const getTimeRating = () => {
    if (timeMinutes <= 60) return { label: 'Lightning Fast!', color: 'text-yellow-400', stars: 3 };
    if (timeMinutes <= 90) return { label: 'Great Pace!', color: 'text-green-400', stars: 2 };
    return { label: 'Completed', color: 'text-blue-400', stars: 1 };
  };

  const getHintsRating = () => {
    if (hintsUsed === 0) return { label: 'No Hints Needed!', color: 'text-purple-400', stars: 3 };
    if (hintsUsed <= 2) return { label: 'Minimal Help', color: 'text-green-400', stars: 2 };
    return { label: 'Got Some Help', color: 'text-blue-400', stars: 1 };
  };

  const timeRating = getTimeRating();
  const hintsRating = getHintsRating();
  const isPerfect = timeMinutes <= 60 && hintsUsed === 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-gradient-to-br from-[#2D1B4E] to-[#1a0f2e] border border-white/10 text-white max-w-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-center">
            <div className="flex flex-col items-center gap-3">
              {isPerfect ? (
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 flex items-center justify-center animate-pulse">
                  <Award className="w-10 h-10 text-[#2D1B4E]" />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-[#D4AF37] to-amber-500 flex items-center justify-center">
                  <Trophy className="w-10 h-10 text-[#2D1B4E]" />
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {isPerfect ? 'Perfect Escape!' : 'Adventure Complete!'}
                </h2>
                <p className="text-gray-400 text-sm mt-1">{adventureName}</p>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* First Escape Badge */}
          {isFirstEscape && (
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <span className="text-purple-400 font-bold">First Escape Completed!</span>
                <Sparkles className="w-5 h-5 text-purple-400" />
              </div>
              <p className="text-gray-300 text-sm">Welcome to the adventure! Here's a bonus for your first escape.</p>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Time */}
            <div className="bg-white/5 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-[#D4AF37]" />
                <span className="text-gray-400 text-sm">Time</span>
              </div>
              <p className="text-white text-xl font-bold">{formatTime(timeMinutes)}</p>
              <div className="flex items-center gap-1 mt-1">
                {[...Array(3)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 ${i < timeRating.stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} 
                  />
                ))}
                <span className={`text-xs ml-1 ${timeRating.color}`}>{timeRating.label}</span>
              </div>
            </div>

            {/* Hints */}
            <div className="bg-white/5 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-5 h-5 text-[#D4AF37]" />
                <span className="text-gray-400 text-sm">Hints Used</span>
              </div>
              <p className="text-white text-xl font-bold">{hintsUsed}</p>
              <div className="flex items-center gap-1 mt-1">
                {[...Array(3)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 ${i < hintsRating.stars ? 'text-purple-400 fill-purple-400' : 'text-gray-600'}`} 
                  />
                ))}
                <span className={`text-xs ml-1 ${hintsRating.color}`}>{hintsRating.label}</span>
              </div>
            </div>

            {/* Stops */}
            <div className="bg-white/5 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-[#D4AF37]" />
                <span className="text-gray-400 text-sm">Stops</span>
              </div>
              <p className="text-white text-xl font-bold">{stopsCompleted}/{totalStops}</p>
              <div className="flex items-center gap-1 mt-1">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-xs text-green-400">All completed!</span>
              </div>
            </div>

            {/* Total Points */}
            <div className="bg-gradient-to-r from-[#D4AF37]/20 to-amber-500/20 rounded-xl p-4 border border-[#D4AF37]/30">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-[#D4AF37]" />
                <span className="text-gray-400 text-sm">Points Earned</span>
              </div>
              <p className="text-[#D4AF37] text-2xl font-bold">
                +{bonusPoints?.totalPoints || 0}
              </p>
            </div>
          </div>

          {/* Points Breakdown */}
          {bonusPoints && bonusPoints.breakdown.length > 0 && (
            <div className="bg-white/5 rounded-xl p-4">
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Star className="w-4 h-4 text-[#D4AF37]" />
                Points Breakdown
              </h4>
              <div className="space-y-2">
                {bonusPoints.breakdown.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">{item.split(':')[0]}</span>
                    <span className="text-[#D4AF37] font-medium">{item.split(':')[1]}</span>
                  </div>
                ))}
                <div className="border-t border-white/10 pt-2 mt-2 flex items-center justify-between">
                  <span className="text-white font-semibold">Total</span>
                  <span className="text-[#D4AF37] font-bold text-lg">+{bonusPoints.totalPoints}</span>
                </div>
              </div>
            </div>
          )}

          {/* Perfect Escape Message */}
          {isPerfect && (
            <div className="bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-2">
                <Award className="w-6 h-6 text-yellow-400" />
                <span className="text-yellow-400 font-bold text-lg">Perfect Escape Achievement!</span>
              </div>
              <p className="text-gray-300 text-sm mt-2">
                You completed this adventure quickly and without any hints. Amazing teamwork!
              </p>
            </div>
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-amber-500 text-[#2D1B4E] font-bold text-lg hover:shadow-lg hover:shadow-amber-500/30 transition-all"
          >
            Continue
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdventureSummary;
