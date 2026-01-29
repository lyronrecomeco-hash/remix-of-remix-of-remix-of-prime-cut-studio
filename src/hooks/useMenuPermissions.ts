import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface MenuPermission {
  menu_id: string;
  is_allowed: boolean;
}

export const useMenuPermissions = () => {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchPermissions = useCallback(async () => {
    if (!user) {
      setPermissions({});
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_menu_permissions' as any)
        .select('menu_id, is_allowed')
        .eq('user_id', user.id) as { data: MenuPermission[] | null; error: any };

      if (error) throw error;

      const permMap: Record<string, boolean> = {};
      data?.forEach((p) => {
        permMap[p.menu_id] = p.is_allowed;
      });
      setPermissions(permMap);
    } catch (error) {
      console.error('Error fetching menu permissions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  // Check if menu item is allowed (default: true if not explicitly denied)
  const isMenuAllowed = useCallback((menuId: string): boolean => {
    // If no explicit permission set, default to allowed
    if (permissions[menuId] === undefined) return true;
    return permissions[menuId];
  }, [permissions]);

  return { permissions, isMenuAllowed, isLoading, refetch: fetchPermissions };
};

// Hook for super_admin to manage other users' permissions
export const useManageMenuPermissions = () => {
  const [saving, setSaving] = useState(false);

  const getUserPermissions = useCallback(async (userId: string): Promise<Record<string, boolean>> => {
    try {
      const { data, error } = await supabase
        .from('user_menu_permissions' as any)
        .select('menu_id, is_allowed')
        .eq('user_id', userId) as { data: MenuPermission[] | null; error: any };

      if (error) throw error;

      const permMap: Record<string, boolean> = {};
      data?.forEach((p) => {
        permMap[p.menu_id] = p.is_allowed;
      });
      return permMap;
    } catch (error) {
      console.error('Error fetching user permissions:', error);
      return {};
    }
  }, []);

  const setMenuPermission = useCallback(async (
    userId: string, 
    menuId: string, 
    isAllowed: boolean
  ): Promise<boolean> => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('user_menu_permissions' as any)
        .upsert({
          user_id: userId,
          menu_id: menuId,
          is_allowed: isAllowed,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,menu_id'
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error setting menu permission:', error);
      return false;
    } finally {
      setSaving(false);
    }
  }, []);

  const setMultiplePermissions = useCallback(async (
    userId: string,
    permissions: Record<string, boolean>
  ): Promise<boolean> => {
    setSaving(true);
    try {
      const upserts = Object.entries(permissions).map(([menuId, isAllowed]) => ({
        user_id: userId,
        menu_id: menuId,
        is_allowed: isAllowed,
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('user_menu_permissions' as any)
        .upsert(upserts, { onConflict: 'user_id,menu_id' });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error setting multiple permissions:', error);
      return false;
    } finally {
      setSaving(false);
    }
  }, []);

  return { getUserPermissions, setMenuPermission, setMultiplePermissions, saving };
};
