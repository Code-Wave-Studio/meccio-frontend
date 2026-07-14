import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Tag,
  Star,
  FolderTree,
  Layers,
  MessageSquareQuote,
  HelpCircle,
  Ruler,
  Truck,
  RefreshCw,
  Mail,
  Settings,
  Image,
  LogOut,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

const NAV = [
  { to: '/admin', end: true, label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/admin/customers', label: 'Customers', icon: Users },
  { to: '/admin/coupons', label: 'Coupons', icon: Tag },
  { to: '/admin/reviews', label: 'Reviews', icon: Star },
  { to: '/admin/categories', label: 'Categories', icon: FolderTree },
  { to: '/admin/collections', label: 'Collections', icon: Layers },
  { to: '/admin/testimonials', label: 'Testimonials', icon: MessageSquareQuote },
  { to: '/admin/faqs', label: 'FAQs', icon: HelpCircle },
  { to: '/admin/size-guide', label: 'Size Guide', icon: Ruler },
  { to: '/admin/shipping', label: 'Shipping', icon: Truck },
  { to: '/admin/returns', label: 'Returns', icon: RefreshCw },
  { to: '/admin/messages', label: 'Messages', icon: Mail },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
  { to: '/admin/page-images', label: 'Page Images', icon: Image },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const NavItems = (
    <nav className="flex-1 space-y-0.5 px-2 sm:px-3 py-3 overflow-y-auto overscroll-contain">
      {NAV.map(({ to, end, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={() => setOpen(false)}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-3 py-2.5 text-sm rounded-sm transition-colors min-h-[44px]',
              isActive
                ? 'bg-[#2c2825] text-[#c4a962]'
                : 'text-[#9c8b7a] hover:bg-[#2c2825]/80 hover:text-[#c4a962]',
            )
          }
        >
          <Icon size={16} strokeWidth={1.5} className="shrink-0" />
          <span className="truncate">{label}</span>
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="min-h-dvh bg-[#f5f0eb] text-[#2c2825]">
      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between gap-3 px-3 sm:px-4 py-3 bg-[#1a1714] text-[#faf8f5] border-b border-[#2c2825]/80">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] -ml-1"
        >
          <Menu size={22} />
        </button>
        <div className="text-center min-w-0">
          <p className="font-display tracking-[0.18em] text-[#c4a962] text-sm truncate">MECCIO</p>
          <p className="text-[9px] uppercase tracking-[0.16em] text-[#9c8b7a]">Admin</p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          aria-label="Logout"
          className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] -mr-1 text-red-400"
        >
          <LogOut size={18} />
        </button>
      </header>

      {/* Mobile drawer */}
      <div
        className={cn(
          'lg:hidden fixed inset-0 z-50 transition-[visibility] duration-200',
          open ? 'visible' : 'invisible pointer-events-none',
        )}
      >
        <button
          type="button"
          className={cn(
            'absolute inset-0 bg-black/55 transition-opacity duration-200',
            open ? 'opacity-100' : 'opacity-0',
          )}
          onClick={() => setOpen(false)}
          aria-label="Close menu"
        />
        <aside
          className={cn(
            'absolute inset-y-0 left-0 w-[min(100%,300px)] bg-[#1a1714] text-[#faf8f5] flex flex-col shadow-2xl transition-transform duration-200 ease-out',
            open ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          <div className="flex items-center justify-between px-4 py-4 border-b border-[#2c2825]">
            <div>
              <p className="font-display tracking-[0.18em] text-[#c4a962]">MECCIO</p>
              <p className="text-[10px] uppercase tracking-[0.14em] text-[#9c8b7a] mt-0.5">Admin Panel</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="inline-flex items-center justify-center min-h-[44px] min-w-[44px]"
            >
              <X size={20} />
            </button>
          </div>
          {NavItems}
          <div className="p-4 border-t border-[#2c2825] space-y-2 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <p className="text-xs text-[#9c8b7a] truncate px-1">{user?.email}</p>
            <Link
              to="/"
              className="flex items-center gap-2 px-3 py-2.5 text-sm text-[#9c8b7a] hover:text-[#c4a962] min-h-[44px]"
            >
              <ExternalLink size={14} /> View Store
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-400 min-h-[44px]"
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </aside>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-[260px] xl:w-[280px] bg-[#1a1714] text-[#faf8f5] flex-col z-30">
        <div className="px-6 py-6 border-b border-[#2c2825]">
          <Link to="/admin" className="font-display text-xl tracking-[0.2em] text-[#c4a962]">
            MECCIO
          </Link>
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#9c8b7a] mt-1">Admin Panel</p>
        </div>
        {NavItems}
        <div className="p-4 border-t border-[#2c2825] space-y-1">
          <p className="text-xs text-[#9c8b7a] truncate px-3">
            {user?.first_name} {user?.last_name}
          </p>
          <p className="text-[11px] text-[#6f655c] truncate px-3 mb-2">{user?.email}</p>
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2.5 text-sm text-[#9c8b7a] hover:text-[#c4a962] rounded-sm"
          >
            <ExternalLink size={14} /> View Store
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-400 hover:text-red-300 rounded-sm"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      <main className="lg:ml-[260px] xl:ml-[280px] min-h-dvh">
        <div className="mx-auto w-full max-w-[1400px] px-3 sm:px-5 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
