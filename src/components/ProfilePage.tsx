import React, { useState, useEffect } from 'react';
import { 
  User, Heart, MapPin, Trophy, Star, Clock, Flame, 
  Edit2, Save, X, LogOut, Camera, Award, Target,
  Sparkles, Lock, ChevronRight, Calendar, Image
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { escapeLocations, truthOrDareCards, neverHaveIEverCards } from '@/data/gameData';
import PhotoAlbum from './PhotoAlbum';

interface ProfilePageProps {
  user: any;
  onClose: () => void;
  onLogout: () => void;
}

interface Profile {
  display_name: string;
  partner_name: string;
  avatar_url: string;
  created_at: string;
}

interface GameProgress {
  completed_locations: string[];
  revealed_locations: string[];
  truth_or_dare_played: number;
  never_have_i_ever_played: number;
  escapes_completed: number;
  total_score: number;
  current_streak: number;
  longest_streak: number;
  last_played_at: string;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  unlockedAt?: string;
}

const achievementDefinitions = [
  { id: 'first_game', name: 'First Steps', description: 'Play your first game', icon: <Sparkles className="w-6 h-6" /> },
  { id: 'truth_master', name: 'Truth Seeker', description: 'Play 10 Truth or Dare games', icon: <Lock className="w-6 h-6" /> },
  { id: 'dare_devil', name: 'Dare Devil', description: 'Play 25 Truth or Dare games', icon: <Flame className="w-6 h-6" /> },
  { id: 'never_novice', name: 'Confession Starter', description: 'Play 10 Never Have I Ever games', icon: <Heart className="w-6 h-6" /> },
  { id: 'never_expert', name: 'Secret Keeper', description: 'Play 25 Never Have I Ever games', icon: <Star className="w-6 h-6" /> },
  { id: 'explorer', name: 'Explorer', description: 'Complete your first escape location', icon: <MapPin className="w-6 h-6" /> },
  { id: 'adventurer', name: 'Adventurer', description: 'Complete 4 escape locations', icon: <Target className="w-6 h-6" /> },
  { id: 'escape_master', name: 'Escape Master', description: 'Complete all escape locations', icon: <Trophy className="w-6 h-6" /> },
  { id: 'streak_3', name: 'On Fire', description: 'Maintain a 3-day streak', icon: <Flame className="w-6 h-6" /> },
  { id: 'streak_7', name: 'Dedicated Lovers', description: 'Maintain a 7-day streak', icon: <Award className="w-6 h-6" /> },
  { id: 'collector', name: 'Card Collector', description: 'Save 10 favorite cards', icon: <Star className="w-6 h-6" /> },
  { id: 'high_scorer', name: 'High Scorer', description: 'Reach 100 total points', icon: <Trophy className="w-6 h-6" /> },
  { id: 'photographer', name: 'Memory Keeper', description: 'Upload 10 photos', icon: <Camera className="w-6 h-6" /> },
];

const ProfilePage: React.FC<ProfilePageProps> = ({ user, onClose, onLogout }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [progress, setProgress] = useState<GameProgress | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [photoCount, setPhotoCount] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPartner, setEditPartner] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'stats' | 'achievements' | 'history' | 'photos'>('stats');

  useEffect(() => {
    loadUserData();
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;

    try {
      // Load profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
        setEditName(profileData.display_name || '');
        setEditPartner(profileData.partner_name || '');
      }

      // Load game progress
      const { data: progressData } = await supabase
        .from('game_progress')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (progressData) {
        setProgress(progressData);
      }

      // Load achievements
      const { data: achievementData } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', user.id);

      const unlockedIds = achievementData?.map(a => a.achievement_id) || [];
      const mappedAchievements = achievementDefinitions.map(def => ({
        ...def,
        unlocked: unlockedIds.includes(def.id),
        unlockedAt: achievementData?.find(a => a.achievement_id === def.id)?.unlocked_at,
      }));
      setAchievements(mappedAchievements);

      // Load favorites
      const { data: favoritesData } = await supabase
        .from('favorites')
        .select('card_id')
        .eq('user_id', user.id);

      setFavorites(favoritesData?.map(f => f.card_id) || []);

      // Load photo count
      const { count } = await supabase
        .from('photo_memories')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      setPhotoCount(count || 0);

    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      await supabase
        .from('profiles')
        .update({
          display_name: editName,
          partner_name: editPartner,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      setProfile(prev => prev ? { ...prev, display_name: editName, partner_name: editPartner } : null);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const completedLocationDetails = escapeLocations.filter(
    loc => progress?.completed_locations?.includes(loc.id)
  );

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalAchievements = achievements.length;

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1a0f2e]">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-[#D4AF37] to-amber-500 flex items-center justify-center animate-pulse">
            <Heart className="w-8 h-8 text-[#2D1B4E]" />
          </div>
          <p className="text-gray-400">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0f2e] via-[#2D1B4E] to-[#1a0f2e] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
            Back to Games
          </button>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>

        {/* Profile Card */}
        <div className="bg-[#2D1B4E]/50 backdrop-blur-sm rounded-3xl border border-white/10 overflow-hidden mb-8">
          {/* Cover */}
          <div className="h-32 bg-gradient-to-r from-[#8B1538] to-pink-600 relative">
            <div className="absolute -bottom-12 left-6">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-amber-500 flex items-center justify-center text-[#2D1B4E] text-3xl font-bold border-4 border-[#1a0f2e]">
                {profile?.display_name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            </div>
          </div>

          {/* Profile Info */}
          <div className="pt-16 pb-6 px-6">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Your Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-white/10 text-white border border-white/10 focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Partner's Name</label>
                  <input
                    type="text"
                    value={editPartner}
                    onChange={(e) => setEditPartner(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-white/10 text-white border border-white/10 focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveProfile}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-amber-500 text-[#2D1B4E] font-bold flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 rounded-xl bg-white/10 text-white"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    {profile?.display_name || 'Anonymous'}
                    {profile?.partner_name && (
                      <>
                        <Heart className="w-5 h-5 text-pink-500" />
                        {profile.partner_name}
                      </>
                    )}
                  </h1>
                  <p className="text-gray-400 text-sm mt-1">{user?.email}</p>
                  <p className="text-gray-500 text-xs mt-2 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Joined {new Date(profile?.created_at || '').toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-[#2D1B4E]/50 rounded-2xl p-4 border border-white/10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 flex items-center justify-center mb-3">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-white">{progress?.truth_or_dare_played || 0}</p>
            <p className="text-gray-400 text-sm">Truth or Dare</p>
          </div>
          <div className="bg-[#2D1B4E]/50 rounded-2xl p-4 border border-white/10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center mb-3">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-white">{progress?.never_have_i_ever_played || 0}</p>
            <p className="text-gray-400 text-sm">Never Have I Ever</p>
          </div>
          <div className="bg-[#2D1B4E]/50 rounded-2xl p-4 border border-white/10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#D4AF37] to-amber-500 flex items-center justify-center mb-3">
              <MapPin className="w-5 h-5 text-[#2D1B4E]" />
            </div>
            <p className="text-2xl font-bold text-white">{progress?.escapes_completed || 0}/{escapeLocations.length}</p>
            <p className="text-gray-400 text-sm">Escapes</p>
          </div>
          <div className="bg-[#2D1B4E]/50 rounded-2xl p-4 border border-white/10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center mb-3">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-white">{photoCount}</p>
            <p className="text-gray-400 text-sm">Photos</p>
          </div>
          <div className="bg-[#2D1B4E]/50 rounded-2xl p-4 border border-white/10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center mb-3">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-white">{progress?.total_score || 0}</p>
            <p className="text-gray-400 text-sm">Total Score</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'stats', label: 'Statistics', icon: <Target className="w-4 h-4" /> },
            { id: 'photos', label: 'Photo Album', icon: <Camera className="w-4 h-4" /> },
            { id: 'achievements', label: 'Achievements', icon: <Trophy className="w-4 h-4" /> },
            { id: 'history', label: 'History', icon: <Clock className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-[#D4AF37] to-amber-500 text-[#2D1B4E]'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.id === 'photos' && photoCount > 0 && (
                <span className={`ml-1 px-1.5 py-0.5 rounded text-xs ${
                  activeTab === 'photos' ? 'bg-[#2D1B4E]/30' : 'bg-white/20'
                }`}>
                  {photoCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            {/* Streak Info */}
            <div className="bg-[#2D1B4E]/50 rounded-2xl p-6 border border-white/10">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" />
                Streak Stats
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-3xl font-bold text-orange-500">{progress?.current_streak || 0}</p>
                  <p className="text-gray-400 text-sm">Current Streak</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-3xl font-bold text-[#D4AF37]">{progress?.longest_streak || 0}</p>
                  <p className="text-gray-400 text-sm">Longest Streak</p>
                </div>
              </div>
            </div>

            {/* Favorites */}
            <div className="bg-[#2D1B4E]/50 rounded-2xl p-6 border border-white/10">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-[#D4AF37]" />
                Favorite Cards ({favorites.length})
              </h3>
              {favorites.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-3">
                  {favorites.slice(0, 4).map(cardId => {
                    const card = [...truthOrDareCards, ...neverHaveIEverCards].find(c => c.id === cardId);
                    if (!card) return null;
                    return (
                      <div key={cardId} className="bg-white/5 rounded-xl p-3">
                        <span className="text-xs text-[#D4AF37] uppercase font-bold">{card.type}</span>
                        <p className="text-white text-sm mt-1 line-clamp-2">{card.content}</p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">No favorite cards yet. Star cards during gameplay to save them!</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'photos' && (
          <PhotoAlbum userId={user.id} />
        )}

        {activeTab === 'achievements' && (
          <div className="space-y-4">
            <div className="bg-[#2D1B4E]/50 rounded-2xl p-6 border border-white/10 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">Achievement Progress</h3>
                  <p className="text-gray-400 text-sm">{unlockedCount} of {totalAchievements} unlocked</p>
                </div>
                <div className="text-3xl font-bold text-[#D4AF37]">
                  {Math.round((unlockedCount / totalAchievements) * 100)}%
                </div>
              </div>
              <div className="mt-4 bg-white/10 rounded-full h-3 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#D4AF37] to-amber-500 transition-all duration-500"
                  style={{ width: `${(unlockedCount / totalAchievements) * 100}%` }}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`rounded-2xl p-4 border transition-all ${
                    achievement.unlocked
                      ? 'bg-gradient-to-r from-[#D4AF37]/20 to-amber-500/20 border-[#D4AF37]/30'
                      : 'bg-[#2D1B4E]/50 border-white/10 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      achievement.unlocked
                        ? 'bg-gradient-to-r from-[#D4AF37] to-amber-500 text-[#2D1B4E]'
                        : 'bg-white/10 text-gray-400'
                    }`}>
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-bold ${achievement.unlocked ? 'text-white' : 'text-gray-400'}`}>
                        {achievement.name}
                      </h4>
                      <p className="text-gray-400 text-sm">{achievement.description}</p>
                      {achievement.unlocked && achievement.unlockedAt && (
                        <p className="text-[#D4AF37] text-xs mt-1">
                          Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-6">
            {/* Completed Locations */}
            <div className="bg-[#2D1B4E]/50 rounded-2xl p-6 border border-white/10">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#D4AF37]" />
                Completed Escape Locations
              </h3>
              {completedLocationDetails.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {completedLocationDetails.map((location) => (
                    <div key={location.id} className="flex gap-4 bg-white/5 rounded-xl p-3">
                      <img 
                        src={location.image} 
                        alt={location.name}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                      <div>
                        <h4 className="text-white font-medium">{location.name}</h4>
                        <p className="text-gray-400 text-sm">{location.address.split(',')[0]}</p>
                        <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs ${
                          location.intensity === 'mild' ? 'bg-pink-500/20 text-pink-400' :
                          location.intensity === 'spicy' ? 'bg-orange-500/20 text-orange-400' :
                          'bg-purple-500/20 text-purple-400'
                        }`}>
                          {location.intensity}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">No locations completed yet. Start your adventure!</p>
              )}
            </div>

            {/* Last Played */}
            {progress?.last_played_at && (
              <div className="bg-[#2D1B4E]/50 rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gray-400" />
                  Last Activity
                </h3>
                <p className="text-gray-400">
                  {new Date(progress.last_played_at).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
