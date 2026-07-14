import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Mail, MapPin, Phone, Search, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi } from '@/lib/api';
import { formatInr, formatUsd } from '@/lib/currency';
import { formatDate } from '@/lib/utils';

type CustomerRow = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  is_active: number;
  order_count: number;
  total_spent: number;
  last_order_at?: string | null;
  last_login_at?: string | null;
  created_at: string;
};

type CustomerAddress = {
  id: number;
  label?: string;
  first_name: string;
  last_name: string;
  phone?: string | null;
  company?: string | null;
  address_line1: string;
  address_line2?: string | null;
  city: string;
  state?: string | null;
  postal_code: string;
  country: string;
  is_default?: number;
};

type CustomerOrder = {
  id: number;
  order_number: string;
  status: string;
  payment_status: string;
  total: number;
  currency?: string;
  item_count?: number;
  created_at: string;
};

function money(n: number, currency?: string) {
  if (currency === 'USD') return formatUsd(n);
  return formatInr(n);
}

function initials(first?: string, last?: string) {
  const a = (first || '').trim().charAt(0);
  const b = (last || '').trim().charAt(0);
  return ((a + b) || '?').toUpperCase();
}

function fullName(c: { first_name?: string; last_name?: string }) {
  return [c.first_name, c.last_name].filter(Boolean).join(' ').trim() || '—';
}

export default function AdminCustomersPage() {
  const queryClient = useQueryClient();
  const [q, setQ] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const listParams = useMemo(() => {
    const p: Record<string, string> = {};
    if (q.trim()) p.q = q.trim();
    return p;
  }, [q]);

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['admin', 'customers', listParams],
    queryFn: async () => {
      const res = await adminApi.customers.list(Object.keys(listParams).length ? listParams : undefined);
      return Array.isArray(res.data?.data) ? (res.data.data as CustomerRow[]) : [];
    },
  });

  const { data: detail, isLoading: detailLoading } = useQuery({
    queryKey: ['admin', 'customer', selectedId],
    queryFn: async () => {
      const res = await adminApi.customers.get(selectedId!);
      return res.data?.data as CustomerRow & {
        orders?: CustomerOrder[];
        addresses?: CustomerAddress[];
        paid_orders?: number;
        email_verified_at?: string | null;
      };
    },
    enabled: !!selectedId,
  });

  const toggleMutation = useMutation({
    mutationFn: (payload: { id: number; is_active: number }) =>
      adminApi.customers.update(payload.id, { is_active: payload.is_active ? 0 : 1 }),
    onSuccess: () => {
      toast.success('Customer status updated');
      queryClient.invalidateQueries({ queryKey: ['admin', 'customers'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'customer', selectedId] });
    },
    onError: () => toast.error('Could not update customer'),
  });

  const activeCount = customers.filter((c) => c.is_active).length;

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-medium">Customers</h1>
          <p className="text-sm text-[#9c8b7a] mt-1">Registered storefront accounts and order history</p>
        </div>
        <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-wider">
          <span className="px-3 py-1.5 bg-white border border-[#e8e0d5]">{customers.length} total</span>
          <span className="px-3 py-1.5 bg-white border border-[#e8e0d5]">{activeCount} active</span>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-white border border-[#e8e0d5] px-3 py-2.5 max-w-md">
        <Search size={16} className="text-[#9c8b7a] shrink-0" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, email, phone..."
          className="w-full outline-none text-sm bg-transparent min-h-[28px]"
        />
      </div>

      <div className="grid lg:grid-cols-[1fr_minmax(320px,420px)] gap-4">
        <div className="bg-white border border-[#e8e0d5] overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="animate-spin text-[#c4a962]" />
            </div>
          ) : customers.length === 0 ? (
            <p className="px-4 py-10 text-center text-[#9c8b7a] text-sm">No customers found</p>
          ) : (
            <>
              {/* Mobile */}
              <div className="md:hidden divide-y divide-[#efe7dc]">
                {customers.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedId(c.id)}
                    className={`w-full text-left p-4 space-y-2 ${selectedId === c.id ? 'bg-[#faf8f5]' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 h-11 w-11 flex items-center justify-center bg-[#1a1714] text-[#c4a962] text-xs font-medium tracking-wider">
                        {initials(c.first_name, c.last_name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-medium truncate">{fullName(c)}</p>
                          <span
                            className={`shrink-0 text-[10px] uppercase tracking-wider px-2 py-0.5 ${
                              c.is_active ? 'bg-green-50 text-green-800' : 'bg-[#f5f0eb] text-[#9c8b7a]'
                            }`}
                          >
                            {c.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#9c8b7a] break-all mt-0.5">{c.email}</p>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm pt-1.5">
                          <span>{c.order_count} orders</span>
                          <span className="font-medium">{money(c.total_spent, 'INR')}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Desktop */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#faf8f5] text-[11px] uppercase tracking-wider text-[#9c8b7a]">
                      <th className="text-left px-4 py-3 font-medium">Customer</th>
                      <th className="text-left px-4 py-3 font-medium">Phone</th>
                      <th className="text-left px-4 py-3 font-medium">Orders</th>
                      <th className="text-left px-4 py-3 font-medium">Spent</th>
                      <th className="text-left px-4 py-3 font-medium">Status</th>
                      <th className="text-left px-4 py-3 font-medium">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((c) => (
                      <tr
                        key={c.id}
                        onClick={() => setSelectedId(c.id)}
                        className={`border-t border-[#efe7dc] cursor-pointer hover:bg-[#fcfaf7] ${
                          selectedId === c.id ? 'bg-[#faf8f5]' : ''
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="shrink-0 h-10 w-10 flex items-center justify-center bg-[#1a1714] text-[#c4a962] text-[11px] font-medium tracking-wider">
                              {initials(c.first_name, c.last_name)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium truncate">{fullName(c)}</p>
                              <p className="text-[11px] text-[#9c8b7a] truncate">{c.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[#6f655c]">{c.phone || '—'}</td>
                        <td className="px-4 py-3">{c.order_count}</td>
                        <td className="px-4 py-3 font-medium">{money(c.total_spent, 'INR')}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`text-[10px] uppercase tracking-wider px-2 py-1 ${
                              c.is_active ? 'bg-green-50 text-green-800' : 'bg-[#f5f0eb] text-[#9c8b7a]'
                            }`}
                          >
                            {c.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[#9c8b7a] text-xs">{formatDate(c.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        <aside className="bg-white border border-[#e8e0d5] p-4 sm:p-5 lg:sticky lg:top-6 self-start max-h-[min(92dvh,900px)] overflow-y-auto">
          {!selectedId ? (
            <p className="text-sm text-[#9c8b7a] py-8 text-center">Select a customer to view details</p>
          ) : detailLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-[#c4a962]" />
            </div>
          ) : detail ? (
            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <div className="shrink-0 h-14 w-14 flex items-center justify-center bg-[#1a1714] text-[#c4a962] text-sm font-medium tracking-wider">
                  {initials(detail.first_name, detail.last_name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-lg leading-tight">{fullName(detail)}</p>
                  <p className="text-[11px] text-[#9c8b7a] mt-1">Customer #{detail.id}</p>
                  <button
                    type="button"
                    onClick={() => toggleMutation.mutate({ id: detail.id, is_active: detail.is_active })}
                    disabled={toggleMutation.isPending}
                    className={`mt-2 text-[10px] uppercase tracking-wider px-2.5 py-1 disabled:opacity-60 ${
                      detail.is_active ? 'bg-green-50 text-green-800' : 'bg-[#f5f0eb] text-[#9c8b7a]'
                    }`}
                  >
                    {detail.is_active ? 'Active — tap to disable' : 'Inactive — tap to enable'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="border border-[#efe7dc] bg-[#faf8f5] p-3">
                  <p className="text-[10px] uppercase tracking-wider text-[#9c8b7a]">Orders</p>
                  <p className="text-lg font-semibold mt-1">{detail.order_count ?? detail.orders?.length ?? 0}</p>
                </div>
                <div className="border border-[#efe7dc] bg-[#faf8f5] p-3">
                  <p className="text-[10px] uppercase tracking-wider text-[#9c8b7a]">Paid spent</p>
                  <p className="text-lg font-semibold mt-1">{money(detail.total_spent, 'INR')}</p>
                </div>
              </div>

              <div className="space-y-2.5 text-sm border-t border-[#e8e0d5] pt-4">
                <p className="text-[11px] uppercase tracking-wider text-[#9c8b7a] mb-1">Contact</p>
                <p className="flex items-start gap-2 text-[#5c5248] break-all">
                  <Mail size={14} className="mt-0.5 shrink-0 text-[#9c8b7a]" />
                  {detail.email}
                </p>
                <p className="flex items-center gap-2 text-[#5c5248]">
                  <Phone size={14} className="shrink-0 text-[#9c8b7a]" />
                  {detail.phone || '—'}
                </p>
                <div className="text-[11px] text-[#9c8b7a] space-y-0.5 pt-1">
                  <p>Joined {formatDate(detail.created_at)}</p>
                  <p>Last login {detail.last_login_at ? formatDate(detail.last_login_at) : '—'}</p>
                  <p>Email {detail.email_verified_at ? 'verified' : 'not verified'}</p>
                </div>
              </div>

              <div className="border-t border-[#e8e0d5] pt-4">
                <p className="text-[11px] uppercase tracking-wider text-[#9c8b7a] mb-3 flex items-center gap-1.5">
                  <MapPin size={12} /> Addresses ({detail.addresses?.length ?? 0})
                </p>
                {!detail.addresses?.length ? (
                  <p className="text-sm text-[#9c8b7a]">No saved addresses</p>
                ) : (
                  <ul className="space-y-3">
                    {detail.addresses.map((addr) => (
                      <li key={addr.id} className="border border-[#efe7dc] bg-[#faf8f5] p-3 text-sm space-y-0.5">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-[10px] uppercase tracking-wider text-[#9c8b7a]">
                            {addr.label || 'Address'}
                          </span>
                          {addr.is_default ? (
                            <span className="text-[9px] uppercase tracking-wider bg-[#c4a962]/20 text-[#6f5a2a] px-1.5 py-0.5">
                              Default
                            </span>
                          ) : null}
                        </div>
                        <p className="font-medium">{fullName(addr)}</p>
                        {addr.phone ? <p className="text-[#6f655c] text-xs">{addr.phone}</p> : null}
                        <p className="text-[#5c5248] leading-relaxed">
                          {[addr.address_line1, addr.address_line2].filter(Boolean).join(', ')}
                        </p>
                        <p className="text-[#5c5248]">
                          {[addr.city, addr.state, addr.postal_code].filter(Boolean).join(', ')}
                        </p>
                        <p className="text-[#9c8b7a] text-xs">{addr.country}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="border-t border-[#e8e0d5] pt-4">
                <p className="text-[11px] uppercase tracking-wider text-[#9c8b7a] mb-3 flex items-center gap-1.5">
                  <ShoppingBag size={12} /> Orders ({detail.orders?.length ?? 0})
                </p>
                {!detail.orders?.length ? (
                  <p className="text-sm text-[#9c8b7a]">No orders yet</p>
                ) : (
                  <ul className="space-y-2">
                    {detail.orders.map((o) => (
                      <li key={o.id} className="border border-[#efe7dc] p-3 space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-mono text-xs">{o.order_number}</p>
                            <p className="text-[11px] text-[#9c8b7a] mt-0.5">{formatDate(o.created_at)}</p>
                          </div>
                          <p className="font-semibold text-sm shrink-0">{money(o.total, o.currency)}</p>
                        </div>
                        <div className="flex flex-wrap gap-1.5 text-[10px] uppercase tracking-wider">
                          <span className="px-2 py-0.5 bg-[#f5f0eb] capitalize">{o.status}</span>
                          <span className="px-2 py-0.5 bg-[#f5f0eb] capitalize">{o.payment_status}</span>
                          {o.item_count != null ? (
                            <span className="px-2 py-0.5 text-[#9c8b7a] normal-case tracking-normal">
                              {o.item_count} item{o.item_count === 1 ? '' : 's'}
                            </span>
                          ) : null}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
