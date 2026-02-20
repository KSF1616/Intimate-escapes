import React, { useState, useEffect } from 'react';
import { 
  Camera, MapPin, Calendar, Heart, Edit2, Save, X, 
  Trash2, ChevronDown, ChevronUp, Image, Loader2,
  Share2, Download, Sparkles, Clock, MessageSquare
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { escapeAdventures } from '@/data/gameData';
import AdventureSummary from './AdventureSummary';

interface PhotoMemory {
  id: string;
  user_id: string;
  adventure_id: string;
  stop_id: string;
  photo_url: string;
  caption: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface PhotoAlbumProps {
  userId: string;
}

const PhotoAlbum: React.FC<PhotoAlbumProps> = ({ userId }) => {
  const [photos, setPhotos] = useState<PhotoMemory[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedAdventure, setExpandedAdventure] = useState<string | null>(null);
  const [editingPhoto, setEditingPhoto] = useState<string | null>(null);
  const [editCaption, setEditCaption] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoMemory | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [summaryAdventureId, setSummaryAdventureId] = useState<string | null>(null);

  useEffect(() => {
    loadPhotos();
  }, [userId]);

  const loadPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from('photo_memories')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPhotos(data || []);
    } catch (error) {
      console.error('Error loading photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePhoto = async (photoId: string) => {
    try {
      const { error } = await supabase
        .from('photo_memories')
        .update({
          caption: editCaption.trim() || null,
          notes: editNotes.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', photoId);

      if (error) throw error;

      setPhotos(prev => prev.map(p => 
        p.id === photoId 
          ? { ...p, caption: editCaption.trim() || null, notes: editNotes.trim() || null }
          : p
      ));
      setEditingPhoto(null);
    } catch (error) {
      console.error('Error updating photo:', error);
    }
  };

  const handleDeletePhoto = async (photoId: string, photoUrl: string) => {
    if (!confirm('Are you sure you want to delete this memory?')) return;

    try {
      // Delete from database
      const { error: dbError } = await supabase
        .from('photo_memories')
        .delete()
        .eq('id', photoId);

      if (dbError) throw dbError;

      // Try to delete from storage (extract path from URL)
      const urlParts = photoUrl.split('/photo-memories/');
      if (urlParts[1]) {
        await supabase.storage.from('photo-memories').remove([urlParts[1]]);
      }

      setPhotos(prev => prev.filter(p => p.id !== photoId));
      setSelectedPhoto(null);
    } catch (error) {
      console.error('Error deleting photo:', error);
    }
  };

  // Group photos by adventure
  const photosByAdventure = photos.reduce((acc, photo) => {
    if (!acc[photo.adventure_id]) {
      acc[photo.adventure_id] = [];
    }
    acc[photo.adventure_id].push(photo);
    return acc;
  }, {} as Record<string, PhotoMemory[]>);

  const getAdventureInfo = (adventureId: string) => {
    return escapeAdventures.find(a => a.id === adventureId);
  };

  const getStopInfo = (adventureId: string, stopId: string) => {
    const adventure = escapeAdventures.find(a => a.id === adventureId);
    return adventure?.stops.find(s => s.id === stopId);
  };

  const handleGenerateSummary = (adventureId: string) => {
    setSummaryAdventureId(adventureId);
    setShowSummary(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-white/10 flex items-center justify-center">
          <Camera className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">No Memories Yet</h3>
        <p className="text-gray-400 max-w-md mx-auto">
          Start capturing your intimate adventures! Upload photos at each stop to build your private memory album.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white/5 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-[#D4AF37]">{photos.length}</p>
          <p className="text-gray-400 text-sm">Total Photos</p>
        </div>
        <div className="bg-white/5 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-pink-400">{Object.keys(photosByAdventure).length}</p>
          <p className="text-gray-400 text-sm">Adventures</p>
        </div>
        <div className="bg-white/5 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-purple-400">
            {new Set(photos.map(p => p.stop_id)).size}
          </p>
          <p className="text-gray-400 text-sm">Locations</p>
        </div>
      </div>

      {/* Adventures with Photos */}
      {Object.entries(photosByAdventure).map(([adventureId, adventurePhotos]) => {
        const adventure = getAdventureInfo(adventureId);
        if (!adventure) return null;

        const isExpanded = expandedAdventure === adventureId;
        
        // Group photos by stop
        const photosByStop = adventurePhotos.reduce((acc, photo) => {
          if (!acc[photo.stop_id]) {
            acc[photo.stop_id] = [];
          }
          acc[photo.stop_id].push(photo);
          return acc;
        }, {} as Record<string, PhotoMemory[]>);

        return (
          <div 
            key={adventureId}
            className="bg-[#2D1B4E]/50 rounded-2xl border border-white/10 overflow-hidden"
          >
            {/* Adventure Header */}
            <div 
              className="p-4 cursor-pointer hover:bg-white/5 transition-all"
              onClick={() => setExpandedAdventure(isExpanded ? null : adventureId)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden">
                    <img 
                      src={adventure.coverImage} 
                      alt={adventure.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">{adventure.name}</h3>
                    <p className="text-gray-400 text-sm flex items-center gap-2">
                      <Image className="w-4 h-4" />
                      {adventurePhotos.length} photos • {Object.keys(photosByStop).length} stops
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGenerateSummary(adventureId);
                    }}
                    className="px-3 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-amber-500 text-[#2D1B4E] font-medium text-sm flex items-center gap-2 hover:shadow-lg hover:shadow-amber-500/30 transition-all"
                  >
                    <Share2 className="w-4 h-4" />
                    Summary
                  </button>
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>
              </div>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
              <div className="border-t border-white/10">
                {Object.entries(photosByStop).map(([stopId, stopPhotos]) => {
                  const stop = getStopInfo(adventureId, stopId);
                  if (!stop) return null;

                  return (
                    <div key={stopId} className="border-b border-white/5 last:border-b-0">
                      {/* Stop Header */}
                      <div className="px-4 py-3 bg-white/5">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-[#D4AF37]" />
                          <span className="text-white font-medium">Stop {stop.stopNumber}: {stop.name}</span>
                          <span className="text-gray-400 text-sm">({stopPhotos.length} photos)</span>
                        </div>
                      </div>

                      {/* Photos Grid */}
                      <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                        {stopPhotos.map((photo) => (
                          <div 
                            key={photo.id}
                            className="relative group cursor-pointer"
                            onClick={() => setSelectedPhoto(photo)}
                          >
                            <img
                              src={photo.photo_url}
                              alt={photo.caption || 'Memory'}
                              className="w-full aspect-square object-cover rounded-xl"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all rounded-xl flex items-center justify-center">
                              <div className="text-center">
                                {photo.caption && (
                                  <p className="text-white text-sm font-medium px-2 line-clamp-2">{photo.caption}</p>
                                )}
                                <p className="text-gray-300 text-xs mt-1 flex items-center justify-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {new Date(photo.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* Photo Detail Modal */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
          onClick={() => setSelectedPhoto(null)}
        >
          <div 
            className="bg-gradient-to-br from-[#2D1B4E] to-[#1a0f2e] rounded-3xl w-full max-w-2xl overflow-hidden border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Photo */}
            <div className="relative">
              <img
                src={selectedPhoto.photo_url}
                alt={selectedPhoto.caption || 'Memory'}
                className="w-full max-h-[50vh] object-contain bg-black"
              />
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Details */}
            <div className="p-6 space-y-4">
              {editingPhoto === selectedPhoto.id ? (
                <>
                  <div>
                    <label className="flex items-center gap-2 text-white font-medium mb-2">
                      <MessageSquare className="w-4 h-4 text-[#D4AF37]" />
                      Caption
                    </label>
                    <input
                      type="text"
                      value={editCaption}
                      onChange={(e) => setEditCaption(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl bg-white/10 text-white border border-white/10 focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-white font-medium mb-2">
                      <Heart className="w-4 h-4 text-[#D4AF37]" />
                      Private Notes
                    </label>
                    <textarea
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 rounded-xl bg-white/10 text-white border border-white/10 focus:border-[#D4AF37] focus:outline-none resize-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdatePhoto(selectedPhoto.id)}
                      className="flex-1 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-amber-500 text-[#2D1B4E] font-bold flex items-center justify-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </button>
                    <button
                      onClick={() => setEditingPhoto(null)}
                      className="px-4 py-2 rounded-xl bg-white/10 text-white"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Location Info */}
                  <div className="flex items-center gap-2 text-[#D4AF37]">
                    <Sparkles className="w-4 h-4" />
                    <span className="font-medium">
                      {getAdventureInfo(selectedPhoto.adventure_id)?.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <MapPin className="w-4 h-4" />
                    {getStopInfo(selectedPhoto.adventure_id, selectedPhoto.stop_id)?.name}
                  </div>

                  {/* Caption */}
                  {selectedPhoto.caption && (
                    <div>
                      <p className="text-white text-lg">{selectedPhoto.caption}</p>
                    </div>
                  )}

                  {/* Notes */}
                  {selectedPhoto.notes && (
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <p className="text-gray-300 text-sm italic">{selectedPhoto.notes}</p>
                    </div>
                  )}

                  {/* Timestamp */}
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Calendar className="w-4 h-4" />
                    {new Date(selectedPhoto.created_at).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => {
                        setEditCaption(selectedPhoto.caption || '');
                        setEditNotes(selectedPhoto.notes || '');
                        setEditingPhoto(selectedPhoto.id);
                      }}
                      className="flex-1 py-2 rounded-xl bg-white/10 text-white font-medium flex items-center justify-center gap-2 hover:bg-white/20 transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeletePhoto(selectedPhoto.id, selectedPhoto.photo_url)}
                      className="px-4 py-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Adventure Summary Modal */}
      {showSummary && summaryAdventureId && (
        <AdventureSummary
          adventureId={summaryAdventureId}
          photos={photosByAdventure[summaryAdventureId] || []}
          onClose={() => {
            setShowSummary(false);
            setSummaryAdventureId(null);
          }}
        />
      )}
    </div>
  );
};

export default PhotoAlbum;
