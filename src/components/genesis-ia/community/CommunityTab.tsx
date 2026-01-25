import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, Settings, RefreshCw } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'para-voce' | 'seguindo'>('para-voce');

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
    <div className="min-h-screen bg-[hsl(220,20%,6%)]">
      {/* Header - Twitter style */}
      <div className="sticky top-0 z-30 bg-[hsl(220,20%,6%)]/80 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center justify-between px-4 h-[53px]">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="text-white/90 hover:bg-white/10 h-9 w-9 rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-white">Comunidade</h1>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={loadPosts}
              disabled={loading}
              className="text-white/90 hover:bg-white/10 h-9 w-9 rounded-full"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white/90 hover:bg-white/10 h-9 w-9 rounded-full"
            >
              <Sparkles className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white/90 hover:bg-white/10 h-9 w-9 rounded-full"
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex">
          <button
            onClick={() => setActiveTab('para-voce')}
            className={`flex-1 py-4 text-center relative font-medium transition-colors ${
              activeTab === 'para-voce' 
                ? 'text-white' 
                : 'text-white/50 hover:text-white/70'
            }`}
          >
            Para você
            {activeTab === 'para-voce' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-blue-500 rounded-full"
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab('seguindo')}
            className={`flex-1 py-4 text-center relative font-medium transition-colors ${
              activeTab === 'seguindo' 
                ? 'text-white' 
                : 'text-white/50 hover:text-white/70'
            }`}
          >
            Seguindo
            {activeTab === 'seguindo' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-blue-500 rounded-full"
              />
            )}
          </button>
        </div>
      </div>

      {/* Create post form - Only for Genesis Hub */}
      {isGenesisHub && (
        <CreatePostForm onSubmit={handleCreatePost} isLoading={posting} />
      )}

      {/* Posts feed */}
      <div>
        {loading ? (
          <div className="flex justify-center py-12">
            <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Bem-vindo à Comunidade!</h3>
            <p className="text-white/50 max-w-sm mx-auto">
              Fique por dentro das novidades, dicas e atualizações exclusivas da Genesis.
            </p>
          </div>
        ) : (
          posts.map((post) => (
            <CommunityPost
              key={post.id}
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
          ))
        )}
      </div>
    </div>
  );
};

export default CommunityTab;
