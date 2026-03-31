
-- Allow public read of site_customization settings
CREATE POLICY "Anyone can read site_customization" ON public.admin_settings
FOR SELECT USING (setting_type = 'site_customization');

-- Ensure admin can write site_customization (even without user_id)
CREATE POLICY "Admins can manage site_customization" ON public.admin_settings
FOR ALL USING (
  setting_type = 'site_customization' AND public.is_admin(auth.uid())
) WITH CHECK (
  setting_type = 'site_customization' AND public.is_admin(auth.uid())
);
