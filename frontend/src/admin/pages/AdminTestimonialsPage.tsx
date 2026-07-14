import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Pencil, Plus, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminMediaPicker from '@/admin/components/AdminMediaPicker';
import { adminApi } from '@/lib/api';

type Testimonial = {
  id: number;
  author_name: string;
  author_title?: string;
  author_location?: string;
  author_image?: string;
  content?: string;
  rating?: number;
  sort_order?: number;
  is_featured?: number;
  is_active?: number;
};

const emptyForm = {
  author_name: '',
  author_title: '',
  author_location: '',
  author_image: '',
  content: '',
  rating: '5',
  sort_order: '0',
  is_featured: false,
  is_active: true,
};

export default function AdminTestimonialsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [form, setForm] = useState(emptyForm);

  const { data: testimonials = [], isLoading } = useQuery({
    queryKey: ['admin', 'testimonials'],
    queryFn: async () => {
      const res = await adminApi.testimonials.list();
      return Array.isArray(res.data?.data) ? res.data.data as Testimonial[] : [];
    },
  });

  const payload = () => ({
    author_name: form.author_name.trim(),
    author_title: form.author_title,
    author_location: form.author_location,
    author_image: form.author_image,
    content: form.content,
    rating: Number(form.rating) || 5,
    sort_order: Number(form.sort_order) || 0,
    is_featured: form.is_featured ? 1 : 0,
    is_active: form.is_active ? 1 : 0,
  });

  const saveMutation = useMutation({
    mutationFn: () =>
      editing
        ? adminApi.testimonials.update(editing.id, payload())
        : adminApi.testimonials.create(payload()),
    onSuccess: () => {
      toast.success(editing ? 'Testimonial updated' : 'Testimonial created');
      closeForm();
      queryClient.invalidateQueries({ queryKey: ['admin', 'testimonials'] });
    },
    onError: () => toast.error('Could not save testimonial'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.testimonials.delete(id),
    onSuccess: () => {
      toast.success('Testimonial deleted');
      queryClient.invalidateQueries({ queryKey: ['admin', 'testimonials'] });
    },
    onError: () => toast.error('Could not delete testimonial'),
  });

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (t: Testimonial) => {
    setEditing(t);
    setForm({
      author_name: t.author_name || '',
      author_title: t.author_title || '',
      author_location: t.author_location || '',
      author_image: t.author_image || '',
      content: t.content || '',
      rating: String(t.rating ?? 5),
      sort_order: String(t.sort_order ?? 0),
      is_featured: !!t.is_featured,
      is_active: !!t.is_active,
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
          <h1 className="text-2xl sm:text-3xl font-medium">Testimonials</h1>
          <p className="text-sm text-[#9c8b7a] mt-1">Manage customer stories</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs uppercase tracking-wider bg-[#1a1714] text-white"
        >
          <Plus size={14} /> Add Testimonial
        </button>
      </div>

      <div className="bg-white border border-[#e8e0d5]">
        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="animate-spin text-[#c4a962]" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[720px]">
              <thead>
                <tr className="bg-[#faf8f5] text-[11px] uppercase tracking-wider text-[#9c8b7a]">
                  <th className="text-left px-4 py-3 font-medium">Author</th>
                  <th className="text-left px-4 py-3 font-medium">Content</th>
                  <th className="text-left px-4 py-3 font-medium">Rating</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-right px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {testimonials.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-10 text-center text-[#9c8b7a]">No testimonials yet</td></tr>
                ) : (
                  testimonials.map((t) => (
                    <tr key={t.id} className="border-t border-[#efe7dc]">
                      <td className="px-4 py-3">
                        <p className="font-medium">{t.author_name}</p>
                        <p className="text-[11px] text-[#9c8b7a]">
                          {[t.author_title, t.author_location].filter(Boolean).join(' · ')}
                        </p>
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <p className="line-clamp-2 text-[#6f655c]">{t.content}</p>
                      </td>
                      <td className="px-4 py-3">{t.rating ?? 5}/5</td>
                      <td className="px-4 py-3 space-x-1">
                        <span className={`text-[10px] uppercase tracking-wider px-2 py-1 ${t.is_active ? 'bg-green-50 text-green-800' : 'bg-[#f5f0eb] text-[#9c8b7a]'}`}>
                          {t.is_active ? 'Active' : 'Hidden'}
                        </span>
                        {!!t.is_featured && (
                          <span className="text-[10px] uppercase tracking-wider px-2 py-1 bg-[#faf8f5] text-[#c4a962]">Featured</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button type="button" onClick={() => openEdit(t)} className="p-2 text-[#9c8b7a] hover:text-[#c4a962]" aria-label="Edit">
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => { if (confirm('Delete this testimonial?')) deleteMutation.mutate(t.id); }}
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
              <h2 className="font-medium text-lg">{editing ? 'Edit Testimonial' : 'Add Testimonial'}</h2>
              <button type="button" onClick={closeForm} aria-label="Close"><X size={18} /></button>
            </div>
            <form
              className="p-5 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (!form.author_name.trim() || !form.content.trim()) {
                  toast.error('Author and content required');
                  return;
                }
                saveMutation.mutate();
              }}
            >
              <input
                className="w-full border border-[#e8e0d5] px-3 py-2.5 text-sm"
                placeholder="Author name *"
                value={form.author_name}
                onChange={(e) => setForm({ ...form, author_name: e.target.value })}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  className="w-full border border-[#e8e0d5] px-3 py-2.5 text-sm"
                  placeholder="Title"
                  value={form.author_title}
                  onChange={(e) => setForm({ ...form, author_title: e.target.value })}
                />
                <input
                  className="w-full border border-[#e8e0d5] px-3 py-2.5 text-sm"
                  placeholder="Location"
                  value={form.author_location}
                  onChange={(e) => setForm({ ...form, author_location: e.target.value })}
                />
              </div>
              <AdminMediaPicker label="Author image" value={form.author_image} onChange={(author_image) => setForm({ ...form, author_image })} />
              <textarea
                className="w-full border border-[#e8e0d5] px-3 py-2.5 text-sm resize-none"
                rows={4}
                placeholder="Content *"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  className="w-full border border-[#e8e0d5] px-3 py-2.5 text-sm"
                  placeholder="Rating 1–5"
                  type="number"
                  min={1}
                  max={5}
                  value={form.rating}
                  onChange={(e) => setForm({ ...form, rating: e.target.value })}
                />
                <input
                  className="w-full border border-[#e8e0d5] px-3 py-2.5 text-sm"
                  placeholder="Sort order"
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
                />
              </div>
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
                {saveMutation.isPending ? 'Saving…' : editing ? 'Update Testimonial' : 'Create Testimonial'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
