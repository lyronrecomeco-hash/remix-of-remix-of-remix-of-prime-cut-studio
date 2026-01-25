import { useState } from 'react';
import { motion } from 'framer-motion';
import { Image, X, Loader2, Send, Brain } from 'lucide-react';
import { GenesisVerifiedBadge } from './GenesisVerifiedBadge';

interface CreatePostFormProps {
  onSubmit: (content: string, imageUrl?: string) => void;
  isLoading: boolean;
}

export const CreatePostForm = ({ onSubmit, isLoading }: CreatePostFormProps) => {
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = () => {
    if (!content.trim()) return;
    
    onSubmit(content.trim(), imageUrl.trim() || undefined);
    setContent('');
    setImageUrl('');
    setShowImageInput(false);
  };

  const characterCount = content.length;
  const maxCharacters = 500;
  const isOverLimit = characterCount > maxCharacters;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4"
    >
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
            <Brain className="w-6 h-6 text-primary-foreground" />
          </div>
        </div>

        {/* Input area */}
        <div className="flex-1 min-w-0">
          {/* Author indicator */}
          {isFocused && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-1.5 mb-2"
            >
              <span className="text-sm font-semibold text-foreground">Genesis Hub</span>
              <GenesisVerifiedBadge size="sm" />
            </motion.div>
          )}

          {/* Textarea */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setIsFocused(true)}
            placeholder="Compartilhar uma novidade..."
            className="w-full bg-transparent text-foreground text-base placeholder:text-muted-foreground resize-none border-0 focus:ring-0 focus:outline-none"
            style={{ 
              lineHeight: '1.4',
              minHeight: isFocused ? '100px' : '52px'
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
                  className="w-full px-3 py-2 bg-muted/30 border border-border/50 rounded-xl text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                />
                <button
                  onClick={() => {
                    setImageUrl('');
                    setShowImageInput(false);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-muted/50 rounded-full"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              
              {imageUrl && (
                <div className="mt-2 relative inline-block">
                  <img 
                    src={imageUrl} 
                    alt="Preview" 
                    className="max-h-40 rounded-xl object-cover border border-border/50"
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
              className="mt-3 flex items-center justify-between border-t border-border/30 pt-3"
            >
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowImageInput(!showImageInput)}
                  className={`p-2 rounded-lg transition-colors ${
                    showImageInput 
                      ? 'bg-primary/20 text-primary' 
                      : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Image className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-3">
                {/* Character count */}
                {content.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${isOverLimit ? 'text-destructive' : 'text-muted-foreground'}`}>
                      {characterCount}/{maxCharacters}
                    </span>
                    <div className="w-px h-5 bg-border/30" />
                  </div>
                )}

                {/* Post button */}
                <button
                  onClick={handleSubmit}
                  disabled={!content.trim() || isLoading || isOverLimit}
                  className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground font-semibold text-sm transition-all shadow-lg shadow-primary/30 flex items-center gap-2"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Publicar
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default CreatePostForm;
