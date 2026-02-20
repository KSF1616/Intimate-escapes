import React, { useState } from 'react';
import { Users, Plus, X, ChevronLeft, ChevronRight, Crown } from 'lucide-react';

interface Player {
  id: string;
  name: string;
  score: number;
  color: string;
}

interface PlayerTrackerProps {
  players: Player[];
  currentPlayerIndex: number;
  onAddPlayer: (name: string) => void;
  onRemovePlayer: (id: string) => void;
  onNextPlayer: () => void;
  onPrevPlayer: () => void;
  onUpdateScore: (id: string, delta: number) => void;
}

const playerColors = [
  'from-pink-500 to-rose-600',
  'from-purple-500 to-indigo-600',
  'from-orange-500 to-red-600',
  'from-cyan-500 to-blue-600',
  'from-green-500 to-emerald-600',
  'from-amber-500 to-orange-600',
];

const PlayerTracker: React.FC<PlayerTrackerProps> = ({
  players,
  currentPlayerIndex,
  onAddPlayer,
  onRemovePlayer,
  onNextPlayer,
  onPrevPlayer,
  onUpdateScore,
}) => {
  const [newPlayerName, setNewPlayerName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddPlayer = () => {
    if (newPlayerName.trim()) {
      onAddPlayer(newPlayerName.trim());
      setNewPlayerName('');
      setIsAdding(false);
    }
  };

  const currentPlayer = players[currentPlayerIndex];
  const highestScore = Math.max(...players.map(p => p.score), 0);

  return (
    <div className="bg-[#2D1B4E]/50 backdrop-blur-sm rounded-2xl p-4">
      {/* Current Player Display */}
      {players.length > 0 && currentPlayer && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm uppercase tracking-wide">Current Turn</span>
            <div className="flex gap-2">
              <button
                onClick={onPrevPlayer}
                className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={onNextPlayer}
                className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className={`p-4 rounded-xl bg-gradient-to-r ${currentPlayer.color} text-white`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold">
                  {currentPlayer.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{currentPlayer.name}</h3>
                  <p className="text-white/80 text-sm">Score: {currentPlayer.score}</p>
                </div>
              </div>
              {currentPlayer.score === highestScore && currentPlayer.score > 0 && (
                <Crown className="w-6 h-6 text-[#D4AF37]" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* All Players */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm uppercase tracking-wide flex items-center gap-2">
            <Users className="w-4 h-4" />
            Players ({players.length})
          </span>
        </div>
        
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {players.map((player, index) => (
            <div
              key={player.id}
              className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                index === currentPlayerIndex
                  ? 'bg-white/20 ring-2 ring-[#D4AF37]'
                  : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${player.color} flex items-center justify-center text-white text-sm font-bold`}>
                  {player.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-white font-medium">{player.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onUpdateScore(player.id, -1)}
                  className="w-7 h-7 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all flex items-center justify-center"
                >
                  -
                </button>
                <span className="text-white font-bold w-8 text-center">{player.score}</span>
                <button
                  onClick={() => onUpdateScore(player.id, 1)}
                  className="w-7 h-7 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all flex items-center justify-center"
                >
                  +
                </button>
                <button
                  onClick={() => onRemovePlayer(player.id)}
                  className="w-7 h-7 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all flex items-center justify-center ml-2"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Player */}
      {isAdding ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddPlayer()}
            placeholder="Enter name..."
            className="flex-1 px-4 py-2 rounded-xl bg-white/10 text-white placeholder-gray-400 border border-white/10 focus:border-[#D4AF37] focus:outline-none"
            autoFocus
          />
          <button
            onClick={handleAddPlayer}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-amber-500 text-[#2D1B4E] font-bold hover:shadow-lg transition-all"
          >
            Add
          </button>
          <button
            onClick={() => {
              setIsAdding(false);
              setNewPlayerName('');
            }}
            className="px-4 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full py-3 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Player
        </button>
      )}
    </div>
  );
};

export default PlayerTracker;
export type { Player };
export { playerColors };
