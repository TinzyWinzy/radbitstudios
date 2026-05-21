export type UserRole = 'sme_owner' | 'sme_staff' | 'admin' | 'super_admin';

export interface RolePermissions {
  canManageBlog: boolean;
  canAccessMessages: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  sme_owner: {
    canManageBlog: false,
    canAccessMessages: true,
  },
  sme_staff: {
    canManageBlog: false,
    canAccessMessages: false,
  },
  admin: {
    canManageBlog: true,
    canAccessMessages: true,
  },
  super_admin: {
    canManageBlog: true,
    canAccessMessages: true,
  },
};

export function hasRole(userRole: UserRole | null, requiredRole: UserRole): boolean {
  return userRole === requiredRole;
}

export function canAccessByTier(
  currentTier: 'Free' | 'Growth' | 'Pro' | 'Enterprise',
  requiredTier: 'Free' | 'Growth' | 'Pro' | 'Enterprise'
): boolean {
  const TIER_ORDER = ['Free', 'Growth', 'Pro', 'Enterprise'] as const;
  return TIER_ORDER.indexOf(currentTier) >= TIER_ORDER.indexOf(requiredTier);
}