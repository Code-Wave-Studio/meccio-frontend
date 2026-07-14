export type ShopSortOption = {
  value: string;
  label: string;
  enabled: boolean;
};

export type ShopFiltersConfig = {
  show_search: boolean;
  show_sort: boolean;
  show_category: boolean;
  show_collection: boolean;
  show_material: boolean;
  show_color: boolean;
  show_price: boolean;
  default_sort: string;
  sort_options: ShopSortOption[];
  labels: {
    sort: string;
    category: string;
    collection: string;
    material: string;
    color: string;
    price: string;
    clear: string;
  };
};

export const DEFAULT_SHOP_SORT_OPTIONS: ShopSortOption[] = [
  { value: 'newest', label: 'Newest', enabled: true },
  { value: 'price_asc', label: 'Price: Low to High', enabled: true },
  { value: 'price_desc', label: 'Price: High to Low', enabled: true },
  { value: 'rating', label: 'Top Rated', enabled: true },
  { value: 'popular', label: 'Most Popular', enabled: true },
];

export const DEFAULT_SHOP_FILTERS: ShopFiltersConfig = {
  show_search: true,
  show_sort: true,
  show_category: true,
  show_collection: true,
  show_material: true,
  show_color: true,
  show_price: true,
  default_sort: 'newest',
  sort_options: DEFAULT_SHOP_SORT_OPTIONS,
  labels: {
    sort: 'Sort By',
    category: 'Category',
    collection: 'Collection',
    material: 'Material',
    color: 'Color',
    price: 'Price Range',
    clear: 'Clear All Filters',
  },
};

export function normalizeShopFilters(raw: unknown): ShopFiltersConfig {
  const base = { ...DEFAULT_SHOP_FILTERS };
  if (!raw || typeof raw !== 'object') return base;

  const data = raw as Partial<ShopFiltersConfig>;
  const labels = {
    ...DEFAULT_SHOP_FILTERS.labels,
    ...(data.labels && typeof data.labels === 'object' ? data.labels : {}),
  };

  const sortMap = new Map(
    DEFAULT_SHOP_SORT_OPTIONS.map((opt) => [opt.value, { ...opt }]),
  );
  if (Array.isArray(data.sort_options)) {
    for (const opt of data.sort_options) {
      if (!opt || typeof opt !== 'object') continue;
      const value = String((opt as ShopSortOption).value || '');
      if (!sortMap.has(value)) continue;
      const current = sortMap.get(value)!;
      sortMap.set(value, {
        value,
        label: String((opt as ShopSortOption).label || current.label),
        enabled: (opt as ShopSortOption).enabled !== false,
      });
    }
  }

  const sort_options = Array.from(sortMap.values());
  const enabledSorts = sort_options.filter((o) => o.enabled);
  let default_sort = String(data.default_sort || base.default_sort);
  if (!enabledSorts.some((o) => o.value === default_sort)) {
    default_sort = enabledSorts[0]?.value || 'newest';
  }

  return {
    show_search: data.show_search !== false,
    show_sort: data.show_sort !== false,
    show_category: data.show_category !== false,
    show_collection: data.show_collection !== false,
    show_material: data.show_material !== false,
    show_color: data.show_color !== false,
    show_price: data.show_price !== false,
    default_sort,
    sort_options,
    labels: {
      sort: String(labels.sort || DEFAULT_SHOP_FILTERS.labels.sort),
      category: String(labels.category || DEFAULT_SHOP_FILTERS.labels.category),
      collection: String(labels.collection || DEFAULT_SHOP_FILTERS.labels.collection),
      material: String(labels.material || DEFAULT_SHOP_FILTERS.labels.material),
      color: String(labels.color || DEFAULT_SHOP_FILTERS.labels.color),
      price: String(labels.price || DEFAULT_SHOP_FILTERS.labels.price),
      clear: String(labels.clear || DEFAULT_SHOP_FILTERS.labels.clear),
    },
  };
}

export function enabledSortOptions(config: ShopFiltersConfig) {
  const enabled = config.sort_options.filter((o) => o.enabled);
  return enabled.length ? enabled : DEFAULT_SHOP_SORT_OPTIONS.filter((o) => o.enabled);
}
