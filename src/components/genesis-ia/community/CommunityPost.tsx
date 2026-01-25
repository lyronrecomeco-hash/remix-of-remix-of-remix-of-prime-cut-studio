import { useState } from 'react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MessageCircle, MoreHorizontal, Trash2 } from 'lucide-react';
import { GenesisVerifiedBadge } from './GenesisVerifiedBadge';
import { CommunityReactions } from './CommunityReactions';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Reaction {
  type: 'fire' | 'diamond' | 'energy' | 'target' | 'rocket';
  count: number;
  hasReacted: boolean;
}

interface CommunityPostProps {
  id: string;
  authorName: string;
  isVerified: boolean;
  content: string;
  imageUrl?: string | null;
  createdAt: string;
  reactions: Reaction[];
  commentsCount: number;
  onReact: (postId: string, reactionType: string) => void;
  onDelete?: (postId: string) => void;
  onOpenComments: (postId: string) => void;
  canDelete?: boolean;
}

export const CommunityPost = ({
  id,
  authorName,
  isVerified,
  content,
  imageUrl,
  createdAt,
  reactions,
  commentsCount,
  onReact,
  onDelete,
  onOpenComments,
  canDelete = false
}: CommunityPostProps) => {
  const timeAgo = formatDistanceToNow(new Date(createdAt), {
    addSuffix: false,
    locale: ptBR
  });

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 pb-3 flex items-start justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-700 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/30">
            G
          </div>
          
          {/* Author info */}
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-white text-sm">
                {authorName}
              </span>
              {isVerified && (
                <GenesisVerifiedBadge size="sm" />
              )}
            </div>
            <span className="text-xs text-white/50">{timeAgo}</span>
          </div>
        </div>

        {/* Actions */}
        {canDelete && onDelete && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/40 hover:text-white/70">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-card border-white/10">
              <DropdownMenuItem 
                onClick={() => onDelete(id)}
                className="text-destructive focus:text-destructive cursor-pointer"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <p className="text-white/90 text-sm whitespace-pre-wrap leading-relaxed">
          {content}
        </p>
      </div>

      {/* Image */}
      {imageUrl && (
        <div className="px-4 pb-3">
          <img 
            src={imageUrl} 
            alt="Post" 
            className="w-full rounded-xl object-cover max-h-[400px]"
          />
        </div>
      )}

      {/* Footer */}
      <div className="px-4 py-3 border-t border-white/5 flex items-center justify-between">
        <CommunityReactions 
          reactions={reactions}
          onReact={(type) => onReact(id, type)}
        />

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onOpenComments(id)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-white/60 hover:text-white/80"
        >
          <MessageCircle className="w-4 h-4" />
          <span className="text-xs">{commentsCount}</span>
        </motion.button>
      </div>
    </motion.article>
  );
};

export default CommunityPost;
