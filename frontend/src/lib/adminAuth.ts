import type { User } from '@/types';

export function isAdminRole(role?: string | null): boolean {
  return role === 'admin' || role === 'staff';
}

export function isAdminUser(user?: User | null): boolean {
  return !!user && isAdminRole(user.role);
}

export function postAuthPath(user: User, redirect?: string | null): string {
  if (isAdminUser(user)) return '/admin';
  if (redirect && redirect.startsWith('/') && !redirect.startsWith('/admin')) {
    return redirect;
  }
  return '/dashboard';
}
