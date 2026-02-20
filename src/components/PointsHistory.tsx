import React, { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft, 
  History, 
  Star, 
  Sparkles, 
  Calendar, 
  Heart, 
  Flame, 
  Crown, 
  Camera, 
  MapPin,
  Plus,
  Trash2,
  Gift
} from 'lucide-react';

interface PointsHistoryProps {
  onBack: () => void;
}

const actionIcons: Record<string, React.ReactNode> = {
  complete_adventure: <Crown className="w-4 h-4" />,
  upload_photo: <Camera className="w-4 h-4" />,
  complete_stop: <MapPin className="w-4 h-4" />,
  complete_challenge: <Flame className="w-4 h-4" />,
  first_adventure: <Star className="w-4 h-4" />,
  streak_bonus: <Sparkles className="w-4 h-4" />,
};

const actionColors: Record<string, string> = {
  complete_adventure: 'bg-purple-500/20 text-purple-400',
  upload_photo: 'bg-blue-500/20 text-blue-400',
  complete_stop: 'bg-green-500/20 text-green-400',
  complete_challenge: 'bg-orange-500/20 text-orange-400',
  first_adventure: 'bg-yellow-500/20 text-yellow-400',
  streak_bonus: 'bg-pink-500/20 text-pink-400',
};

export const PointsHistory: React.FC<PointsHistoryProps> = ({ onBack }) => {
  const { 
    rewards, 
    pointsHistory, 
    specialDates, 
    setSpecialDate, 
    deleteSpecialDate 
  } = useAppContext();

  const [addDateOpen, setAddDateOpen] = useState(false);
  const [newDateType, setNewDateType] = useState('anniversary');
  const [newDateValue, setNewDateValue] = useState('');
  const [newDateLabel, setNewDateLabel] = useState('');
  const [saving, setSaving] = useState(false);

  const totalPoints = rewards?.total_points || 0;
  const lifetimePoints = rewards?.lifetime_points || 0;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatSpecialDate = (dateStr: string) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
    });
  };

  const handleAddSpecialDate = async () => {
    if (!newDateValue || !newDateLabel) return;
    
    setSaving(true);
    await setSpecialDate(newDateType, newDateValue, newDateLabel);
    setSaving(false);
    setAddDateOpen(false);
    setNewDateValue('');
    setNewDateLabel('');
  };

  const handleDeleteSpecialDate = async (dateType: string) => {
    await deleteSpecialDate(dateType);
  };

  // Group history by date
  const groupedHistory = pointsHistory.reduce((acc, item) => {
    const date = new Date(item.created_at).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(item);
    return acc;
  }, {} as Record<string, typeof pointsHistory>);

  const dateTypeLabels: Record<string, string> = {
    anniversary: 'Anniversary (3x)',
    birthday: 'Birthday (2x)',
    custom: 'Custom Date (1.5x)',
  };

  const dateTypeMultipliers: Record<string, string> = {
    anniversary: '3x',
    birthday: '2x',
    custom: '1.5x',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Header */}
      <div className="bg-black/30 border-b border-white/10">
        <div className="container mx-auto px-4 py-6">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="text-white hover:bg-white/20 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <History className="w-8 h-8 text-pink-400" />
                Points History
              </h1>
              <p className="text-white/80 mt-1">Track your rewards journey</p>
            </div>
            
            <div className="flex gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/20 text-center">
                <div className="flex items-center gap-2 justify-center">
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                  <span className="text-2xl font-bold text-white">{totalPoints.toLocaleString()}</span>
                </div>
                <p className="text-white/60 text-sm">Available</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/20 text-center">
                <div className="flex items-center gap-2 justify-center">
                  <Star className="w-5 h-5 text-purple-400" />
                  <span className="text-2xl font-bold text-white">{lifetimePoints.toLocaleString()}</span>
                </div>
                <p className="text-white/60 text-sm">Lifetime</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Points History */}
          <div className="lg:col-span-2">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-pink-400" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {Object.keys(groupedHistory).length === 0 ? (
                  <div className="text-center py-12">
                    <Sparkles className="w-12 h-12 text-white/20 mx-auto mb-4" />
                    <p className="text-white/60">No points earned yet</p>
                    <p className="text-white/40 text-sm mt-1">Complete adventures and upload photos to earn points!</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {Object.entries(groupedHistory).map(([date, items]) => (
                      <div key={date}>
                        <h3 className="text-white/60 text-sm font-medium mb-3 flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {date}
                        </h3>
                        <div className="space-y-2">
                          {items.map((item) => (
                            <div 
                              key={item.id}
                              className="flex items-center justify-between bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors"
                            >
                              <div className="flex items-center gap-4">
                                <div className={`p-2 rounded-lg ${actionColors[item.action_type] || 'bg-gray-500/20 text-gray-400'}`}>
                                  {actionIcons[item.action_type] || <Star className="w-4 h-4" />}
                                </div>
                                <div>
                                  <p className="text-white font-medium">{item.description}</p>
                                  <p className="text-white/40 text-sm">
                                    {new Date(item.created_at).toLocaleTimeString('en-US', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-yellow-400 font-bold">+{item.points}</p>
                                {item.multiplier > 1 && (
                                  <Badge className="bg-pink-500/20 text-pink-400 border-pink-500/30 text-xs">
                                    {item.multiplier}x bonus
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Special Dates Sidebar */}
          <div>
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Heart className="w-5 h-5 text-pink-400" />
                    Special Dates
                  </CardTitle>
                  <Dialog open={addDateOpen} onOpenChange={setAddDateOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="bg-pink-500 hover:bg-pink-600">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-900 border-white/20 text-white">
                      <DialogHeader>
                        <DialogTitle>Add Special Date</DialogTitle>
                        <DialogDescription className="text-white/60">
                          Set a special date to earn bonus points when you play on that day!
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label className="text-white">Date Type</Label>
                          <Select value={newDateType} onValueChange={setNewDateType}>
                            <SelectTrigger className="bg-white/10 border-white/20 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-900 border-white/20">
                              <SelectItem value="anniversary">Anniversary (3x points)</SelectItem>
                              <SelectItem value="birthday">Birthday (2x points)</SelectItem>
                              <SelectItem value="custom">Custom Date (1.5x points)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-white">Date</Label>
                          <Input
                            type="date"
                            value={newDateValue}
                            onChange={(e) => setNewDateValue(e.target.value)}
                            className="bg-white/10 border-white/20 text-white"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-white">Label</Label>
                          <Input
                            placeholder="e.g., Our Anniversary"
                            value={newDateLabel}
                            onChange={(e) => setNewDateLabel(e.target.value)}
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                          />
                        </div>
                      </div>

                      <DialogFooter>
                        <Button 
                          variant="outline" 
                          onClick={() => setAddDateOpen(false)}
                          className="border-white/20 text-white hover:bg-white/10"
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleAddSpecialDate}
                          disabled={saving || !newDateValue || !newDateLabel}
                          className="bg-pink-500 hover:bg-pink-600"
                        >
                          {saving ? 'Saving...' : 'Add Date'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-white/60 text-sm mb-4">
                  Earn bonus points when you play on these special days!
                </p>
                
                {specialDates.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-10 h-10 text-white/20 mx-auto mb-3" />
                    <p className="text-white/40 text-sm">No special dates set</p>
                    <p className="text-white/30 text-xs mt-1">Add your anniversary for 3x points!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {specialDates.map((sd) => (
                      <div 
                        key={sd.id}
                        className="flex items-center justify-between bg-white/5 rounded-lg p-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-pink-500/20">
                            <Heart className="w-4 h-4 text-pink-400" />
                          </div>
                          <div>
                            <p className="text-white font-medium text-sm">{sd.label}</p>
                            <p className="text-white/40 text-xs">{formatSpecialDate(sd.date_value)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                            {dateTypeMultipliers[sd.date_type] || '1.5x'}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteSpecialDate(sd.date_type)}
                            className="text-white/40 hover:text-red-400 hover:bg-red-500/10 h-8 w-8 p-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Valentine's Day Note */}
                <div className="mt-6 p-4 bg-gradient-to-r from-pink-500/10 to-red-500/10 rounded-lg border border-pink-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="w-4 h-4 text-red-400" />
                    <span className="text-white font-medium text-sm">Valentine's Day</span>
                    <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">2.5x</Badge>
                  </div>
                  <p className="text-white/50 text-xs">
                    Automatic 2.5x bonus on February 14th!
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="bg-white/5 border-white/10 mt-6">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2 text-lg">
                  <Gift className="w-5 h-5 text-purple-400" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-white/60">Adventures Completed</span>
                  <span className="text-white font-bold">
                    {pointsHistory.filter(p => p.action_type === 'complete_adventure').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/60">Photos Uploaded</span>
                  <span className="text-white font-bold">
                    {pointsHistory.filter(p => p.action_type === 'upload_photo').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/60">Challenges Completed</span>
                  <span className="text-white font-bold">
                    {pointsHistory.filter(p => p.action_type === 'complete_challenge').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/60">Bonus Points Earned</span>
                  <span className="text-yellow-400 font-bold">
                    {pointsHistory.filter(p => p.multiplier > 1).reduce((sum, p) => sum + Math.round(p.points * (1 - 1/p.multiplier)), 0)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PointsHistory;
