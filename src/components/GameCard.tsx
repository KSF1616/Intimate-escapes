import React, { useState } from 'react';
import { Heart, Lock, Flame, Sparkles, MessageCircle, RotateCcw, Star, ChevronRight, Ticket } from 'lucide-react';
import { GameCard as GameCardType, IntensityLevel } from '@/data/gameData';
import { useAppContext } from '@/contexts/AppContext';
import { LOGO_URL, APP_NAME } from '@/lib/constants';
import PassPurchaseModal from './PassPurchaseModal';

interface GameCardProps {
  card: GameCardType;
  onNext: () => void;
  onFavorite: (id: string) => void;
  isFavorite: boolean;
  isFlipped: boolean;
  onFlip: () => void;
}

const categoryIcons: Record<string, React.ReactNode> = {
  'Romance': <Heart className="w-5 h-5" />,
  'Secrets': <Lock className="w-5 h-5" />,
  'Wild Stories': <Flame className="w-5 h-5" />,
  'Fantasy': <Sparkles className="w-5 h-5" />,
  'Confessions': <MessageCircle className="w-5 h-5" />,
};

const intensityColors: Record<IntensityLevel, string> = {
  mild: 'from-pink-400 to-rose-500',
  spicy: 'from-orange-500 to-red-600',
  xxx: 'from-purple-600 to-pink-600',
};

const intensityLabels: Record<IntensityLevel, string> = {
  mild: 'Mild',
  spicy: 'Spicy',
  xxx: 'XXX',
};

// Logo watermark component
const LogoWatermark: React.FC<{ position?: 'bottom-right' | 'bottom-left' | 'center' }> = ({ 
  position = 'bottom-right' 
}) => {
  const positionClasses = {
    'bottom-right': 'bottom-3 right-3',
    'bottom-left': 'bottom-3 left-3',
    'center': 'inset-0 flex items-center justify-center'
  };

  return (
    <div className={`absolute ${positionClasses[position]} pointer-events-none`}>
      <img 
        src={LOGO_URL} 
        alt={APP_NAME}
        className={`${position === 'center' ? 'w-24 h-24 opacity-5' : 'w-10 h-10 opacity-30'} object-contain`}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
        }}
      />
    </div>
  );
};

const GameCard: React.FC<GameCardProps> = ({ 
  card, 
  onNext, 
  onFavorite, 
  isFavorite, 
  isFlipped, 
  onFlip 
}) => {
  const { hasActivePass, refreshPass } = useAppContext();
  const [showPassModal, setShowPassModal] = useState(false);

  const requiresPass = !hasActivePass;

  const handleFlip = () => {
    if (requiresPass) {
      setShowPassModal(true);
      return;
    }
    onFlip();
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (requiresPass) {
      setShowPassModal(true);
      return;
    }
    onNext();
  };

  return (
    <>
      <div className="perspective-1000 w-full max-w-md mx-auto">
        <div 
          className={`relative w-full h-96 transition-transform duration-700 transform-style-3d cursor-pointer ${
            isFlipped && hasActivePass ? 'rotate-y-180' : ''
          }`}
          onClick={handleFlip}
        >
          {/* Card Back */}
          <div className="absolute inset-0 backface-hidden">
            <div className="w-full h-full rounded-3xl bg-gradient-to-br from-[#2D1B4E] to-[#1a0f2e] border border-[#D4AF37]/30 shadow-2xl shadow-purple-900/50 flex items-center justify-center relative overflow-hidden">
              {/* Background logo watermark */}
              <LogoWatermark position="center" />
              
              <div className="text-center relative z-10">
                {requiresPass ? (
                  <>
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
                      <Lock className="w-12 h-12 text-white" />
                    </div>
                    <p className="text-pink-400 text-lg font-medium">Pass Required</p>
                    <p className="text-gray-400 text-sm mt-2 mb-4">Get a pass to unlock all cards</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowPassModal(true);
                      }}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold flex items-center gap-2 mx-auto hover:shadow-lg hover:shadow-pink-500/30 transition-all"
                    >
                      <Ticket className="w-5 h-5" />
                      Get Pass
                    </button>
                  </>
                ) : (
                  <>
                    {/* Logo on card back */}
                    <div className="w-24 h-24 mx-auto mb-4 rounded-2xl overflow-hidden bg-gradient-to-br from-[#D4AF37]/20 to-amber-600/20 flex items-center justify-center border border-[#D4AF37]/30">
                      <img 
                        src={LOGO_URL} 
                        alt={APP_NAME}
                        className="w-20 h-20 object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.parentElement!.innerHTML = '<div class="w-12 h-12 text-[#D4AF37]"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></div>';
                        }}
                      />
                    </div>
                    <p className="text-[#D4AF37] text-lg font-medium">Tap to Reveal</p>
                    <p className="text-gray-400 text-sm mt-2">Your fate awaits...</p>
                  </>
                )}
              </div>
              
              {/* Corner watermark */}
              <LogoWatermark position="bottom-right" />
            </div>
          </div>

          {/* Card Front */}
          <div className="absolute inset-0 backface-hidden rotate-y-180">
            <div className={`w-full h-full rounded-3xl bg-gradient-to-br ${intensityColors[card.intensity]} p-1`}>
              <div className="w-full h-full rounded-3xl bg-[#1a0f2e] p-6 flex flex-col relative overflow-hidden">
                {/* Background logo watermark */}
                <LogoWatermark position="center" />
                
                {/* Header */}
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase bg-gradient-to-r ${intensityColors[card.intensity]} text-white`}>
                      {card.type === 'truth' ? 'Truth' : card.type === 'dare' ? 'Dare' : 'Never Have I Ever'}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs bg-white/10 text-white`}>
                      {intensityLabels[card.intensity]}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onFavorite(card.id);
                    }}
                    className={`p-2 rounded-full transition-all ${
                      isFavorite 
                        ? 'bg-[#D4AF37] text-[#2D1B4E]' 
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    <Star className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {/* Category */}
                <div className="flex items-center gap-2 text-gray-400 mb-4 relative z-10">
                  {categoryIcons[card.category]}
                  <span className="text-sm">{card.category}</span>
                </div>

                {/* Content */}
                <div className="flex-1 flex items-center justify-center relative z-10">
                  <p className="text-white text-xl md:text-2xl font-medium text-center leading-relaxed">
                    {card.content}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-4 relative z-10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onFlip();
                    }}
                    className="flex-1 py-3 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-5 h-5" />
                    Flip
                  </button>
                  <button
                    onClick={handleNext}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-amber-500 text-[#2D1B4E] font-bold hover:shadow-lg hover:shadow-amber-500/30 transition-all flex items-center justify-center gap-2"
                  >
                    Next
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Corner watermark on front */}
                <LogoWatermark position="bottom-right" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pass Purchase Modal */}
      <PassPurchaseModal
        isOpen={showPassModal}
        onClose={() => setShowPassModal(false)}
        onSuccess={() => {
          setShowPassModal(false);
          refreshPass();
        }}
      />
    </>
  );
};

export default GameCard;
