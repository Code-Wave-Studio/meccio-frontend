import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Pencil, Plus, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi } from '@/lib/api';

type Faq = {
  id: number;
  category?: string;
  question: string;
  answer: string;
  sort_order?: number;
  is_active?: number;
};

const emptyForm = {
  category: 'General',
  question: '',
  answer: '',
  sort_order: '0',
  is_active: true,
};

export default function AdminFaqsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Faq | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [meta, setMeta] = useState({ title: '', subtitle: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'faqs'],
    queryFn: async () => {
      const res = await adminApi.faqs.list();
      return res.data?.data as { faqs: Faq[]; meta: { title?: string; subtitle?: string } };
    },
  });

  const faqs = Array.isArray(data?.faqs) ? data.faqs : [];

  useEffect(() => {
    if (data?.meta) {
      setMeta({
        title: data.meta.title || '',
        subtitle: data.meta.subtitle || '',
      });
    }
  }, [data?.meta]);

  const metaMutation = useMutation({
    mutationFn: () => adminApi.faqs.updateMeta(meta),
    onSuccess: () => {
      toast.success('FAQ meta saved');
      queryClient.invalidateQueries({ queryKey: ['admin', 'faqs'] });
    },
    onError: () => toast.error('Could not save meta'),
  });

  const payload = () => ({
    category: form.category.trim() || 'General',
    question: form.question.trim(),
    answer: form.answer.trim(),
    sort_order: Number(form.sort_order) || 0,
    is_active: form.is_active ? 1 : 0,
  });

  const saveMutation = useMutation({
    mutationFn: () =>
      editing ? adminApi.faqs.update(editing.id, payload()) : adminApi.faqs.create(payload()),
    onSuccess: () => {
      toast.success(editing ? 'FAQ updated' : 'FAQ created');
      closeForm();
      queryClient.invalidateQueries({ queryKey: ['admin', 'faqs'] });
    },
    onError: () => toast.error('Could not save FAQ'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.faqs.delete(id),
    onSuccess: () => {
      toast.success('FAQ deleted');
      queryClient.invalidateQueries({ queryKey: ['admin', 'faqs'] });
    },
    onError: () => toast.error('Could not delete FAQ'),
  });

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (f: Faq) => {
    setEditing(f);
    setForm({
      category: f.category || 'General',
      question: f.question || '',
      answer: f.answer || '',
      sort_order: String(f.sort_order ?? 0),
      is_active: !!f.is_active,
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
          <h1 className="text-2xl sm:text-3xl font-medium">FAQs</h1>
          <p className="text-sm text-[#9c8b7a] mt-1">Edit help center questions</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs uppercase tracking-wider bg-[#1a1714] text-white"
        >
          <Plus size={14} /> Add FAQ
        </button>
      </div>

      <div className="bg-white border border-[#e8e0d5] p-5 space-y-4">
        <h2 className="font-medium">Page meta</h2>
        <input
          className="w-full border border-[#e8e0d5] px-3 py-2.5 text-sm"
          placeholder="Title"
          value={meta.title}
          onChange={(e) => setMeta({ ...meta, title: e.target.value })}
        />
        <textarea
          className="w-full border border-[#e8e0d5] px-3 py-2.5 text-sm resize-none"
          rows={2}
          placeholder="Subtitle"
          value={meta.subtitle}
          onChange={(e) => setMeta({ ...meta, subtitle: e.target.value })}
        />
        <button
          type="button"
          disabled={metaMutation.isPending}
          onClick={() => metaMutation.mutate()}
          className="px-4 py-2.5 text-xs uppercase tracking-wider bg-[#1a1714] text-white disabled:opacity-60"
        >
          {metaMutation.isPending ? 'Saving…' : 'Save Meta'}
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
                  <th className="text-left px-4 py-3 font-medium">Category</th>
                  <th className="text-left px-4 py-3 font-medium">Question</th>
                  <th className="text-left px-4 py-3 font-medium">Order</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-right px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {faqs.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-10 text-center text-[#9c8b7a]">No FAQs yet</td></tr>
                ) : (
                  faqs.map((f) => (
                    <tr key={f.id} className="border-t border-[#efe7dc]">
                      <td className="px-4 py-3 text-xs uppercase tracking-wider text-[#9c8b7a]">{f.category}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium line-clamp-1">{f.question}</p>
                        <p className="text-[11px] text-[#9c8b7a] line-clamp-1">{f.answer}</p>
                      </td>
                      <td className="px-4 py-3">{f.sort_order ?? 0}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] uppercase tracking-wider px-2 py-1 ${f.is_active ? 'bg-green-50 text-green-800' : 'bg-[#f5f0eb] text-[#9c8b7a]'}`}>
                          {f.is_active ? 'Active' : 'Hidden'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button type="button" onClick={() => openEdit(f)} className="p-2 text-[#9c8b7a] hover:text-[#c4a962]" aria-label="Edit">
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => { if (confirm('Delete this FAQ?')) deleteMutation.mutate(f.id); }}
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
              <h2 className="font-medium text-lg">{editing ? 'Edit FAQ' : 'Add FAQ'}</h2>
              <button type="button" onClick={closeForm} aria-label="Close"><X size={18} /></button>
            </div>
            <form
              className="p-5 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (!form.question.trim() || !form.answer.trim()) {
                  toast.error('Question and answer required');
                  return;
                }
                saveMutation.mutate();
              }}
            >
              <input
                className="w-full border border-[#e8e0d5] px-3 py-2.5 text-sm"
                placeholder="Category"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
              <input
                className="w-full border border-[#e8e0d5] px-3 py-2.5 text-sm"
                placeholder="Question *"
                value={form.question}
                onChange={(e) => setForm({ ...form, question: e.target.value })}
              />
              <textarea
                className="w-full border border-[#e8e0d5] px-3 py-2.5 text-sm resize-none"
                rows={5}
                placeholder="Answer *"
                value={form.answer}
                onChange={(e) => setForm({ ...form, answer: e.target.value })}
              />
              <input
                className="w-full border border-[#e8e0d5] px-3 py-2.5 text-sm"
                placeholder="Sort order"
                type="number"
                value={form.sort_order}
                onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
              />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
                Active
              </label>
              <button
                type="submit"
                disabled={saveMutation.isPending}
                className="w-full py-3 bg-[#1a1714] text-white text-sm uppercase tracking-wider disabled:opacity-60"
              >
                {saveMutation.isPending ? 'Saving…' : editing ? 'Update FAQ' : 'Create FAQ'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
