import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, RefreshCw } from 'lucide-react';
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
      
      // Load posts
      const { data: postsData, error: postsError } = await supabase
        .from('community_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      setPosts(postsData || []);

      // Load reactions for all posts
      if (postsData && postsData.length > 0) {
        const postIds = postsData.map(p => p.id);
        
        const { data: reactionsData } = await supabase
          .from('community_reactions')
          .select('*')
          .in('post_id', postIds);

        // Process reactions
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

        // Load comments counts
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
        // Remove reaction
        await supabase
          .from('community_reactions')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', genesisUser.id)
          .eq('reaction_type', reactionType);
      } else {
        // Add reaction
        await supabase
          .from('community_reactions')
          .insert({
            post_id: postId,
            user_id: genesisUser.id,
            reaction_type: reactionType
          });
      }

      // Update local state
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
    // TODO: Implementar modal de comentários
    toast.info('Comentários em breve!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-white/50 hover:text-white hover:bg-white/10 h-9"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Voltar
          </Button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={loadPosts}
          disabled={loading}
          className="text-white/50 hover:text-white hover:bg-white/10 h-9"
        >
          <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Title section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center border border-cyan-500/20">
            <Users className="w-6 h-6 text-cyan-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Comunidade Genesis</h1>
        </div>
        <p className="text-white/60 text-sm max-w-md mx-auto">
          Fique por dentro das novidades, atualizações e dicas exclusivas
        </p>
      </motion.div>

      {/* Create post form - Only for Genesis Hub */}
      {isGenesisHub && (
        <CreatePostForm onSubmit={handleCreatePost} isLoading={posting} />
      )}

      {/* Posts feed */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <RefreshCw className="w-6 h-6 text-white/40 animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 bg-white/5 rounded-2xl border border-white/10"
          >
            <Users className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <p className="text-white/60">Nenhum post ainda</p>
            <p className="text-white/40 text-sm">Em breve teremos novidades!</p>
          </motion.div>
        ) : (
          posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
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
          ))
        )}
      </div>
    </div>
  );
};

export default CommunityTab;
