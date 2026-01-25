import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MoreHorizontal, Trash2 } from 'lucide-react';
import { GenesisVerifiedBadge } from './GenesisVerifiedBadge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface CommunityPostProps {
  id: string;
  authorName: string;
  content: string;
  imageUrl?: string | null;
  createdAt: string;
  onDelete?: (postId: string) => void;
  canDelete?: boolean;
}

export const CommunityPost = ({
  id,
  authorName,
  content,
  imageUrl,
  createdAt,
  onDelete,
  canDelete = false
}: CommunityPostProps) => {
  const timeAgo = formatDistanceToNow(new Date(createdAt), {
    addSuffix: false,
    locale: ptBR
  });

  return (
    <article className="px-4 py-4 hover:bg-white/[0.02] transition-colors">
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-base shadow-lg shadow-blue-500/20">
            G
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-white text-[15px]">
                {authorName}
              </span>
              <GenesisVerifiedBadge size="sm" />
              <span className="text-white/30 text-sm">·</span>
              <span className="text-white/40 text-sm">{timeAgo}</span>
            </div>

            {/* Delete action */}
            {canDelete && onDelete && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/30 hover:text-white/60">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-[hsl(220,25%,12%)] border-white/10">
                  <DropdownMenuItem 
                    onClick={() => onDelete(id)}
                    className="text-red-400 focus:text-red-400 focus:bg-red-500/10 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Text content */}
          <div className="mb-2">
            <p className="text-white/90 text-[15px] whitespace-pre-wrap leading-relaxed">
              {content}
            </p>
          </div>

          {/* Image */}
          {imageUrl && (
            <div className="mt-3 rounded-xl overflow-hidden border border-white/10">
              <img 
                src={imageUrl} 
                alt="Post" 
                className="w-full object-cover max-h-[400px]"
              />
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

export default CommunityPost;
