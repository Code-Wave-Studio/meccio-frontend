import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import SEO from '@/components/SEO';
import ShopPage from './ShopPage';
import { collectionApi } from '@/lib/api';
import { COLLECTIONS, slugToTitle } from '@/lib/utils';
import { usePageImages } from '@/hooks/usePageImages';
import type { Collection } from '@/types';

export function CollectionsPage() {
  const { data: collections } = useQuery({
    queryKey: ['collections'],
    queryFn: () => collectionApi.list().then((r) => r.data.data),
  });

  return (
    <>
      <SEO
        title="Collections"
        description="Explore MECCIO luxury rug collections — Luxury, Modern, Persian, Handmade, Wool, and Silk handcrafted carpets."
        keywords="rug collections, Persian rugs, silk rugs, wool rugs, luxury carpets, MECCIO"
      />
      <div className="container-luxury py-8 sm:py-12">
        <h1 className="luxury-heading text-3xl sm:text-4xl md:text-5xl mb-4">Our Collections</h1>
        <p className="text-stone text-sm sm:text-base max-w-2xl mb-10 sm:mb-16">Each collection tells a unique story of craftsmanship, material, and design philosophy.</p>

        <div className="grid md:grid-cols-2 gap-8">
          {(collections || COLLECTIONS.map((c, i) => ({ ...c, id: i, image: '' }))).map((col: Collection, i: number) => (
            <motion.div
              key={col.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link to={`/collections/${col.slug}`} className="group block relative aspect-[16/9] overflow-hidden">
                <img
                  src={col.image || `https://images.unsplash.com/photo-1600166898405-da9535204843?w=800&sig=${i}`}
                  alt={col.name}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-espresso/80 via-espresso/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <h2 className="font-display text-3xl text-cream mb-2">{col.name}</h2>
                  <p className="text-cream/70 text-sm">{col.description}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </>
  );
}

export function CollectionDetailPage({ slug }: { slug: string }) {
  const { collectionHeroImage } = usePageImages();
  const collection = COLLECTIONS.find((c) => c.slug === slug) || { slug, name: slugToTitle(slug), description: '' };

  return (
    <>
      <SEO title={collection.name} description={collection.description} />
      <div className="relative h-[50vh] overflow-hidden">
        <img src={collectionHeroImage} alt={collection.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-espresso/50 flex items-center justify-center">
          <div className="text-center">
            <p className="luxury-subheading text-gold-light mb-4">Collection</p>
            <h1 className="font-display text-5xl md:text-6xl text-cream">{collection.name}</h1>
          </div>
        </div>
      </div>
      <ShopPage title={collection.name} defaultFilters={{ collection: slug }} seoDescription={collection.description} />
    </>
  );
}
