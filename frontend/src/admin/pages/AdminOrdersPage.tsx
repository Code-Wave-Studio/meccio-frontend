import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi, resolveMediaUrl } from '@/lib/api';
import { formatUsd } from '@/lib/currency';
import { formatDate } from '@/lib/utils';

const STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

type OrderItem = {
  id: number;
  product_id?: number | null;
  product_name: string;
  product_sku?: string;
  variant_name?: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  product_image?: string | null;
  product_slug?: string | null;
};

type Address = {
  first_name?: string;
  last_name?: string;
  phone?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
};

function money(n: number, currency?: string) {
  if (currency === 'INR') return `₹${Number(n || 0).toLocaleString('en-IN')}`;
  return formatUsd(Number(n || 0));
}

function formatAddress(addr?: Address | null) {
  if (!addr || typeof addr !== 'object') return null;
  const name = [addr.first_name, addr.last_name].filter(Boolean).join(' ').trim();
  const lines = [
    name || null,
    addr.phone || null,
    addr.address_line1 || null,
    addr.address_line2 || null,
    [addr.city, addr.state, addr.postal_code].filter(Boolean).join(', ') || null,
    addr.country || null,
  ].filter(Boolean);
  return lines.length ? lines : null;
}

export default function AdminOrdersPage() {
  const queryClient = useQueryClient();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const params = useMemo(() => {
    const p: Record<string, string> = {};
    if (q.trim()) p.q = q.trim();
    if (status) p.status = status;
    return p;
  }, [q, status]);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['admin', 'orders', params],
    queryFn: async () => {
      const res = await adminApi.orders.list(params);
      return Array.isArray(res.data?.data) ? res.data.data : [];
    },
  });

  const { data: detail, isLoading: detailLoading } = useQuery({
    queryKey: ['admin', 'order', selectedId],
    queryFn: async () => {
      const res = await adminApi.orders.get(selectedId!);
      return res.data?.data;
    },
    enabled: !!selectedId,
  });

  const updateMutation = useMutation({
    mutationFn: (payload: { id: number; data: Record<string, unknown> }) =>
      adminApi.orders.updateStatus(payload.id, payload.data),
    onSuccess: () => {
      toast.success('Order updated');
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'order', selectedId] });
    },
    onError: () => toast.error('Could not update order'),
  });

  const shippingLines = formatAddress(detail?.shipping_address as Address | undefined);

  return (
    <div className="space-y-5 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-medium">Orders</h1>
        <p className="text-sm text-[#9c8b7a] mt-1">Manage order status, payments, and tracking</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 flex-1 bg-white border border-[#e8e0d5] px-3 py-2.5">
          <Search size={16} className="text-[#9c8b7a]" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search order #, email, name..."
            className="w-full outline-none text-sm bg-transparent"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setStatus('')}
            className={`shrink-0 px-3 py-2 text-[11px] uppercase tracking-wider border ${!status ? 'bg-[#1a1714] text-white border-[#1a1714]' : 'bg-white border-[#e8e0d5]'}`}
          >
            All
          </button>
          {STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={`shrink-0 px-3 py-2 text-[11px] uppercase tracking-wider border capitalize ${status === s ? 'bg-[#1a1714] text-white border-[#1a1714]' : 'bg-white border-[#e8e0d5]'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_minmax(320px,420px)] gap-4">
        <div className="bg-white border border-[#e8e0d5] overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center py-16"><Loader2 className="animate-spin text-[#c4a962]" /></div>
          ) : (
            <>
              <div className="md:hidden divide-y divide-[#efe7dc]">
                {orders.map((o: {
                  id: number;
                  order_number: string;
                  customer_name?: string;
                  customer_email?: string;
                  total: number;
                  currency?: string;
                  status: string;
                  payment_status: string;
                  created_at: string;
                }) => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => setSelectedId(o.id)}
                    className={`w-full text-left p-4 space-y-2 ${selectedId === o.id ? 'bg-[#faf8f5]' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-mono text-xs">{o.order_number}</p>
                        <p className="text-sm mt-1 truncate">{o.customer_name || '—'}</p>
                        <p className="text-[11px] text-[#9c8b7a] truncate">{o.customer_email}</p>
                      </div>
                      <p className="font-medium shrink-0">{money(o.total, o.currency)}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-wider">
                      <span className="px-2 py-1 bg-[#f5f0eb] capitalize">{o.status}</span>
                      <span className="px-2 py-1 bg-[#f5f0eb] capitalize">{o.payment_status}</span>
                      <span className="text-[#9c8b7a] normal-case tracking-normal self-center">{formatDate(o.created_at)}</span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#faf8f5] text-[11px] uppercase tracking-wider text-[#9c8b7a]">
                      <th className="text-left px-4 py-3 font-medium">Order</th>
                      <th className="text-left px-4 py-3 font-medium">Customer</th>
                      <th className="text-left px-4 py-3 font-medium">Total</th>
                      <th className="text-left px-4 py-3 font-medium">Payment</th>
                      <th className="text-left px-4 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o: {
                      id: number;
                      order_number: string;
                      customer_name?: string;
                      customer_email?: string;
                      total: number;
                      currency?: string;
                      status: string;
                      payment_status: string;
                      created_at: string;
                    }) => (
                      <tr
                        key={o.id}
                        onClick={() => setSelectedId(o.id)}
                        className={`border-t border-[#efe7dc] cursor-pointer hover:bg-[#fcfaf7] ${selectedId === o.id ? 'bg-[#faf8f5]' : ''}`}
                      >
                        <td className="px-4 py-3">
                          <p className="font-mono text-xs">{o.order_number}</p>
                          <p className="text-[11px] text-[#9c8b7a]">{formatDate(o.created_at)}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="truncate max-w-[160px]">{o.customer_name || '—'}</p>
                          <p className="text-[11px] text-[#9c8b7a] truncate max-w-[160px]">{o.customer_email}</p>
                        </td>
                        <td className="px-4 py-3 font-medium">{money(o.total, o.currency)}</td>
                        <td className="px-4 py-3 capitalize text-xs">{o.payment_status}</td>
                        <td className="px-4 py-3">
                          <span className="inline-block px-2 py-1 text-[10px] uppercase tracking-wider bg-[#f5f0eb] capitalize">
                            {o.status}
                          </span>
                        </td>
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
            <p className="text-sm text-[#9c8b7a] py-8 text-center">Select an order to manage</p>
          ) : detailLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#c4a962]" /></div>
          ) : detail ? (
            <div className="space-y-5">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-[#9c8b7a]">Order</p>
                <p className="font-mono text-sm mt-1">{detail.order_number}</p>
                <p className="text-lg font-semibold mt-2">{money(detail.total, detail.currency)}</p>
                <p className="text-[11px] text-[#9c8b7a] mt-1">{formatDate(detail.created_at)}</p>
              </div>

              <div className="text-sm space-y-1 border-t border-[#e8e0d5] pt-4">
                <p className="text-[11px] uppercase tracking-wider text-[#9c8b7a] mb-2">Customer</p>
                <p className="font-medium">{detail.customer_name || '—'}</p>
                <p className="text-[#6f655c] break-all">{detail.customer_email || '—'}</p>
                {detail.phone ? <p className="text-[#6f655c]">{detail.phone}</p> : null}
              </div>

              {Array.isArray(detail.items) && detail.items.length > 0 && (
                <div className="border-t border-[#e8e0d5] pt-4">
                  <p className="text-[11px] uppercase tracking-wider text-[#9c8b7a] mb-3">
                    Items ({detail.items.length})
                  </p>
                  <ul className="space-y-3">
                    {(detail.items as OrderItem[]).map((item) => (
                      <li key={item.id} className="flex gap-3 border border-[#efe7dc] bg-[#faf8f5] p-2.5">
                        <div className="shrink-0 h-16 w-16 border border-[#e8e0d5] bg-white overflow-hidden">
                          {item.product_image ? (
                            <img
                              src={resolveMediaUrl(item.product_image)}
                              alt={item.product_name}
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-[9px] uppercase tracking-wider text-[#9c8b7a]">
                              No img
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1 space-y-1">
                          <p className="text-sm font-medium leading-snug line-clamp-2">{item.product_name}</p>
                          <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-[#9c8b7a]">
                            {item.product_sku ? <span className="font-mono">SKU {item.product_sku}</span> : null}
                            {item.variant_name ? <span>Size: {item.variant_name}</span> : null}
                          </div>
                          <div className="flex flex-wrap items-end justify-between gap-2 pt-1 text-xs">
                            <span className="text-[#6f655c]">
                              {money(item.unit_price, detail.currency)} × {item.quantity}
                            </span>
                            <span className="font-semibold text-sm">{money(item.total_price, detail.currency)}</span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-3 space-y-1.5 text-xs border-t border-[#efe7dc] pt-3">
                    <div className="flex justify-between gap-3 text-[#6f655c]">
                      <span>Subtotal</span>
                      <span>{money(detail.subtotal, detail.currency)}</span>
                    </div>
                    {Number(detail.discount_amount) > 0 && (
                      <div className="flex justify-between gap-3 text-[#6f655c]">
                        <span>Discount{detail.coupon_code ? ` (${detail.coupon_code})` : ''}</span>
                        <span>-{money(detail.discount_amount, detail.currency)}</span>
                      </div>
                    )}
                    <div className="flex justify-between gap-3 text-[#6f655c]">
                      <span>Shipping</span>
                      <span>
                        {Number(detail.shipping_amount) === 0
                          ? 'Free'
                          : money(detail.shipping_amount, detail.currency)}
                      </span>
                    </div>
                    <div className="flex justify-between gap-3 text-[#6f655c]">
                      <span>Tax</span>
                      <span>{money(detail.tax_amount, detail.currency)}</span>
                    </div>
                    <div className="flex justify-between gap-3 font-semibold text-sm pt-1 text-[#1a1714]">
                      <span>Total</span>
                      <span>{money(detail.total, detail.currency)}</span>
                    </div>
                  </div>
                </div>
              )}

              {shippingLines && (
                <div className="border-t border-[#e8e0d5] pt-4">
                  <p className="text-[11px] uppercase tracking-wider text-[#9c8b7a] mb-2">Shipping address</p>
                  <div className="text-sm text-[#5c5248] space-y-0.5 leading-relaxed">
                    {shippingLines.map((line) => (
                      <p key={String(line)}>{line}</p>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#9c8b7a] mb-2">Status</label>
                <select
                  className="w-full border border-[#e8e0d5] px-3 py-2.5 text-sm bg-white"
                  value={detail.status}
                  onChange={(e) => updateMutation.mutate({ id: detail.id, data: { status: e.target.value } })}
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#9c8b7a] mb-2">Payment</label>
                <select
                  className="w-full border border-[#e8e0d5] px-3 py-2.5 text-sm bg-white"
                  value={detail.payment_status}
                  onChange={(e) => updateMutation.mutate({ id: detail.id, data: { status: detail.status, payment_status: e.target.value } })}
                >
                  {['pending', 'paid', 'failed', 'refunded'].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#9c8b7a] mb-2">Tracking #</label>
                <input
                  className="w-full border border-[#e8e0d5] px-3 py-2.5 text-sm"
                  defaultValue={detail.tracking_number || ''}
                  placeholder="Tracking number"
                  onBlur={(e) => {
                    const val = e.target.value.trim();
                    if (val && val !== (detail.tracking_number || '')) {
                      updateMutation.mutate({
                        id: detail.id,
                        data: { status: 'shipped', tracking_number: val, tracking_url: detail.tracking_url || '' },
                      });
                    }
                  }}
                />
              </div>

              {detail.notes ? (
                <div className="border-t border-[#e8e0d5] pt-4">
                  <p className="text-[11px] uppercase tracking-wider text-[#9c8b7a] mb-1">Notes</p>
                  <p className="text-sm text-[#5c5248] whitespace-pre-wrap">{detail.notes}</p>
                </div>
              ) : null}
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
