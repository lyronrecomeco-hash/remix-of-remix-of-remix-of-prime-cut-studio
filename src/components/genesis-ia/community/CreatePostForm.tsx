import { useState } from 'react';
import { motion } from 'framer-motion';
import { Image, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { GenesisVerifiedBadge } from './GenesisVerifiedBadge';

interface CreatePostFormProps {
  onSubmit: (content: string, imageUrl?: string) => Promise<void>;
  isLoading: boolean;
}

export const CreatePostForm = ({ onSubmit, isLoading }: CreatePostFormProps) => {
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    
    await onSubmit(content.trim(), imageUrl.trim() || undefined);
    setContent('');
    setImageUrl('');
    setShowImageInput(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-700 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/30">
          G
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-white text-sm">Genesis Hub</span>
          <GenesisVerifiedBadge size="sm" />
        </div>
      </div>

      {/* Content input */}
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Compartilhe algo com a comunidade..."
        className="min-h-[100px] bg-white/5 border-white/10 text-white placeholder:text-white/40 resize-none mb-3"
      />

      {/* Image URL input */}
      {showImageInput && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-3"
        >
          <div className="relative">
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="URL da imagem (opcional)"
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
            <button
              onClick={() => {
                setImageUrl('');
                setShowImageInput(false);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded"
            >
              <X className="w-4 h-4 text-white/50" />
            </button>
          </div>
          
          {imageUrl && (
            <div className="mt-2 relative">
              <img 
                src={imageUrl} 
                alt="Preview" 
                className="max-h-32 rounded-lg object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
        </motion.div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowImageInput(!showImageInput)}
            className={`text-white/60 hover:text-white hover:bg-white/10 ${showImageInput ? 'bg-white/10' : ''}`}
          >
            <Image className="w-4 h-4" />
          </Button>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!content.trim() || isLoading}
          size="sm"
          className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white gap-2"
        >
          <Send className="w-4 h-4" />
          Publicar
        </Button>
      </div>
    </motion.div>
  );
};

export default CreatePostForm;
