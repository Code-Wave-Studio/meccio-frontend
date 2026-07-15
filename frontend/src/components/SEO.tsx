import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  /** Path only, e.g. `/shop` — defaults to current pathname */
  url?: string;
  type?: string;
  noindex?: boolean;
  /** Emit Organization + WebSite JSON-LD (home only recommended) */
  includeSiteSchema?: boolean;
  keywords?: string;
}

export const SITE_NAME = 'MECCIO';
export const DEFAULT_DESC =
  'Luxury handcrafted carpets and rugs for discerning homes, hotels, and commercial spaces. Premium wool, silk, and Persian collections shipped worldwide.';
export const BASE_URL = (import.meta.env.VITE_SITE_URL || 'https://meccio.com').replace(/\/$/, '');
const DEFAULT_OG = `${BASE_URL}/icon.png`;

function absolutize(pathOrUrl: string): string {
  if (!pathOrUrl) return DEFAULT_OG;
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://') || pathOrUrl.startsWith('data:')) {
    return pathOrUrl;
  }
  return `${BASE_URL}${pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`}`;
}

export default function SEO({
  title,
  description = DEFAULT_DESC,
  image,
  url,
  type = 'website',
  noindex = false,
  includeSiteSchema = false,
  keywords,
}: SEOProps) {
  const location = useLocation();
  const path = url ?? (location.pathname === '/' ? '/' : location.pathname.replace(/\/$/, '') || '/');
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | Luxury Carpets & Rugs`;
  const canonical = path === '/' ? `${BASE_URL}/` : `${BASE_URL}${path}`;
  const ogImage = absolutize(image || '/icon.png');

  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: BASE_URL,
    logo: `${BASE_URL}/icon.png`,
    image: `${BASE_URL}/icon.png`,
    description: DEFAULT_DESC,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-888-633-2466',
      contactType: 'customer service',
      availableLanguage: ['English'],
    },
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: BASE_URL,
    description: DEFAULT_DESC,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/shop?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <Helmet>
      <html lang="en" />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="author" content="MECCIO" />
      <meta name="robots" content={noindex ? 'noindex,nofollow' : 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1'} />
      <link rel="canonical" href={canonical} />

      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:alt" content={title || SITE_NAME} />
      <meta property="og:url" content={canonical} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_US" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {includeSiteSchema && (
        <>
          <script type="application/ld+json">{JSON.stringify(orgSchema)}</script>
          <script type="application/ld+json">{JSON.stringify(websiteSchema)}</script>
        </>
      )}
    </Helmet>
  );
}

type ProductSchemaInput = {
  name: string;
  description?: string;
  price: number;
  price_inr?: number | null;
  sku: string;
  rating_avg?: number;
  rating_count?: number;
  primary_image?: string;
  slug: string;
  stock_quantity?: number;
  brand?: string;
  meta_title?: string | null;
  meta_description?: string | null;
};

export function ProductSchema({ product }: { product: ProductSchemaInput }) {
  const inStock = (product.stock_quantity ?? 1) > 0;
  const image = product.primary_image ? absolutize(product.primary_image) : `${BASE_URL}/icon.png`;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.meta_description || product.description || DEFAULT_DESC,
    sku: product.sku,
    image: [image],
    url: `${BASE_URL}/product/${product.slug}`,
    brand: { '@type': 'Brand', name: product.brand || 'MECCIO' },
    offers: {
      '@type': 'Offer',
      url: `${BASE_URL}/product/${product.slug}`,
      price: product.price,
      priceCurrency: 'USD',
      availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: { '@type': 'Organization', name: SITE_NAME },
    },
    ...(product.rating_count && product.rating_count > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: product.rating_avg,
            reviewCount: product.rating_count,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

export function BreadcrumbSchema({ items }: { items: { name: string; url: string }[] }) {
  const list = [{ name: 'Home', url: '/' }, ...items];
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: list.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url === '/' ? `${BASE_URL}/` : `${BASE_URL}${item.url}`,
    })),
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

export function FaqSchema({ faqs }: { faqs: { question: string; answer: string }[] }) {
  if (!faqs.length) return null;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer,
      },
    })),
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

export function CollectionSchema({
  name,
  description,
  url,
  image,
}: {
  name: string;
  description?: string;
  url: string;
  image?: string;
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    description: description || DEFAULT_DESC,
    url: `${BASE_URL}${url}`,
    ...(image ? { image: absolutize(image) } : {}),
    isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: BASE_URL },
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}
