import React, { useState, useEffect, useMemo } from 'react';
import { Heart, Flame, Sparkles, MapPin, Menu, X, Star, Dice1, Users, Navigation, Info, Settings, ChevronRight, Shuffle, Filter, Instagram, Twitter, Facebook, Mail, Play, Clock, Trophy, Wine, Shield, User, LogIn, LogOut, Map, Camera, Lock, Ticket, Gift, History } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/lib/supabase';
import { LOGO_URL, APP_NAME, APP_TAGLINE } from '@/lib/constants';
import { truthOrDareCards, neverHaveIEverCards, escapeLocations, escapeAdventures, IntensityLevel, GameCard as GameCardType, EscapeLocation, EscapeAdventure, EscapeStop } from '@/data/gameData';
import GameCard from './GameCard';
import EscapeCard from './EscapeCard';
import EscapeAdventureCard from './EscapeAdventureCard';
import IntensitySelector from './IntensitySelector';
import PlayerTracker, { Player, playerColors } from './PlayerTracker';
import GameTimer from './GameTimer';
import AgeVerificationModal from './AgeVerificationModal';
import RulesModal from './RulesModal';
import AuthModal from './AuthModal';
import ProfilePage from './ProfilePage';
import PassPurchaseModal from './PassPurchaseModal';
import RewardsStore from './RewardsStore';
import PointsHistory from './PointsHistory';
import GiftPurchaseModal from './GiftPurchaseModal';
import GiftRedemptionModal from './GiftRedemptionModal';
import EscapesRemainingBadge from './EscapesRemainingBadge';
import BookingRequestForm from './BookingRequestForm';

type GameMode = 'home' | 'truth-or-dare' | 'never-have-i-ever' | 'escape-adventure' | 'rewards-store' | 'points-history';
type View = 'game' | 'favorites' | 'settings' | 'profile';


// Logo component with fallback
const Logo: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}> = ({
  size = 'md',
  showText = true,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };
  return <div className={`flex items-center gap-3 ${className}`}>
      <div className={`${sizeClasses[size]} rounded-xl overflow-hidden bg-gradient-to-r from-[#8B1538] to-pink-600 flex items-center justify-center`}>
        <img src={LOGO_URL} alt={APP_NAME} className="w-full h-full object-contain" onError={e => {
        const target = e.target as HTMLImageElement;
        target.style.display = 'none';
        target.parentElement!.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white w-6 h-6"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>';
      }} />
      </div>
      {showText && <div className="hidden sm:block">
          <h1 className="text-xl font-bold text-white">{APP_NAME}</h1>
          <p className="text-xs text-gray-400">{APP_TAGLINE}</p>
        </div>}
    </div>;
};
const AppLayout: React.FC = () => {
  const {
    sidebarOpen,
    toggleSidebar,
    hasActivePass,
    activePass,
    loadingPass,
    refreshPass,
    userId,
    rewards,
    earnPoints,
    escapePass,
    gamePass,
    hasEscapeAccess,
    hasGameAccess,
    escapesRemaining,
    completeEscape
  } = useAppContext();
  const isMobile = useIsMobile();

  // Auth state
  const [user, setUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showPassModal, setShowPassModal] = useState(false);
  const [showGiftPurchaseModal, setShowGiftPurchaseModal] = useState(false);
  const [showGiftRedemptionModal, setShowGiftRedemptionModal] = useState(false);

  // Age verification
  const [isVerified, setIsVerified] = useState(false);
  const [showAgeModal, setShowAgeModal] = useState(true);

  // Game state
  const [gameMode, setGameMode] = useState<GameMode>('home');
  const [view, setView] = useState<View>('game');
  const [selectedIntensities, setSelectedIntensities] = useState<IntensityLevel[]>(['mild', 'spicy']);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Player state
  const [players, setPlayers] = useState<Player[]>([{
    id: '1',
    name: 'Player 1',
    score: 0,
    color: playerColors[0]
  }, {
    id: '2',
    name: 'Player 2',
    score: 0,
    color: playerColors[1]
  }]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);

  // Escape state
  const [revealedLocations, setRevealedLocations] = useState<string[]>([]);
  const [completedLocations, setCompletedLocations] = useState<string[]>([]);

  // Photo memories state
  const [stopPhotoCount, setStopPhotoCount] = useState<Record<string, number>>({});

  // Game stats for tracking
  const [truthOrDarePlayed, setTruthOrDarePlayed] = useState(0);
  const [neverHaveIEverPlayed, setNeverHaveIEverPlayed] = useState(0);

  // Check auth state on mount
  useEffect(() => {
    supabase.auth.getSession().then(({
      data: {
        session
      }
    }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserData(session.user.id);
      }
    });
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserData(session.user.id);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // Load user data from database
  const loadUserData = async (userId: string) => {
    try {
      // Load game progress
      const {
        data: progressData
      } = await supabase.from('game_progress').select('*').eq('user_id', userId).single();
      if (progressData) {
        setCompletedLocations(progressData.completed_locations || []);
        setRevealedLocations(progressData.revealed_locations || []);
        setTruthOrDarePlayed(progressData.truth_or_dare_played || 0);
        setNeverHaveIEverPlayed(progressData.never_have_i_ever_played || 0);
      }

      // Load favorites
      const {
        data: favoritesData
      } = await supabase.from('favorites').select('card_id').eq('user_id', userId);
      if (favoritesData) {
        setFavorites(favoritesData.map(f => f.card_id));
      }

      // Load photo counts per stop
      await loadPhotoCount(userId);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  // Load photo counts for each stop
  const loadPhotoCount = async (userId: string) => {
    try {
      const {
        data: photos
      } = await supabase.from('photo_memories').select('stop_id').eq('user_id', userId);
      if (photos) {
        const counts: Record<string, number> = {};
        photos.forEach(photo => {
          counts[photo.stop_id] = (counts[photo.stop_id] || 0) + 1;
        });
        setStopPhotoCount(counts);
      }
    } catch (error) {
      console.error('Error loading photo counts:', error);
    }
  };

  // Handler for when a photo is uploaded
  const handlePhotoUploaded = () => {
    if (user) {
      loadPhotoCount(user.id);
    }
  };

  // Save progress to database
  const saveProgress = async () => {
    if (!user) return;
    try {
      await supabase.from('game_progress').upsert({
        user_id: user.id,
        completed_locations: completedLocations,
        revealed_locations: revealedLocations,
        truth_or_dare_played: truthOrDarePlayed,
        never_have_i_ever_played: neverHaveIEverPlayed,
        escapes_completed: completedLocations.length,
        total_score: players.reduce((sum, p) => sum + p.score, 0),
        last_played_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

      // Check and unlock achievements
      await checkAchievements();
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  // Check and unlock achievements
  const checkAchievements = async () => {
    if (!user) return;
    const achievementsToUnlock: string[] = [];

    // First game
    if (truthOrDarePlayed + neverHaveIEverPlayed >= 1) {
      achievementsToUnlock.push('first_game');
    }

    // Truth or Dare milestones
    if (truthOrDarePlayed >= 10) achievementsToUnlock.push('truth_master');
    if (truthOrDarePlayed >= 25) achievementsToUnlock.push('dare_devil');

    // Never Have I Ever milestones
    if (neverHaveIEverPlayed >= 10) achievementsToUnlock.push('never_novice');
    if (neverHaveIEverPlayed >= 25) achievementsToUnlock.push('never_expert');

    // Escape milestones
    if (completedLocations.length >= 1) achievementsToUnlock.push('explorer');
    if (completedLocations.length >= 4) achievementsToUnlock.push('adventurer');
    if (completedLocations.length >= escapeLocations.length) achievementsToUnlock.push('escape_master');

    // Favorites milestone
    if (favorites.length >= 10) achievementsToUnlock.push('collector');

    // Score milestone
    const totalScore = players.reduce((sum, p) => sum + p.score, 0);
    if (totalScore >= 100) achievementsToUnlock.push('high_scorer');

    // Insert achievements
    for (const achievementId of achievementsToUnlock) {
      try {
        await supabase.from('achievements').upsert({
          user_id: user.id,
          achievement_id: achievementId
        }, {
          onConflict: 'user_id,achievement_id',
          ignoreDuplicates: true
        });
      } catch (error) {
        // Ignore duplicate errors
      }
    }
  };

  // Filter cards by intensity
  const filteredTruthOrDare = useMemo(() => truthOrDareCards.filter(card => selectedIntensities.includes(card.intensity)), [selectedIntensities]);
  const filteredNeverHaveIEver = useMemo(() => neverHaveIEverCards.filter(card => selectedIntensities.includes(card.intensity)), [selectedIntensities]);
  const filteredEscapes = useMemo(() => escapeLocations.filter(loc => selectedIntensities.includes(loc.intensity)), [selectedIntensities]);

  // Shuffle cards
  const [shuffledCards, setShuffledCards] = useState<GameCardType[]>([]);
  useEffect(() => {
    const cards = gameMode === 'truth-or-dare' ? filteredTruthOrDare : filteredNeverHaveIEver;
    setShuffledCards([...cards].sort(() => Math.random() - 0.5));
    setCurrentCardIndex(0);
    setIsCardFlipped(false);
  }, [gameMode, filteredTruthOrDare, filteredNeverHaveIEver]);
  const currentCard = shuffledCards[currentCardIndex];

  // Handlers
  const handleNextCard = () => {
    setIsCardFlipped(false);

    // Track game played
    if (gameMode === 'truth-or-dare') {
      setTruthOrDarePlayed(prev => prev + 1);
    } else if (gameMode === 'never-have-i-ever') {
      setNeverHaveIEverPlayed(prev => prev + 1);
    }
    setTimeout(() => {
      setCurrentCardIndex(prev => (prev + 1) % shuffledCards.length);
      setCurrentPlayerIndex(prev => (prev + 1) % players.length);
    }, 300);

    // Auto-save progress
    saveProgress();
  };
  const handleShuffle = () => {
    setShuffledCards([...shuffledCards].sort(() => Math.random() - 0.5));
    setCurrentCardIndex(0);
    setIsCardFlipped(false);
  };
  const handleToggleFavorite = async (id: string) => {
    const isFavorite = favorites.includes(id);
    if (isFavorite) {
      setFavorites(prev => prev.filter(f => f !== id));
      if (user) {
        await supabase.from('favorites').delete().eq('user_id', user.id).eq('card_id', id);
      }
    } else {
      setFavorites(prev => [...prev, id]);
      if (user) {
        const card = [...truthOrDareCards, ...neverHaveIEverCards].find(c => c.id === id);
        await supabase.from('favorites').insert({
          user_id: user.id,
          card_id: id,
          card_type: card?.type || 'unknown'
        });
      }
    }

    // Check collector achievement
    if (user && !isFavorite && favorites.length + 1 >= 10) {
      await supabase.from('achievements').upsert({
        user_id: user.id,
        achievement_id: 'collector'
      }, {
        onConflict: 'user_id,achievement_id',
        ignoreDuplicates: true
      });
    }
  };
  const handleAddPlayer = (name: string) => {
    const newPlayer: Player = {
      id: Date.now().toString(),
      name,
      score: 0,
      color: playerColors[players.length % playerColors.length]
    };
    setPlayers([...players, newPlayer]);
  };
  const handleRemovePlayer = (id: string) => {
    if (players.length > 1) {
      setPlayers(players.filter(p => p.id !== id));
      if (currentPlayerIndex >= players.length - 1) {
        setCurrentPlayerIndex(0);
      }
    }
  };
  const handleUpdateScore = (id: string, delta: number) => {
    setPlayers(players.map(p => p.id === id ? {
      ...p,
      score: Math.max(0, p.score + delta)
    } : p));
  };
  const handleRevealLocation = (id: string) => {
    const newRevealed = revealedLocations.includes(id) ? revealedLocations.filter(l => l !== id) : [...revealedLocations, id];
    setRevealedLocations(newRevealed);
    saveProgress();
  };
  const handleCompleteLocation = async (id: string) => {
    if (!completedLocations.includes(id)) {
      const newCompleted = [...completedLocations, id];
      setCompletedLocations(newCompleted);
      await saveProgress();
    }
  };
  const handleNavigateToLocation = (location: EscapeLocation) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.address)}`;
    window.open(url, '_blank');
  };

  // Auth handlers
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setShowProfile(false);
    // Reset to defaults
    setFavorites([]);
    setCompletedLocations([]);
    setRevealedLocations([]);
  };

  // Age verification handlers
  const handleVerify = () => {
    setIsVerified(true);
    setShowAgeModal(false);
    localStorage.setItem('ageVerified', 'true');
  };
  const handleDecline = () => {
    window.location.href = 'https://www.google.com';
  };
  useEffect(() => {
    const verified = localStorage.getItem('ageVerified');
    if (verified === 'true') {
      setIsVerified(true);
      setShowAgeModal(false);
    }
  }, []);

  // Game mode cards for home - show TOTAL card counts, not filtered
  const gameModes = [{
    id: 'truth-or-dare',
    title: 'Truth or Dare',
    description: 'Classic game with an intimate twist. Choose your fate and reveal your secrets.',
    icon: <Dice1 className="w-8 h-8" />,
    color: 'from-pink-500 to-rose-600',
    image: 'https://d64gsuwffb70l.cloudfront.net/69599545a00efe0bc982d486_1767479083904_f8551101.jpg',
    cardCount: truthOrDareCards.length // Show total cards (50)
  }, {
    id: 'never-have-i-ever',
    title: 'Never Have I Ever',
    description: 'Discover secrets and share experiences. Who has the most to confess?',
    icon: <Users className="w-8 h-8" />,
    color: 'from-purple-500 to-indigo-600',
    image: 'https://d64gsuwffb70l.cloudfront.net/69599545a00efe0bc982d486_1767479091957_42f1e4f8.png',
    cardCount: neverHaveIEverCards.length // Show total cards (50)
  }, {
    id: 'escape-adventure',
    title: 'Intimate Escape',
    description: 'Explore Fort Lauderdale with romantic clues and daring challenges.',
    icon: <MapPin className="w-8 h-8" />,
    color: 'from-[#D4AF37] to-amber-500',
    image: 'https://d64gsuwffb70l.cloudfront.net/69599545a00efe0bc982d486_1767479129554_f82bc6dd.png',
    cardCount: escapeLocations.length // Show total locations
  }];

  // Show profile page
  if (showProfile && user) {
    return <ProfilePage user={user} onClose={() => setShowProfile(false)} onLogout={handleLogout} />;
  }

  // Show Rewards Store
  if (gameMode === 'rewards-store') {
    return <RewardsStore onBack={() => setGameMode('home')} />;
  }

  // Show Points History
  if (gameMode === 'points-history') {
    return <PointsHistory onBack={() => setGameMode('home')} />;
  }

  // Render game content based on mode
  const renderGameContent = () => {
    if (gameMode === 'home') {
      return <div className="space-y-8">
          {/* Game Mode Selection */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Choose Your Adventure</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {gameModes.map(mode => <button key={mode.id} onClick={() => setGameMode(mode.id as GameMode)} className="group relative overflow-hidden rounded-2xl bg-[#2D1B4E]/50 border border-white/10 hover:border-[#D4AF37]/50 transition-all duration-300">
                  <div className="relative h-48 overflow-hidden">
                    <img src={mode.image} alt={mode.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a0f2e] via-transparent to-transparent" />
                    <div className={`absolute top-4 left-4 w-14 h-14 rounded-xl bg-gradient-to-r ${mode.color} flex items-center justify-center text-white shadow-lg`}>
                      {mode.icon}
                    </div>
                    <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-black/50 text-white text-sm" data-mixed-content="true" data-mixed-content="true" data-mixed-content="true">
                      {mode.cardCount} cards
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#D4AF37] transition-colors">
                      {mode.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {mode.description}
                    </p>

                    <div className="mt-4 flex items-center text-[#D4AF37] font-medium">
                      <span>Play Now</span>
                      <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </button>)}
            </div>
          </div>


          {/* Rewards Section */}
          <div className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-2xl p-6 border border-pink-500/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500">
                  <Gift className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Couples Rewards</h3>
                  <p className="text-[#2D1B4E] text-sm font-medium">
                    {rewards?.total_points?.toLocaleString() || 0} points available
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setGameMode('points-history')} className="px-4 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all flex items-center gap-2">
                  <History className="w-5 h-5" />
                  <span className="hidden sm:inline">History</span>
                </button>
                <button onClick={() => setGameMode('rewards-store')} className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold flex items-center gap-2">
                  <Gift className="w-5 h-5" />
                  <span className="hidden sm:inline">Rewards Store</span>
                </button>
              </div>
            </div>
            <p className="text-[#2D1B4E] text-sm font-medium">
              Earn points by completing adventures, uploading photos, and playing on special dates like anniversaries for bonus multipliers!
            </p>

          </div>


          {/* Intensity Selector */}
          <div className="bg-[#2D1B4E]/50 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <h3 className="text-lg font-bold text-white mb-4">Set Your Intensity</h3>
            <IntensitySelector selected={selectedIntensities} onChange={setSelectedIntensities} />
          </div>

          {/* User Progress (if logged in) */}
          {user && <div className="bg-gradient-to-r from-[#D4AF37]/10 to-amber-500/10 rounded-2xl p-6 border border-[#D4AF37]/30">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Your Progress</h3>
                  <p className="text-gray-400 text-sm" data-mixed-content="true" data-mixed-content="true" data-mixed-content="true">
                    {completedLocations.length} locations completed • {favorites.length} favorites saved
                  </p>
                </div>
                <button onClick={() => setShowProfile(true)} className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-amber-500 text-[#2D1B4E] font-bold flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  View Profile
                </button>
              </div>
            </div>}



          {/* Featured Locations */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Featured Fort Lauderdale Escapes</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {escapeLocations.slice(0, 4).map(location => <div key={location.id} className="relative group overflow-hidden rounded-xl cursor-pointer" onClick={() => setGameMode('escape-adventure')}>
                  <img src={location.image} alt={location.name} className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  {completedLocations.includes(location.id) && <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      Completed
                    </div>}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h4 className="text-white font-bold">{location.name}</h4>
                    <p className="text-gray-300 text-sm flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {location.address.split(',')[0]}
                    </p>
                  </div>
                </div>)}
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-gradient-to-r from-[#8B1538]/20 to-purple-900/20 rounded-2xl p-8 border border-[#8B1538]/30">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">How It Works</h2>
            <div className="grid md:grid-cols-4 gap-6">
              {[{
              icon: <Users className="w-6 h-6" />,
              title: 'Add Players',
              desc: 'Enter names for everyone playing'
            }, {
              icon: <Filter className="w-6 h-6" />,
              title: 'Set Intensity',
              desc: 'Choose Mild, Spicy, or XXX'
            }, {
              icon: <Play className="w-6 h-6" />,
              title: 'Start Playing',
              desc: 'Draw cards and complete challenges'
            }, {
              icon: <Trophy className="w-6 h-6" />,
              title: 'Track Scores',
              desc: 'Compete for the highest score'
            }].map((step, index) => <div key={index} className="text-center">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gradient-to-r from-[#D4AF37] to-amber-500 flex items-center justify-center text-[#2D1B4E]">
                    {step.icon}
                  </div>
                  <h4 className="text-white font-bold mb-2">{step.title}</h4>
                  <p className="text-gray-400 text-sm">{step.desc}</p>
                </div>)}
            </div>
          </div>

          {/* Sign Up CTA (if not logged in) */}
          {!user && <div className="bg-gradient-to-r from-[#2D1B4E] to-purple-900 rounded-2xl p-8 border border-purple-500/30 text-center">
              <Heart className="w-12 h-12 mx-auto mb-4 text-pink-500" />
              <h3 className="text-2xl font-bold text-white mb-2">Save Your Progress</h3>
              <p className="text-gray-300 mb-6 max-w-md mx-auto">
                Create a free account to save your favorite cards, track completed locations, 
                and unlock achievements together.
              </p>
              <button onClick={() => setShowAuthModal(true)} className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#D4AF37] to-amber-500 text-[#2D1B4E] font-bold text-lg hover:shadow-lg hover:shadow-amber-500/30 transition-all">
                Create Free Account
              </button>
            </div>}
        </div>;
    }
    if (gameMode === 'escape-adventure') {
      // Filter adventures by intensity
      const filteredAdventures = escapeAdventures.filter(adv => selectedIntensities.includes(adv.intensity));

      // Calculate total stops completed
      const totalStops = filteredAdventures.reduce((sum, adv) => sum + adv.stops.length, 0);
      const completedStopsCount = filteredAdventures.reduce((sum, adv) => sum + adv.stops.filter(s => completedLocations.includes(s.id)).length, 0);

      // Handler for navigating to a stop
      const handleNavigateToStop = (stop: EscapeStop) => {
        const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stop.address)}`;
        window.open(url, '_blank');
      };
      return <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Fort Lauderdale Intimate Escapes</h2>
              <p className="text-gray-400" data-mixed-content="true" data-mixed-content="true" data-mixed-content="true">
                {completedStopsCount} of {totalStops} stops completed across {filteredAdventures.length} adventures
              </p>
            </div>
            <button onClick={() => setShowRulesModal(true)} className="p-3 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all">
              <Info className="w-5 h-5" />
            </button>
          </div>

          {/* Overall Progress Bar */}
          {/* Overall Progress Bar */}
          <div className="bg-[#2D1B4E]/50 rounded-2xl p-4 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-medium">Overall Progress</span>
              <span className="text-[#D4AF37] font-bold" data-mixed-content="true" data-mixed-content="true" data-mixed-content="true">
                {Math.round(completedStopsCount / totalStops * 100)}%
              </span>
            </div>
            <div className="bg-white/10 rounded-full h-3 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#D4AF37] to-amber-500 transition-all duration-500" style={{
              width: `${completedStopsCount / totalStops * 100}%`
            }} />
            </div>
            <p className="text-white/80 text-sm mt-2">
              Complete all stops in an adventure to unlock special rewards!
            </p>
          </div>

          {/* Intensity Filter */}
          <div className="bg-[#2D1B4E]/50 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
            <h3 className="text-sm font-medium text-white mb-3">Filter by Intensity</h3>
            <IntensitySelector selected={selectedIntensities} onChange={setSelectedIntensities} />
          </div>


          {/* Adventures List */}
          <div className="space-y-6">
            {filteredAdventures.length === 0 ? <div className="text-center py-12 bg-[#2D1B4E]/30 rounded-2xl">
                <Map className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                <p className="text-gray-400">No adventures match your selected intensity levels.</p>
                <p className="text-gray-500 text-sm mt-2">Try selecting different intensity options above.</p>
              </div> : filteredAdventures.map(adventure => <EscapeAdventureCard key={adventure.id} adventure={adventure} completedStops={completedLocations} revealedStops={revealedLocations} onRevealStop={handleRevealLocation} onCompleteStop={handleCompleteLocation} onNavigate={handleNavigateToStop} userId={user?.id || null} stopPhotoCount={stopPhotoCount} onPhotoUploaded={handlePhotoUploaded} />)}
          </div>

          {/* Tips Section */}
          {/* Tips Section */}
          <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-2xl p-6 border border-purple-500/20">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              Tips for Your Intimate Escape
            </h3>
            <ul className="space-y-2 text-white text-sm">
              <li className="flex items-start gap-2">
                <span className="text-[#D4AF37]">•</span>
                Each adventure has 3-4 stops that lead you through Fort Lauderdale's most romantic spots
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#D4AF37]">•</span>
                Complete each stop's challenge before moving to the next for the full experience
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#D4AF37]">•</span>
                Use the hint feature if you're having trouble finding a location
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#D4AF37]">•</span>
                Complete all stops in an adventure to unlock exclusive rewards
              </li>
            </ul>
          </div>



          {/* Booking Request Form Section */}
          <BookingRequestForm 
            userEmail={user?.email}
            userName={user?.user_metadata?.full_name || user?.email?.split('@')[0]}
          />

          {/* Disclaimer */}
          <div className="bg-[#1a0f2e]/80 rounded-xl p-4 border border-white/10">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <p className="text-gray-400 text-sm leading-relaxed">
                <span className="text-white font-medium">Disclaimer:</span> Adventures on this app are at the expense of the user. Only live adventures purchased through our{' '}
                <a 
                  href="https://ksf1616.wixsite.com/intimate-escapes" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#D4AF37] hover:underline"
                >
                  website
                </a>{' '}
                include tangible items and transportation (if purchased).
              </p>
            </div>
          </div>

        </div>;
    }



    // Truth or Dare / Never Have I Ever
    return <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {gameMode === 'truth-or-dare' ? 'Truth or Dare' : 'Never Have I Ever'}
            </h2>
            <p className="text-gray-400" data-mixed-content="true" data-mixed-content="true" data-mixed-content="true">
              Card {currentCardIndex + 1} of {shuffledCards.length}
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={handleShuffle} className="p-3 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all" title="Shuffle Cards">
              <Shuffle className="w-5 h-5" />
            </button>
            <button onClick={() => setShowRulesModal(true)} className="p-3 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all" title="Rules">
              <Info className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Game Area */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Card Area */}
          <div className="lg:col-span-2">
            {currentCard && <GameCard card={currentCard} onNext={handleNextCard} onFavorite={handleToggleFavorite} isFavorite={favorites.includes(currentCard.id)} isFlipped={isCardFlipped} onFlip={() => setIsCardFlipped(!isCardFlipped)} />}

            {/* Intensity Selector */}
            <div className="mt-6 bg-[#2D1B4E]/50 backdrop-blur-sm rounded-2xl p-4">
              <IntensitySelector selected={selectedIntensities} onChange={setSelectedIntensities} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <PlayerTracker players={players} currentPlayerIndex={currentPlayerIndex} onAddPlayer={handleAddPlayer} onRemovePlayer={handleRemovePlayer} onNextPlayer={() => setCurrentPlayerIndex(prev => (prev + 1) % players.length)} onPrevPlayer={() => setCurrentPlayerIndex(prev => (prev - 1 + players.length) % players.length)} onUpdateScore={handleUpdateScore} />
            <GameTimer defaultSeconds={60} />
          </div>
        </div>
      </div>;
  };
  return <div className="min-h-screen from-[#1a0f2e] via-[#2D1B4E] to-[#1a0f2e] bg-[url('https://d64gsuwffb70l.cloudfront.net/692bc9245f44a664483e6b47_1767554173036_8935612e.png')] bg-cover bg-center">
      {/* Age Verification Modal */}
      <AgeVerificationModal isOpen={showAgeModal} onVerify={handleVerify} onDecline={handleDecline} />

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} onSuccess={() => {
      setShowAuthModal(false);
      // Reload user data
      supabase.auth.getSession().then(({
        data: {
          session
        }
      }) => {
        if (session?.user) {
          setUser(session.user);
          loadUserData(session.user.id);
        }
      });
    }} />

      {/* Pass Purchase Modal */}
      <PassPurchaseModal isOpen={showPassModal} onClose={() => setShowPassModal(false)} onSuccess={() => {
      setShowPassModal(false);
      refreshPass();
    }} onGiftClick={() => setShowGiftPurchaseModal(true)} onRedeemClick={() => setShowGiftRedemptionModal(true)} />

      {/* Rules Modal */}

      <RulesModal isOpen={showRulesModal} onClose={() => setShowRulesModal(false)} gameMode={gameMode === 'home' ? 'truth-or-dare' : gameMode} />

      {/* Gift Purchase Modal */}
      <GiftPurchaseModal isOpen={showGiftPurchaseModal} onClose={() => setShowGiftPurchaseModal(false)} userEmail={user?.email} userName={user?.user_metadata?.full_name || user?.email?.split('@')[0]} />

      {/* Gift Redemption Modal */}
      <GiftRedemptionModal isOpen={showGiftRedemptionModal} onClose={() => setShowGiftRedemptionModal(false)} onRedeemed={(passType, expiresAt) => {
      setShowGiftRedemptionModal(false);
      refreshPass();
    }} userEmail={user?.email} userId={user?.id} />



      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#1a0f2e]/80 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">

          <div className="flex items-center justify-between bg-[url('https://d64gsuwffb70l.cloudfront.net/692bc9245f44a664483e6b47_1767554173036_8935612e.png')] bg-cover bg-center">
            {/* Logo */}
            <button onClick={() => setGameMode('home')} className="flex items-center gap-3">
              <Logo size="md" showText={true} />
            </button>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-2">
              {gameModes.map(mode => <button key={mode.id} onClick={() => setGameMode(mode.id as GameMode)} className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${gameMode === mode.id ? 'bg-gradient-to-r from-[#D4AF37] to-amber-500 text-[#2D1B4E]' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}>
                  {mode.icon}
                  <span className="hidden lg:inline">{mode.title}</span>
                </button>)}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              <button onClick={() => setView(view === 'favorites' ? 'game' : 'favorites')} className={`p-2 rounded-xl transition-all ${view === 'favorites' ? 'bg-[#D4AF37] text-[#2D1B4E]' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                <Star className={`w-5 h-5 ${view === 'favorites' ? 'fill-current' : ''}`} />
              </button>

              {/* Auth Button */}
              {user ? <button onClick={() => setShowProfile(true)} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-amber-500 text-[#2D1B4E] font-medium">
                  <User className="w-5 h-5" />
                  <span className="hidden sm:inline">Profile</span>
                </button> : <button onClick={() => setShowAuthModal(true)} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all">
                  <LogIn className="w-5 h-5" />
                  <span className="hidden sm:inline">Sign In</span>
                </button>}

              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all">
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && <div className="md:hidden mt-4 pt-4 border-t border-white/10">
              <div className="grid grid-cols-3 gap-2">
                {gameModes.map(mode => <button key={mode.id} onClick={() => {
              setGameMode(mode.id as GameMode);
              setMobileMenuOpen(false);
            }} className={`p-3 rounded-xl font-medium transition-all flex flex-col items-center gap-2 ${gameMode === mode.id ? 'bg-gradient-to-r from-[#D4AF37] to-amber-500 text-[#2D1B4E]' : 'bg-white/10 text-gray-300'}`}>
                    {mode.icon}
                    <span className="text-xs">{mode.title.split(' ')[0]}</span>
                  </button>)}
              </div>
            </div>}
        </div>
      </header>



      {/* Hero Section (Home only) */}
      {gameMode === 'home' && <section className="relative overflow-hidden">
          <div className="absolute inset-0">
            <img src="https://d64gsuwffb70l.cloudfront.net/69599545a00efe0bc982d486_1767479068187_8259b683.png" alt="Fort Lauderdale Romance" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#1a0f2e] via-[#1a0f2e]/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1a0f2e] via-transparent to-transparent" />
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-32">
            <div className="max-w-2xl">
              {/* Large Hero Logo */}
              <div className="mb-8">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden bg-gradient-to-br from-[#2D1B4E]/80 to-[#1a0f2e]/80 backdrop-blur-sm p-2 shadow-2xl shadow-[#D4AF37]/20 border border-[#D4AF37]/30">
                  <img src={LOGO_URL} alt={APP_NAME} className="w-full h-full object-contain" onError={e => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }} />
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-[#D4AF37] mb-4">
                <MapPin className="w-5 h-5" />
                <span className="font-medium">{APP_TAGLINE}</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Where <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-amber-400">Passion</span> Meets Adventure
              </h1>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Discover intimate escapes, spicy challenges, and unforgettable moments 
                in South Florida's most romantic destinations.
              </p>
              <div className="flex flex-wrap gap-4">
                <button onClick={() => setGameMode('escape-adventure')} className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#D4AF37] to-amber-500 text-[#2D1B4E] font-bold text-lg hover:shadow-lg hover:shadow-amber-500/30 transition-all flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Start Escape
                </button>
                <button onClick={() => setGameMode('truth-or-dare')} className="px-8 py-4 rounded-xl bg-white/10 text-white font-bold text-lg hover:bg-white/20 transition-all flex items-center gap-2 border border-white/20">
                  <Dice1 className="w-5 h-5" />
                  Play Games
                </button>
              </div>
              
              {/* Stats */}
              <div className="flex gap-8 mt-12">
                <div>
                  <div className="text-3xl font-bold text-[#D4AF37]" data-mixed-content="true" data-mixed-content="true" data-mixed-content="true">{truthOrDareCards.length}+</div>
                  <div className="text-gray-400 text-sm">Challenges</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-[#D4AF37]">{escapeLocations.length}</div>
                  <div className="text-gray-400 text-sm">Locations</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-[#D4AF37]">3</div>
                  <div className="text-gray-400 text-sm">Intensity Levels</div>
                </div>
              </div>
            </div>
          </div>
        </section>}


      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button (when not on home) */}
        {gameMode !== 'home' && <button onClick={() => setGameMode('home')} className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ChevronRight className="w-5 h-5 rotate-180" />
            Back to Home
          </button>}

        {/* Favorites View */}
        {view === 'favorites' ? <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Your Favorites</h2>
            {favorites.length === 0 ? <div className="text-center py-12">
                <Star className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                <p className="text-gray-400">No favorites yet. Star cards to save them here!</p>
                {!user && <p className="text-gray-500 text-sm mt-2">
                    <button onClick={() => setShowAuthModal(true)} className="text-[#D4AF37] hover:underline">
                      Sign in
                    </button> to save favorites across sessions.
                  </p>}
              </div> : <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...truthOrDareCards, ...neverHaveIEverCards].filter(card => favorites.includes(card.id)).map(card => <div key={card.id} className="bg-[#2D1B4E]/50 rounded-xl p-4 border border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase text-[#D4AF37]">
                          {card.type}
                        </span>
                        <button onClick={() => handleToggleFavorite(card.id)} className="text-[#D4AF37]">
                          <Star className="w-5 h-5 fill-current" />
                        </button>
                      </div>
                      <p className="text-white">{card.content}</p>
                    </div>)}
              </div>}
          </div> : renderGameContent()}
      </main>

      {/* Footer */}
      <footer className="bg-[#1a0f2e] border-t border-white/10 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Brand with Logo */}
            <div className="md:col-span-2">
              <div className="mb-4">
                <Logo size="md" showText={true} />
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                Discover passion and adventure in South Florida's most romantic destinations. 
                Adult party games, intimate challenges, and unforgettable experiences.
              </p>
              <div className="flex gap-4">
                <a href="#" className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all">
                  <Mail className="w-5 h-5" />
                </a>
              </div>
            </div>


            {/* Games */}
            <div>
              <h4 className="text-white font-bold mb-4">Games</h4>
              <ul className="space-y-2">
                <li>
                  <button onClick={() => setGameMode('truth-or-dare')} className="text-gray-400 hover:text-white transition-colors">
                    Truth or Dare
                  </button>
                </li>
                <li>
                  <button onClick={() => setGameMode('never-have-i-ever')} className="text-gray-400 hover:text-white transition-colors">
                    Never Have I Ever
                  </button>
                </li>
                <li>
                  <button onClick={() => setGameMode('escape-adventure')} className="text-gray-400 hover:text-white transition-colors">
                    Intimate Escapes
                  </button>
                </li>
              </ul>
            </div>

            {/* Account */}
            <div>
              <h4 className="text-white font-bold mb-4">Account</h4>
              <ul className="space-y-2">
                {user ? <>
                    <li>
                      <button onClick={() => setShowProfile(true)} className="text-gray-400 hover:text-white transition-colors">
                        My Profile
                      </button>
                    </li>
                    <li>
                      <button onClick={handleLogout} className="text-gray-400 hover:text-white transition-colors">
                        Sign Out
                      </button>
                    </li>
                  </> : <>
                    <li>
                      <button onClick={() => setShowAuthModal(true)} className="text-gray-400 hover:text-white transition-colors">
                        Sign In
                      </button>
                    </li>
                    <li>
                      <button onClick={() => setShowAuthModal(true)} className="text-gray-400 hover:text-white transition-colors">
                        Create Account
                      </button>
                    </li>
                  </>}
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mt-8 pt-8 border-t border-white/10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <Shield className="w-4 h-4" />
                <span>Adults Only (21+) - Please drink responsibly</span>
              </div>
              <p className="text-gray-500 text-sm">
                © 2026 Intimate Escapes Fort Lauderdale. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>


      {/* Floating Website Button - Book Live Escapes */}
      <a href="https://ksf1616.wixsite.com/intimate-escapes" target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 z-50 group" title="Book Live Escapes on our Website">
        <div className="relative bg-[url('https://d64gsuwffb70l.cloudfront.net/692bc9245f44a664483e6b47_1767554281057_5dc6cadc.png')] bg-cover bg-center">
          {/* Pulsing ring animation */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#D4AF37] to-amber-500 animate-ping opacity-30" />
          
          {/* Main button container */}
          <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden bg-gradient-to-br from-[#2D1B4E] to-[#1a0f2e] border-4 border-[#D4AF37] shadow-2xl shadow-[#D4AF37]/40 hover:shadow-[#D4AF37]/60 transition-all duration-300 hover:scale-110 flex items-center justify-center">
            <img src={LOGO_URL} alt="Intimate Escapes - Book Live Escapes" className="w-full h-full object-contain p-1" onError={e => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            target.parentElement!.innerHTML = '<div class="text-[#D4AF37] text-center"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg></div>';
          }} />
          </div>
          
          {/* Tooltip label */}
          <div className="absolute bottom-full right-0 mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="bg-[#2D1B4E] text-white text-sm font-medium px-4 py-2 rounded-xl shadow-xl border border-[#D4AF37]/50 whitespace-nowrap">
              <span className="text-[#D4AF37]">Book Live Escapes</span>
              <br />
              <span className="text-gray-300 text-xs">Visit our website</span>
            </div>
            {/* Arrow */}
            <div className="absolute -bottom-2 right-6 w-4 h-4 bg-[#2D1B4E] border-r border-b border-[#D4AF37]/50 transform rotate-45" />
          </div>
        </div>
      </a>

      {/* Custom CSS for 3D transforms */}
      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>;
};
export default AppLayout;