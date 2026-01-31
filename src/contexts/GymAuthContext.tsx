import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type GymRole = 'aluno' | 'instrutor' | 'admin';

interface GymProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  birth_date?: string;
  gender?: string;
  height_cm?: number;
  weight_kg?: number;
  goals?: string[];
  medical_restrictions?: string;
}

interface GymAuthContextType {
  user: User | null;
  session: Session | null;
  profile: GymProfile | null;
  role: GymRole | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isInstructor: boolean;
  isStudent: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const GymAuthContext = createContext<GymAuthContextType | undefined>(undefined);

export function GymAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<GymProfile | null>(null);
  const [role, setRole] = useState<GymRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data: profileData } = await supabase
        .from('gym_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileData) {
        setProfile(profileData as GymProfile);
      }

      const { data: roleData } = await supabase
        .from('gym_user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (roleData) {
        setRole(roleData.role as GymRole);
      }
    } catch (error) {
      console.error('Error fetching gym profile:', error);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setRole(null);
        }
        setIsLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) return { error };
      
      // Verify user has a gym profile (is a gym member)
      if (data.user) {
        const { data: gymProfile, error: profileError } = await supabase
          .from('gym_profiles')
          .select('id')
          .eq('user_id', data.user.id)
          .single();
        
        if (profileError || !gymProfile) {
          await supabase.auth.signOut();
          return { error: new Error('Usuário não cadastrado nesta academia. Contate o administrador.') };
        }
      }
      
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setRole(null);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const value: GymAuthContextType = {
    user,
    session,
    profile,
    role,
    isLoading,
    isAuthenticated: !!user && !!profile,
    isAdmin: role === 'admin',
    isInstructor: role === 'instrutor' || role === 'admin',
    isStudent: role === 'aluno',
    signIn,
    signOut,
    refreshProfile
  };

  return (
    <GymAuthContext.Provider value={value}>
      {children}
    </GymAuthContext.Provider>
  );
}

export function useGymAuth() {
  const context = useContext(GymAuthContext);
  if (context === undefined) {
    throw new Error('useGymAuth must be used within a GymAuthProvider');
  }
  return context;
}
