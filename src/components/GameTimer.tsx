import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Clock } from 'lucide-react';

interface GameTimerProps {
  defaultSeconds?: number;
  onComplete?: () => void;
}

const GameTimer: React.FC<GameTimerProps> = ({ defaultSeconds = 60, onComplete }) => {
  const [seconds, setSeconds] = useState(defaultSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTime, setSelectedTime] = useState(defaultSeconds);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning && seconds > 0) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            onComplete?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, onComplete]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setSeconds(selectedTime);
  };

  const setTime = (time: number) => {
    setSelectedTime(time);
    setSeconds(time);
    setIsRunning(false);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const progress = (seconds / selectedTime) * 100;
  const isLow = seconds <= 10 && seconds > 0;

  return (
    <div className="bg-[#2D1B4E]/50 backdrop-blur-sm rounded-2xl p-4">
      <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
        <Clock className="w-4 h-4" />
        <span className="uppercase tracking-wide">Timer</span>
      </div>

      {/* Timer Display */}
      <div className="relative mb-4">
        <div className="w-32 h-32 mx-auto relative">
          {/* Background Circle */}
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="58"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="8"
            />
            <circle
              cx="64"
              cy="64"
              r="58"
              fill="none"
              stroke={isLow ? '#ef4444' : '#D4AF37'}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 58}`}
              strokeDashoffset={`${2 * Math.PI * 58 * (1 - progress / 100)}`}
              className="transition-all duration-300"
            />
          </svg>
          {/* Time Display */}
          <div className={`absolute inset-0 flex items-center justify-center text-3xl font-bold ${
            isLow ? 'text-red-500 animate-pulse' : 'text-white'
          }`}>
            {formatTime(seconds)}
          </div>
        </div>
      </div>

      {/* Quick Time Buttons */}
      <div className="flex gap-2 mb-4">
        {[30, 60, 120, 180].map((time) => (
          <button
            key={time}
            onClick={() => setTime(time)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedTime === time
                ? 'bg-[#D4AF37] text-[#2D1B4E]'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            {time < 60 ? `${time}s` : `${time / 60}m`}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        <button
          onClick={toggleTimer}
          className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
            isRunning
              ? 'bg-orange-500 text-white hover:bg-orange-600'
              : 'bg-gradient-to-r from-[#D4AF37] to-amber-500 text-[#2D1B4E] hover:shadow-lg hover:shadow-amber-500/30'
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-5 h-5" />
              Pause
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              Start
            </>
          )}
        </button>
        <button
          onClick={resetTimer}
          className="px-4 py-3 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default GameTimer;
