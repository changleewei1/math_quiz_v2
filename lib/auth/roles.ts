export type UserRole = 'admin' | 'staff';

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: '管理員',
  staff: '行政/老師',
};

export const ROLE_PERMISSIONS = {
  admin: ['admin', 'staff'],
  staff: ['staff'],
} as const;


