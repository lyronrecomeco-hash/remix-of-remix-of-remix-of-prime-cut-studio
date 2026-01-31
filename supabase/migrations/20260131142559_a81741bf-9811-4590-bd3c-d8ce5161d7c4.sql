-- Add unique constraint on user_id for gym_user_roles
ALTER TABLE public.gym_user_roles ADD CONSTRAINT gym_user_roles_user_id_unique UNIQUE (user_id);

-- Add unique constraint on user_id for gym_profiles  
ALTER TABLE public.gym_profiles ADD CONSTRAINT gym_profiles_user_id_unique UNIQUE (user_id);