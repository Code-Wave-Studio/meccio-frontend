import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Pencil, Plus, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { ADMIN_INPUT, AdminField } from '@/admin/components/AdminFormBits';
import { adminApi } from '@/lib/api';
import { formatInr } from '@/lib/currency';
import { formatDate } from '@/lib/utils';

type Coupon = {
  id: number;
  code: string;
  description?: string | null;
  type: 'percentage' | 'fixed' | 'free_shipping' | string;
  value: number;
  min_order_amount?: number | null;
  max_uses?: number | null;
  used_count?: number;
  starts_at?: string | null;
  expires_at?: string | null;
  is_active: number;
  created_at: string;
};

const emptyForm = {
  code: '',
  description: '',
  type: 'percentage',
  value: '',
  min_order_amount: '',
  max_uses: '',
  starts_at: '',
  expires_at: '',
  is_active: true,
};

function toDateInput(value?: string | null) {
  if (!value) return '';
  return String(value).slice(0, 10);
}

function formatValue(c: Coupon) {
  if (c.type === 'percentage') return `${Number(c.value)}%`;
  if (c.type === 'free_shipping') return 'Free shipping';
  return formatInr(c.value);
}

export default function AdminCouponsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);

  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ['admin', 'coupons'],
    queryFn: async () => {
      const res = await adminApi.coupons.list();
      return Array.isArray(res.data?.data) ? (res.data.data as Coupon[]) : [];
    },
  });

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (c: Coupon) => {
    setEditingId(c.id);
    setForm({
      code: c.code || '',
      description: c.description || '',
      type: c.type || 'percentage',
      value: String(c.value ?? ''),
      min_order_amount: c.min_order_amount != null ? String(c.min_order_amount) : '',
      max_uses: c.max_uses != null ? String(c.max_uses) : '',
      starts_at: toDateInput(c.starts_at),
      expires_at: toDateInput(c.expires_at),
      is_active: !!c.is_active,
    });
    setShowForm(true);
  };

  const payload = () => ({
    code: form.code.trim().toUpperCase(),
    description: form.description.trim(),
    type: form.type,
    value: form.type === 'free_shipping' ? 0 : Number(form.value) || 0,
    min_order_amount: form.min_order_amount === '' ? null : Number(form.min_order_amount),
    max_uses: form.max_uses === '' ? null : Number(form.max_uses),
    starts_at: form.starts_at || null,
    expires_at: form.expires_at || null,
    is_active: form.is_active ? 1 : 0,
  });

  const saveMutation = useMutation({
    mutationFn: () =>
      editingId
        ? adminApi.coupons.update(editingId, payload())
        : adminApi.coupons.create(payload()),
    onSuccess: () => {
      toast.success(editingId ? 'Coupon updated' : 'Coupon created');
      closeForm();
      queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] });
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err?.response?.data?.message || (editingId ? 'Could not update coupon' : 'Could not create coupon'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.coupons.delete(id),
    onSuccess: () => {
      toast.success('Coupon deleted');
      queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] });
    },
    onError: () => toast.error('Could not delete coupon'),
  });

  const toggleMutation = useMutation({
    mutationFn: (c: Coupon) =>
      adminApi.coupons.update(c.id, {
        code: c.code,
        description: c.description || '',
        type: c.type,
        value: c.value,
        min_order_amount: c.min_order_amount ?? null,
        max_uses: c.max_uses ?? null,
        starts_at: c.starts_at ? toDateInput(c.starts_at) : null,
        expires_at: c.expires_at ? toDateInput(c.expires_at) : null,
        is_active: c.is_active ? 0 : 1,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] }),
    onError: () => toast.error('Could not update status'),
  });

  const ActionButtons = ({ c }: { c: Coupon }) => (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => openEdit(c)}
        className="inline-flex items-center justify-center min-h-[40px] min-w-[40px] text-[#9c8b7a] hover:text-[#1a1714]"
        aria-label="Edit"
      >
        <Pencil size={16} />
      </button>
      <button
        type="button"
        onClick={() => {
          if (confirm(`Delete coupon ${c.code}?`)) deleteMutation.mutate(c.id);
        }}
        className="inline-flex items-center justify-center min-h-[40px] min-w-[40px] text-[#9c8b7a] hover:text-red-600"
        aria-label="Delete"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-medium">Coupons</h1>
          <p className="text-sm text-[#9c8b7a] mt-1">Discount codes for checkout</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] text-xs uppercase tracking-wider bg-[#1a1714] text-white"
        >
          <Plus size={14} /> Add Coupon
        </button>
      </div>

      <div className="bg-white border border-[#e8e0d5]">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-[#c4a962]" />
          </div>
        ) : coupons.length === 0 ? (
          <p className="text-center text-[#9c8b7a] py-16 text-sm">No coupons yet</p>
        ) : (
          <>
            <div className="md:hidden divide-y divide-[#efe7dc]">
              {coupons.map((c) => (
                <div key={c.id} className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono font-medium">{c.code}</p>
                      {c.description ? <p className="text-[11px] text-[#9c8b7a] mt-0.5">{c.description}</p> : null}
                    </div>
                    <ActionButtons c={c} />
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm">
                    <span className="capitalize">{c.type.replace('_', ' ')}</span>
                    <span className="font-medium">{formatValue(c)}</span>
                    <span className="text-[#9c8b7a]">
                      Used {c.used_count ?? 0}{c.max_uses != null ? ` / ${c.max_uses}` : ''}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleMutation.mutate(c)}
                    className={`text-[10px] uppercase tracking-wider px-2 py-1 ${
                      c.is_active ? 'bg-green-50 text-green-800' : 'bg-[#f5f0eb] text-[#9c8b7a]'
                    }`}
                  >
                    {c.is_active ? 'Active' : 'Off'}
                  </button>
                </div>
              ))}
            </div>

            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#faf8f5] text-[11px] uppercase tracking-wider text-[#9c8b7a]">
                    <th className="text-left px-4 py-3 font-medium">Code</th>
                    <th className="text-left px-4 py-3 font-medium">Type</th>
                    <th className="text-left px-4 py-3 font-medium">Value</th>
                    <th className="text-left px-4 py-3 font-medium">Min order</th>
                    <th className="text-left px-4 py-3 font-medium">Used</th>
                    <th className="text-left px-4 py-3 font-medium">Expires</th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                    <th className="text-right px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((c) => (
                    <tr key={c.id} className="border-t border-[#efe7dc]">
                      <td className="px-4 py-3">
                        <p className="font-mono font-medium">{c.code}</p>
                        {c.description ? <p className="text-[11px] text-[#9c8b7a] mt-0.5 line-clamp-1">{c.description}</p> : null}
                      </td>
                      <td className="px-4 py-3 capitalize">{c.type.replace('_', ' ')}</td>
                      <td className="px-4 py-3">{formatValue(c)}</td>
                      <td className="px-4 py-3">
                        {c.min_order_amount != null ? formatInr(c.min_order_amount) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        {c.used_count ?? 0}{c.max_uses != null ? ` / ${c.max_uses}` : ''}
                      </td>
                      <td className="px-4 py-3 text-xs text-[#9c8b7a]">
                        {c.expires_at ? formatDate(c.expires_at) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => toggleMutation.mutate(c)}
                          className={`text-[10px] uppercase tracking-wider px-2 py-1 ${
                            c.is_active ? 'bg-green-50 text-green-800' : 'bg-[#f5f0eb] text-[#9c8b7a]'
                          }`}
                        >
                          {c.is_active ? 'Active' : 'Off'}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end">
                          <ActionButtons c={c} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-lg max-h-[92dvh] overflow-y-auto border border-[#e8e0d5] rounded-t-lg sm:rounded-none">
            <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b border-[#e8e0d5] bg-white">
              <h2 className="font-medium text-lg">{editingId ? 'Edit Coupon' : 'Add Coupon'}</h2>
              <button type="button" onClick={closeForm} aria-label="Close" className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center">
                <X size={18} />
              </button>
            </div>
            <form
              className="p-5 space-y-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
              onSubmit={(e) => {
                e.preventDefault();
                if (!form.code.trim()) {
                  toast.error('Code required');
                  return;
                }
                if (form.type !== 'free_shipping' && !(Number(form.value) > 0)) {
                  toast.error('Value required');
                  return;
                }
                if (form.type === 'percentage' && Number(form.value) > 100) {
                  toast.error('Percentage cannot exceed 100');
                  return;
                }
                saveMutation.mutate();
              }}
            >
              <AdminField label="Code *">
                <input
                  className={`${ADMIN_INPUT} uppercase`}
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  required
                />
              </AdminField>
              <AdminField label="Description">
                <input
                  className={ADMIN_INPUT}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Optional note"
                />
              </AdminField>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <AdminField label="Type">
                  <select
                    className={ADMIN_INPUT}
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed (INR)</option>
                    <option value="free_shipping">Free shipping</option>
                  </select>
                </AdminField>
                <AdminField label={form.type === 'percentage' ? 'Value %' : 'Value (INR)'}>
                  <input
                    className={ADMIN_INPUT}
                    type="number"
                    min={0}
                    step="0.01"
                    disabled={form.type === 'free_shipping'}
                    value={form.type === 'free_shipping' ? '0' : form.value}
                    onChange={(e) => setForm({ ...form, value: e.target.value })}
                  />
                </AdminField>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <AdminField label="Min order (INR)">
                  <input
                    className={ADMIN_INPUT}
                    type="number"
                    min={0}
                    value={form.min_order_amount}
                    onChange={(e) => setForm({ ...form, min_order_amount: e.target.value })}
                    placeholder="Optional"
                  />
                </AdminField>
                <AdminField label="Max uses">
                  <input
                    className={ADMIN_INPUT}
                    type="number"
                    min={0}
                    value={form.max_uses}
                    onChange={(e) => setForm({ ...form, max_uses: e.target.value })}
                    placeholder="Unlimited"
                  />
                </AdminField>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <AdminField label="Starts at">
                  <input
                    className={ADMIN_INPUT}
                    type="date"
                    value={form.starts_at}
                    onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
                  />
                </AdminField>
                <AdminField label="Expires at">
                  <input
                    className={ADMIN_INPUT}
                    type="date"
                    value={form.expires_at}
                    onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                  />
                </AdminField>
              </div>
              <label className="flex items-center gap-2 text-sm min-h-[44px]">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                />
                Active
              </label>
              <button
                type="submit"
                disabled={saveMutation.isPending}
                className="w-full py-3.5 min-h-[48px] bg-[#1a1714] text-white text-sm uppercase tracking-wider disabled:opacity-60"
              >
                {saveMutation.isPending ? 'Saving…' : editingId ? 'Update Coupon' : 'Create Coupon'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
