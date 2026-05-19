import { useState, useEffect, useCallback } from 'react';
import type { UserRole } from '@/services/permissions';

interface UseUserRoleResult {
  role: UserRole | null;
  loading: boolean;
  refetch: () => Promise<void>;
}

export function useUserRole(): UseUserRoleResult {
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRole = useCallback(async () => {
    setLoading(true);
    try {
      const { auth } = await import('@/lib/firebase/firebase');
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setRole(null);
        setLoading(false);
        return;
      }
      const token = await currentUser.getIdTokenResult(false);
      const customRole = token.claims['role'] as UserRole | undefined;
      setRole(customRole ?? 'sme_owner');
    } catch (error) {
      console.error('Error fetching user role:', error);
      setRole(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRole();
  }, [fetchRole]);

  return { role, loading, refetch: fetchRole };
}

export function useUserRoleFromContext(user: any): UserRole | null {
  if (!user) return null;
  if ((user as any).role && ['sme_owner', 'sme_staff', 'admin'].includes((user as any).role)) {
    return (user as any).role as UserRole;
  }
  return 'sme_owner';
}