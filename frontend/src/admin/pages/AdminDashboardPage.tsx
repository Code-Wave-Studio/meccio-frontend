import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Package, ShoppingBag, Users, DollarSign } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { formatUsd } from '@/lib/currency';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

function money(n: number, currency?: string) {
  if (currency === 'INR') return `₹${Number(n || 0).toLocaleString('en-IN')}`;
  return formatUsd(Number(n || 0));
}

type RecentOrder = {
  id: number;
  order_number: string;
  customer_name?: string;
  customer_email?: string;
  total: number;
  currency?: string;
  status: string;
  created_at: string;
};

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: async () => {
      const res = await adminApi.dashboard();
      return res.data?.data ?? {};
    },
  });

  const stats = data?.stats ?? {};
  const recentOrders: RecentOrder[] = data?.recent_orders ?? [];
  const monthlyRevenue = data?.monthly_revenue ?? [];
  const statusBreakdown = data?.status_breakdown ?? [];
  const maxRevenue = Math.max(...(monthlyRevenue.map((m: { revenue: number }) => Number(m.revenue)) || [1]), 1);
  const maxStatus = Math.max(...(statusBreakdown.map((s: { count: number }) => Number(s.count)) || [1]), 1);

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="animate-spin text-[#c4a962]" size={28} />
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-8 overflow-x-hidden">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-medium tracking-tight">Dashboard</h1>
          <p className="text-sm text-[#9c8b7a] mt-1 truncate">
            Welcome back, {user?.first_name || 'Admin'} · MECCIO RUGS overview
          </p>
        </div>
        <div className="grid grid-cols-2 sm:flex gap-2 w-full sm:w-auto">
          <Link
            to="/admin/orders"
            className="inline-flex items-center justify-center px-4 py-2.5 min-h-[44px] text-xs uppercase tracking-wider border border-[#e8e0d5] bg-white hover:border-[#c4a962]"
          >
            View Orders
          </Link>
          <Link
            to="/admin/products"
            className="inline-flex items-center justify-center px-4 py-2.5 min-h-[44px] text-xs uppercase tracking-wider bg-[#1a1714] text-[#faf8f5] hover:bg-[#2c2825]"
          >
            + Products
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        {[
          {
            label: 'Total Revenue',
            value: money(stats.total_revenue),
            sub: `${money(stats.month_revenue)} this month`,
            icon: DollarSign,
            accent: true,
          },
          {
            label: 'Orders',
            value: String(stats.total_orders ?? 0),
            sub: `${stats.today_orders ?? 0} today · ${stats.pending_orders ?? 0} pending`,
            icon: ShoppingBag,
          },
          {
            label: 'Customers',
            value: String(stats.total_customers ?? 0),
            sub: 'Registered accounts',
            icon: Users,
          },
          {
            label: 'Products',
            value: String(stats.total_products ?? 0),
            sub: `${stats.low_stock ?? 0} low stock`,
            icon: Package,
          },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={
                card.accent
                  ? 'bg-gradient-to-br from-[#1a1714] to-[#2c2825] text-[#faf8f5] p-4 sm:p-5 border border-[#2c2825]'
                  : 'bg-white p-4 sm:p-5 border border-[#e8e0d5]'
              }
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="min-w-0">
                  <p className={`text-[10px] sm:text-[11px] uppercase tracking-[0.12em] ${card.accent ? 'text-white/60' : 'text-[#9c8b7a]'}`}>
                    {card.label}
                  </p>
                  <p className="text-xl sm:text-2xl font-semibold mt-1 leading-tight break-all">{card.value}</p>
                </div>
                <div className={`shrink-0 w-9 h-9 flex items-center justify-center border ${card.accent ? 'bg-white/10 border-white/10 text-[#d4bc7a]' : 'bg-[#faf8f5] border-[#efe7dc] text-[#a68b4b]'}`}>
                  <Icon size={16} />
                </div>
              </div>
              <p className={`text-[11px] sm:text-xs ${card.accent ? 'text-white/60' : 'text-[#9c8b7a]'}`}>{card.sub}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        {[
          { k: "Today's Revenue", v: money(stats.today_revenue) },
          { k: 'Unpaid Orders', v: String(stats.unpaid_orders ?? 0) },
          { k: 'Processing', v: String(stats.processing_orders ?? 0) },
          { k: 'Low Stock', v: String(stats.low_stock ?? 0) },
        ].map((m) => (
          <div key={m.k} className="bg-white border border-[#e8e0d5] px-3 sm:px-4 py-3 min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-[#9c8b7a] leading-snug">{m.k}</p>
            <p className="font-semibold mt-1 text-sm sm:text-base break-all">{m.v}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-4 sm:gap-5">
        <div className="bg-white border border-[#e8e0d5] min-w-0">
          <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-b border-[#e8e0d5] gap-3">
            <h2 className="font-medium text-base sm:text-lg">Recent Orders</h2>
            <Link to="/admin/orders" className="text-xs sm:text-sm text-[#a68b4b] hover:underline shrink-0">View all</Link>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-[#efe7dc]">
            {recentOrders.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-[#9c8b7a]">No orders yet</p>
            ) : (
              recentOrders.map((o) => (
                <Link
                  key={o.id}
                  to={`/admin/orders?id=${o.id}`}
                  className="block p-4 hover:bg-[#fcfaf7] active:bg-[#f5f0eb]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-mono text-xs text-[#a68b4b] truncate">{o.order_number}</p>
                      <p className="text-sm font-medium mt-1 truncate">{o.customer_name || '—'}</p>
                      <p className="text-[11px] text-[#9c8b7a] truncate">{o.customer_email}</p>
                      <p className="text-[11px] text-[#9c8b7a] mt-1">{formatDate(o.created_at)}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-medium text-sm">{money(o.total, o.currency)}</p>
                      <span className="inline-block mt-2 px-2 py-1 text-[10px] uppercase tracking-wider bg-[#f5f0eb] text-[#6f655c]">
                        {o.status}
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#faf8f5] text-[11px] uppercase tracking-wider text-[#9c8b7a]">
                  <th className="text-left px-4 py-3 font-medium">Order</th>
                  <th className="text-left px-4 py-3 font-medium">Customer</th>
                  <th className="text-left px-4 py-3 font-medium">Total</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-[#9c8b7a]">No orders yet</td></tr>
                ) : (
                  recentOrders.map((o) => (
                    <tr key={o.id} className="border-t border-[#efe7dc] hover:bg-[#fcfaf7]">
                      <td className="px-4 py-3">
                        <Link to={`/admin/orders?id=${o.id}`} className="font-mono text-xs text-[#a68b4b] hover:underline">
                          {o.order_number}
                        </Link>
                        <p className="text-[11px] text-[#9c8b7a] mt-0.5">{formatDate(o.created_at)}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="truncate max-w-[160px]">{o.customer_name || '—'}</p>
                        <p className="text-[11px] text-[#9c8b7a] truncate max-w-[160px]">{o.customer_email}</p>
                      </td>
                      <td className="px-4 py-3 font-medium">{money(o.total, o.currency)}</td>
                      <td className="px-4 py-3">
                        <span className="inline-block px-2 py-1 text-[10px] uppercase tracking-wider bg-[#f5f0eb] text-[#6f655c]">
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-5 min-w-0">
          <div className="bg-white border border-[#e8e0d5] p-4 sm:p-5">
            <h2 className="font-medium text-base sm:text-lg mb-4">Revenue (6 mo)</h2>
            <div className="flex items-end gap-1.5 sm:gap-2 h-36">
              {monthlyRevenue.length === 0 ? (
                <p className="text-sm text-[#9c8b7a]">No data</p>
              ) : (
                monthlyRevenue.map((m: { month: string; revenue: number }) => (
                  <div key={m.month} className="flex-1 flex flex-col items-center justify-end gap-2 h-full min-w-0">
                    <div
                      className="w-full max-w-[36px] bg-gradient-to-t from-[#c4a962] to-[#d4bc7a] min-h-[8px]"
                      style={{ height: `${Math.max(8, (Number(m.revenue) / maxRevenue) * 100)}%` }}
                    />
                    <span className="text-[9px] sm:text-[10px] text-[#9c8b7a]">{String(m.month).slice(5)}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white border border-[#e8e0d5] p-4 sm:p-5">
            <h2 className="font-medium text-base sm:text-lg mb-4">Order Status</h2>
            <div className="space-y-3">
              {statusBreakdown.map((s: { status: string; count: number }) => (
                <div key={s.status}>
                  <div className="flex justify-between text-xs mb-1 gap-2">
                    <span className="capitalize text-[#6f655c] truncate">{s.status}</span>
                    <span className="font-medium shrink-0">{s.count}</span>
                  </div>
                  <div className="h-1.5 bg-[#f5f0eb]">
                    <div
                      className="h-full bg-[#c4a962]"
                      style={{ width: `${(Number(s.count) / maxStatus) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
