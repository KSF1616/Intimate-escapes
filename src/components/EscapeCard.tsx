import React, { useState } from 'react';
import { MapPin, Eye, EyeOff, CheckCircle, Navigation, Flame, Heart, Sparkles } from 'lucide-react';
import { EscapeLocation, IntensityLevel } from '@/data/gameData';

interface EscapeCardProps {
  location: EscapeLocation;
  isRevealed: boolean;
  isCompleted: boolean;
  onReveal: () => void;
  onComplete: () => void;
  onNavigate: () => void;
}

const intensityColors: Record<IntensityLevel, string> = {
  mild: 'from-pink-400 to-rose-500',
  spicy: 'from-orange-500 to-red-600',
  xxx: 'from-purple-600 to-pink-600',
};

const intensityIcons: Record<IntensityLevel, React.ReactNode> = {
  mild: <Heart className="w-4 h-4" />,
  spicy: <Flame className="w-4 h-4" />,
  xxx: <Sparkles className="w-4 h-4" />,
};

const EscapeCard: React.FC<EscapeCardProps> = ({
  location,
  isRevealed,
  isCompleted,
  onReveal,
  onComplete,
  onNavigate,
}) => {
  const [showChallenge, setShowChallenge] = useState(false);

  return (
    <div className={`relative rounded-2xl overflow-hidden transition-all duration-500 ${
      isCompleted ? 'ring-2 ring-green-500 ring-offset-2 ring-offset-[#1a0f2e]' : ''
    }`}>
      {/* Background Image */}
      <div className="relative h-64 md:h-72">
        <img
          src={location.image}
          alt={location.name}
          className={`w-full h-full object-cover transition-all duration-500 ${
            !isRevealed ? 'blur-md' : ''
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a0f2e] via-[#1a0f2e]/50 to-transparent" />
        
        {/* Completed Badge */}
        {isCompleted && (
          <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full flex items-center gap-2 text-sm font-medium">
            <CheckCircle className="w-4 h-4" />
            Completed
          </div>
        )}

        {/* Intensity Badge */}
        <div className={`absolute top-4 left-4 px-3 py-1 rounded-full flex items-center gap-2 text-sm font-medium text-white bg-gradient-to-r ${intensityColors[location.intensity]}`}>
          {intensityIcons[location.intensity]}
          {location.intensity.charAt(0).toUpperCase() + location.intensity.slice(1)}
        </div>

        {/* Location Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-white text-xl font-bold mb-1">{location.name}</h3>
          <p className="text-gray-300 text-sm flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {location.address}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="bg-[#2D1B4E]/50 backdrop-blur-sm p-4">
        <p className="text-gray-300 text-sm mb-4">{location.description}</p>

        {/* Clue Section */}
        <div className="bg-[#1a0f2e] rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#D4AF37] font-medium text-sm uppercase tracking-wide">
              {isRevealed ? 'Your Clue' : 'Hidden Clue'}
            </span>
            <button
              onClick={onReveal}
              className="text-gray-400 hover:text-white transition-colors"
            >
              {isRevealed ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {isRevealed ? (
            <p className="text-white italic leading-relaxed">{location.clue}</p>
          ) : (
            <p className="text-gray-500 italic">Tap the eye to reveal your clue...</p>
          )}
        </div>

        {/* Challenge Section */}
        {isRevealed && (
          <div className="mb-4">
            <button
              onClick={() => setShowChallenge(!showChallenge)}
              className={`w-full py-2 rounded-xl text-sm font-medium transition-all ${
                showChallenge 
                  ? 'bg-gradient-to-r from-[#8B1538] to-pink-600 text-white' 
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {showChallenge ? 'Hide Challenge' : 'Reveal Intimate Challenge'}
            </button>
            {showChallenge && (
              <div className="mt-3 p-4 rounded-xl bg-gradient-to-r from-[#8B1538]/20 to-pink-600/20 border border-[#8B1538]/30">
                <p className="text-white text-center">{location.challenge}</p>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onNavigate}
            className="flex-1 py-3 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-all flex items-center justify-center gap-2"
          >
            <Navigation className="w-5 h-5" />
            Navigate
          </button>
          <button
            onClick={onComplete}
            disabled={isCompleted}
            className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
              isCompleted
                ? 'bg-green-500/20 text-green-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-[#D4AF37] to-amber-500 text-[#2D1B4E] hover:shadow-lg hover:shadow-amber-500/30'
            }`}
          >
            <CheckCircle className="w-5 h-5" />
            {isCompleted ? 'Done!' : 'Complete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EscapeCard;
