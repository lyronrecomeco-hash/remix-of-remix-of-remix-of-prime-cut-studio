
-- Create community posts table
CREATE TABLE public.community_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID NOT NULL,
  author_name TEXT NOT NULL DEFAULT 'Genesis Hub',
  content TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create community reactions table
CREATE TABLE public.community_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('fire', 'diamond', 'energy', 'target', 'rocket')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id, reaction_type)
);

-- Create community comments table
CREATE TABLE public.community_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  user_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;

-- Posts policies (everyone can read, only specific user can create)
CREATE POLICY "Anyone can view posts" ON public.community_posts FOR SELECT USING (true);
CREATE POLICY "Genesis Hub can create posts" ON public.community_posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Genesis Hub can update posts" ON public.community_posts FOR UPDATE USING (true);
CREATE POLICY "Genesis Hub can delete posts" ON public.community_posts FOR DELETE USING (true);

-- Reactions policies (authenticated users can react)
CREATE POLICY "Anyone can view reactions" ON public.community_reactions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can react" ON public.community_reactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can remove own reactions" ON public.community_reactions FOR DELETE USING (true);

-- Comments policies
CREATE POLICY "Anyone can view comments" ON public.community_comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can comment" ON public.community_comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can delete own comments" ON public.community_comments FOR DELETE USING (true);

-- Create indexes
CREATE INDEX idx_community_posts_created_at ON public.community_posts(created_at DESC);
CREATE INDEX idx_community_reactions_post_id ON public.community_reactions(post_id);
CREATE INDEX idx_community_comments_post_id ON public.community_comments(post_id);
