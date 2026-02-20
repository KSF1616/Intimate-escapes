import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, Eye, EyeOff, CheckCircle, Navigation, Flame, Heart, Sparkles,
  ChevronDown, ChevronUp, Lock, Unlock, Clock, Trophy, Map, Lightbulb, Camera, Image, Ticket, AlertTriangle, Zap
} from 'lucide-react';
import { EscapeAdventure, EscapeStop, IntensityLevel } from '@/data/gameData';
import { useAppContext, BonusPointsResult } from '@/contexts/AppContext';
import { LOGO_URL, APP_NAME } from '@/lib/constants';
import PhotoUploadModal from './PhotoUploadModal';
import PassPurchaseModal from './PassPurchaseModal';
import UseEscapeConfirmDialog from './UseEscapeConfirmDialog';
import EscapesRemainingBadge from './EscapesRemainingBadge';
import AdventureSummary from './AdventureSummary';

interface EscapeAdventureCardProps {
  adventure: EscapeAdventure;
  completedStops: string[];
  revealedStops: string[];
  onRevealStop: (stopId: string) => void;
  onCompleteStop: (stopId: string) => void;
  onNavigate: (stop: EscapeStop) => void;
  userId?: string | null;
  stopPhotoCount?: Record<string, number>;
  onPhotoUploaded?: () => void;
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

const EscapeAdventureCard: React.FC<EscapeAdventureCardProps> = ({
  adventure,
  completedStops,
  revealedStops,
  onRevealStop,
  onCompleteStop,
  onNavigate,
  userId,
  stopPhotoCount = {},
  onPhotoUploaded,
}) => {
  const { 
    hasActivePass, 
    hasEscapeAccess,
    escapePass,
    escapesRemaining, 
    loadingPass, 
    refreshPass,
    useEscape,
    completeEscape,
    activePass
  } = useAppContext();

  const [isExpanded, setIsExpanded] = useState(false);
  const [activeStopIndex, setActiveStopIndex] = useState(0);
  const [showHint, setShowHint] = useState<string | null>(null);
  const [showChallenge, setShowChallenge] = useState<string | null>(null);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [showPassModal, setShowPassModal] = useState(false);
  const [showEscapeConfirm, setShowEscapeConfirm] = useState(false);
  const [isUsingEscape, setIsUsingEscape] = useState(false);
  const [adventureStarted, setAdventureStarted] = useState(false);
  
  // Tracking state for bonus points
  const [hintsUsed, setHintsUsed] = useState(0);
  const [adventureStartTime, setAdventureStartTime] = useState<Date | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [completionData, setCompletionData] = useState<{
    bonusPoints: BonusPointsResult | null;
    isFirstEscape: boolean;
    timeMinutes: number;
  } | null>(null);

  const completedCount = adventure.stops.filter(s => completedStops.includes(s.id)).length;
  const isAdventureComplete = completedCount === adventure.stops.length;
  const progressPercent = (completedCount / adventure.stops.length) * 100;

  // Check if this adventure has been started (at least one stop revealed or completed)
  const hasStartedAdventure = adventure.stops.some(s => 
    revealedStops.includes(s.id) || completedStops.includes(s.id)
  ) || adventureStarted;

  // Determine which stops are unlocked (first stop always unlocked, others unlock when previous is completed)
  const isStopUnlocked = (index: number) => {
    if (index === 0) return true;
    return completedStops.includes(adventure.stops[index - 1].id);
  };

  const activeStop = adventure.stops[activeStopIndex];
  const activeStopPhotoCount = stopPhotoCount[activeStop?.id] || 0;

  // Check if user needs a pass to access content
  const requiresPass = !hasActivePass && !hasEscapeAccess;

  // Check if user has no escapes remaining
  const noEscapesRemaining = escapesRemaining === 0 && !['day', 'weekend', 'annual'].includes(activePass?.pass_type || '');

  // Check if this is the first use (pass not yet activated)
  const isFirstUse = escapePass && !escapePass.activated_at;

  // Check if user has legacy unlimited pass
  const hasUnlimitedPass = activePass && ['day', 'weekend', 'annual'].includes(activePass.pass_type);

  // Track hint usage
  const handleShowHint = (stopId: string) => {
    if (showHint !== stopId) {
      setHintsUsed(prev => prev + 1);
    }
    setShowHint(showHint === stopId ? null : stopId);
  };

  // Handle adventure completion
  const handleAdventureComplete = async () => {
    if (!adventureStartTime) return;

    const endTime = new Date();
    const timeMinutes = Math.round((endTime.getTime() - adventureStartTime.getTime()) / (1000 * 60));

    // Call the completeEscape function to award bonus points
    const result = await completeEscape(
      adventure.id,
      adventure.name,
      hintsUsed,
      timeMinutes,
      adventure.stops.length,
      adventure.stops.length
    );

    if (result.success) {
      setCompletionData({
        bonusPoints: result.bonusPoints || null,
        isFirstEscape: result.isFirstEscape || false,
        timeMinutes
      });
      setShowSummary(true);
    }
  };

  // Check for adventure completion
  useEffect(() => {
    if (isAdventureComplete && adventureStartTime && !completionData) {
      handleAdventureComplete();
    }
  }, [isAdventureComplete, adventureStartTime]);

  const handleStartAdventure = () => {
    // If no pass at all, show purchase modal
    if (requiresPass) {
      setShowPassModal(true);
      return;
    }

    // If no escapes remaining and not unlimited, show purchase modal
    if (noEscapesRemaining && !hasUnlimitedPass) {
      setShowPassModal(true);
      return;
    }

    // If already started this adventure, just expand
    if (hasStartedAdventure) {
      setIsExpanded(true);
      return;
    }

    // Show confirmation dialog before using an escape
    if (!hasUnlimitedPass) {
      setShowEscapeConfirm(true);
    } else {
      // Unlimited pass - just start
      setAdventureStarted(true);
      setAdventureStartTime(new Date());
      setIsExpanded(true);
    }
  };

  const handleConfirmUseEscape = async () => {
    setIsUsingEscape(true);
    
    try {
      const success = await useEscape(adventure.id, adventure.name);
      
      if (success) {
        setAdventureStarted(true);
        setAdventureStartTime(new Date());
        setIsExpanded(true);
        setShowEscapeConfirm(false);
      }
    } finally {
      setIsUsingEscape(false);
    }
  };

  const handleRevealClue = (stopId: string) => {
    if (requiresPass) {
      setShowPassModal(true);
      return;
    }
    
    // If adventure not started and not unlimited, need to use an escape first
    if (!hasStartedAdventure && !hasUnlimitedPass) {
      setShowEscapeConfirm(true);
      return;
    }

    onRevealStop(stopId);
  };

  const handleShowChallenge = (stopId: string) => {
    if (requiresPass) {
      setShowPassModal(true);
      return;
    }
    setShowChallenge(showChallenge === stopId ? null : stopId);
  };

  const handleCardClick = () => {
    if (isExpanded) {
      setIsExpanded(false);
    } else {
      handleStartAdventure();
    }
  };

  // Calculate elapsed time for display
  const getElapsedTime = () => {
    if (!adventureStartTime) return null;
    const now = new Date();
    const minutes = Math.floor((now.getTime() - adventureStartTime.getTime()) / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <>
      <div className={`rounded-2xl overflow-hidden transition-all duration-500 ${
        isAdventureComplete ? 'ring-2 ring-green-500 ring-offset-2 ring-offset-[#1a0f2e]' : ''
      }`}>
        {/* Header / Cover */}
        <div 
          className="relative cursor-pointer"
          onClick={handleCardClick}
        >
          <div className="relative h-56 md:h-64">
            <img
              src={adventure.coverImage}
              alt={adventure.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1a0f2e] via-[#1a0f2e]/60 to-transparent" />
            
            {/* Logo Watermark */}
            <div className="absolute bottom-4 right-4 opacity-40 pointer-events-none">
              <img 
                src={LOGO_URL} 
                alt={APP_NAME}
                className="w-12 h-12 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>

            {/* Badges */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <div className={`px-3 py-1 rounded-full flex items-center gap-2 text-sm font-medium text-white bg-gradient-to-r ${intensityColors[adventure.intensity]}`}>
                {intensityIcons[adventure.intensity]}
                {adventure.intensity.charAt(0).toUpperCase() + adventure.intensity.slice(1)}
              </div>
              <div className="px-3 py-1 rounded-full bg-black/50 text-white text-sm flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {adventure.duration}
              </div>
            </div>

            {/* Status Badges */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
              {/* Completion Badge */}
              {isAdventureComplete && (
                <div className="bg-green-500 text-white px-3 py-1 rounded-full flex items-center gap-2 text-sm font-medium">
                  <Trophy className="w-4 h-4" />
                  Completed!
                </div>
              )}

              {/* Pass Required Badge */}
              {requiresPass && !isAdventureComplete && (
                <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-3 py-1 rounded-full flex items-center gap-2 text-sm font-medium">
                  <Lock className="w-4 h-4" />
                  Pass Required
                </div>
              )}

              {/* No Escapes Badge */}
              {!requiresPass && noEscapesRemaining && !hasUnlimitedPass && !isAdventureComplete && !hasStartedAdventure && (
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full flex items-center gap-2 text-sm font-medium">
                  <AlertTriangle className="w-4 h-4" />
                  No Escapes Left
                </div>
              )}

              {/* Escapes Remaining Badge (when has escapes) */}
              {!requiresPass && !hasUnlimitedPass && escapesRemaining > 0 && !isAdventureComplete && (
                <div className="bg-gradient-to-r from-[#D4AF37]/80 to-amber-500/80 text-[#2D1B4E] px-3 py-1 rounded-full flex items-center gap-2 text-sm font-bold">
                  <Ticket className="w-4 h-4" />
                  {escapesRemaining} escape{escapesRemaining !== 1 ? 's' : ''} left
                </div>
              )}

              {/* In Progress Badge */}
              {hasStartedAdventure && !isAdventureComplete && completedCount > 0 && (
                <div className="bg-blue-500/80 text-white px-3 py-1 rounded-full flex items-center gap-2 text-sm font-medium">
                  <Map className="w-4 h-4" />
                  In Progress
                </div>
              )}
            </div>

            {/* Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white text-2xl font-bold mb-1">{adventure.name}</h3>
                  <p className="text-gray-300 text-sm flex items-center gap-2">
                    <Map className="w-4 h-4" />
                    {adventure.stops.length} stops • {completedCount} completed
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white">
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4 bg-white/20 rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#D4AF37] to-amber-500 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="bg-[#2D1B4E]/50 backdrop-blur-sm">
            {/* Description */}
            <div className="p-5 border-b border-white/10">
              <p className="text-white">{adventure.description}</p>

              
              {/* Active Adventure Stats */}
              {hasStartedAdventure && !isAdventureComplete && (
                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="bg-white/5 rounded-xl p-3 text-center">
                    <Clock className="w-5 h-5 text-[#D4AF37] mx-auto mb-1" />
                    <p className="text-white font-bold">{getElapsedTime() || '0m'}</p>
                    <p className="text-gray-400 text-xs">Time</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 text-center">
                    <Lightbulb className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                    <p className="text-white font-bold">{hintsUsed}</p>
                    <p className="text-gray-400 text-xs">Hints Used</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 text-center">
                    <Zap className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                    <p className="text-white font-bold">{completedCount}/{adventure.stops.length}</p>
                    <p className="text-gray-400 text-xs">Stops</p>
                  </div>
                </div>
              )}

              {isAdventureComplete && (
                <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30">
                  <div className="flex items-center gap-2 text-green-400 font-medium mb-1">
                    <Trophy className="w-5 h-5" />
                    Reward Unlocked!
                  </div>
                  <p className="text-white text-sm">{adventure.reward}</p>
                </div>
              )}

              {/* Escapes Remaining Info */}
              {!hasUnlimitedPass && escapePass && (
                <div className="mt-4">
                  <EscapesRemainingBadge 
                    variant="full" 
                    showPurchaseButton={noEscapesRemaining}
                    onPurchaseClick={() => setShowPassModal(true)}
                  />
                </div>
              )}

              {/* Pass Required Banner */}
              {requiresPass && (
                <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-pink-500/20 to-rose-500/20 border border-pink-500/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center">
                        <Ticket className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-medium">Pass Required</p>
                        <p className="text-gray-400 text-sm">Get a pass to unlock clues & challenges</p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowPassModal(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold text-sm hover:shadow-lg hover:shadow-pink-500/30 transition-all"
                    >
                      Get Pass
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Stop Navigation */}
            <div className="p-5 border-b border-white/10">
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {adventure.stops.map((stop, index) => {
                  const isCompleted = completedStops.includes(stop.id);
                  const isUnlocked = isStopUnlocked(index);
                  const isActive = index === activeStopIndex;
                  const photoCount = stopPhotoCount[stop.id] || 0;

                  return (
                    <button
                      key={stop.id}
                      onClick={() => isUnlocked && setActiveStopIndex(index)}
                      disabled={!isUnlocked}
                      className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                        isActive 
                          ? 'bg-gradient-to-r from-[#D4AF37] to-amber-500 text-[#2D1B4E] font-bold'
                          : isCompleted
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : isUnlocked
                              ? 'bg-white/10 text-white hover:bg-white/20'
                              : 'bg-white/5 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : isUnlocked ? (
                        <Unlock className="w-4 h-4" />
                      ) : (
                        <Lock className="w-4 h-4" />
                      )}
                      Stop {stop.stopNumber}
                      {photoCount > 0 && (
                        <span className={`ml-1 px-1.5 py-0.5 rounded text-xs ${
                          isActive ? 'bg-[#2D1B4E]/30' : 'bg-white/20'
                        }`}>
                          <Image className="w-3 h-3 inline mr-0.5" />
                          {photoCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Stop Details */}
            {activeStop && (
              <div className="p-5">
                {/* Stop Header */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                    <img 
                      src={activeStop.image} 
                      alt={activeStop.name}
                      className={`w-full h-full object-cover ${
                        !isStopUnlocked(activeStopIndex) ? 'blur-md' : ''
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[#D4AF37] text-sm font-medium">
                        Stop {activeStop.stopNumber} of {adventure.stops.length}
                      </span>
                      {completedStops.includes(activeStop.id) && (
                        <span className="text-green-400 text-xs flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Completed
                        </span>
                      )}
                    </div>
                    <h4 className="text-white text-lg font-bold">{activeStop.name}</h4>
                    <p className="text-gray-400 text-sm flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" />
                      {activeStop.address}
                    </p>
                  </div>
                </div>

                {/* Clue Section */}
                <div className="bg-[#1a0f2e] rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[#D4AF37] font-medium text-sm uppercase tracking-wide flex items-center gap-2">
                      <Map className="w-4 h-4" />
                      {revealedStops.includes(activeStop.id) && (hasActivePass || hasStartedAdventure) ? 'Your Clue' : 'Hidden Clue'}
                    </span>
                    <button
                      onClick={() => handleRevealClue(activeStop.id)}
                      className="text-gray-400 hover:text-white transition-colors flex items-center gap-1 text-sm"
                    >
                      {requiresPass ? (
                        <>
                          <Lock className="w-4 h-4" />
                          Unlock
                        </>
                      ) : revealedStops.includes(activeStop.id) ? (
                        <>
                          <EyeOff className="w-4 h-4" />
                          Hide
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4" />
                          Reveal
                        </>
                      )}
                    </button>
                  </div>
                  {revealedStops.includes(activeStop.id) && (hasActivePass || hasStartedAdventure) ? (
                    <p className="text-white italic leading-relaxed">{activeStop.clue}</p>
                  ) : requiresPass ? (
                    <div className="text-center py-4">
                      <Lock className="w-8 h-8 mx-auto text-gray-500 mb-2" />
                      <p className="text-gray-500 italic">Purchase a pass to reveal clues and challenges</p>
                      <button
                        onClick={() => setShowPassModal(true)}
                        className="mt-3 px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-medium"
                      >
                        Get Pass
                      </button>
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">Tap reveal to see your clue for this stop...</p>
                  )}
                </div>

                {/* Hint Button - Only show if has pass */}
                {revealedStops.includes(activeStop.id) && (hasActivePass || hasStartedAdventure) && (
                  <button
                    onClick={() => handleShowHint(activeStop.id)}
                    className={`w-full mb-4 py-2 rounded-xl transition-all flex items-center justify-center gap-2 text-sm ${
                      showHint === activeStop.id 
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-white/5 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    <Lightbulb className="w-4 h-4" />
                    {showHint === activeStop.id ? 'Hide Hint' : 'Need a Hint?'}
                    {showHint !== activeStop.id && (
                      <span className="text-xs text-gray-500">(affects bonus points)</span>
                    )}
                  </button>
                )}
                {showHint === activeStop.id && (hasActivePass || hasStartedAdventure) && (
                  <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
                    <p className="text-white text-sm">{activeStop.hint}</p>
                  </div>
                )}


                {/* Challenge Section - Only show if has pass */}
                {revealedStops.includes(activeStop.id) && (
                  <div className="mb-4">
                    <button
                      onClick={() => handleShowChallenge(activeStop.id)}
                      className={`w-full py-3 rounded-xl text-sm font-medium transition-all ${
                        showChallenge === activeStop.id && (hasActivePass || hasStartedAdventure)
                          ? 'bg-gradient-to-r from-[#8B1538] to-pink-600 text-white' 
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      {requiresPass ? (
                        <span className="flex items-center justify-center gap-2">
                          <Lock className="w-4 h-4" />
                          Unlock Intimate Challenge
                        </span>
                      ) : showChallenge === activeStop.id ? (
                        'Hide Intimate Challenge'
                      ) : (
                        'Reveal Intimate Challenge'
                      )}
                    </button>
                    {showChallenge === activeStop.id && (hasActivePass || hasStartedAdventure) && (
                      <div className="mt-3 p-4 rounded-xl bg-gradient-to-r from-[#8B1538]/20 to-pink-600/20 border border-[#8B1538]/30">
                        <p className="text-white text-center leading-relaxed">{activeStop.challenge}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Photo Memory Section - Show when stop is completed */}
                {completedStops.includes(activeStop.id) && userId && (
                  <div className="mb-4 p-4 rounded-xl bg-gradient-to-r from-[#D4AF37]/10 to-amber-500/10 border border-[#D4AF37]/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#D4AF37] to-amber-500 flex items-center justify-center">
                          <Camera className="w-5 h-5 text-[#2D1B4E]" />
                        </div>
                        <div>
                          <p className="text-white font-medium">Capture This Memory</p>
                          <p className="text-gray-400 text-sm">
                            {activeStopPhotoCount > 0 
                              ? `${activeStopPhotoCount} photo${activeStopPhotoCount !== 1 ? 's' : ''} saved`
                              : 'Add a photo from this location'
                            }
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowPhotoUpload(true)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-amber-500 text-[#2D1B4E] font-bold text-sm hover:shadow-lg hover:shadow-amber-500/30 transition-all flex items-center gap-2"
                      >
                        <Camera className="w-4 h-4" />
                        Add Photo
                      </button>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => onNavigate(activeStop)}
                    className="flex-1 py-3 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                  >
                    <Navigation className="w-5 h-5" />
                    Navigate
                  </button>
                  <button
                    onClick={() => onCompleteStop(activeStop.id)}
                    disabled={completedStops.includes(activeStop.id)}
                    className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                      completedStops.includes(activeStop.id)
                        ? 'bg-green-500/20 text-green-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-[#D4AF37] to-amber-500 text-[#2D1B4E] hover:shadow-lg hover:shadow-amber-500/30'
                    }`}
                  >
                    <CheckCircle className="w-5 h-5" />
                    {completedStops.includes(activeStop.id) ? 'Completed!' : 'Mark Complete'}
                  </button>
                </div>

                {/* Next Stop Preview */}
                {activeStopIndex < adventure.stops.length - 1 && completedStops.includes(activeStop.id) && (
                  <button
                    onClick={() => setActiveStopIndex(activeStopIndex + 1)}
                    className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-white font-medium hover:from-purple-500/30 hover:to-pink-500/30 transition-all flex items-center justify-center gap-2"
                  >
                    Continue to Stop {activeStopIndex + 2}: {adventure.stops[activeStopIndex + 1].name}
                    <ChevronDown className="w-5 h-5 rotate-[-90deg]" />
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Photo Upload Modal */}
        {showPhotoUpload && userId && activeStop && (
          <PhotoUploadModal
            isOpen={showPhotoUpload}
            onClose={() => setShowPhotoUpload(false)}
            userId={userId}
            adventureId={adventure.id}
            adventureName={adventure.name}
            stopId={activeStop.id}
            stopName={activeStop.name}
            onPhotoUploaded={() => {
              setShowPhotoUpload(false);
              onPhotoUploaded?.();
            }}
          />
        )}
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

      {/* Use Escape Confirmation Dialog */}
      <UseEscapeConfirmDialog
        isOpen={showEscapeConfirm}
        onClose={() => setShowEscapeConfirm(false)}
        onConfirm={handleConfirmUseEscape}
        adventureName={adventure.name}
        escapesRemaining={escapesRemaining}
        escapesTotal={escapePass?.escapes_total || 0}
        isFirstUse={isFirstUse || false}
        expiresAt={escapePass?.expires_at}
        isLoading={isUsingEscape}
      />

      {/* Adventure Summary Modal */}
      {completionData && (
        <AdventureSummary
          isOpen={showSummary}
          onClose={() => setShowSummary(false)}
          adventureName={adventure.name}
          timeMinutes={completionData.timeMinutes}
          hintsUsed={hintsUsed}
          stopsCompleted={adventure.stops.length}
          totalStops={adventure.stops.length}
          bonusPoints={completionData.bonusPoints}
          isFirstEscape={completionData.isFirstEscape}
        />
      )}
    </>
  );
};

export default EscapeAdventureCard;
