import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  LayoutDashboard,
  LogOut,
  MapPin,
  Package,
  ShoppingBag,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { User as AuthUser } from '@/types';

export type DashboardTab = 'overview' | 'orders' | 'wishlist' | 'addresses' | 'profile';

const NAV: { id: DashboardTab; label: string; short: string; icon: typeof Package }[] = [
  { id: 'overview', label: 'Overview', short: 'Home', icon: LayoutDashboard },
  { id: 'orders', label: 'Orders', short: 'Orders', icon: Package },
  { id: 'wishlist', label: 'Wishlist', short: 'Saved', icon: Heart },
  { id: 'addresses', label: 'Addresses', short: 'Address', icon: MapPin },
  { id: 'profile', label: 'Profile', short: 'Profile', icon: User },
];

interface DashboardShellProps {
  user: AuthUser;
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  onLogout: () => void;
  children: ReactNode;
}

export default function DashboardShell({
  user,
  activeTab,
  onTabChange,
  onLogout,
  children,
}: DashboardShellProps) {
  const initials = `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase();

  return (
    <div className="pb-24 lg:pb-0">
      <div className="container-luxury py-6 sm:py-8 md:py-10">
        {/* Header */}
        <div className="mb-6 sm:mb-8 md:mb-10">
          <p className="luxury-subheading mb-2">My Account</p>
          <div className="flex flex-row items-end justify-between gap-3 sm:gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="font-display text-2xl sm:text-4xl md:text-5xl text-charcoal truncate">
                Welcome, {user.first_name}
              </h1>
              <p className="text-stone text-xs sm:text-sm mt-1.5 sm:mt-2 truncate">{user.email}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-charcoal text-gold flex items-center justify-center font-display text-xs sm:text-sm tracking-wide">
                {initials}
              </div>
              <button
                type="button"
                onClick={onLogout}
                className="lg:hidden inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-[10px] sm:text-[11px] uppercase tracking-[0.12em] border border-sand/50 text-stone hover:text-red-600 hover:border-red-300 transition-colors"
                aria-label="Sign out"
              >
                <LogOut size={14} />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile tab strip */}
        <div className="lg:hidden -mx-4 px-4 mb-5 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 min-w-max pb-1">
            {NAV.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => onTabChange(id)}
                className={cn(
                  'inline-flex items-center gap-2 shrink-0 px-3.5 py-2.5 text-[11px] uppercase tracking-[0.12em] border transition-colors',
                  activeTab === id
                    ? 'bg-charcoal text-cream border-charcoal'
                    : 'bg-white text-stone border-sand/50',
                )}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)] gap-6 lg:gap-8 xl:gap-10">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block space-y-4">
            <div className="bg-white border border-sand/40 p-5 sticky top-28">
              <div className="flex items-center gap-3 mb-6 pb-5 border-b border-sand/40">
                <div className="w-12 h-12 rounded-full bg-charcoal text-gold flex items-center justify-center font-display text-base shrink-0">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-charcoal truncate text-sm">
                    {user.first_name} {user.last_name}
                  </p>
                  <p className="text-xs text-stone truncate">{user.email}</p>
                </div>
              </div>

              <nav className="space-y-1">
                {NAV.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => onTabChange(id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors text-left',
                      activeTab === id
                        ? 'bg-charcoal text-cream'
                        : 'text-stone hover:bg-ivory hover:text-charcoal',
                    )}
                  >
                    <Icon size={16} />
                    {label}
                  </button>
                ))}
              </nav>

              <div className="mt-6 pt-5 border-t border-sand/40 space-y-1">
                <Link
                  to="/shop"
                  className="flex items-center gap-3 px-3 py-2.5 text-sm text-stone hover:text-charcoal transition-colors"
                >
                  <ShoppingBag size={16} />
                  Continue Shopping
                </Link>
                <button
                  type="button"
                  onClick={onLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-stone hover:text-red-600 transition-colors"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            </div>
          </aside>

          <div className="min-w-0">{children}</div>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-sand/50 bg-cream/95 backdrop-blur-md"
        style={{ paddingBottom: 'max(0.25rem, env(safe-area-inset-bottom))' }}
      >
        <div className="grid grid-cols-5">
          {NAV.map(({ id, short, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => onTabChange(id)}
              className={cn(
                'flex flex-col items-center gap-1 py-2.5 px-1 text-[10px] uppercase tracking-[0.08em] transition-colors',
                activeTab === id ? 'text-charcoal' : 'text-stone',
              )}
            >
              <span
                className={cn(
                  'w-9 h-9 flex items-center justify-center transition-colors',
                  activeTab === id ? 'bg-charcoal text-cream' : 'bg-transparent',
                )}
              >
                <Icon size={16} />
              </span>
              {short}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
