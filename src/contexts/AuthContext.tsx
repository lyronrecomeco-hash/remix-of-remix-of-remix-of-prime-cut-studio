import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

type AppRole = 'super_admin' | 'admin' | 'barber';

interface AdminUser {
  id: string;
  userId: string;
  email: string;
  name: string;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  role: AppRole | null;
  adminUsers: AdminUser[];
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  createAdminUser: (email: string, password: string, name: string, role: AppRole, expiresAt?: string) => Promise<{ error: Error | null }>;
  updateAdminUser: (userId: string, updates: Partial<AdminUser>) => Promise<{ error: Error | null }>;
  deleteAdminUser: (userId: string) => Promise<{ error: Error | null }>;
  refreshAdminUsers: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [role, setRole] = useState<AppRole | null>(null);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);

  const checkUserRole = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error checking user role:', error.message);
        setRole(null);
        setIsAdmin(false);
        setIsSuperAdmin(false);
        return;
      }

      if (!data) {
        setRole(null);
        setIsAdmin(false);
        setIsSuperAdmin(false);
        return;
      }

      const userRole = data.role as AppRole;
      setRole(userRole);
      setIsAdmin(userRole === 'admin' || userRole === 'super_admin');
      setIsSuperAdmin(userRole === 'super_admin');
    } catch (err) {
      console.error('Exception checking user role:', err);
      setRole(null);
      setIsAdmin(false);
      setIsSuperAdmin(false);
    }
  }, []);

  const refreshAdminUsers = useCallback(async () => {
    if (!isAdmin) return;

    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching admin users:', error.message);
        return;
      }

      setAdminUsers(
        (data || []).map((u) => ({
          id: u.id,
          userId: u.user_id,
          email: u.email,
          name: u.name,
          expiresAt: u.expires_at,
          isActive: u.is_active,
          createdAt: u.created_at,
        }))
      );
    } catch (error) {
      console.error('Error fetching admin users:', error);
    }
  }, [isAdmin]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          setTimeout(() => {
            checkUserRole(session.user.id);
          }, 0);
        } else {
          setRole(null);
          setIsAdmin(false);
          setIsSuperAdmin(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        checkUserRole(session.user.id);
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [checkUserRole]);

  useEffect(() => {
    if (isAdmin) {
      refreshAdminUsers();
    }
  }, [isAdmin, refreshAdminUsers]);

  const signIn = useCallback(async (email: string, password: string): Promise<{ error: Error | null }> => {
    try {
      // First check if user's email is confirmed in our custom system
      const { data: tokenData } = await supabase
        .from('email_confirmation_tokens')
        .select('confirmed_at')
        .eq('email', email)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (tokenData && !tokenData.confirmed_at) {
        return { error: new Error('Por favor, confirme seu email antes de fazer login.') };
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        return { error };
      }

      // Check if user has a role (for admin access)
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', data.user.id)
        .maybeSingle();

      if (roleError) {
        console.error('Error checking role on login:', roleError.message);
      }

      // If no role found, user is a regular client - allow login but no admin access
      // The ProtectedRoute will handle admin-only routes
      if (!roleData) {
        console.log('User has no admin role, regular user access');
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setRole(null);
    setIsAdmin(false);
    setIsSuperAdmin(false);
    setAdminUsers([]);
  }, []);

  const createAdminUser = useCallback(async (
    email: string,
    password: string,
    name: string,
    userRole: AppRole,
    expiresAt?: string
  ): Promise<{ error: Error | null }> => {
    if (!isSuperAdmin) {
      return { error: new Error('Apenas super admins podem criar usuários.') };
    }

    if (!session) {
      return { error: new Error('Sessão expirada. Faça login novamente.') };
    }

    try {
      console.log('Creating admin user:', { email, name, role: userRole });
      
      const { data, error: invokeError } = await supabase.functions.invoke('create-admin-user', {
        body: { email, password, name, role: userRole, expiresAt },
      });

      console.log('Function response:', { data, invokeError });

      if (invokeError) {
        console.error('Function invoke error:', invokeError);
        return { error: new Error(invokeError.message || 'Erro ao chamar função de criação') };
      }

      if (data?.error) {
        console.error('Function returned error:', data.error);
        return { error: new Error(data.error) };
      }

      if (!data?.success) {
        return { error: new Error('Resposta inesperada do servidor') };
      }

      await refreshAdminUsers();
      return { error: null };
    } catch (error) {
      console.error('Create admin user exception:', error);
      return { error: error as Error };
    }
  }, [isSuperAdmin, session, refreshAdminUsers]);

  const updateAdminUser = useCallback(async (
    userId: string,
    updates: Partial<AdminUser>
  ): Promise<{ error: Error | null }> => {
    if (!isSuperAdmin) {
      return { error: new Error('Apenas super admins podem atualizar usuários.') };
    }

    try {
      const dbUpdates: Record<string, unknown> = {};
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.email) dbUpdates.email = updates.email;
      if (updates.expiresAt !== undefined) dbUpdates.expires_at = updates.expiresAt;
      if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;

      const { error } = await supabase
        .from('admin_users')
        .update(dbUpdates)
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating admin user:', error.message);
        return { error: new Error(error.message) };
      }

      await refreshAdminUsers();
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }, [isSuperAdmin, refreshAdminUsers]);

  const deleteAdminUser = useCallback(async (userId: string): Promise<{ error: Error | null }> => {
    if (!isSuperAdmin) {
      return { error: new Error('Apenas super admins podem excluir usuários.') };
    }

    try {
      const { data, error } = await supabase.functions.invoke('delete-admin-user', {
        body: { userId },
      });

      if (error || data?.error) {
        return { error: new Error(data?.error || error?.message || 'Erro ao excluir usuário') };
      }

      await refreshAdminUsers();
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }, [isSuperAdmin, refreshAdminUsers]);

  const value: AuthState = {
    user,
    session,
    isLoading,
    isAdmin,
    isSuperAdmin,
    role,
    adminUsers,
    signIn,
    signOut,
    createAdminUser,
    updateAdminUser,
    deleteAdminUser,
    refreshAdminUsers,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
