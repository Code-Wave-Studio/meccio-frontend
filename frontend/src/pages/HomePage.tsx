import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Star } from 'lucide-react';
import { useState } from 'react';
import SEO from '@/components/SEO';
import ProductCard from '@/components/ProductCard';
import QuickView from '@/components/QuickView';
import HomeHero from '@/components/HomeHero';
import CategoryShowcase from '@/components/CategoryShowcase';
import WhyChooseUs from '@/components/WhyChooseUs';
import { contentApi } from '@/lib/api';
import { useCart } from '@/context/CartContext';
import { usePageImages } from '@/hooks/usePageImages';
import type { Collection, Testimonial, Product, HomepageData } from '@/types';

const EMPTY_HOMEPAGE: HomepageData = {
  featured_products: [],
  new_arrivals: [],
  collections: [],
  categories: [],
  testimonials: [],
};

export default function HomePage() {
  const { data, isLoading } = useQuery({
    queryKey: ['homepage'],
    queryFn: async (): Promise<HomepageData> => {
      try {
        const res = await contentApi.homepage();
        return res.data?.data ?? EMPTY_HOMEPAGE;
      } catch {
        return EMPTY_HOMEPAGE;
      }
    },
  });
  const { addToWishlist } = useCart();
  const [quickView, setQuickView] = useState<Product | null>(null);
  const { homeLuxuryImage, homeCraftImage } = usePageImages();

  const collections = (data?.collections || []).slice(0, 6);
  const featured = (data?.featured_products || []).slice(0, 8);
  const newArrivals = (data?.new_arrivals || []).slice(0, 8);
  const categories = (data?.categories || []).slice(0, 6);

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <SEO />

      <HomeHero />

      {/* Shop by Collection — max 6 */}
      <section className="py-14 sm:py-20 md:py-24 bg-ivory">
        <div className="container-luxury">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-10 sm:mb-14 md:mb-16">
            <div>
              <p className="luxury-subheading mb-2 sm:mb-3">Curated Collections</p>
              <h2 className="luxury-heading text-3xl sm:text-4xl md:text-5xl">Shop by Collection</h2>
            </div>
            <Link
              to="/collections"
              className="inline-flex items-center gap-2 text-sm uppercase tracking-wider hover:text-gold-dark transition-colors"
            >
              View All <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
            {collections.map((col: Collection, i: number) => (
              <motion.div
                key={col.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: Math.min(i * 0.08, 0.4) }}
              >
                <Link to={`/collections/${col.slug}`} className="group block relative aspect-[4/3] overflow-hidden bg-cream">
                  <img
                    src={col.image || ''}
                    alt={col.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-espresso/80 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 md:p-8">
                    <h3 className="font-display text-xl sm:text-2xl text-cream mb-1 sm:mb-2">{col.name}</h3>
                    {col.description && (
                      <p className="text-cream/70 text-sm line-clamp-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-500">
                        {col.description}
                      </p>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products — max 8 */}
      <section className="py-14 sm:py-20 md:py-24">
        <div className="container-luxury">
          <div className="text-center mb-10 sm:mb-14 md:mb-16">
            <p className="luxury-subheading mb-2 sm:mb-3">Handpicked Excellence</p>
            <h2 className="luxury-heading text-3xl sm:text-4xl md:text-5xl">Featured Products</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 md:gap-6 lg:gap-8">
            {(isLoading ? Array(8).fill(null) : featured).map((product: Product | null, i: number) =>
              product ? (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={setQuickView}
                  onAddToWishlist={addToWishlist}
                />
              ) : (
                <div key={i} className="aspect-[4/5] skeleton" />
              ),
            )}
          </div>
          <div className="text-center mt-10 sm:mt-12">
            <Link to="/shop" className="btn-outline">View All Products</Link>
          </div>
        </div>
      </section>

      {homeLuxuryImage && (
        <section className="relative py-20 sm:py-28 md:py-32 overflow-hidden">
          <img
            src={homeLuxuryImage}
            alt="Luxury rug craftsmanship"
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-espresso/60" />
          <div className="container-luxury relative z-10 text-center px-4">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <p className="luxury-subheading text-gold mb-3 sm:mb-4">The Luxury Collection</p>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-cream font-light mb-4 sm:mb-6">
                Unparalleled Craftsmanship
              </h2>
              <p className="text-cream/70 max-w-xl mx-auto mb-8 sm:mb-10 text-sm sm:text-base px-2">
                Each piece in our Luxury Collection represents hundreds of hours of artisan work,
                using the finest silks and wools from around the world.
              </p>
              <Link to="/collections/luxury-collection" className="btn-gold">Discover Luxury</Link>
            </motion.div>
          </div>
        </section>
      )}

      <CategoryShowcase categories={categories} />

      {/* New Arrivals — max 8 */}
      <section className="py-14 sm:py-20 md:py-24">
        <div className="container-luxury">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-10 sm:mb-14 md:mb-16">
            <div>
              <p className="luxury-subheading mb-2 sm:mb-3">Just Arrived</p>
              <h2 className="luxury-heading text-3xl sm:text-4xl md:text-5xl">New Arrivals</h2>
            </div>
            <Link
              to="/new-arrivals"
              className="inline-flex items-center gap-2 text-sm uppercase tracking-wider hover:text-gold-dark transition-colors"
            >
              View All <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 md:gap-6 lg:gap-8">
            {newArrivals.map((product: Product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={setQuickView}
                onAddToWishlist={addToWishlist}
              />
            ))}
          </div>
        </div>
      </section>

      <WhyChooseUs />

      {/* Our Process */}
      <section className="relative py-16 sm:py-20 md:py-28 overflow-hidden bg-gradient-to-b from-ivory via-cream to-ivory" id="craftsmanship">
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[min(90vw,720px)] h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

        <div className="container-luxury">
          <div className="grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] gap-12 lg:gap-16 xl:gap-20 items-center">
            {/* Copy + steps */}
            <div>
              <div className="mb-8 sm:mb-10">
                <div className="flex items-center gap-4 mb-3">
                  <span className="h-px w-10 bg-gold" />
                  <p className="luxury-subheading mb-0">Our Process</p>
                </div>
                <h2 className="luxury-heading text-3xl sm:text-4xl md:text-5xl mb-4">
                  The Art of Craftsmanship
                </h2>
                <p className="text-stone text-sm sm:text-base leading-relaxed max-w-lg">
                  From raw fiber to finished heirloom — every MECCIO rug follows a meticulous four-stage process shaped by master artisans.
                </p>
              </div>

              <div className="relative space-y-0">
                <div className="absolute left-[15px] sm:left-[17px] top-3 bottom-3 w-px bg-gradient-to-b from-gold via-gold/40 to-transparent" aria-hidden="true" />

                {[
                  { step: '01', title: 'Material Selection', desc: 'Hand-selected premium wools and silks from the finest sources worldwide.' },
                  { step: '02', title: 'Design & Planning', desc: 'Patterns that blend tradition with contemporary aesthetics for modern interiors.' },
                  { step: '03', title: 'Hand-Knotting', desc: 'Master weavers tie every knot by hand, building intricate detail over months.' },
                  { step: '04', title: 'Finishing & Quality', desc: 'Rigorous inspection ensures lasting beauty before each piece leaves our loft.' },
                ].map((item) => (
                  <div
                    key={item.step}
                    className="relative flex gap-4 sm:gap-5 pl-0 py-4 sm:py-5 group"
                  >
                    <div className="relative z-10 shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-charcoal text-gold border border-gold/30 flex items-center justify-center font-display text-xs sm:text-sm group-hover:bg-gold group-hover:text-espresso transition-colors duration-300">
                      {item.step}
                    </div>
                    <div className="min-w-0 pt-0.5 pb-1 border-b border-sand/40 group-last:border-0 flex-1">
                      <h4 className="font-display text-lg sm:text-xl text-charcoal mb-1.5 group-hover:text-gold-dark transition-colors duration-300">
                        {item.title}
                      </h4>
                      <p className="text-stone text-sm leading-relaxed max-w-md">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 sm:mt-10 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.14em] text-stone">
                <CheckCircle2 size={16} className="text-gold" />
                <span>Quality checked at every stage</span>
              </div>
            </div>

            {/* Image composition */}
            {homeCraftImage && (
              <div className="relative flex justify-center lg:justify-end">
                <div className="relative w-full max-w-[280px] sm:max-w-[300px] md:max-w-[320px]">
                  <div
                    className="pointer-events-none absolute -inset-10 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(196,169,98,0.18),transparent_70%)] blur-2xl"
                    aria-hidden="true"
                  />
                  <div className="pointer-events-none absolute -left-3 top-8 bottom-8 w-px bg-gradient-to-b from-transparent via-gold to-transparent" aria-hidden="true" />
                  <div className="pointer-events-none absolute left-8 -top-3 right-8 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent" aria-hidden="true" />

                  <figure className="group relative">
                    <div className="relative overflow-hidden bg-espresso aspect-[5/6] max-h-[380px] sm:max-h-[400px]">
                      <img
                        src={homeCraftImage}
                        alt="Rug craftsmanship process"
                        loading="eager"
                        decoding="async"
                        fetchPriority="low"
                        className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-espresso/40 via-transparent to-espresso/10" />
                      <div className="absolute inset-0 ring-1 ring-inset ring-white/15" />
                    </div>

                    <figcaption className="mt-5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="h-px w-6 sm:w-8 bg-gold shrink-0" />
                        <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-stone truncate">
                          Handcrafted process
                        </span>
                      </div>
                      <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.18em] text-charcoal/50 shrink-0">
                        01 — 04
                      </span>
                    </figcaption>
                  </figure>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-14 sm:py-20 md:py-24 bg-ivory">
        <div className="container-luxury">
          <div className="text-center mb-10 sm:mb-14 md:mb-16">
            <p className="luxury-subheading mb-2 sm:mb-3">Client Stories</p>
            <h2 className="luxury-heading text-3xl sm:text-4xl md:text-5xl">What Our Clients Say</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {(data?.testimonials || []).map((t: Testimonial) => (
              <div key={t.id} className="glass-card p-6 sm:p-8">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={14} className="fill-gold text-gold" />
                  ))}
                </div>
                <p className="text-charcoal/80 text-sm leading-relaxed mb-6 italic">"{t.content}"</p>
                <div>
                  <p className="font-medium text-sm">{t.author_name}</p>
                  <p className="text-xs text-stone">
                    {t.author_title}
                    {t.author_location && ` · ${t.author_location}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10 sm:mt-12">
            <Link to="/testimonials" className="btn-outline">Read More Reviews</Link>
          </div>
        </div>
      </section>

      {quickView && <QuickView product={quickView} onClose={() => setQuickView(null)} />}
    </div>
  );
}
