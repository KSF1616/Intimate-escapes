import React from 'react';
import { Heart, Flame, Sparkles, AlertTriangle } from 'lucide-react';
import { IntensityLevel } from '@/data/gameData';

interface IntensitySelectorProps {
  selected: IntensityLevel[];
  onChange: (levels: IntensityLevel[]) => void;
}

const intensityOptions: { level: IntensityLevel; label: string; description: string; icon: React.ReactNode; color: string; bgColor: string }[] = [
  {
    level: 'mild',
    label: 'Mild',
    description: 'Romantic & Playful',
    icon: <Heart className="w-6 h-6" />,
    color: 'text-pink-400',
    bgColor: 'from-pink-400 to-rose-500',
  },
  {
    level: 'spicy',
    label: 'Spicy',
    description: 'Flirty & Daring',
    icon: <Flame className="w-6 h-6" />,
    color: 'text-orange-400',
    bgColor: 'from-orange-500 to-red-600',
  },
  {
    level: 'xxx',
    label: 'XXX',
    description: 'Explicit & Intense',
    icon: <Sparkles className="w-6 h-6" />,
    color: 'text-purple-400',
    bgColor: 'from-purple-600 to-pink-600',
  },
];

const IntensitySelector: React.FC<IntensitySelectorProps> = ({ selected, onChange }) => {
  const toggleLevel = (level: IntensityLevel) => {
    if (selected.includes(level)) {
      // Don't allow deselecting all
      if (selected.length > 1) {
        onChange(selected.filter(l => l !== level));
      }
    } else {
      onChange([...selected, level]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-white text-sm">
        <AlertTriangle className="w-4 h-4" />
        <span>Select intensity levels for your game</span>
      </div>
      

      <div className="grid grid-cols-3 gap-3">
        {intensityOptions.map((option) => {
          const isSelected = selected.includes(option.level);
          return (
            <button
              key={option.level}
              onClick={() => toggleLevel(option.level)}
              className={`relative p-4 rounded-2xl transition-all duration-300 ${
                isSelected
                  ? `bg-gradient-to-br ${option.bgColor} shadow-lg`
                  : 'bg-white/5 hover:bg-white/10 border border-white/10'
              }`}
            >
              <div className={`flex flex-col items-center gap-2 ${isSelected ? 'text-white' : option.color}`}>
                {option.icon}
                <span className="font-bold text-white">{option.label}</span>
                <span className={`text-xs ${isSelected ? 'text-white/90' : 'text-white/70'}`}>
                  {option.description}
                </span>
              </div>
              {isSelected && (
                <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-white" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

};

export default IntensitySelector;
