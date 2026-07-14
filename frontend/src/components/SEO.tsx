import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  noindex?: boolean;
}

const SITE_NAME = 'MECCIO';
const DEFAULT_DESC = 'Luxury handcrafted carpets and rugs for discerning homes, hotels, and commercial spaces. Premium wool, silk, and Persian collections shipped worldwide.';
const BASE_URL = import.meta.env.VITE_SITE_URL || 'https://meccio.com';

export default function SEO({
  title,
  description = DEFAULT_DESC,
  image = '/og-image.jpg',
  url,
  type = 'website',
  noindex = false,
}: SEOProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | Luxury Carpets & Rugs`;
  const canonical = url ? `${BASE_URL}${url}` : BASE_URL;
  const ogImage = image.startsWith('http') ? image : `${BASE_URL}${image}`;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: BASE_URL,
    logo: `${BASE_URL}/favicon.svg`,
    description: DEFAULT_DESC,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-888-633-2466',
      contactType: 'customer service',
      availableLanguage: ['English'],
    },
    sameAs: [],
  };

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noindex && <meta name="robots" content="noindex,nofollow" />}
      <link rel="canonical" href={canonical} />

      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={canonical} />
      <meta property="og:site_name" content={SITE_NAME} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

export function ProductSchema({ product }: { product: { name: string; description?: string; price: number; sku: string; rating_avg?: number; rating_count?: number; primary_image?: string; slug: string } }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    sku: product.sku,
    image: product.primary_image,
    url: `${BASE_URL}/product/${product.slug}`,
    brand: { '@type': 'Brand', name: 'MECCIO' },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    ...(product.rating_count && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.rating_avg,
        reviewCount: product.rating_count,
      },
    }),
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

export function BreadcrumbSchema({ items }: { items: { name: string; url: string }[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${BASE_URL}${item.url}`,
    })),
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}
