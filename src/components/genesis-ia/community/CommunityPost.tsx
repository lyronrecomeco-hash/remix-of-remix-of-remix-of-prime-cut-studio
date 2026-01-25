import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MessageCircle, MoreHorizontal, Trash2, Share2, Brain } from 'lucide-react';
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
    <article className="glass-card p-4 hover:bg-card/60 transition-colors">
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
            <Brain className="w-6 h-6 text-primary-foreground" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-foreground text-[15px]">
                {authorName}
              </span>
              {isVerified && <GenesisVerifiedBadge size="sm" />}
              <span className="text-muted-foreground/40 text-sm">·</span>
              <span className="text-muted-foreground text-sm">{timeAgo}</span>
            </div>

            {/* Delete action */}
            {canDelete && onDelete && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-1.5 rounded-lg hover:bg-muted/30 transition-colors text-muted-foreground/50 hover:text-muted-foreground">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-card border-border">
                  <DropdownMenuItem 
                    onClick={() => onDelete(id)}
                    className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Text content */}
          <div className="mb-3">
            <p className="text-foreground/90 text-[15px] whitespace-pre-wrap leading-relaxed">
              {content}
            </p>
          </div>

          {/* Image */}
          {imageUrl && (
            <div className="mb-3 rounded-xl overflow-hidden border border-border/50">
              <img 
                src={imageUrl} 
                alt="Post" 
                className="w-full object-cover max-h-[400px]"
              />
            </div>
          )}

          {/* Reactions bar */}
          <div className="mb-3">
            <CommunityReactions 
              reactions={reactions}
              onReact={(type) => onReact(id, type)}
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-4 -ml-2">
            {/* Comments */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenComments(id);
              }}
              className="group flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors"
            >
              <div className="p-2 rounded-lg group-hover:bg-primary/10 transition-colors">
                <MessageCircle className="w-[18px] h-[18px]" />
              </div>
              {commentsCount > 0 && (
                <span className="text-[13px]">{commentsCount}</span>
              )}
            </button>

            {/* Share */}
            <button className="group flex items-center text-muted-foreground hover:text-accent transition-colors">
              <div className="p-2 rounded-lg group-hover:bg-accent/10 transition-colors">
                <Share2 className="w-[18px] h-[18px]" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default CommunityPost;
