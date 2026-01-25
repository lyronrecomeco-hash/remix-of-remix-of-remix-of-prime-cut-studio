import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, RefreshCw, Bell } from 'lucide-react';
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

interface CommunityTabProps {
  onBack: () => void;
}

const GENESIS_HUB_EMAIL = 'lyronrp@gmail.com';

export const CommunityTab = ({ onBack }: CommunityTabProps) => {
  const { genesisUser } = useGenesisAuth();
  const [posts, setPosts] = useState<Post[]>([]);
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

  return (
    <div className="min-h-screen bg-[hsl(220,25%,6%)]">
      {/* Header - Genesis style */}
      <div className="sticky top-0 z-30 bg-[hsl(220,25%,8%)]/95 backdrop-blur-xl border-b border-white/10">
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
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                <Bell className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Comunidade</h1>
                <p className="text-[10px] text-white/40 -mt-0.5">Avisos & Atualizações</p>
              </div>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={loadPosts}
            disabled={loading}
            className="text-white/80 hover:text-white hover:bg-white/10 h-9 w-9 rounded-xl"
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
              <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />
              <span className="text-sm text-white/40">Carregando...</span>
            </div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 px-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mx-auto mb-4 border border-blue-500/20"
            >
              <Sparkles className="w-10 h-10 text-blue-400" />
            </motion.div>
            <h3 className="text-xl font-bold text-white mb-2">Bem-vindo à Comunidade!</h3>
            <p className="text-white/50 max-w-sm mx-auto text-sm">
              Fique por dentro das novidades, dicas e atualizações exclusivas da Genesis.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
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
                  content={post.content}
                  imageUrl={post.image_url}
                  createdAt={post.created_at}
                  onDelete={handleDeletePost}
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
