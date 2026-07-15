import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Loader2, Pencil, Plus, Star, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { ADMIN_INPUT, AdminField } from '@/admin/components/AdminFormBits';
import AdminMediaPicker from '@/admin/components/AdminMediaPicker';
import { adminApi, resolveMediaUrl } from '@/lib/api';
import { formatDate } from '@/lib/utils';

type Review = {
  id: number;
  product_id: number;
  rating: number;
  title?: string | null;
  content?: string | null;
  is_approved?: number;
  is_verified?: number;
  created_at: string;
  product_name?: string;
  product_slug?: string;
  product_image?: string | null;
  author_name?: string;
  author_email?: string | null;
};

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

type ProductOption = { id: number; name: string };

type MainTab = 'product' | 'testimonials';
type Filter = 'all' | 'pending' | 'approved';

const emptyReviewForm = {
  product_id: '',
  author_name: '',
  author_email: '',
  rating: '5',
  title: '',
  content: '',
  is_verified: false,
  is_approved: true,
};

const emptyTestimonialForm = {
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

export default function AdminReviewsPage() {
  const queryClient = useQueryClient();
  const [mainTab, setMainTab] = useState<MainTab>('product');
  const [filter, setFilter] = useState<Filter>('all');

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [reviewForm, setReviewForm] = useState(emptyReviewForm);

  const [showTestimonialForm, setShowTestimonialForm] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [testimonialForm, setTestimonialForm] = useState(emptyTestimonialForm);

  const reviewParams = useMemo(() => {
    if (filter === 'all') return undefined;
    return { status: filter };
  }, [filter]);

  const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ['admin', 'reviews', filter],
    queryFn: async () => {
      const res = await adminApi.reviews.list(reviewParams);
      return Array.isArray(res.data?.data) ? (res.data.data as Review[]) : [];
    },
  });

  const { data: testimonials = [], isLoading: testimonialsLoading } = useQuery({
    queryKey: ['admin', 'testimonials'],
    queryFn: async () => {
      const res = await adminApi.testimonials.list();
      return Array.isArray(res.data?.data) ? (res.data.data as Testimonial[]) : [];
    },
  });

  const { data: products = [] } = useQuery({
    queryKey: ['admin', 'products', 'options'],
    queryFn: async () => {
      const res = await adminApi.products.list({ page: 1, per_page: 200 });
      const raw = res.data?.data;
      const items = Array.isArray(raw) ? raw : Array.isArray(raw?.items) ? raw.items : [];
      return items.map((p: ProductOption) => ({ id: p.id, name: p.name })) as ProductOption[];
    },
  });

  const reviewPayload = () => ({
    product_id: Number(reviewForm.product_id) || 0,
    author_name: reviewForm.author_name.trim(),
    author_email: reviewForm.author_email.trim(),
    rating: Number(reviewForm.rating) || 5,
    title: reviewForm.title.trim(),
    content: reviewForm.content.trim(),
    is_verified: reviewForm.is_verified ? 1 : 0,
    is_approved: reviewForm.is_approved ? 1 : 0,
  });

  const testimonialPayload = () => ({
    author_name: testimonialForm.author_name.trim(),
    author_title: testimonialForm.author_title,
    author_location: testimonialForm.author_location,
    author_image: testimonialForm.author_image,
    content: testimonialForm.content,
    rating: Number(testimonialForm.rating) || 5,
    sort_order: Number(testimonialForm.sort_order) || 0,
    is_featured: testimonialForm.is_featured ? 1 : 0,
    is_active: testimonialForm.is_active ? 1 : 0,
  });

  const saveReviewMutation = useMutation({
    mutationFn: () =>
      editingReview
        ? adminApi.reviews.update(editingReview.id, reviewPayload())
        : adminApi.reviews.create(reviewPayload()),
    onSuccess: () => {
      toast.success(editingReview ? 'Review updated' : 'Review added');
      closeReviewForm();
      queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] });
    },
    onError: () => toast.error('Could not save review'),
  });

  const approveMutation = useMutation({
    mutationFn: (id: number) => adminApi.reviews.approve(id),
    onSuccess: () => {
      toast.success('Review approved');
      queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] });
    },
    onError: () => toast.error('Could not approve review'),
  });

  const rejectMutation = useMutation({
    mutationFn: (id: number) => adminApi.reviews.reject(id),
    onSuccess: () => {
      toast.success('Review moved to pending');
      queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] });
    },
    onError: () => toast.error('Could not update review'),
  });

  const deleteReviewMutation = useMutation({
    mutationFn: (id: number) => adminApi.reviews.delete(id),
    onSuccess: () => {
      toast.success('Review deleted');
      queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] });
    },
    onError: () => toast.error('Could not delete review'),
  });

  const saveTestimonialMutation = useMutation({
    mutationFn: () =>
      editingTestimonial
        ? adminApi.testimonials.update(editingTestimonial.id, testimonialPayload())
        : adminApi.testimonials.create(testimonialPayload()),
    onSuccess: () => {
      toast.success(editingTestimonial ? 'Testimonial updated' : 'Testimonial added');
      closeTestimonialForm();
      queryClient.invalidateQueries({ queryKey: ['admin', 'testimonials'] });
    },
    onError: () => toast.error('Could not save testimonial'),
  });

  const deleteTestimonialMutation = useMutation({
    mutationFn: (id: number) => adminApi.testimonials.delete(id),
    onSuccess: () => {
      toast.success('Testimonial deleted');
      queryClient.invalidateQueries({ queryKey: ['admin', 'testimonials'] });
    },
    onError: () => toast.error('Could not delete testimonial'),
  });

  const openCreateReview = () => {
    setEditingReview(null);
    setReviewForm(emptyReviewForm);
    setShowReviewForm(true);
  };

  const openEditReview = (r: Review) => {
    setEditingReview(r);
    setReviewForm({
      product_id: String(r.product_id || ''),
      author_name: r.author_name || '',
      author_email: r.author_email || '',
      rating: String(r.rating ?? 5),
      title: r.title || '',
      content: r.content || '',
      is_verified: !!r.is_verified,
      is_approved: !!r.is_approved,
    });
    setShowReviewForm(true);
  };

  const closeReviewForm = () => {
    setShowReviewForm(false);
    setEditingReview(null);
    setReviewForm(emptyReviewForm);
  };

  const openCreateTestimonial = () => {
    setEditingTestimonial(null);
    setTestimonialForm(emptyTestimonialForm);
    setShowTestimonialForm(true);
  };

  const openEditTestimonial = (t: Testimonial) => {
    setEditingTestimonial(t);
    setTestimonialForm({
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
    setShowTestimonialForm(true);
  };

  const closeTestimonialForm = () => {
    setShowTestimonialForm(false);
    setEditingTestimonial(null);
    setTestimonialForm(emptyTestimonialForm);
  };

  const pendingCount = reviews.filter((r) => !r.is_approved).length;
  const approvedCount = reviews.filter((r) => r.is_approved).length;

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-medium">Reviews</h1>
          <p className="text-sm text-[#9c8b7a] mt-1">
            Product reviews from customers + homepage testimonials
          </p>
        </div>
        <button
          type="button"
          onClick={() => (mainTab === 'product' ? openCreateReview() : openCreateTestimonial())}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] text-xs uppercase tracking-wider bg-[#1a1714] text-white w-full sm:w-auto"
        >
          <Plus size={14} />
          {mainTab === 'product' ? 'Add Review' : 'Add Testimonial'}
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-0.5 -mx-1 px-1">
        {(
          [
            { id: 'product' as const, label: 'Product Reviews' },
            { id: 'testimonials' as const, label: 'Testimonials' },
          ]
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setMainTab(tab.id)}
            className={`shrink-0 px-3 py-2.5 min-h-[44px] text-[11px] uppercase tracking-wider border ${
              mainTab === tab.id
                ? 'bg-[#1a1714] text-white border-[#1a1714]'
                : 'bg-white border-[#e8e0d5]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {mainTab === 'product' ? (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex gap-2 overflow-x-auto flex-1">
              {(
                [
                  { id: 'all' as const, label: 'All' },
                  { id: 'pending' as const, label: 'Pending' },
                  { id: 'approved' as const, label: 'Approved' },
                ]
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilter(tab.id)}
                  className={`shrink-0 px-3 py-2 min-h-[40px] text-[11px] uppercase tracking-wider border ${
                    filter === tab.id
                      ? 'bg-[#1a1714] text-white border-[#1a1714]'
                      : 'bg-white border-[#e8e0d5]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            {filter === 'all' && reviews.length > 0 && (
              <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-wider w-full sm:w-auto">
                <span className="px-3 py-1.5 bg-white border border-[#e8e0d5]">{pendingCount} pending</span>
                <span className="px-3 py-1.5 bg-white border border-[#e8e0d5]">{approvedCount} approved</span>
              </div>
            )}
          </div>

          <div className="bg-white border border-[#e8e0d5]">
            {reviewsLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="animate-spin text-[#c4a962]" />
              </div>
            ) : reviews.length === 0 ? (
              <p className="text-center text-[#9c8b7a] py-16 text-sm px-4">
                No product reviews yet. Customer submissions appear here for approval.
              </p>
            ) : (
              <div className="divide-y divide-[#efe7dc]">
                {reviews.map((r) => (
                  <div key={r.id} className="p-4 sm:p-5 flex flex-col gap-4">
                    <div className="flex gap-3 sm:gap-4">
                      <div className="shrink-0 h-14 w-14 sm:h-16 sm:w-16 border border-[#e8e0d5] bg-[#faf8f5] overflow-hidden">
                        {r.product_image ? (
                          <img
                            src={resolveMediaUrl(r.product_image)}
                            alt={r.product_name || 'Product'}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-[9px] uppercase tracking-wider text-[#9c8b7a]">
                            No img
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                size={14}
                                className={i < Number(r.rating) ? 'fill-[#c4a962] text-[#c4a962]' : 'text-[#e8e0d5]'}
                              />
                            ))}
                          </div>
                          {r.is_verified ? (
                            <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 bg-[#faf8f5] text-[#c4a962]">
                              Verified
                            </span>
                          ) : null}
                          <span
                            className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 ${
                              r.is_approved ? 'bg-green-50 text-green-800' : 'bg-amber-50 text-amber-800'
                            }`}
                          >
                            {r.is_approved ? 'Approved' : 'Pending'}
                          </span>
                        </div>
                        <p className="font-medium text-sm sm:text-base">{r.title || 'Untitled review'}</p>
                        <p className="text-sm text-[#6f655c] leading-relaxed whitespace-pre-wrap break-words">
                          {r.content || '—'}
                        </p>
                        <p className="text-[11px] text-[#9c8b7a] break-words">
                          <span className="font-medium text-[#6f655c]">{r.product_name || 'Product'}</span>
                          {' · '}
                          {r.author_name || 'Customer'}
                          {r.author_email ? ` · ${r.author_email}` : ''}
                          {' · '}
                          {formatDate(r.created_at)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => openEditReview(r)}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 min-h-[44px] text-[11px] uppercase tracking-wider border border-[#e8e0d5]"
                      >
                        <Pencil size={12} /> Edit
                      </button>
                      {!r.is_approved ? (
                        <button
                          type="button"
                          onClick={() => approveMutation.mutate(r.id)}
                          disabled={approveMutation.isPending}
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 min-h-[44px] text-[11px] uppercase tracking-wider bg-[#1a1714] text-white disabled:opacity-60"
                        >
                          <Check size={12} /> Approve
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => rejectMutation.mutate(r.id)}
                          disabled={rejectMutation.isPending}
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 min-h-[44px] text-[11px] uppercase tracking-wider border border-[#e8e0d5] disabled:opacity-60"
                        >
                          <X size={12} /> Unapprove
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm('Delete this review permanently?')) deleteReviewMutation.mutate(r.id);
                        }}
                        disabled={deleteReviewMutation.isPending}
                        className="col-span-2 sm:col-span-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 min-h-[44px] text-[11px] uppercase tracking-wider text-red-600 border border-[#e8e0d5] hover:border-red-300 disabled:opacity-60"
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="bg-white border border-[#e8e0d5]">
          {testimonialsLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="animate-spin text-[#c4a962]" />
            </div>
          ) : testimonials.length === 0 ? (
            <p className="text-center text-[#9c8b7a] py-16 text-sm px-4">No testimonials yet</p>
          ) : (
            <div className="divide-y divide-[#efe7dc]">
              {testimonials.map((t) => (
                <div key={t.id} className="p-4 sm:p-5 space-y-3">
                  <div className="flex items-start gap-3">
                    {t.author_image ? (
                      <img
                        src={resolveMediaUrl(t.author_image)}
                        alt={t.author_name}
                        className="h-12 w-12 rounded-full object-cover border border-[#e8e0d5] shrink-0"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-[#faf8f5] border border-[#e8e0d5] shrink-0 flex items-center justify-center text-xs text-[#9c8b7a]">
                        {t.author_name?.charAt(0) || '?'}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{t.author_name}</p>
                      <p className="text-[11px] text-[#9c8b7a]">
                        {[t.author_title, t.author_location].filter(Boolean).join(' · ') || '—'}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <span className="text-[10px] uppercase tracking-wider px-2 py-1 bg-[#faf8f5]">
                          {t.rating ?? 5}/5
                        </span>
                        <span
                          className={`text-[10px] uppercase tracking-wider px-2 py-1 ${
                            t.is_active ? 'bg-green-50 text-green-800' : 'bg-[#f5f0eb] text-[#9c8b7a]'
                          }`}
                        >
                          {t.is_active ? 'Active' : 'Hidden'}
                        </span>
                        {!!t.is_featured && (
                          <span className="text-[10px] uppercase tracking-wider px-2 py-1 bg-[#faf8f5] text-[#c4a962]">
                            Featured
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-[#6f655c] leading-relaxed whitespace-pre-wrap break-words">
                    {t.content || '—'}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => openEditTestimonial(t)}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 min-h-[44px] text-[11px] uppercase tracking-wider border border-[#e8e0d5]"
                    >
                      <Pencil size={12} /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('Delete this testimonial?')) deleteTestimonialMutation.mutate(t.id);
                      }}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 min-h-[44px] text-[11px] uppercase tracking-wider text-red-600 border border-[#e8e0d5]"
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showReviewForm && (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-lg max-h-[92dvh] overflow-y-auto border-0 sm:border border-[#e8e0d5] rounded-t-2xl sm:rounded-none">
            <div className="sticky top-0 bg-white border-b border-[#e8e0d5] px-4 py-3 flex items-center justify-between gap-3">
              <h2 className="font-medium text-lg">{editingReview ? 'Edit Review' : 'Add Review'}</h2>
              <button type="button" onClick={closeReviewForm} className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center" aria-label="Close">
                <X size={18} />
              </button>
            </div>
            <form
              className="p-4 space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                if (!reviewForm.product_id) {
                  toast.error('Select a product');
                  return;
                }
                if (!reviewForm.content.trim()) {
                  toast.error('Review content is required');
                  return;
                }
                saveReviewMutation.mutate();
              }}
            >
              <AdminField label="Product *">
                <select
                  className={ADMIN_INPUT}
                  value={reviewForm.product_id}
                  onChange={(e) => setReviewForm({ ...reviewForm, product_id: e.target.value })}
                  required
                >
                  <option value="">Select product</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </AdminField>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <AdminField label="Author name *">
                  <input
                    className={ADMIN_INPUT}
                    value={reviewForm.author_name}
                    onChange={(e) => setReviewForm({ ...reviewForm, author_name: e.target.value })}
                    required
                  />
                </AdminField>
                <AdminField label="Author email">
                  <input
                    className={ADMIN_INPUT}
                    type="email"
                    value={reviewForm.author_email}
                    onChange={(e) => setReviewForm({ ...reviewForm, author_email: e.target.value })}
                  />
                </AdminField>
              </div>
              <AdminField label="Rating">
                <select
                  className={ADMIN_INPUT}
                  value={reviewForm.rating}
                  onChange={(e) => setReviewForm({ ...reviewForm, rating: e.target.value })}
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>{n} stars</option>
                  ))}
                </select>
              </AdminField>
              <AdminField label="Title">
                <input
                  className={ADMIN_INPUT}
                  value={reviewForm.title}
                  onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                />
              </AdminField>
              <AdminField label="Content *">
                <textarea
                  className={`${ADMIN_INPUT} resize-none`}
                  rows={4}
                  value={reviewForm.content}
                  onChange={(e) => setReviewForm({ ...reviewForm, content: e.target.value })}
                  required
                />
              </AdminField>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-sm min-h-[44px]">
                  <input
                    type="checkbox"
                    checked={reviewForm.is_approved}
                    onChange={(e) => setReviewForm({ ...reviewForm, is_approved: e.target.checked })}
                  />
                  Approved (live)
                </label>
                <label className="flex items-center gap-2 text-sm min-h-[44px]">
                  <input
                    type="checkbox"
                    checked={reviewForm.is_verified}
                    onChange={(e) => setReviewForm({ ...reviewForm, is_verified: e.target.checked })}
                  />
                  Verified
                </label>
              </div>
              <button
                type="submit"
                disabled={saveReviewMutation.isPending}
                className="w-full py-3.5 min-h-[48px] bg-[#1a1714] text-white text-sm uppercase tracking-wider disabled:opacity-60"
              >
                {saveReviewMutation.isPending ? 'Saving...' : editingReview ? 'Update Review' : 'Add Review'}
              </button>
            </form>
          </div>
        </div>
      )}

      {showTestimonialForm && (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-lg max-h-[92dvh] overflow-y-auto border-0 sm:border border-[#e8e0d5] rounded-t-2xl sm:rounded-none">
            <div className="sticky top-0 bg-white border-b border-[#e8e0d5] px-4 py-3 flex items-center justify-between gap-3">
              <h2 className="font-medium text-lg">{editingTestimonial ? 'Edit Testimonial' : 'Add Testimonial'}</h2>
              <button type="button" onClick={closeTestimonialForm} className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center" aria-label="Close">
                <X size={18} />
              </button>
            </div>
            <form
              className="p-4 space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                if (!testimonialForm.author_name.trim() || !testimonialForm.content.trim()) {
                  toast.error('Name and content are required');
                  return;
                }
                saveTestimonialMutation.mutate();
              }}
            >
              <AdminField label="Author name *">
                <input
                  className={ADMIN_INPUT}
                  value={testimonialForm.author_name}
                  onChange={(e) => setTestimonialForm({ ...testimonialForm, author_name: e.target.value })}
                  required
                />
              </AdminField>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <AdminField label="Title / role">
                  <input
                    className={ADMIN_INPUT}
                    value={testimonialForm.author_title}
                    onChange={(e) => setTestimonialForm({ ...testimonialForm, author_title: e.target.value })}
                  />
                </AdminField>
                <AdminField label="Location">
                  <input
                    className={ADMIN_INPUT}
                    value={testimonialForm.author_location}
                    onChange={(e) => setTestimonialForm({ ...testimonialForm, author_location: e.target.value })}
                  />
                </AdminField>
              </div>
              <AdminField label="Photo">
                <AdminMediaPicker
                  value={testimonialForm.author_image}
                  onChange={(url) => setTestimonialForm({ ...testimonialForm, author_image: url })}
                />
              </AdminField>
              <AdminField label="Content *">
                <textarea
                  className={`${ADMIN_INPUT} resize-none`}
                  rows={4}
                  value={testimonialForm.content}
                  onChange={(e) => setTestimonialForm({ ...testimonialForm, content: e.target.value })}
                  required
                />
              </AdminField>
              <div className="grid grid-cols-2 gap-3">
                <AdminField label="Rating">
                  <select
                    className={ADMIN_INPUT}
                    value={testimonialForm.rating}
                    onChange={(e) => setTestimonialForm({ ...testimonialForm, rating: e.target.value })}
                  >
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </AdminField>
                <AdminField label="Sort order">
                  <input
                    className={ADMIN_INPUT}
                    type="number"
                    value={testimonialForm.sort_order}
                    onChange={(e) => setTestimonialForm({ ...testimonialForm, sort_order: e.target.value })}
                  />
                </AdminField>
              </div>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-sm min-h-[44px]">
                  <input
                    type="checkbox"
                    checked={testimonialForm.is_active}
                    onChange={(e) => setTestimonialForm({ ...testimonialForm, is_active: e.target.checked })}
                  />
                  Active
                </label>
                <label className="flex items-center gap-2 text-sm min-h-[44px]">
                  <input
                    type="checkbox"
                    checked={testimonialForm.is_featured}
                    onChange={(e) => setTestimonialForm({ ...testimonialForm, is_featured: e.target.checked })}
                  />
                  Featured
                </label>
              </div>
              <button
                type="submit"
                disabled={saveTestimonialMutation.isPending}
                className="w-full py-3.5 min-h-[48px] bg-[#1a1714] text-white text-sm uppercase tracking-wider disabled:opacity-60"
              >
                {saveTestimonialMutation.isPending ? 'Saving...' : editingTestimonial ? 'Update' : 'Add Testimonial'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
