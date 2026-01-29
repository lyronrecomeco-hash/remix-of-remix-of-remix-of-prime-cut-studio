-- Create table for user menu permissions
CREATE TABLE IF NOT EXISTS public.user_menu_permissions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    menu_id TEXT NOT NULL,
    is_allowed BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, menu_id)
);

-- Enable RLS
ALTER TABLE public.user_menu_permissions ENABLE ROW LEVEL SECURITY;

-- Super admin can manage all permissions
CREATE POLICY "Super admins can manage all permissions"
ON public.user_menu_permissions
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'super_admin'
    )
);

-- Users can read their own permissions
CREATE POLICY "Users can read their own permissions"
ON public.user_menu_permissions
FOR SELECT
USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE TRIGGER update_user_menu_permissions_updated_at
    BEFORE UPDATE ON public.user_menu_permissions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();