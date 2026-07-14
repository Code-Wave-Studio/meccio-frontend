import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminMediaPicker from '@/admin/components/AdminMediaPicker';
import { ADMIN_LABEL } from '@/admin/components/AdminFormBits';
import { adminApi } from '@/lib/api';

/** Only image settings — text/hero copy fields are excluded. */
const IMAGE_FIELDS: { key: string; label: string }[] = [
  { key: 'page_auth_panel_image', label: 'Login / Signup panel image' },
  { key: 'page_home_luxury_image', label: 'Home — luxury section' },
  { key: 'page_home_craft_image', label: 'Home — craft section' },
  { key: 'page_about_hero_image', label: 'About — hero' },
  { key: 'page_about_craft_image', label: 'About — craft' },
  { key: 'page_custom_rugs_hero_image', label: 'Custom rugs — hero' },
  { key: 'page_collection_hero_image', label: 'Collections — hero' },
  { key: 'page_faq_hero_image', label: 'FAQ — hero' },
  { key: 'page_shipping_hero_image', label: 'Shipping — hero' },
  { key: 'page_returns_hero_image', label: 'Returns — hero' },
  { key: 'page_order_tracking_hero_image', label: 'Order tracking — hero' },
  { key: 'page_size_guide_hero_image', label: 'Size guide — hero' },
];

const OBSOLETE_KEYS = [
  'page_home_hero_btn1_href',
  'page_home_hero_btn1_label',
  'page_home_hero_btn2_href',
  'page_home_hero_btn2_label',
  'page_home_hero_description',
  'page_home_hero_show_btn2',
  'page_home_hero_slider_seconds',
  'page_home_hero_subheading',
  'page_home_hero_title',
];

export default function AdminPageImagesPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<Record<string, string>>({});
  const [heroSlides, setHeroSlides] = useState<string[]>(['']);

  const { data: images, isLoading } = useQuery({
    queryKey: ['admin', 'page-images'],
    queryFn: async () => {
      const res = await adminApi.pageImages.get();
      return (res.data?.data ?? {}) as Record<string, string>;
    },
  });

  useEffect(() => {
    if (!images) return;
    const next: Record<string, string> = {};
    for (const field of IMAGE_FIELDS) {
      next[field.key] = images[field.key] ?? '';
    }
    setForm(next);

    try {
      const slides = JSON.parse(images.page_home_hero_slides || '[]') as { url?: string }[];
      const urls = Array.isArray(slides)
        ? slides.map((s) => s.url || '').filter(Boolean)
        : [];
      setHeroSlides(urls.length ? urls : ['']);
    } catch {
      setHeroSlides(['']);
    }
  }, [images]);

  const saveMutation = useMutation({
    mutationFn: () => {
      const slides = heroSlides
        .map((url) => url.trim())
        .filter(Boolean)
        .map((url, i) => ({ url, alt: `Hero slide ${i + 1}` }));

      const payload: Record<string, string> = {
        ...form,
        page_home_hero_slides: JSON.stringify(slides),
      };
      // Drop obsolete text fields from DB when saving
      for (const key of OBSOLETE_KEYS) {
        payload[key] = '';
      }
      return adminApi.pageImages.update(payload);
    },
    onSuccess: () => {
      toast.success('Page images saved');
      queryClient.invalidateQueries({ queryKey: ['admin', 'page-images'] });
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
    onError: () => toast.error('Could not save page images'),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="animate-spin text-[#c4a962]" />
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-medium">Page Images</h1>
        <p className="text-sm text-[#9c8b7a] mt-1">
          Upload or paste URLs for storefront heroes, sections, and auth pages
        </p>
      </div>

      <form
        className="bg-white border border-[#e8e0d5] p-5 sm:p-6 space-y-8"
        onSubmit={(e) => {
          e.preventDefault();
          saveMutation.mutate();
        }}
      >
        <section className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-medium">Home hero slides</h2>
              <p className="text-xs text-[#9c8b7a] mt-0.5">Homepage carousel images</p>
            </div>
            <button
              type="button"
              onClick={() => setHeroSlides((prev) => [...prev, ''])}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs uppercase tracking-wider border border-[#e8e0d5] hover:border-[#c4a962]"
            >
              <Plus size={14} />
              Add slide
            </button>
          </div>
          <div className="space-y-4">
            {heroSlides.map((url, index) => (
              <div key={index} className="border border-[#e8e0d5] bg-[#faf8f5] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className={ADMIN_LABEL.replace(' mb-1.5', '')}>Slide {index + 1}</span>
                  {heroSlides.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setHeroSlides((prev) => prev.filter((_, i) => i !== index))}
                      className="inline-flex items-center gap-1 text-xs text-[#9c8b7a] hover:text-red-600"
                    >
                      <Trash2 size={14} />
                      Remove
                    </button>
                  )}
                </div>
                <AdminMediaPicker
                  value={url}
                  onChange={(next) =>
                    setHeroSlides((prev) => prev.map((u, i) => (i === index ? next : u)))
                  }
                />
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6 pt-2 border-t border-[#e8e0d5]">
          {IMAGE_FIELDS.map((field) => (
            <AdminMediaPicker
              key={field.key}
              label={field.label}
              value={form[field.key] || ''}
              onChange={(url) => setForm({ ...form, [field.key]: url })}
            />
          ))}
        </section>

        <button
          type="submit"
          disabled={saveMutation.isPending}
          className="w-full sm:w-auto px-6 py-3 bg-[#1a1714] text-white text-sm uppercase tracking-wider disabled:opacity-60"
        >
          {saveMutation.isPending ? 'Saving…' : 'Save Images'}
        </button>
      </form>
    </div>
  );
}
