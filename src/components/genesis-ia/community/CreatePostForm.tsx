import { useState } from 'react';
import { motion } from 'framer-motion';
import { Image, X, Loader2 } from 'lucide-react';
import { GenesisVerifiedBadge } from './GenesisVerifiedBadge';

interface CreatePostFormProps {
  onSubmit: (content: string, imageUrl?: string) => Promise<void>;
  isLoading: boolean;
}

export const CreatePostForm = ({ onSubmit, isLoading }: CreatePostFormProps) => {
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    
    await onSubmit(content.trim(), imageUrl.trim() || undefined);
    setContent('');
    setImageUrl('');
    setShowImageInput(false);
  };

  const characterCount = content.length;
  const maxCharacters = 500;
  const isOverLimit = characterCount > maxCharacters;

  return (
    <div className="border-b border-white/10">
      <div className="px-4 py-3">
        <div className="flex gap-3">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-sm">
              G
            </div>
          </div>

          {/* Input area */}
          <div className="flex-1 min-w-0">
            {/* Author indicator */}
            {isFocused && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-1 mb-2"
              >
                <span className="text-sm font-semibold text-white">Genesis Hub</span>
                <GenesisVerifiedBadge size="sm" />
              </motion.div>
            )}

            {/* Textarea */}
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onFocus={() => setIsFocused(true)}
              placeholder="O que está acontecendo?"
              className="w-full bg-transparent text-white text-xl placeholder:text-white/50 resize-none border-0 focus:ring-0 focus:outline-none min-h-[52px]"
              style={{ 
                lineHeight: '1.3',
                height: isFocused ? '100px' : '52px'
              }}
            />

            {/* Image URL input */}
            {showImageInput && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-3"
              >
                <div className="relative">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Cole a URL da imagem"
                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-xl text-white text-sm placeholder:text-white/40 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={() => {
                      setImageUrl('');
                      setShowImageInput(false);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full"
                  >
                    <X className="w-4 h-4 text-white/50" />
                  </button>
                </div>
                
                {imageUrl && (
                  <div className="mt-2 relative inline-block">
                    <img 
                      src={imageUrl} 
                      alt="Preview" 
                      className="max-h-40 rounded-xl object-cover border border-white/10"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </motion.div>
            )}

            {/* Actions bar */}
            {(isFocused || content) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-3 flex items-center justify-between border-t border-white/10 pt-3"
              >
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setShowImageInput(!showImageInput)}
                    className={`p-2 rounded-full transition-colors ${
                      showImageInput 
                        ? 'bg-blue-500/20 text-blue-400' 
                        : 'hover:bg-blue-500/10 text-blue-400'
                    }`}
                  >
                    <Image className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  {/* Character count */}
                  {content.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className={`text-sm ${isOverLimit ? 'text-red-500' : 'text-white/40'}`}>
                        {characterCount}/{maxCharacters}
                      </span>
                      <div className="w-px h-5 bg-white/20" />
                    </div>
                  )}

                  {/* Post button */}
                  <button
                    onClick={handleSubmit}
                    disabled={!content.trim() || isLoading || isOverLimit}
                    className="px-4 py-1.5 rounded-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm transition-colors"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Postar'
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePostForm;
