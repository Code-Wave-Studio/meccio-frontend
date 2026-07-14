import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import SEO from '@/components/SEO';
import DashboardShell, { type DashboardTab } from '@/components/dashboard/DashboardShell';
import DashboardOverview from '@/components/dashboard/DashboardOverview';
import DashboardOrders from '@/components/dashboard/DashboardOrders';
import DashboardAddresses from '@/components/dashboard/DashboardAddresses';
import DashboardProfile from '@/components/dashboard/DashboardProfile';
import DashboardWishlist from '@/components/dashboard/DashboardWishlist';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { addressApi, orderApi } from '@/lib/api';
import type { Order } from '@/types';

const VALID_TABS: DashboardTab[] = ['overview', 'orders', 'wishlist', 'addresses', 'profile'];

function parseTab(value: string | null): DashboardTab {
  if (value && VALID_TABS.includes(value as DashboardTab)) {
    return value as DashboardTab;
  }
  return 'overview';
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const { cart, wishlistCount } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = parseTab(searchParams.get('tab'));

  const setTab = useCallback((tab: DashboardTab) => {
    setSearchParams(tab === 'overview' ? {} : { tab }, { replace: true });
  }, [setSearchParams]);

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      try {
        const res = await orderApi.list();
        return (res.data?.data ?? []) as Order[];
      } catch {
        return [] as Order[];
      }
    },
    enabled: !!user,
  });

  const { data: addresses = [] } = useQuery({
    queryKey: ['addresses'],
    queryFn: async () => {
      try {
        const res = await addressApi.list();
        return res.data?.data ?? [];
      } catch {
        return [];
      }
    },
    enabled: !!user,
  });

  const content = useMemo(() => {
    switch (activeTab) {
      case 'orders':
        return <DashboardOrders orders={orders} isLoading={ordersLoading} />;
      case 'wishlist':
        return <DashboardWishlist />;
      case 'addresses':
        return <DashboardAddresses />;
      case 'profile':
        return <DashboardProfile />;
      default:
        return (
          <DashboardOverview
            orders={orders}
            wishlistCount={wishlistCount}
            addressCount={addresses.length}
            cartCount={cart?.item_count || 0}
            onTabChange={setTab}
          />
        );
    }
  }, [activeTab, orders, ordersLoading, wishlistCount, addresses.length, cart?.item_count, setTab]);

  if (!user) return null;

  return (
    <>
      <SEO title="My Account" noindex />
      <DashboardShell
        user={user}
        activeTab={activeTab}
        onTabChange={setTab}
        onLogout={logout}
      >
        {content}
      </DashboardShell>
    </>
  );
}
