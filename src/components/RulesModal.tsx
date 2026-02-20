import React from 'react';
import { X, Heart, Flame, Sparkles, MapPin, Wine, Dice1, Users, Clock } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameMode: 'truth-or-dare' | 'never-have-i-ever' | 'escape-adventure';
}

const gameRules = {
  'truth-or-dare': {
    title: 'Truth or Dare',
    icon: <Dice1 className="w-8 h-8" />,
    color: 'from-pink-500 to-rose-600',
    description: 'The classic game with an intimate twist',
    rules: [
      'Take turns drawing cards from the deck',
      'Choose Truth or Dare before revealing',
      'Complete the challenge or take a drink',
      'Skip cards cost you a point',
      'Completing challenges earns points',
    ],
    drinkPairing: 'Champagne or Rosé Wine',
    tips: [
      'Start with Mild intensity to warm up',
      'Increase intensity as the night progresses',
      'Set boundaries before playing',
    ],
  },
  'never-have-i-ever': {
    title: 'Never Have I Ever',
    icon: <Users className="w-8 h-8" />,
    color: 'from-purple-500 to-indigo-600',
    description: 'Discover secrets and share experiences',
    rules: [
      'Read the "Never Have I Ever" statement',
      'If you HAVE done it, drink and lose a point',
      'If you HAVEN\'T done it, stay safe',
      'Optional: Share the story for bonus points',
      'Most points at the end wins',
    ],
    drinkPairing: 'Cocktails or Mixed Drinks',
    tips: [
      'Be honest - the game is more fun that way',
      'Stories make the game memorable',
      'Respect others\' boundaries',
    ],
  },
  'escape-adventure': {
    title: 'Intimate Escape',
    icon: <MapPin className="w-8 h-8" />,
    color: 'from-[#D4AF37] to-amber-500',
    description: 'Explore Fort Lauderdale with romantic challenges',
    rules: [
      'Follow the clues to each location',
      'Complete the intimate challenge at each spot',
      'Take photos as proof (optional)',
      'Mark locations complete to track progress',
      'Complete all locations to win',
    ],
    drinkPairing: 'Bring a flask of your favorite spirit',
    tips: [
      'Plan your route before starting',
      'Visit during evening for best atmosphere',
      'Be respectful of public spaces',
    ],
  },
};

const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose, gameMode }) => {
  if (!isOpen) return null;

  const rules = gameRules[gameMode];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg bg-gradient-to-br from-[#2D1B4E] to-[#1a0f2e] rounded-3xl border border-[#D4AF37]/30 shadow-2xl my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className={`p-6 rounded-t-3xl bg-gradient-to-r ${rules.color}`}>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-white">
              {rules.icon}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{rules.title}</h2>
              <p className="text-white/80">{rules.description}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Rules */}
          <div>
            <h3 className="text-[#D4AF37] font-bold uppercase tracking-wide text-sm mb-3 flex items-center gap-2">
              <Dice1 className="w-4 h-4" />
              How to Play
            </h3>
            <ul className="space-y-2">
              {rules.rules.map((rule, index) => (
                <li key={index} className="flex items-start gap-3 text-gray-300">
                  <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-[#D4AF37] flex-shrink-0">
                    {index + 1}
                  </span>
                  {rule}
                </li>
              ))}
            </ul>
          </div>

          {/* Drink Pairing */}
          <div className="bg-white/5 rounded-xl p-4">
            <h3 className="text-[#D4AF37] font-bold uppercase tracking-wide text-sm mb-2 flex items-center gap-2">
              <Wine className="w-4 h-4" />
              Suggested Drink Pairing
            </h3>
            <p className="text-white">{rules.drinkPairing}</p>
          </div>

          {/* Tips */}
          <div>
            <h3 className="text-[#D4AF37] font-bold uppercase tracking-wide text-sm mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Pro Tips
            </h3>
            <ul className="space-y-2">
              {rules.tips.map((tip, index) => (
                <li key={index} className="flex items-center gap-2 text-gray-300">
                  <Heart className="w-4 h-4 text-pink-400 flex-shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-0">
          <button
            onClick={onClose}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-[#D4AF37] to-amber-500 text-[#2D1B4E] font-bold text-lg hover:shadow-lg hover:shadow-amber-500/30 transition-all"
          >
            Let's Play!
          </button>
        </div>
      </div>
    </div>
  );
};

export default RulesModal;
