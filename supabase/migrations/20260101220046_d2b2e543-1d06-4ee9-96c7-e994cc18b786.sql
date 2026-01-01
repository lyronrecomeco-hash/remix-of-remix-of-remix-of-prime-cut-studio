-- Allow public read access to proposals with questionnaire_completed = true
-- This is needed for the public proposal page (/proposta/:id)
CREATE POLICY "Anyone can view completed proposals"
ON public.affiliate_proposals
FOR SELECT
USING (questionnaire_completed = true);