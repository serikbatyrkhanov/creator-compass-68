import { supabase } from "@/integrations/supabase/client";

export const checkAdminRole = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .single();

    if (error || !data) return false;
    return true;
  } catch {
    return false;
  }
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const requireAdmin = async () => {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Not authenticated');
  }

  const isAdmin = await checkAdminRole(user.id);
  if (!isAdmin) {
    throw new Error('Not authorized - Admin access required');
  }

  return user;
};
