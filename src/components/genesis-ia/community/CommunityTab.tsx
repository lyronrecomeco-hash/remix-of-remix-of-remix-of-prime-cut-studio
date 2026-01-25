import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, RefreshCw, Sparkles, Brain } from 'lucide-react';
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

export const CommunityTab = ({ onBack: _onBack }: CommunityTabProps) => {
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
    <div className="w-full max-w-4xl mx-auto space-y-4 pb-8">
      {/* Section Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
              <Bell className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Comunidade</h2>
              <p className="text-xs text-muted-foreground">Avisos & Atualizações</p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={loadPosts}
            disabled={loading}
            className="text-primary hover:text-primary hover:bg-primary/10 h-9 w-9 rounded-xl"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </motion.div>

      {/* Create post form - Only for Genesis Hub */}
      {isGenesisHub && (
        <CreatePostForm onSubmit={handleCreatePost} isLoading={posting} />
      )}

      {/* Posts feed */}
      <div className="space-y-3">
        {loading ? (
          <div className="glass-card p-8">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <RefreshCw className="w-5 h-5 text-primary animate-spin" />
              </div>
              <span className="text-sm text-muted-foreground">Carregando...</span>
            </div>
          </div>
        ) : posts.length === 0 ? (
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-card p-8 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-4 border border-primary/30 shadow-lg shadow-primary/10">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">Bem-vindo à Comunidade!</h3>
            <p className="text-muted-foreground max-w-sm mx-auto text-sm">
              Fique por dentro das novidades, dicas e atualizações exclusivas da Genesis.
            </p>
          </motion.div>
        ) : (
          posts.map((post, index) => (
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
          ))
        )}
      </div>
    </div>
  );
};

export default CommunityTab;
