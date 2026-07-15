import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CreditCard, Loader2, Search } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { formatUsd } from '@/lib/currency';
import { formatDate } from '@/lib/utils';

function money(n: number, currency?: string) {
  if (currency === 'INR') return `₹${Number(n || 0).toLocaleString('en-IN')}`;
  return formatUsd(Number(n || 0));
}

const STATUS_FILTERS = ['', 'success', 'failed', 'pending', 'refunded'];

export default function AdminPaymentsPage() {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const params = useMemo(() => {
    const p: Record<string, string> = {};
    if (q.trim()) p.q = q.trim();
    if (status) p.status = status;
    return p;
  }, [q, status]);

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['admin', 'payments', params],
    queryFn: async () => {
      const res = await adminApi.payments.list(params);
      return Array.isArray(res.data?.data) ? res.data.data : [];
    },
  });

  const { data: detail, isLoading: detailLoading } = useQuery({
    queryKey: ['admin', 'payment', selectedId],
    queryFn: async () => {
      const res = await adminApi.payments.get(selectedId!);
      return res.data?.data;
    },
    enabled: !!selectedId,
  });

  return (
    <div className="space-y-5 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-medium">Payment History</h1>
        <p className="text-sm text-[#9c8b7a] mt-1">
          All Razorpay transactions with order &amp; invoice references
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 flex-1 bg-white border border-[#e8e0d5] px-3 py-2.5">
          <Search size={16} className="text-[#9c8b7a]" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search txn ID, order #, invoice, email..."
            className="w-full outline-none text-sm bg-transparent"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s || 'all'}
              type="button"
              onClick={() => setStatus(s)}
              className={`shrink-0 px-3 py-2 text-[11px] uppercase tracking-wider border ${
                status === s
                  ? 'bg-[#1a1714] text-white border-[#1a1714]'
                  : 'bg-white border-[#e8e0d5]'
              }`}
            >
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3 space-y-3">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="animate-spin text-[#c4a962]" />
            </div>
          ) : !payments.length ? (
            <div className="bg-white border border-[#e8e0d5] p-10 text-center text-sm text-[#9c8b7a]">
              <CreditCard className="mx-auto mb-3 text-[#d4c4b0]" size={32} />
              No payments found
            </div>
          ) : (
            <>
              {/* Mobile cards */}
              <div className="space-y-3 lg:hidden">
                {payments.map((p: Record<string, unknown>) => (
                  <button
                    key={p.id as number}
                    type="button"
                    onClick={() => setSelectedId(p.id as number)}
                    className={`w-full text-left bg-white border p-4 space-y-2 ${
                      selectedId === p.id ? 'border-[#c4a962]' : 'border-[#e8e0d5]'
                    }`}
                  >
                    <div className="flex justify-between gap-2">
                      <span className="font-mono text-xs text-[#a68b4b] break-all">
                        {(p.transaction_id as string) || '—'}
                      </span>
                      <span
                        className={`text-[10px] uppercase tracking-wider px-2 py-0.5 border shrink-0 ${
                          p.status === 'success'
                            ? 'border-green-200 bg-green-50 text-green-800'
                            : p.status === 'failed'
                              ? 'border-red-200 bg-red-50 text-red-800'
                              : 'border-[#e8e0d5] text-[#9c8b7a]'
                        }`}
                      >
                        {String(p.status)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>{(p.order_number as string) || 'No order'}</span>
                      <span className="font-medium">
                        {money(Number(p.amount), p.currency as string)}
                      </span>
                    </div>
                    <p className="text-xs text-[#9c8b7a]">{formatDate(String(p.created_at))}</p>
                  </button>
                ))}
              </div>

              {/* Desktop table */}
              <div className="hidden lg:block bg-white border border-[#e8e0d5] overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#e8e0d5] text-left text-[11px] uppercase tracking-wider text-[#9c8b7a]">
                      <th className="px-4 py-3 font-medium">Transaction</th>
                      <th className="px-4 py-3 font-medium">Order / Invoice</th>
                      <th className="px-4 py-3 font-medium">Customer</th>
                      <th className="px-4 py-3 font-medium">Amount</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p: Record<string, unknown>) => (
                      <tr
                        key={p.id as number}
                        onClick={() => setSelectedId(p.id as number)}
                        className={`border-b border-[#f0ebe4] cursor-pointer hover:bg-[#faf8f5] ${
                          selectedId === p.id ? 'bg-[#faf8f5]' : ''
                        }`}
                      >
                        <td className="px-4 py-3 font-mono text-xs text-[#a68b4b] max-w-[160px] truncate">
                          {String(p.transaction_id || '—')}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium">{(p.order_number as string) || '—'}</div>
                          {(p.invoice_number as string) && (
                            <div className="text-xs text-[#9c8b7a]">{String(p.invoice_number)}</div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div>{(p.customer_name as string) || '—'}</div>
                          <div className="text-xs text-[#9c8b7a]">{String(p.customer_email || '')}</div>
                        </td>
                        <td className="px-4 py-3 font-medium whitespace-nowrap">
                          {money(Number(p.amount), p.currency as string)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`text-[10px] uppercase tracking-wider px-2 py-0.5 border ${
                              p.status === 'success'
                                ? 'border-green-200 bg-green-50 text-green-800'
                                : p.status === 'failed'
                                  ? 'border-red-200 bg-red-50 text-red-800'
                                  : 'border-[#e8e0d5] text-[#9c8b7a]'
                            }`}
                          >
                            {String(p.status)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[#9c8b7a] whitespace-nowrap">
                          {formatDate(String(p.created_at))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white border border-[#e8e0d5] p-5 sm:p-6 sticky top-4">
            {!selectedId ? (
              <p className="text-sm text-[#9c8b7a] text-center py-10">Select a payment to view details</p>
            ) : detailLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="animate-spin text-[#c4a962]" />
              </div>
            ) : detail ? (
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-[#9c8b7a]">Transaction ID</p>
                  <p className="font-mono text-xs sm:text-sm break-all mt-1 text-[#a68b4b]">
                    {detail.transaction_id}
                  </p>
                </div>
                {detail.razorpay_order_id && (
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-[#9c8b7a]">Razorpay Order</p>
                    <p className="font-mono text-xs break-all mt-1">{detail.razorpay_order_id}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-[#9c8b7a]">Amount</p>
                    <p className="font-medium mt-1">{money(Number(detail.amount), detail.currency)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-[#9c8b7a]">Status</p>
                    <p className="font-medium mt-1 capitalize">{detail.status}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-[#9c8b7a]">Method</p>
                    <p className="mt-1 capitalize">{detail.method || 'razorpay'}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-[#9c8b7a]">Date</p>
                    <p className="mt-1">{formatDate(detail.created_at)}</p>
                  </div>
                </div>
                <div className="border-t border-[#f0ebe4] pt-4 space-y-2">
                  <p className="text-[11px] uppercase tracking-wider text-[#9c8b7a]">Order</p>
                  <p className="font-medium">{detail.order_number || '—'}</p>
                  {detail.invoice_number && (
                    <p className="text-xs text-[#9c8b7a]">Invoice: {detail.invoice_number}</p>
                  )}
                </div>
                <div className="border-t border-[#f0ebe4] pt-4 space-y-1">
                  <p className="text-[11px] uppercase tracking-wider text-[#9c8b7a]">Customer</p>
                  <p>{detail.customer_name || '—'}</p>
                  <p className="text-[#9c8b7a]">{detail.customer_email || ''}</p>
                </div>
                {Array.isArray(detail.items) && detail.items.length > 0 && (
                  <div className="border-t border-[#f0ebe4] pt-4 space-y-2">
                    <p className="text-[11px] uppercase tracking-wider text-[#9c8b7a]">Items</p>
                    {detail.items.map((item: Record<string, unknown>) => (
                      <div key={item.id as number} className="flex justify-between gap-2 text-xs">
                        <span className="min-w-0 truncate">
                          {String(item.product_name)} × {String(item.quantity)}
                        </span>
                        <span className="shrink-0">
                          {money(Number(item.total_price), detail.currency)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-[#9c8b7a]">Payment not found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
