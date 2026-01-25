import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Bell, RefreshCw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useGenesisAuth } from '@/contexts/GenesisAuthContext';
import { toast } from 'sonner';
import { CommunityPost } from './CommunityPost';
import { CreatePostForm } from './CreatePostForm';

interface Post {
  id: string;
  author_id: string;
  author_name: string;
  content: string;
  image_url: string | null;
  created_at: string;
}

interface Reaction {
  type: 'fire' | 'diamond' | 'energy' | 'target' | 'rocket';
  count: number;
  hasReacted: boolean;
}

interface CommunityTabProps {
  onBack: () => void;
}

const GENESIS_HUB_EMAIL = 'lyronrp@gmail.com';

export const CommunityTab = ({ onBack }: CommunityTabProps) => {
  const { genesisUser } = useGenesisAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [reactions, setReactions] = useState<Record<string, Reaction[]>>({});
  const [commentsCounts, setCommentsCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  const isGenesisHub = genesisUser?.email === GENESIS_HUB_EMAIL;

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      
      const { data: postsData, error: postsError } = await supabase
        .from('community_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      setPosts(postsData || []);

      if (postsData && postsData.length > 0) {
        const postIds = postsData.map(p => p.id);
        
        const { data: reactionsData } = await supabase
          .from('community_reactions')
          .select('*')
          .in('post_id', postIds);

        const reactionsMap: Record<string, Reaction[]> = {};
        postIds.forEach(postId => {
          const postReactions = reactionsData?.filter(r => r.post_id === postId) || [];
          const reactionTypes: ('fire' | 'diamond' | 'energy' | 'target' | 'rocket')[] = 
            ['fire', 'diamond', 'energy', 'target', 'rocket'];
          
          reactionsMap[postId] = reactionTypes.map(type => ({
            type,
            count: postReactions.filter(r => r.reaction_type === type).length,
            hasReacted: postReactions.some(r => 
              r.reaction_type === type && r.user_id === genesisUser?.id
            )
          }));
        });
        setReactions(reactionsMap);

        const { data: commentsData } = await supabase
          .from('community_comments')
          .select('post_id')
          .in('post_id', postIds);

        const countsMap: Record<string, number> = {};
        postIds.forEach(postId => {
          countsMap[postId] = commentsData?.filter(c => c.post_id === postId).length || 0;
        });
        setCommentsCounts(countsMap);
      }
    } catch (error) {
      console.error('Error loading posts:', error);
      toast.error('Erro ao carregar posts');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (content: string, imageUrl?: string) => {
    if (!genesisUser || !isGenesisHub) return;

    try {
      setPosting(true);

      const { error } = await supabase
        .from('community_posts')
        .insert({
          author_id: genesisUser.id,
          author_name: 'Genesis Hub',
          content,
          image_url: imageUrl || null
        });

      if (error) throw error;

      toast.success('Post publicado!');
      loadPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Erro ao publicar post');
    } finally {
      setPosting(false);
    }
  };

  const handleReact = async (postId: string, reactionType: string) => {
    if (!genesisUser) {
      toast.error('Faça login para reagir');
      return;
    }

    try {
      const currentReaction = reactions[postId]?.find(r => r.type === reactionType);
      
      if (currentReaction?.hasReacted) {
        await supabase
          .from('community_reactions')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', genesisUser.id)
          .eq('reaction_type', reactionType);
      } else {
        await supabase
          .from('community_reactions')
          .insert({
            post_id: postId,
            user_id: genesisUser.id,
            reaction_type: reactionType
          });
      }

      setReactions(prev => ({
        ...prev,
        [postId]: prev[postId]?.map(r => 
          r.type === reactionType 
            ? { ...r, count: r.hasReacted ? r.count - 1 : r.count + 1, hasReacted: !r.hasReacted }
            : r
        ) || []
      }));
    } catch (error) {
      console.error('Error reacting:', error);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!isGenesisHub) return;

    try {
      const { error } = await supabase
        .from('community_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      setPosts(prev => prev.filter(p => p.id !== postId));
      toast.success('Post excluído');
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Erro ao excluir post');
    }
  };

  const handleOpenComments = (postId: string) => {
    toast.info('Comentários em breve!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[hsl(220,30%,8%)] to-[hsl(220,25%,5%)]">
      {/* Header - Genesis style with glassmorphism */}
      <div className="sticky top-0 z-30 bg-[hsl(220,30%,10%)]/80 backdrop-blur-xl border-b border-blue-500/20">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="text-white/80 hover:text-white hover:bg-white/10 h-9 w-9 rounded-xl"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Comunidade</h1>
                <p className="text-[11px] text-blue-400/80 -mt-0.5">Avisos & Atualizações</p>
              </div>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={loadPosts}
            disabled={loading}
            className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 h-9 w-9 rounded-xl"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Create post form - Only for Genesis Hub */}
      {isGenesisHub && (
        <CreatePostForm onSubmit={handleCreatePost} isLoading={posting} />
      )}

      {/* Posts feed */}
      <div className="pb-20">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />
              </div>
              <span className="text-sm text-white/40">Carregando...</span>
            </div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 px-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mx-auto mb-4 border border-blue-500/30 shadow-lg shadow-blue-500/10"
            >
              <Sparkles className="w-10 h-10 text-blue-400" />
            </motion.div>
            <h3 className="text-xl font-bold text-white mb-2">Bem-vindo à Comunidade!</h3>
            <p className="text-blue-300/60 max-w-sm mx-auto text-sm">
              Fique por dentro das novidades, dicas e atualizações exclusivas da Genesis.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-blue-500/10">
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <CommunityPost
                  id={post.id}
                  authorName={post.author_name}
                  isVerified={true}
                  content={post.content}
                  imageUrl={post.image_url}
                  createdAt={post.created_at}
                  reactions={reactions[post.id] || []}
                  commentsCount={commentsCounts[post.id] || 0}
                  onReact={handleReact}
                  onDelete={handleDeletePost}
                  onOpenComments={handleOpenComments}
                  canDelete={isGenesisHub}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityTab;
