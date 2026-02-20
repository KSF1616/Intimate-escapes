import React, { useState, useEffect } from 'react';
import { useAppContext, RewardItem } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Gift, Star, Crown, Heart, Flame, Diamond, Sparkles, Lock, Check, ArrowLeft, AlertTriangle, RefreshCw, Loader2 } from 'lucide-react';

interface RewardsStoreProps {
  onBack: () => void;
}

const categoryIcons: Record<string, React.ReactNode> = {
  content: <Flame className="w-5 h-5" />,
  suggestions: <Heart className="w-5 h-5" />,
  title: <Crown className="w-5 h-5" />,
  badge: <Star className="w-5 h-5" />,
  premium: <Diamond className="w-5 h-5" />,
};

const categoryColors: Record<string, string> = {
  content: 'from-red-500 to-orange-500',
  suggestions: 'from-pink-500 to-rose-500',
  title: 'from-purple-500 to-indigo-500',
  badge: 'from-amber-500 to-yellow-500',
  premium: 'from-cyan-500 to-blue-500',
};

const badgeIcons: Record<string, React.ReactNode> = {
  heart: <Heart className="w-6 h-6 text-pink-500" />,
  fire: <Flame className="w-6 h-6 text-orange-500" />,
  diamond: <Diamond className="w-6 h-6 text-cyan-500" />,
};

// Default rewards catalog for when edge function fails
const defaultRewardsCatalog: Record<string, RewardItem> = {
  'spicy_card_pack': {
    id: 'spicy_card_pack',
    name: 'Spicy Card Pack',
    description: 'Unlock 10 exclusive spicy truth or dare cards',
    points: 200,
    category: 'content',
  },
  'romantic_date_ideas': {
    id: 'romantic_date_ideas',
    name: 'Romantic Date Ideas',
    description: 'Get 5 personalized romantic date suggestions for Fort Lauderdale',
    points: 150,
    category: 'suggestions',
  },
  'adventure_lovers_title': {
    id: 'adventure_lovers_title',
    name: 'Adventure Lovers Title',
    description: 'Unlock the "Adventure Lovers" couple title',
    points: 300,
    category: 'title',
  },
  'flame_badge': {
    id: 'flame_badge',
    name: 'Flame Badge',
    description: 'Show off your passion with the exclusive flame badge',
    points: 100,
    category: 'badge',
  },
  'diamond_badge': {
    id: 'diamond_badge',
    name: 'Diamond Badge',
    description: 'The ultimate status symbol for dedicated couples',
    points: 500,
    category: 'badge',
  },
  'premium_escape_hints': {
    id: 'premium_escape_hints',
    name: 'Premium Escape Hints',
    description: 'Get detailed hints for all escape adventures',
    points: 250,
    category: 'premium',
  },
  'midnight_card_pack': {
    id: 'midnight_card_pack',
    name: 'Midnight Card Pack',
    description: 'Unlock 10 exclusive late-night challenge cards',
    points: 350,
    category: 'content',
  },
  'beach_date_ideas': {
    id: 'beach_date_ideas',
    name: 'Beach Date Ideas',
    description: '5 romantic beach date ideas in Fort Lauderdale',
    points: 175,
    category: 'suggestions',
  },
  'soulmates_title': {
    id: 'soulmates_title',
    name: 'Soulmates Title',
    description: 'Unlock the prestigious "Soulmates" couple title',
    points: 750,
    category: 'title',
  },
};

export const RewardsStore: React.FC<RewardsStoreProps> = ({ onBack }) => {
  const { rewards, rewardsCatalog, redeemedRewards, redeemReward, loadingRewards, refreshRewards } = useAppContext();
  const [selectedReward, setSelectedReward] = useState<RewardItem | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [redeeming, setRedeeming] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [retrying, setRetrying] = useState(false);

  const totalPoints = rewards?.total_points || 0;
  const lifetimePoints = rewards?.lifetime_points || 0;

  // Use the catalog from context, or fall back to defaults
  const activeCatalog = Object.keys(rewardsCatalog).length > 0 ? rewardsCatalog : defaultRewardsCatalog;

  // Detect if rewards failed to load
  useEffect(() => {
    if (!loadingRewards && !rewards && Object.keys(rewardsCatalog).length === 0) {
      setHasError(true);
    } else if (rewards || Object.keys(rewardsCatalog).length > 0) {
      setHasError(false);
    }
  }, [loadingRewards, rewards, rewardsCatalog]);

  const handleRetryLoad = async () => {
    setRetrying(true);
    setHasError(false);
    try {
      await refreshRewards();
    } catch (e) {
      setHasError(true);
    } finally {
      setRetrying(false);
    }
  };

  const isRedeemed = (rewardId: string) => {
    return redeemedRewards.some(r => r.reward_id === rewardId);
  };

  const canAfford = (points: number) => totalPoints >= points;

  const handleRedeemClick = (reward: RewardItem) => {
    setSelectedReward(reward);
    setConfirmOpen(true);
  };

  const handleConfirmRedeem = async () => {
    if (!selectedReward) return;
    
    setRedeeming(true);
    const success = await redeemReward(selectedReward.id);
    setRedeeming(false);
    
    if (success) {
      setConfirmOpen(false);
      setSelectedReward(null);
    }
  };

  const rewardsByCategory = Object.values(activeCatalog).reduce((acc, reward) => {
    if (!acc[reward.category]) {
      acc[reward.category] = [];
    }
    acc[reward.category].push(reward);
    return acc;
  }, {} as Record<string, RewardItem[]>);

  const categories = [
    { id: 'all', label: 'All Rewards' },
    { id: 'content', label: 'Card Packs' },
    { id: 'suggestions', label: 'Date Ideas' },
    { id: 'title', label: 'Titles' },
    { id: 'badge', label: 'Badges' },
    { id: 'premium', label: 'Premium' },
  ];

  const allRewards = Object.values(activeCatalog);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Header */}
      <div 
        className="relative h-48 bg-cover bg-center"
        style={{ backgroundImage: 'url(https://d64gsuwffb70l.cloudfront.net/69599545a00efe0bc982d486_1767484481474_29164488.png)' }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 container mx-auto px-4 py-6">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="text-white hover:bg-white/20 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Gift className="w-8 h-8 text-pink-400" />
                Rewards Store
              </h1>
              <p className="text-white/80 mt-1">Redeem your points for exclusive rewards</p>
            </div>
            
            <div className="text-right">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/20">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                  <span className="text-3xl font-bold text-white">{totalPoints.toLocaleString()}</span>
                </div>
                <p className="text-white/60 text-sm">Available Points</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-black/30 border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                {badgeIcons[rewards?.couple_badge || 'heart']}
                <span className="text-white font-medium">{rewards?.couple_title || 'New Lovers'}</span>
              </div>
              <div className="text-white/60">
                Lifetime Points: <span className="text-white font-medium">{lifetimePoints.toLocaleString()}</span>
              </div>
            </div>
            <div className="text-white/60">
              Rewards Unlocked: <span className="text-white font-medium">{redeemedRewards.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {(loadingRewards || retrying) && (
        <div className="container mx-auto px-4 py-16 text-center">
          <Loader2 className="w-12 h-12 text-pink-400 animate-spin mx-auto mb-4" />
          <p className="text-white/60">Loading rewards...</p>
        </div>
      )}

      {/* Error State */}
      {hasError && !loadingRewards && !retrying && (
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/20 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-amber-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Rewards Loading Issue</h3>
            <p className="text-gray-400 text-sm mb-6">
              We had trouble loading the rewards data. You can still browse the available rewards below, but point balances may not be up to date.
            </p>
            <Button 
              onClick={handleRetryLoad}
              className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry Loading
            </Button>
          </div>
        </div>
      )}

      {/* Main Content - show even if there's an error (using default catalog) */}
      {!loadingRewards && !retrying && (
        <div className="container mx-auto px-4 py-8">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="bg-white/10 border border-white/20 mb-8 flex-wrap h-auto p-1">
              {categories.map(cat => (
                <TabsTrigger 
                  key={cat.id} 
                  value={cat.id}
                  className="data-[state=active]:bg-pink-500 data-[state=active]:text-white text-white/70"
                >
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map(cat => (
              <TabsContent key={cat.id} value={cat.id}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(cat.id === 'all' ? allRewards : rewardsByCategory[cat.id] || []).map(reward => {
                    const redeemed = isRedeemed(reward.id);
                    const affordable = canAfford(reward.points);
                    
                    return (
                      <Card 
                        key={reward.id}
                        className={`bg-white/5 border-white/10 overflow-hidden transition-all duration-300 ${
                          redeemed ? 'opacity-60' : 'hover:bg-white/10 hover:border-pink-500/50'
                        }`}
                      >
                        <div className={`h-2 bg-gradient-to-r ${categoryColors[reward.category] || 'from-gray-500 to-gray-600'}`} />
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className={`p-3 rounded-xl bg-gradient-to-br ${categoryColors[reward.category] || 'from-gray-500 to-gray-600'}`}>
                              {categoryIcons[reward.category] || <Star className="w-5 h-5" />}
                            </div>
                            {redeemed && (
                              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                                <Check className="w-3 h-3 mr-1" />
                                Unlocked
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-white mt-3">{reward.name}</CardTitle>
                          <CardDescription className="text-white/80">
                            {reward.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-yellow-400" />
                              <span className={`font-bold ${affordable ? 'text-yellow-400' : 'text-white/40'}`}>
                                {reward.points.toLocaleString()} pts
                              </span>
                            </div>
                            
                            {redeemed ? (
                              <Button disabled variant="outline" className="border-white/20 text-white/40">
                                Redeemed
                              </Button>
                            ) : affordable ? (
                              <Button 
                                onClick={() => handleRedeemClick(reward)}
                                className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
                              >
                                Redeem
                              </Button>
                            ) : (
                              <Button disabled variant="outline" className="border-white/20 text-white/40">
                                <Lock className="w-4 h-4 mr-2" />
                                {reward.points - totalPoints} more pts
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Empty state for category */}
                {(cat.id === 'all' ? allRewards : rewardsByCategory[cat.id] || []).length === 0 && (
                  <div className="text-center py-12">
                    <Gift className="w-12 h-12 text-white/20 mx-auto mb-4" />
                    <p className="text-white/60">No rewards available in this category yet.</p>
                    <p className="text-white/40 text-sm mt-1">Check back soon for new rewards!</p>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>

          {/* How to Earn Points Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-400" />
              How to Earn Points
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { action: 'Complete an Adventure', points: 100, icon: <Crown className="w-5 h-5" /> },
                { action: 'Upload a Photo', points: 25, icon: <Heart className="w-5 h-5" /> },
                { action: 'Complete a Stop', points: 20, icon: <Star className="w-5 h-5" /> },
                { action: 'Complete a Challenge', points: 30, icon: <Flame className="w-5 h-5" /> },
              ].map((item, idx) => (
                <div 
                  key={idx}
                  className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4"
                >
                  <div className="p-3 rounded-full bg-pink-500/20 text-pink-400">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-white font-medium">{item.action}</p>
                    <p className="text-yellow-400 font-bold">+{item.points} pts</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Bonus Multipliers */}
            <div className="mt-8 bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                Bonus Point Multipliers
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { date: 'Anniversary', multiplier: '3x', color: 'text-pink-400' },
                  { date: "Valentine's Day", multiplier: '2.5x', color: 'text-red-400' },
                  { date: 'Birthday', multiplier: '2x', color: 'text-purple-400' },
                  { date: 'Custom Dates', multiplier: '1.5x', color: 'text-cyan-400' },
                ].map((item, idx) => (
                  <div key={idx} className="text-center">
                    <p className={`text-2xl font-bold ${item.color}`}>{item.multiplier}</p>
                    <p className="text-white/70">{item.date}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Redemption Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="bg-gray-900 border-white/20 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-pink-400" />
              Confirm Redemption
            </DialogTitle>
            <DialogDescription className="text-white/60">
              Are you sure you want to redeem this reward?
            </DialogDescription>
          </DialogHeader>
          
          {selectedReward && (
            <div className="bg-white/5 rounded-xl p-4 my-4">
              <h4 className="font-bold text-white">{selectedReward.name}</h4>
              <p className="text-white/60 text-sm mt-1">{selectedReward.description}</p>
              <div className="flex items-center gap-2 mt-3">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-400 font-bold">{selectedReward.points.toLocaleString()} points</span>
              </div>
            </div>
          )}

          <div className="text-sm text-white/60">
            Your balance after redemption: <span className="text-white font-medium">{(totalPoints - (selectedReward?.points || 0)).toLocaleString()} pts</span>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setConfirmOpen(false)}
              className="border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmRedeem}
              disabled={redeeming}
              className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
            >
              {redeeming ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Redeeming...
                </span>
              ) : (
                'Confirm Redemption'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RewardsStore;
