import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ExternalLink, Loader2, Pencil, Plus, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { ADMIN_INPUT, AdminField } from '@/admin/components/AdminFormBits';
import AdminProductImagesField, {
  PRODUCT_IMAGES_MAX,
  PRODUCT_IMAGES_MIN,
  type ProductImageItem,
} from '@/admin/components/AdminProductImagesField';
import { adminApi, resolveMediaUrl } from '@/lib/api';
import { formatInr, formatUsd } from '@/lib/currency';
import { formatDate } from '@/lib/utils';

type ProductRow = {
  id: number;
  name: string;
  sku: string;
  price: number;
  price_inr?: number | null;
  compare_price?: number | null;
  compare_price_inr?: number | null;
  stock_quantity: number;
  is_active: number;
  is_featured: number;
  etsy_enabled?: number;
  etsy_url?: string | null;
  short_description?: string;
  meta_title?: string | null;
  meta_description?: string | null;
  created_at: string;
  primary_image?: string | null;
  images?: Array<{ url: string; alt_text?: string; is_primary?: number | boolean }>;
};

const emptyForm = {
  name: '',
  sku: '',
  compare_price: '',
  price: '',
  compare_price_inr: '',
  price_inr: '',
  stock_quantity: '10',
  short_description: '',
  meta_title: '',
  meta_description: '',
  is_active: true,
  is_featured: false,
  etsy_enabled: false,
  etsy_url: '',
  images: [] as ProductImageItem[],
};

function calcDiscount(mrp: string, selling: string) {
  const compare = Number(mrp);
  const price = Number(selling);
  if (!compare || !price || compare <= price) return 0;
  return Math.round(((compare - price) / compare) * 100);
}

function mapImages(raw?: ProductRow['images']): ProductImageItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((img) => img?.url)
    .slice(0, PRODUCT_IMAGES_MAX)
    .map((img) => ({
      url: img.url,
      alt_text: img.alt_text || '',
      is_primary: !!img.is_primary,
    }));
}

export default function AdminProductsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'products', page],
    queryFn: async () => {
      const res = await adminApi.products.list({ page });
      return res.data?.data ?? {};
    },
  });

  const products: ProductRow[] = Array.isArray(data)
    ? data
    : Array.isArray(data?.items)
      ? data.items
      : [];
  const meta =
    (data && !Array.isArray(data) ? data.pagination : null) ??
    ({} as { total_pages?: number; last_page?: number });

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

  const openEdit = async (p: ProductRow) => {
    setEditingId(p.id);
    setForm({
      name: p.name || '',
      sku: p.sku || '',
      compare_price: p.compare_price != null ? String(p.compare_price) : '',
      price: String(p.price ?? ''),
      compare_price_inr: p.compare_price_inr != null ? String(p.compare_price_inr) : '',
      price_inr: p.price_inr != null ? String(p.price_inr) : '',
      stock_quantity: String(p.stock_quantity ?? 0),
      short_description: p.short_description || '',
      meta_title: p.meta_title || '',
      meta_description: p.meta_description || '',
      is_active: !!p.is_active,
      is_featured: !!p.is_featured,
      etsy_enabled: !!p.etsy_enabled,
      etsy_url: p.etsy_url || '',
      images: [],
    });
    setShowForm(true);

    try {
      const res = await adminApi.products.get(p.id);
      const full = res.data?.data as ProductRow | undefined;
      if (!full) return;
      setForm({
        name: full.name || '',
        sku: full.sku || '',
        compare_price: full.compare_price != null ? String(full.compare_price) : '',
        price: String(full.price ?? ''),
        compare_price_inr: full.compare_price_inr != null ? String(full.compare_price_inr) : '',
        price_inr: full.price_inr != null ? String(full.price_inr) : '',
        stock_quantity: String(full.stock_quantity ?? 0),
        short_description: full.short_description || '',
        meta_title: full.meta_title || '',
        meta_description: full.meta_description || '',
        is_active: !!full.is_active,
        is_featured: !!full.is_featured,
        etsy_enabled: !!full.etsy_enabled,
        etsy_url: full.etsy_url || '',
        images: mapImages(full.images),
      });
    } catch {
      /* list row data is enough to start */
    }
  };

  const payload = () => ({
    name: form.name.trim(),
    sku: form.sku.trim(),
    compare_price: form.compare_price === '' ? null : Number(form.compare_price) || 0,
    price: Number(form.price) || 0,
    compare_price_inr: form.compare_price_inr === '' ? null : Number(form.compare_price_inr) || 0,
    price_inr: form.price_inr === '' ? null : Number(form.price_inr) || 0,
    stock_quantity: Number(form.stock_quantity) || 0,
    short_description: form.short_description,
    meta_title: form.meta_title.trim() || null,
    meta_description: form.meta_description.trim() || null,
    is_active: form.is_active ? 1 : 0,
    is_featured: form.is_featured ? 1 : 0,
    etsy_enabled: form.etsy_enabled ? 1 : 0,
    etsy_url: form.etsy_enabled ? form.etsy_url.trim() : '',
    images: form.images.map((img) => ({
      url: img.url,
      alt_text: img.alt_text || '',
      is_primary: img.is_primary ? 1 : 0,
    })),
  });

  const usdDiscount = calcDiscount(form.compare_price, form.price);
  const inrDiscount = calcDiscount(form.compare_price_inr, form.price_inr);

  const saveMutation = useMutation({
    mutationFn: () =>
      editingId
        ? adminApi.products.update(editingId, payload())
        : adminApi.products.create(payload()),
    onSuccess: () => {
      toast.success(editingId ? 'Product updated' : 'Product created');
      closeForm();
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
    },
    onError: () => toast.error(editingId ? 'Could not update product' : 'Could not create product'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.products.delete(id),
    onSuccess: () => {
      toast.success('Product deleted');
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
    },
    onError: () => toast.error('Could not delete product'),
  });

  const toggleMutation = useMutation({
    mutationFn: (p: ProductRow) =>
      adminApi.products.update(p.id, {
        name: p.name,
        sku: p.sku,
        price: p.price,
        price_inr: p.price_inr ?? null,
        stock_quantity: p.stock_quantity,
        short_description: p.short_description || '',
        is_active: p.is_active ? 0 : 1,
        is_featured: p.is_featured,
        etsy_enabled: p.etsy_enabled ? 1 : 0,
        etsy_url: p.etsy_url || '',
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'products'] }),
  });

  const displayPrice = (p: ProductRow) => {
    if (p.price_inr != null && Number(p.price_inr) > 0) return formatInr(p.price_inr);
    return formatUsd(p.price);
  };

  const ProductThumb = ({ src, alt }: { src?: string | null; alt: string }) => (
    <div className="shrink-0 h-14 w-14 sm:h-16 sm:w-16 border border-[#e8e0d5] bg-[#faf8f5] overflow-hidden">
      {src ? (
        <img src={resolveMediaUrl(src)} alt={alt} className="h-full w-full object-cover" loading="lazy" />
      ) : (
        <div className="h-full w-full flex items-center justify-center text-[9px] uppercase tracking-wider text-[#9c8b7a]">
          No img
        </div>
      )}
    </div>
  );

  const ActionButtons = ({ p }: { p: ProductRow }) => (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => openEdit(p)}
        className="inline-flex items-center justify-center min-h-[40px] min-w-[40px] text-[#9c8b7a] hover:text-[#1a1714]"
        aria-label="Edit"
        title="Edit"
      >
        <Pencil size={16} />
      </button>
      {p.etsy_enabled && p.etsy_url ? (
        <a
          href={p.etsy_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center min-h-[40px] min-w-[40px] text-[#9c8b7a] hover:text-[#c4a962]"
          aria-label="Etsy link"
          title="Open Etsy"
        >
          <ExternalLink size={16} />
        </a>
      ) : null}
      <button
        type="button"
        onClick={() => {
          if (confirm('Delete this product?')) deleteMutation.mutate(p.id);
        }}
        className="inline-flex items-center justify-center min-h-[40px] min-w-[40px] text-[#9c8b7a] hover:text-red-600"
        aria-label="Delete"
        title="Delete"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-medium">Products</h1>
          <p className="text-sm text-[#9c8b7a] mt-1">Catalog inventory and visibility</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] text-xs uppercase tracking-wider bg-[#1a1714] text-white"
        >
          <Plus size={14} /> Add Product
        </button>
      </div>

      <div className="bg-white border border-[#e8e0d5]">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-[#c4a962]" />
          </div>
        ) : products.length === 0 ? (
          <p className="text-center text-sm text-[#9c8b7a] py-16">No products yet</p>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-[#efe7dc]">
              {products.map((p) => (
                <div key={p.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <ProductThumb src={p.primary_image} alt={p.name} />
                      <div className="min-w-0">
                        <p className="font-medium line-clamp-2">{p.name}</p>
                        <p className="text-[11px] font-mono text-[#9c8b7a] mt-0.5">{p.sku}</p>
                      </div>
                    </div>
                    <ActionButtons p={p} />
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                    <span className="font-medium">{displayPrice(p)}</span>
                    <span className="text-[#9c8b7a]">Stock {p.stock_quantity}</span>
                    {p.etsy_enabled ? (
                      <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-[#f5f0eb] text-[#6f655c]">
                        Etsy
                      </span>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => toggleMutation.mutate(p)}
                      className={`text-[10px] uppercase tracking-wider px-2 py-1 ${
                        p.is_active ? 'bg-green-50 text-green-800' : 'bg-[#f5f0eb] text-[#9c8b7a]'
                      }`}
                    >
                      {p.is_active ? 'Active' : 'Hidden'}
                    </button>
                  </div>
                  <p className="text-[11px] text-[#9c8b7a]">{formatDate(p.created_at)}</p>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#faf8f5] text-[11px] uppercase tracking-wider text-[#9c8b7a]">
                    <th className="text-left px-4 py-3 font-medium">Product</th>
                    <th className="text-left px-4 py-3 font-medium">SKU</th>
                    <th className="text-left px-4 py-3 font-medium">Price</th>
                    <th className="text-left px-4 py-3 font-medium">Stock</th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                    <th className="text-right px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} className="border-t border-[#efe7dc]">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <ProductThumb src={p.primary_image} alt={p.name} />
                          <div className="min-w-0">
                            <p className="font-medium line-clamp-1">{p.name}</p>
                            <p className="text-[11px] text-[#9c8b7a]">
                              {formatDate(p.created_at)}
                              {p.etsy_enabled ? ' · Etsy' : ''}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">{p.sku}</td>
                      <td className="px-4 py-3">{displayPrice(p)}</td>
                      <td className="px-4 py-3">{p.stock_quantity}</td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => toggleMutation.mutate(p)}
                          className={`text-[10px] uppercase tracking-wider px-2 py-1 ${
                            p.is_active ? 'bg-green-50 text-green-800' : 'bg-[#f5f0eb] text-[#9c8b7a]'
                          }`}
                        >
                          {p.is_active ? 'Active' : 'Hidden'}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end">
                          <ActionButtons p={p} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {(meta.total_pages > 1 || meta.last_page > 1) && (
          <div className="flex justify-center gap-2 p-4 border-t border-[#e8e0d5]">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-2 min-h-[40px] text-xs border border-[#e8e0d5] disabled:opacity-40"
            >
              Prev
            </button>
            <span className="text-xs text-[#9c8b7a] self-center">Page {page}</span>
            <button
              type="button"
              disabled={page >= (meta.total_pages || meta.last_page || page)}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-2 min-h-[40px] text-xs border border-[#e8e0d5] disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-2xl max-h-[92dvh] overflow-y-auto border border-[#e8e0d5] rounded-t-lg sm:rounded-none">
            <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b border-[#e8e0d5] bg-white">
              <h2 className="font-medium text-lg">{editingId ? 'Edit Product' : 'Add Product'}</h2>
              <button
                type="button"
                onClick={closeForm}
                aria-label="Close"
                className="inline-flex items-center justify-center min-h-[44px] min-w-[44px]"
              >
                <X size={18} />
              </button>
            </div>
            <form
              className="p-5 space-y-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
              onSubmit={(e) => {
                e.preventDefault();
                if (!form.name.trim()) {
                  toast.error('Name required');
                  return;
                }
                if (form.images.length < PRODUCT_IMAGES_MIN) {
                  toast.error(`Add at least ${PRODUCT_IMAGES_MIN} product image`);
                  return;
                }
                if (form.images.length > PRODUCT_IMAGES_MAX) {
                  toast.error(`Maximum ${PRODUCT_IMAGES_MAX} images allowed`);
                  return;
                }
                if (form.etsy_enabled && !form.etsy_url.trim()) {
                  toast.error('Etsy link required when Buy with Etsy is enabled');
                  return;
                }
                if (form.etsy_enabled && form.etsy_url.trim() && !/^https?:\/\//i.test(form.etsy_url.trim())) {
                  toast.error('Etsy link must start with http:// or https://');
                  return;
                }
                saveMutation.mutate();
              }}
            >
              <AdminProductImagesField
                value={form.images}
                onChange={(images) => setForm({ ...form, images })}
              />

              <AdminField label="Product name *">
                <input
                  className={ADMIN_INPUT}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </AdminField>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <AdminField label="SKU">
                  <input
                    className={ADMIN_INPUT}
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  />
                </AdminField>
                <AdminField label="Stock">
                  <input
                    className={ADMIN_INPUT}
                    type="number"
                    min={0}
                    value={form.stock_quantity}
                    onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })}
                  />
                </AdminField>
              </div>

              <div className="space-y-3 border border-[#e8e0d5] bg-[#faf8f5] p-4">
                <p className="text-[11px] uppercase tracking-wider text-[#9c8b7a] font-medium">USD Pricing</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <AdminField label="MRP (USD)">
                    <input
                      className={ADMIN_INPUT}
                      type="number"
                      step="0.01"
                      min={0}
                      value={form.compare_price}
                      onChange={(e) => setForm({ ...form, compare_price: e.target.value })}
                      placeholder="Original / MRP"
                    />
                  </AdminField>
                  <AdminField label="Selling Price (USD)">
                    <input
                      className={ADMIN_INPUT}
                      type="number"
                      step="0.01"
                      min={0}
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      placeholder="Customer pays"
                    />
                  </AdminField>
                </div>
                {usdDiscount > 0 && (
                  <p className="text-sm text-[#8a6a2f]">Discount: <strong>{usdDiscount}% off</strong></p>
                )}
              </div>

              <div className="space-y-3 border border-[#e8e0d5] bg-[#faf8f5] p-4">
                <p className="text-[11px] uppercase tracking-wider text-[#9c8b7a] font-medium">INR Pricing</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <AdminField label="MRP (INR)">
                    <input
                      className={ADMIN_INPUT}
                      type="number"
                      step="0.01"
                      min={0}
                      value={form.compare_price_inr}
                      onChange={(e) => setForm({ ...form, compare_price_inr: e.target.value })}
                      placeholder="Original / MRP"
                    />
                  </AdminField>
                  <AdminField label="Selling Price (INR)">
                    <input
                      className={ADMIN_INPUT}
                      type="number"
                      step="0.01"
                      min={0}
                      value={form.price_inr}
                      onChange={(e) => setForm({ ...form, price_inr: e.target.value })}
                      placeholder="Customer pays"
                    />
                  </AdminField>
                </div>
                {inrDiscount > 0 && (
                  <p className="text-sm text-[#8a6a2f]">Discount: <strong>{inrDiscount}% off</strong></p>
                )}
              </div>

              <AdminField label="Short description">
                <textarea
                  className={`${ADMIN_INPUT} resize-none`}
                  rows={3}
                  value={form.short_description}
                  onChange={(e) => setForm({ ...form, short_description: e.target.value })}
                />
              </AdminField>

              <div className="space-y-3 border border-[#e8e0d5] bg-[#faf8f5] p-4">
                <p className="text-[11px] uppercase tracking-wider text-[#9c8b7a] font-medium">SEO</p>
                <AdminField label="Meta title (optional)">
                  <input
                    className={ADMIN_INPUT}
                    value={form.meta_title}
                    onChange={(e) => setForm({ ...form, meta_title: e.target.value })}
                    placeholder="Custom Google title"
                    maxLength={70}
                  />
                </AdminField>
                <AdminField label="Meta description (optional)">
                  <textarea
                    className={`${ADMIN_INPUT} resize-none`}
                    rows={2}
                    value={form.meta_description}
                    onChange={(e) => setForm({ ...form, meta_description: e.target.value })}
                    placeholder="Custom Google description"
                    maxLength={160}
                  />
                </AdminField>
              </div>

              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-sm min-h-[44px]">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  />
                  Active
                </label>
                <label className="flex items-center gap-2 text-sm min-h-[44px]">
                  <input
                    type="checkbox"
                    checked={form.is_featured}
                    onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                  />
                  Featured
                </label>
              </div>

              <div className="border border-[#e8e0d5] bg-[#faf8f5] p-4 space-y-3">
                <label className="flex items-center gap-2 text-sm font-medium min-h-[44px]">
                  <input
                    type="checkbox"
                    checked={form.etsy_enabled}
                    onChange={(e) => setForm({ ...form, etsy_enabled: e.target.checked })}
                  />
                  Show “Buy with Etsy” button
                </label>
                {form.etsy_enabled && (
                  <AdminField label="Etsy product link *">
                    <input
                      className={ADMIN_INPUT}
                      type="url"
                      placeholder="https://www.etsy.com/listing/..."
                      value={form.etsy_url}
                      onChange={(e) => setForm({ ...form, etsy_url: e.target.value })}
                    />
                  </AdminField>
                )}
                <p className="text-[11px] text-[#9c8b7a] leading-relaxed">
                  When enabled, the product page shows a Buy with Etsy button that opens this link.
                </p>
              </div>

              <button
                type="submit"
                disabled={saveMutation.isPending}
                className="w-full py-3.5 min-h-[48px] bg-[#1a1714] text-white text-sm uppercase tracking-wider disabled:opacity-60"
              >
                {saveMutation.isPending ? 'Saving…' : editingId ? 'Update Product' : 'Create Product'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
