import { useState } from 'react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MessageCircle, MoreHorizontal, Trash2, Heart, Repeat2, Share, BarChart2 } from 'lucide-react';
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
  const [isLiked, setIsLiked] = useState(false);

  const timeAgo = formatDistanceToNow(new Date(createdAt), {
    addSuffix: false,
    locale: ptBR
  });

  const totalReactions = reactions.reduce((sum, r) => sum + r.count, 0);

  return (
    <motion.article
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="border-b border-white/10 hover:bg-white/[0.02] transition-colors cursor-pointer"
    >
      <div className="px-4 py-3">
        <div className="flex gap-3">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-sm">
              G
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 flex-wrap">
                <span className="font-bold text-white text-[15px] hover:underline">
                  {authorName}
                </span>
                {isVerified && (
                  <GenesisVerifiedBadge size="sm" />
                )}
                <span className="text-white/50 text-[15px]">·</span>
                <span className="text-white/50 text-[15px] hover:underline">{timeAgo}</span>
              </div>

              {/* Actions */}
              {canDelete && onDelete && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-2 -m-2 rounded-full hover:bg-blue-500/10 transition-colors text-white/40 hover:text-blue-400">
                      <MoreHorizontal className="w-[18px] h-[18px]" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-card border-white/10">
                    <DropdownMenuItem 
                      onClick={() => onDelete(id)}
                      className="text-red-400 focus:text-red-400 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* Text content */}
            <div className="mt-0.5">
              <p className="text-white text-[15px] whitespace-pre-wrap leading-[1.4]">
                {content}
              </p>
            </div>

            {/* Image */}
            {imageUrl && (
              <div className="mt-3">
                <img 
                  src={imageUrl} 
                  alt="Post" 
                  className="w-full rounded-2xl object-cover max-h-[512px] border border-white/10"
                />
              </div>
            )}

            {/* Reactions bar - Genesis style */}
            <div className="mt-3">
              <CommunityReactions 
                reactions={reactions}
                onReact={(type) => onReact(id, type)}
              />
            </div>

            {/* Action buttons - Twitter style */}
            <div className="mt-3 flex items-center justify-between max-w-md -ml-2">
              {/* Comments */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenComments(id);
                }}
                className="group flex items-center gap-1 text-white/50 hover:text-blue-400 transition-colors"
              >
                <div className="p-2 rounded-full group-hover:bg-blue-500/10 transition-colors">
                  <MessageCircle className="w-[18px] h-[18px]" />
                </div>
                <span className="text-[13px]">{commentsCount > 0 ? commentsCount : ''}</span>
              </button>

              {/* Repost */}
              <button className="group flex items-center gap-1 text-white/50 hover:text-green-400 transition-colors">
                <div className="p-2 rounded-full group-hover:bg-green-500/10 transition-colors">
                  <Repeat2 className="w-[18px] h-[18px]" />
                </div>
              </button>

              {/* Like */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLiked(!isLiked);
                }}
                className={`group flex items-center gap-1 transition-colors ${
                  isLiked ? 'text-pink-500' : 'text-white/50 hover:text-pink-500'
                }`}
              >
                <div className="p-2 rounded-full group-hover:bg-pink-500/10 transition-colors">
                  <Heart className={`w-[18px] h-[18px] ${isLiked ? 'fill-current' : ''}`} />
                </div>
                <span className="text-[13px]">{totalReactions > 0 ? totalReactions : ''}</span>
              </button>

              {/* Views */}
              <button className="group flex items-center gap-1 text-white/50 hover:text-blue-400 transition-colors">
                <div className="p-2 rounded-full group-hover:bg-blue-500/10 transition-colors">
                  <BarChart2 className="w-[18px] h-[18px]" />
                </div>
              </button>

              {/* Share */}
              <button className="group flex items-center text-white/50 hover:text-blue-400 transition-colors">
                <div className="p-2 rounded-full group-hover:bg-blue-500/10 transition-colors">
                  <Share className="w-[18px] h-[18px]" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
};

export default CommunityPost;
