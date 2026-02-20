import React, { useState, useRef } from 'react';
import { 
  Camera, X, Upload, Image, Loader2, Check, 
  MessageSquare, FileText, Sparkles 
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface PhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  adventureId: string;
  adventureName: string;
  stopId: string;
  stopName: string;
  onPhotoUploaded: () => void;
}

const PhotoUploadModal: React.FC<PhotoUploadModalProps> = ({
  isOpen,
  onClose,
  userId,
  adventureId,
  adventureName,
  stopId,
  stopName,
  onPhotoUploaded,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [notes, setNotes] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleUpload = async () => {
    if (!selectedFile || !userId) return;

    setIsUploading(true);
    try {
      // Create unique filename
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${userId}/${adventureId}/${stopId}/${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('photo-memories')
        .upload(fileName, selectedFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('photo-memories')
        .getPublicUrl(fileName);

      // Save metadata to database
      const { error: dbError } = await supabase
        .from('photo_memories')
        .insert({
          user_id: userId,
          adventure_id: adventureId,
          stop_id: stopId,
          photo_url: publicUrl,
          caption: caption.trim() || null,
          notes: notes.trim() || null,
        });

      if (dbError) throw dbError;

      setUploadSuccess(true);
      setTimeout(() => {
        onPhotoUploaded();
        handleClose();
      }, 1500);

    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Failed to upload photo. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreview(null);
    setCaption('');
    setNotes('');
    setUploadSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-[#2D1B4E] to-[#1a0f2e] rounded-3xl w-full max-w-lg overflow-hidden border border-white/10 shadow-2xl">
        {/* Header */}
        <div className="relative p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-[#D4AF37] to-amber-500 flex items-center justify-center">
              <Camera className="w-6 h-6 text-[#2D1B4E]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Capture This Moment</h2>
              <p className="text-gray-400 text-sm">{stopName}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="absolute top-6 right-6 p-2 rounded-xl bg-white/10 text-gray-400 hover:text-white hover:bg-white/20 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {uploadSuccess ? (
            <div className="text-center py-8">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                <Check className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Memory Saved!</h3>
              <p className="text-gray-400">Your photo has been added to your adventure album</p>
            </div>
          ) : (
            <>
              {/* Upload Area */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className={`relative border-2 border-dashed rounded-2xl p-6 transition-all cursor-pointer ${
                  preview 
                    ? 'border-[#D4AF37]/50 bg-[#D4AF37]/5' 
                    : 'border-white/20 hover:border-[#D4AF37]/50 hover:bg-white/5'
                }`}
              >
                {preview ? (
                  <div className="relative">
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-xl"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                        setPreview(null);
                      }}
                      className="absolute top-2 right-2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/10 flex items-center justify-center">
                      <Image className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-white font-medium mb-1">Drop your photo here</p>
                    <p className="text-gray-400 text-sm">or click to browse</p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {/* Caption */}
              <div>
                <label className="flex items-center gap-2 text-white font-medium mb-2">
                  <MessageSquare className="w-4 h-4 text-[#D4AF37]" />
                  Caption
                </label>
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Add a romantic caption..."
                  className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-gray-500 border border-white/10 focus:border-[#D4AF37] focus:outline-none transition-all"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="flex items-center gap-2 text-white font-medium mb-2">
                  <FileText className="w-4 h-4 text-[#D4AF37]" />
                  Private Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Write a private memory about this moment..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-gray-500 border border-white/10 focus:border-[#D4AF37] focus:outline-none transition-all resize-none"
                />
              </div>

              {/* Adventure Info */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 text-[#D4AF37] text-sm mb-1">
                  <Sparkles className="w-4 h-4" />
                  {adventureName}
                </div>
                <p className="text-gray-400 text-sm">{stopName}</p>
              </div>

              {/* Upload Button */}
              <button
                onClick={handleUpload}
                disabled={!selectedFile || isUploading}
                className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                  selectedFile && !isUploading
                    ? 'bg-gradient-to-r from-[#D4AF37] to-amber-500 text-[#2D1B4E] hover:shadow-lg hover:shadow-amber-500/30'
                    : 'bg-white/10 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Save Memory
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhotoUploadModal;
