import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import SEO from '@/components/SEO';
import ProductCard, { ProductCardSkeleton } from '@/components/ProductCard';
import QuickView from '@/components/QuickView';
import { productApi } from '@/lib/api';
import { cn, slugToTitle } from '@/lib/utils';
import {
  DEFAULT_SHOP_FILTERS,
  enabledSortOptions,
  normalizeShopFilters,
} from '@/lib/shopFilters';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { parseSettingJson, useSiteSettings } from '@/hooks/useSiteSettings';
import type { Product } from '@/types';

interface ShopPageProps {
  title?: string;
  defaultFilters?: Record<string, string>;
  seoDescription?: string;
}

interface FilterOption {
  value: string;
  label: string;
}

interface FilterOptions {
  materials?: FilterOption[];
  colors?: FilterOption[];
  categories?: FilterOption[];
  collections?: FilterOption[];
  price_range?: {
    min_price?: number;
    max_price?: number;
    min_price_inr?: number;
    max_price_inr?: number;
  };
}

const EMPTY_PRODUCTS = {
  items: [] as Product[],
  pagination: { total: 0, page: 1, per_page: 12, total_pages: 0 },
};

export default function ShopPage({
  title = 'Shop All Rugs',
  defaultFilters = {},
  seoDescription,
}: ShopPageProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [quickView, setQuickView] = useState<Product | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchDraft, setSearchDraft] = useState(searchParams.get('search') || '');
  const { addToWishlist } = useCart();
  const { isIndia, formatMoney } = useCurrency();
  const { data: settings = {} } = useSiteSettings();
  const shopConfig = useMemo(
    () => normalizeShopFilters(parseSettingJson(settings.shop_filters, DEFAULT_SHOP_FILTERS)),
    [settings.shop_filters],
  );
  const sortOptions = useMemo(() => enabledSortOptions(shopConfig), [shopConfig]);

  const filters = {
    page: searchParams.get('page') || '1',
    sort: searchParams.get('sort') || shopConfig.default_sort || 'newest',
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || defaultFilters.category || '',
    collection: searchParams.get('collection') || defaultFilters.collection || '',
    material: searchParams.get('material') || '',
    color: searchParams.get('color') || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    is_featured: defaultFilters.is_featured || '',
    is_new_arrival: defaultFilters.is_new_arrival || '',
    is_best_seller: defaultFilters.is_best_seller || '',
    is_luxury: defaultFilters.is_luxury || '',
    per_page: '12',
    currency: isIndia ? 'INR' : 'USD',
  };

  useEffect(() => {
    setSearchDraft(filters.search);
  }, [filters.search]);

  useEffect(() => {
    document.body.style.overflow = filtersOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [filtersOpen]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      try {
        const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
        const res = await productApi.list(params);
        return res.data?.data ?? EMPTY_PRODUCTS;
      } catch {
        return EMPTY_PRODUCTS;
      }
    },
  });

  const { data: filterOptions } = useQuery({
    queryKey: ['product-filters'],
    queryFn: async (): Promise<FilterOptions> => {
      try {
        const res = await productApi.filters();
        return res.data?.data ?? {};
      } catch {
        return {};
      }
    },
  });

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    if (key !== 'page') params.delete('page');
    setSearchParams(params);
  };

  const clearFilters = () => {
    const params = new URLSearchParams();
    // Keep default route filters out of URL unless user chose them via shop links
    setSearchParams(params);
    setSearchDraft('');
    setFiltersOpen(false);
  };

  const applySearch = () => {
    updateFilter('search', searchDraft.trim());
  };

  const activeChips = useMemo(() => {
    const chips: { key: string; label: string }[] = [];
    if (filters.search) chips.push({ key: 'search', label: `"${filters.search}"` });
    if (filters.category) chips.push({ key: 'category', label: slugToTitle(filters.category) });
    if (filters.collection && !defaultFilters.collection) {
      chips.push({ key: 'collection', label: slugToTitle(filters.collection) });
    }
    if (filters.material) chips.push({ key: 'material', label: filters.material });
    if (filters.color) chips.push({ key: 'color', label: filters.color });
    if (filters.min_price) chips.push({ key: 'min_price', label: `Min ${formatMoney(Number(filters.min_price))}` });
    if (filters.max_price) chips.push({ key: 'max_price', label: `Max ${formatMoney(Number(filters.max_price))}` });
    return chips;
  }, [filters, defaultFilters.collection, formatMoney]);

  const total = data?.pagination?.total ?? 0;
  const totalPages = data?.pagination?.total_pages ?? 0;
  const currentPage = Number(filters.page) || 1;
  const items = data?.items || [];

  const priceHint = filterOptions?.price_range;
  const priceMin = isIndia
    ? Math.floor(Number(priceHint?.min_price_inr || 0))
    : Math.floor(Number(priceHint?.min_price || 0));
  const priceMax = isIndia
    ? Math.ceil(Number(priceHint?.max_price_inr || 0))
    : Math.ceil(Number(priceHint?.max_price || 0));

  const FilterPanel = (
    <div className="space-y-8">
      {shopConfig.show_sort && (
        <div>
          <h3 className="text-[11px] uppercase tracking-[0.16em] text-stone mb-3">{shopConfig.labels.sort}</h3>
          <select
            value={filters.sort}
            onChange={(e) => updateFilter('sort', e.target.value)}
            className="input-luxury text-sm"
          >
            {sortOptions.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      )}

      {shopConfig.show_category && (filterOptions?.categories?.length || 0) > 0 && !defaultFilters.category && (
        <FilterGroup title={shopConfig.labels.category}>
          {filterOptions!.categories!.map((opt) => (
            <FilterRadio
              key={opt.value}
              name="category"
              label={opt.label}
              checked={filters.category === opt.value}
              onChange={() => updateFilter('category', filters.category === opt.value ? '' : opt.value)}
            />
          ))}
        </FilterGroup>
      )}

      {shopConfig.show_collection && (filterOptions?.collections?.length || 0) > 0 && !defaultFilters.collection && (
        <FilterGroup title={shopConfig.labels.collection}>
          {filterOptions!.collections!.map((opt) => (
            <FilterRadio
              key={opt.value}
              name="collection"
              label={opt.label}
              checked={filters.collection === opt.value}
              onChange={() => updateFilter('collection', filters.collection === opt.value ? '' : opt.value)}
            />
          ))}
        </FilterGroup>
      )}

      {shopConfig.show_material && (filterOptions?.materials?.length || 0) > 0 && (
        <FilterGroup title={shopConfig.labels.material}>
          {filterOptions!.materials!.map((opt) => (
            <FilterRadio
              key={opt.value}
              name="material"
              label={opt.label}
              checked={filters.material === opt.value}
              onChange={() => updateFilter('material', filters.material === opt.value ? '' : opt.value)}
            />
          ))}
        </FilterGroup>
      )}

      {shopConfig.show_color && (filterOptions?.colors?.length || 0) > 0 && (
        <FilterGroup title={shopConfig.labels.color}>
          {filterOptions!.colors!.map((opt) => (
            <FilterRadio
              key={opt.value}
              name="color"
              label={opt.label}
              checked={filters.color === opt.value}
              onChange={() => updateFilter('color', filters.color === opt.value ? '' : opt.value)}
            />
          ))}
        </FilterGroup>
      )}

      {shopConfig.show_price && (
        <div>
          <h3 className="text-[11px] uppercase tracking-[0.16em] text-stone mb-3">{shopConfig.labels.price}</h3>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              min={0}
              placeholder={priceMin ? String(priceMin) : 'Min'}
              value={filters.min_price}
              onChange={(e) => updateFilter('min_price', e.target.value)}
              className="input-luxury text-sm"
            />
            <input
              type="number"
              min={0}
              placeholder={priceMax ? String(priceMax) : 'Max'}
              value={filters.max_price}
              onChange={(e) => updateFilter('max_price', e.target.value)}
              className="input-luxury text-sm"
            />
          </div>
          {priceMax > 0 && (
            <p className="text-xs text-stone mt-2">
              Available {formatMoney(priceMin)} – {formatMoney(priceMax)}
            </p>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={clearFilters}
        className="w-full text-sm uppercase tracking-[0.12em] py-3 border border-sand/60 text-stone hover:border-charcoal hover:text-charcoal transition-colors"
      >
        {shopConfig.labels.clear}
      </button>
    </div>
  );

  return (
    <>
      <SEO
        title={title}
        description={seoDescription || `Browse our ${title.toLowerCase()}. Premium luxury carpets and rugs.`}
      />

      <div className="bg-gradient-to-b from-ivory via-white to-white">
        <div className="container-luxury pt-6 sm:pt-8 pb-8 sm:pb-10">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
            <div>
              <p className="luxury-subheading mb-2">MECCIO Collection</p>
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-charcoal">{title}</h1>
              <p className="text-stone text-sm mt-3 max-w-xl">
                Discover handcrafted rugs curated for refined interiors worldwide.
              </p>
            </div>
            <p className="text-sm text-stone shrink-0">
              <span className="font-medium text-charcoal">{total}</span>{' '}
              {total === 1 ? 'product' : 'products'}
              {isFetching && !isLoading ? ' · Updating…' : ''}
            </p>
          </div>

          {/* Toolbar */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:items-center">
            {shopConfig.show_search && (
              <form
                className="flex-1 flex items-center gap-2 border border-sand/60 bg-white px-4 py-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  applySearch();
                }}
              >
                <Search size={16} className="text-stone shrink-0" />
                <input
                  type="search"
                  value={searchDraft}
                  onChange={(e) => setSearchDraft(e.target.value)}
                  placeholder="Search rugs, materials, SKU…"
                  className="w-full bg-transparent outline-none text-sm text-charcoal placeholder:text-stone/60"
                />
                {searchDraft && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchDraft('');
                      updateFilter('search', '');
                    }}
                    className="text-stone hover:text-charcoal"
                    aria-label="Clear search"
                  >
                    <X size={16} />
                  </button>
                )}
              </form>
            )}

            <div className={cn('flex gap-2', !shopConfig.show_search && 'ml-auto')}>
              <button
                type="button"
                onClick={() => setFiltersOpen(true)}
                className="lg:hidden inline-flex items-center justify-center gap-2 px-4 py-3 border border-sand/60 bg-white text-xs uppercase tracking-[0.14em] text-charcoal"
              >
                <Filter size={15} />
                Filters
                {activeChips.length > 0 && (
                  <span className="w-5 h-5 rounded-full bg-charcoal text-cream text-[10px] flex items-center justify-center">
                    {activeChips.length}
                  </span>
                )}
              </button>

              {shopConfig.show_sort && (
                <div className="hidden sm:flex items-center gap-2 border border-sand/60 bg-white px-3 py-2">
                  <SlidersHorizontal size={14} className="text-stone" />
                  <select
                    value={filters.sort}
                    onChange={(e) => updateFilter('sort', e.target.value)}
                    className="bg-transparent outline-none text-sm text-charcoal pr-1"
                  >
                    {sortOptions.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {activeChips.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {activeChips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={() => updateFilter(chip.key, '')}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-charcoal text-cream text-[11px] uppercase tracking-[0.12em]"
                >
                  {chip.label}
                  <X size={12} />
                </button>
              ))}
              <button
                type="button"
                onClick={clearFilters}
                className="text-[11px] uppercase tracking-[0.12em] text-stone hover:text-charcoal px-2"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="container-luxury pb-16 sm:pb-20 md:pb-24">
        <div className="flex flex-col lg:flex-row gap-8 xl:gap-12">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-[260px] xl:w-[280px] shrink-0">
            <div className="sticky top-28 border border-sand/50 bg-white p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-xl text-charcoal">Filters</h2>
                <Filter size={16} className="text-gold" />
              </div>
              {FilterPanel}
            </div>
          </aside>

          {/* Product grid */}
          <div className="flex-1 min-w-0">
            <div
              className={cn(
                'grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5 md:gap-6 lg:gap-7 transition-opacity duration-300',
                isFetching && !isLoading ? 'opacity-70' : 'opacity-100',
              )}
            >
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
                : items.map((product: Product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onQuickView={setQuickView}
                      onAddToWishlist={addToWishlist}
                    />
                  ))}
            </div>

            {!isLoading && items.length === 0 && (
              <div className="text-center py-20 sm:py-28 border border-sand/40 bg-white">
                <p className="font-display text-2xl sm:text-3xl text-charcoal mb-3">No products found</p>
                <p className="text-stone text-sm mb-8 max-w-md mx-auto px-4">
                  Try adjusting filters or search to discover more handcrafted rugs.
                </p>
                <button type="button" onClick={clearFilters} className="btn-outline">
                  View All Products
                </button>
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-10 sm:mt-12 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => updateFilter('page', String(currentPage - 1))}
                  className="w-10 h-10 border border-sand/60 flex items-center justify-center disabled:opacity-40 hover:border-charcoal transition-colors"
                  aria-label="Previous page"
                >
                  <ChevronLeft size={16} />
                </button>

                {getPageNumbers(currentPage, totalPages).map((page, idx) =>
                  page === '…' ? (
                    <span key={`ellipsis-${idx}`} className="w-8 text-center text-stone">…</span>
                  ) : (
                    <button
                      key={page}
                      type="button"
                      onClick={() => updateFilter('page', String(page))}
                      className={cn(
                        'w-10 h-10 text-sm transition-colors',
                        currentPage === page
                          ? 'bg-charcoal text-cream'
                          : 'border border-sand/60 hover:border-charcoal',
                      )}
                    >
                      {page}
                    </button>
                  ),
                )}

                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => updateFilter('page', String(currentPage + 1))}
                  className="w-10 h-10 border border-sand/60 flex items-center justify-center disabled:opacity-40 hover:border-charcoal transition-colors"
                  aria-label="Next page"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filters drawer */}
      <AnimatePresence>
        {filtersOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[70] bg-charcoal/50 backdrop-blur-sm lg:hidden"
              onClick={() => setFiltersOpen(false)}
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.28 }}
              className="fixed inset-y-0 right-0 z-[71] w-[min(100%,360px)] bg-cream shadow-2xl lg:hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-sand/50">
                <h2 className="font-display text-2xl">Filters</h2>
                <button type="button" onClick={() => setFiltersOpen(false)} aria-label="Close filters">
                  <X size={22} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-5">{FilterPanel}</div>
              <div className="p-4 border-t border-sand/50 bg-white">
                <button
                  type="button"
                  onClick={() => setFiltersOpen(false)}
                  className="btn-primary w-full"
                >
                  Show {total} Results
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {quickView && <QuickView product={quickView} onClose={() => setQuickView(null)} />}
    </>
  );
}

function FilterGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="text-[11px] uppercase tracking-[0.16em] text-stone mb-3">{title}</h3>
      <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">{children}</div>
    </div>
  );
}

function FilterRadio({
  name,
  label,
  checked,
  onChange,
}: {
  name: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={cn(
        'w-full text-left px-3 py-2 text-sm border transition-colors',
        checked
          ? 'border-charcoal bg-charcoal text-cream'
          : 'border-sand/50 text-charcoal hover:border-gold/60',
      )}
      aria-pressed={checked}
      data-filter-name={name}
    >
      {label}
    </button>
  );
}

function getPageNumbers(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | '…')[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  if (start > 2) pages.push('…');
  for (let i = start; i <= end; i += 1) pages.push(i);
  if (end < total - 1) pages.push('…');
  pages.push(total);

  return pages;
}

export function slugToTitleExport(slug: string) {
  return slugToTitle(slug);
}
