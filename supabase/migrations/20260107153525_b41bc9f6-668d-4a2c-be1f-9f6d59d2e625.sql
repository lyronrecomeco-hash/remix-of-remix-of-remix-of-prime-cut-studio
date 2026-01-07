-- Service role only access for dedup table (backend use only)
CREATE POLICY "Service role can manage dedup"
  ON public.chatbot_inbound_dedup
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);