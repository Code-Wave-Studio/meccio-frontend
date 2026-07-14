import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Loader2, Star, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi, resolveMediaUrl } from '@/lib/api';
import { formatDate } from '@/lib/utils';

type Review = {
  id: number;
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

type Filter = 'all' | 'pending' | 'approved';

export default function AdminReviewsPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<Filter>('all');

  const params = useMemo(() => {
    if (filter === 'all') return undefined;
    return { status: filter };
  }, [filter]);

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['admin', 'reviews', filter],
    queryFn: async () => {
      const res = await adminApi.reviews.list(params);
      return Array.isArray(res.data?.data) ? (res.data.data as Review[]) : [];
    },
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
    onError: () => toast.error('Could not reject review'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.reviews.delete(id),
    onSuccess: () => {
      toast.success('Review deleted');
      queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] });
    },
    onError: () => toast.error('Could not delete review'),
  });

  const pendingCount = reviews.filter((r) => !r.is_approved).length;
  const approvedCount = reviews.filter((r) => r.is_approved).length;

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-medium">Reviews</h1>
          <p className="text-sm text-[#9c8b7a] mt-1">Moderate product reviews before they go live</p>
        </div>
        {filter === 'all' && reviews.length > 0 && (
          <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-wider">
            <span className="px-3 py-1.5 bg-white border border-[#e8e0d5]">{pendingCount} pending</span>
            <span className="px-3 py-1.5 bg-white border border-[#e8e0d5]">{approvedCount} approved</span>
          </div>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto">
        {([
          { id: 'all', label: 'All' },
          { id: 'pending', label: 'Pending' },
          { id: 'approved', label: 'Approved' },
        ] as const).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilter(tab.id)}
            className={`shrink-0 px-3 py-2 text-[11px] uppercase tracking-wider border ${
              filter === tab.id
                ? 'bg-[#1a1714] text-white border-[#1a1714]'
                : 'bg-white border-[#e8e0d5]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white border border-[#e8e0d5]">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-[#c4a962]" />
          </div>
        ) : reviews.length === 0 ? (
          <p className="text-center text-[#9c8b7a] py-16 text-sm">No reviews found</p>
        ) : (
          <div className="divide-y divide-[#efe7dc]">
            {reviews.map((r) => (
              <div key={r.id} className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4">
                <div className="shrink-0 h-16 w-16 border border-[#e8e0d5] bg-[#faf8f5] overflow-hidden">
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

                <div className="min-w-0 flex-1 space-y-2">
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

                  <p className="font-medium">{r.title || 'Untitled review'}</p>
                  <p className="text-sm text-[#6f655c] leading-relaxed whitespace-pre-wrap">
                    {r.content || '—'}
                  </p>
                  <p className="text-[11px] text-[#9c8b7a]">
                    <span className="font-medium text-[#6f655c]">{r.product_name || 'Product'}</span>
                    {' · '}
                    {r.author_name || 'Customer'}
                    {r.author_email ? ` · ${r.author_email}` : ''}
                    {' · '}
                    {formatDate(r.created_at)}
                  </p>
                </div>

                <div className="shrink-0 flex sm:flex-col flex-wrap gap-2">
                  {!r.is_approved ? (
                    <button
                      type="button"
                      onClick={() => approveMutation.mutate(r.id)}
                      disabled={approveMutation.isPending}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 min-h-[40px] text-[11px] uppercase tracking-wider bg-[#1a1714] text-white disabled:opacity-60"
                    >
                      <Check size={12} /> Approve
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => rejectMutation.mutate(r.id)}
                      disabled={rejectMutation.isPending}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 min-h-[40px] text-[11px] uppercase tracking-wider border border-[#e8e0d5] disabled:opacity-60"
                    >
                      <X size={12} /> Unapprove
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Delete this review permanently?')) deleteMutation.mutate(r.id);
                    }}
                    disabled={deleteMutation.isPending}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 min-h-[40px] text-[11px] uppercase tracking-wider text-red-600 border border-[#e8e0d5] hover:border-red-300 disabled:opacity-60"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
