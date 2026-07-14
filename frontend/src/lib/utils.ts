import { parseAmount } from '@/lib/currency';

export { parseAmount };

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function slugToTitle(slug: string): string {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function getDiscountPercent(price: unknown, comparePrice: unknown): number {
  const current = parseAmount(price);
  const compare = parseAmount(comparePrice);
  if (!compare || compare <= current) return 0;
  return Math.round(((compare - current) / compare) * 100);
}

export const COLLECTIONS = [
  { slug: 'luxury-collection', name: 'Luxury Collection', description: 'The pinnacle of artisan craftsmanship' },
  { slug: 'modern-collection', name: 'Modern Collection', description: 'Contemporary designs for modern living' },
  { slug: 'persian-collection', name: 'Persian Collection', description: 'Timeless Persian artistry' },
  { slug: 'handmade-collection', name: 'Handmade Collection', description: 'Hand-knotted by master artisans' },
  { slug: 'wool-collection', name: 'Wool Collection', description: 'Premium natural wool rugs' },
  { slug: 'silk-collection', name: 'Silk Collection', description: 'Lustrous silk masterpieces' },
];

export const SHOP_FILTERS = {
  sort: [
    { value: 'newest', label: 'Newest' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'rating', label: 'Top Rated' },
    { value: 'popular', label: 'Most Popular' },
  ],
};
