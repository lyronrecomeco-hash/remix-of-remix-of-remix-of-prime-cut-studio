import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CRMUser {
  id: string;
  auth_user_id: string;
  crm_tenant_id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'collaborator';
  is_active: boolean;
  permissions: Record<string, boolean>;
}

interface CRMTenant {
  id: string;
  name: string;
  segment: string | null;
  settings: Record<string, unknown>;
  onboarding_completed: boolean;
}

interface CRMContextType {
  crmUser: CRMUser | null;
  crmTenant: CRMTenant | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateTenant: (data: Partial<CRMTenant>) => Promise<boolean>;
  completeOnboarding: (companyName: string, segment: string) => Promise<boolean>;
  hasPermission: (permission: string) => boolean;
  isAdmin: boolean;
  isManager: boolean;
  refreshData: () => Promise<void>;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

export function CRMProvider({ children }: { children: ReactNode }) {
  const [crmUser, setCrmUser] = useState<CRMUser | null>(null);
  const [crmTenant, setCrmTenant] = useState<CRMTenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchCRMData = async (authUserId: string) => {
    try {
      // Fetch CRM user
      const { data: userData, error: userError } = await supabase
        .from('crm_users')
        .select('*')
        .eq('auth_user_id', authUserId)
        .eq('is_active', true)
        .single();

      if (userError || !userData) {
        return false;
      }

      setCrmUser({
        id: userData.id,
        auth_user_id: userData.auth_user_id,
        crm_tenant_id: userData.crm_tenant_id,
        name: userData.name,
        email: userData.email,
        role: userData.role as CRMUser['role'],
        is_active: userData.is_active,
        permissions: (userData.permissions as Record<string, boolean>) || {},
      });

      // Fetch tenant
      const { data: tenantData, error: tenantError } = await supabase
        .from('crm_tenants')
        .select('*')
        .eq('id', userData.crm_tenant_id)
        .single();

      if (tenantError || !tenantData) {
        return false;
      }

      setCrmTenant({
        id: tenantData.id,
        name: tenantData.name,
        segment: tenantData.segment,
        settings: (tenantData.settings as Record<string, unknown>) || {},
        onboarding_completed: tenantData.onboarding_completed,
      });

      return true;
    } catch (error) {
      console.error('Error fetching CRM data:', error);
      return false;
    }
  };

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const success = await fetchCRMData(session.user.id);
        if (!success) {
          setCrmUser(null);
          setCrmTenant(null);
        }
      }
    } catch (error) {
      console.error('Error checking CRM session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setCrmUser(null);
        setCrmTenant(null);
      } else if (session?.user && event === 'SIGNED_IN') {
        await fetchCRMData(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: 'Erro no login',
          description: error.message,
          variant: 'destructive',
        });
        return false;
      }

      if (!data.user) {
        toast({
          title: 'Erro no login',
          description: 'Usuário não encontrado',
          variant: 'destructive',
        });
        return false;
      }

      const success = await fetchCRMData(data.user.id);
      
      if (!success) {
        await supabase.auth.signOut();
        toast({
          title: 'Acesso negado',
          description: 'Você não possui acesso ao CRM',
          variant: 'destructive',
        });
        return false;
      }

      // Log audit
      if (crmUser && crmTenant) {
        await supabase.from('crm_audit_logs').insert({
          crm_tenant_id: crmTenant.id,
          user_id: crmUser.id,
          action: 'login',
          entity_type: 'session',
          details: { email },
        });
      }

      toast({
        title: 'Login realizado',
        description: 'Bem-vindo ao CRM!',
      });

      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Erro no login',
        description: 'Ocorreu um erro inesperado',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setCrmUser(null);
      setCrmTenant(null);
      toast({
        title: 'Logout realizado',
        description: 'Até logo!',
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateTenant = async (data: Partial<CRMTenant>): Promise<boolean> => {
    if (!crmTenant) return false;

    try {
      const updateData: Record<string, unknown> = { ...data };
      const { error } = await supabase
        .from('crm_tenants')
        .update(updateData)
        .eq('id', crmTenant.id);

      if (error) throw error;

      setCrmTenant((prev) => prev ? { ...prev, ...data } : null);
      return true;
    } catch (error) {
      console.error('Error updating tenant:', error);
      return false;
    }
  };

  const completeOnboarding = async (companyName: string, segment: string): Promise<boolean> => {
    if (!crmTenant) return false;

    try {
      const { error } = await supabase
        .from('crm_tenants')
        .update({
          name: companyName,
          segment,
          onboarding_completed: true,
        })
        .eq('id', crmTenant.id);

      if (error) throw error;

      setCrmTenant((prev) => prev ? {
        ...prev,
        name: companyName,
        segment,
        onboarding_completed: true,
      } : null);

      // Create default funnel and stages
      const { data: funnel } = await supabase
        .from('crm_funnels')
        .insert({
          crm_tenant_id: crmTenant.id,
          name: 'Funil Principal',
          description: 'Funil padrão de vendas',
          position: 0,
        })
        .select()
        .single();

      if (funnel) {
        const stages = [
          { name: 'Novo Lead', color: '#3b82f6', position: 0 },
          { name: 'Qualificação', color: '#f59e0b', position: 1 },
          { name: 'Proposta', color: '#8b5cf6', position: 2 },
          { name: 'Negociação', color: '#ec4899', position: 3 },
          { name: 'Fechado Ganho', color: '#22c55e', position: 4, is_final: true, is_won: true },
          { name: 'Fechado Perdido', color: '#ef4444', position: 5, is_final: true, is_won: false },
        ];

        await supabase.from('crm_funnel_stages').insert(
          stages.map((s) => ({
            ...s,
            crm_tenant_id: crmTenant.id,
            funnel_id: funnel.id,
          }))
        );
      }

      // Create default pipeline
      await supabase.from('crm_pipelines').insert({
        crm_tenant_id: crmTenant.id,
        name: 'Pipeline Principal',
        description: 'Pipeline padrão de vendas',
        is_default: true,
      });

      // Create default loss reasons
      const lossReasons = [
        'Preço alto',
        'Optou por concorrente',
        'Sem orçamento',
        'Projeto cancelado',
        'Sem resposta',
        'Outro',
      ];

      await supabase.from('crm_loss_reasons').insert(
        lossReasons.map((name) => ({
          crm_tenant_id: crmTenant.id,
          name,
        }))
      );

      toast({
        title: 'Configuração concluída!',
        description: 'Seu CRM está pronto para uso.',
      });

      return true;
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível concluir a configuração',
        variant: 'destructive',
      });
      return false;
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!crmUser) return false;
    if (crmUser.role === 'admin') return true;
    return crmUser.permissions[permission] === true;
  };

  const refreshData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await fetchCRMData(session.user.id);
    }
  };

  const value: CRMContextType = {
    crmUser,
    crmTenant,
    isLoading,
    isAuthenticated: !!crmUser && !!crmTenant,
    login,
    logout,
    updateTenant,
    completeOnboarding,
    hasPermission,
    isAdmin: crmUser?.role === 'admin',
    isManager: crmUser?.role === 'manager' || crmUser?.role === 'admin',
    refreshData,
  };

  return <CRMContext.Provider value={value}>{children}</CRMContext.Provider>;
}

export function useCRM() {
  const context = useContext(CRMContext);
  if (context === undefined) {
    throw new Error('useCRM must be used within a CRMProvider');
  }
  return context;
}
