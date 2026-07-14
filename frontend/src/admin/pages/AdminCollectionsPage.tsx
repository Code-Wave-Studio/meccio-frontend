import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Pencil, Plus, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminMediaPicker from '@/admin/components/AdminMediaPicker';
import { adminApi } from '@/lib/api';

type Collection = {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  sort_order?: number;
  is_featured?: number;
  is_active?: number;
};

const emptyForm = {
  name: '',
  slug: '',
  description: '',
  image: '',
  sort_order: '0',
  is_featured: false,
  is_active: true,
};

export default function AdminCollectionsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Collection | null>(null);
  const [form, setForm] = useState(emptyForm);

  const { data: collections = [], isLoading } = useQuery({
    queryKey: ['admin', 'collections'],
    queryFn: async () => {
      const res = await adminApi.collections.list();
      return Array.isArray(res.data?.data) ? res.data.data as Collection[] : [];
    },
  });

  const payload = () => ({
    name: form.name.trim(),
    slug: form.slug.trim() || undefined,
    description: form.description,
    image: form.image,
    sort_order: Number(form.sort_order) || 0,
    is_featured: form.is_featured ? 1 : 0,
    is_active: form.is_active ? 1 : 0,
  });

  const saveMutation = useMutation({
    mutationFn: () =>
      editing
        ? adminApi.collections.update(editing.id, payload())
        : adminApi.collections.create(payload()),
    onSuccess: () => {
      toast.success(editing ? 'Collection updated' : 'Collection created');
      closeForm();
      queryClient.invalidateQueries({ queryKey: ['admin', 'collections'] });
    },
    onError: () => toast.error('Could not save collection'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.collections.delete(id),
    onSuccess: () => {
      toast.success('Collection deleted');
      queryClient.invalidateQueries({ queryKey: ['admin', 'collections'] });
    },
    onError: () => toast.error('Could not delete collection'),
  });

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (c: Collection) => {
    setEditing(c);
    setForm({
      name: c.name || '',
      slug: c.slug || '',
      description: c.description || '',
      image: c.image || '',
      sort_order: String(c.sort_order ?? 0),
      is_featured: !!c.is_featured,
      is_active: !!c.is_active,
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm(emptyForm);
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-medium">Collections</h1>
          <p className="text-sm text-[#9c8b7a] mt-1">Manage storefront collections</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs uppercase tracking-wider bg-[#1a1714] text-white"
        >
          <Plus size={14} /> Add Collection
        </button>
      </div>

      <div className="bg-white border border-[#e8e0d5]">
        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="animate-spin text-[#c4a962]" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="bg-[#faf8f5] text-[11px] uppercase tracking-wider text-[#9c8b7a]">
                  <th className="text-left px-4 py-3 font-medium">Collection</th>
                  <th className="text-left px-4 py-3 font-medium">Slug</th>
                  <th className="text-left px-4 py-3 font-medium">Order</th>
                  <th className="text-left px-4 py-3 font-medium">Flags</th>
                  <th className="text-right px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {collections.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-10 text-center text-[#9c8b7a]">No collections yet</td></tr>
                ) : (
                  collections.map((c) => (
                    <tr key={c.id} className="border-t border-[#efe7dc]">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {c.image ? (
                            <img src={c.image} alt="" className="h-10 w-10 object-cover border border-[#e8e0d5]" />
                          ) : (
                            <div className="h-10 w-10 bg-[#f5f0eb] border border-[#e8e0d5]" />
                          )}
                          <span className="font-medium">{c.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-[#9c8b7a]">{c.slug}</td>
                      <td className="px-4 py-3">{c.sort_order ?? 0}</td>
                      <td className="px-4 py-3 space-x-1">
                        <span className={`text-[10px] uppercase tracking-wider px-2 py-1 ${c.is_active ? 'bg-green-50 text-green-800' : 'bg-[#f5f0eb] text-[#9c8b7a]'}`}>
                          {c.is_active ? 'Active' : 'Hidden'}
                        </span>
                        {!!c.is_featured && (
                          <span className="text-[10px] uppercase tracking-wider px-2 py-1 bg-[#faf8f5] text-[#c4a962]">Featured</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button type="button" onClick={() => openEdit(c)} className="p-2 text-[#9c8b7a] hover:text-[#c4a962]" aria-label="Edit">
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => { if (confirm('Delete this collection?')) deleteMutation.mutate(c.id); }}
                          className="p-2 text-[#9c8b7a] hover:text-red-600"
                          aria-label="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-lg max-h-[92vh] overflow-y-auto border border-[#e8e0d5]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#e8e0d5]">
              <h2 className="font-medium text-lg">{editing ? 'Edit Collection' : 'Add Collection'}</h2>
              <button type="button" onClick={closeForm} aria-label="Close"><X size={18} /></button>
            </div>
            <form
              className="p-5 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (!form.name.trim()) {
                  toast.error('Name required');
                  return;
                }
                saveMutation.mutate();
              }}
            >
              <input
                className="w-full border border-[#e8e0d5] px-3 py-2.5 text-sm"
                placeholder="Name *"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <input
                className="w-full border border-[#e8e0d5] px-3 py-2.5 text-sm"
                placeholder="Slug (optional)"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
              />
              <input
                className="w-full border border-[#e8e0d5] px-3 py-2.5 text-sm"
                placeholder="Sort order"
                type="number"
                value={form.sort_order}
                onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
              />
              <AdminMediaPicker label="Image" value={form.image} onChange={(image) => setForm({ ...form, image })} />
              <textarea
                className="w-full border border-[#e8e0d5] px-3 py-2.5 text-sm resize-none"
                rows={3}
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
                Active
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} />
                Featured
              </label>
              <button
                type="submit"
                disabled={saveMutation.isPending}
                className="w-full py-3 bg-[#1a1714] text-white text-sm uppercase tracking-wider disabled:opacity-60"
              >
                {saveMutation.isPending ? 'Saving…' : editing ? 'Update Collection' : 'Create Collection'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
