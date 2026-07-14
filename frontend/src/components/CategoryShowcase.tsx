import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import type { Category } from '@/types';

interface CategoryShowcaseProps {
  categories?: Category[];
}

const placeholders = [
  'https://images.unsplash.com/photo-1600166898405-da9535204843?w=600',
  'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=600',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600',
  'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=600',
  'https://images.unsplash.com/photo-1608724552908-e1c141f631ac?w=600',
  'https://images.unsplash.com/photo-1600166898405-da9535204843?w=600&sig=2',
];

export default function CategoryShowcase({ categories = [] }: CategoryShowcaseProps) {
  const items = categories.slice(0, 6);
  if (!items.length) return null;

  return (
    <section className="py-14 sm:py-20 md:py-28 bg-cream overflow-hidden">
      <div className="container-luxury">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 sm:gap-6 mb-10 sm:mb-12 md:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-4 mb-3 sm:mb-4">
              <span className="h-px w-10 bg-gold" />
              <p className="luxury-subheading mb-0">Every Room</p>
            </div>
            <h2 className="luxury-heading text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem]">Shop by Category</h2>
            <p className="text-stone mt-3 sm:mt-4 max-w-lg text-sm md:text-base leading-relaxed">
              Find the perfect rug for living rooms, bedrooms, dining spaces, and more.
            </p>
          </motion.div>

          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.15em] text-charcoal hover:text-gold-dark transition-colors shrink-0 group"
          >
            View All Categories
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Mobile: horizontal snap */}
        <div className="md:hidden -mx-4 px-4 overflow-hidden">
          <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 scrollbar-hide">
            {items.map((cat, i) => (
              <CategoryCard
                key={cat.id}
                category={cat}
                index={i}
                className="min-w-[72%] xs:min-w-[68%] max-w-[72%] shrink-0 snap-center"
              />
            ))}
          </div>
        </div>

        {/* Tablet & desktop: max 6 in grid */}
        <div className="hidden md:grid md:grid-cols-3 xl:grid-cols-6 gap-4 lg:gap-5">
          {items.map((cat, i) => (
            <CategoryCard key={cat.id} category={cat} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CategoryCard({
  category,
  index,
  className = '',
}: {
  category: Category;
  index: number;
  className?: string;
}) {
  const image = category.image || placeholders[index % placeholders.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55, delay: Math.min(index * 0.08, 0.4) }}
      className={className}
    >
      <Link
        to={`/shop?category=${category.slug}`}
        className="group relative block aspect-[3/4] overflow-hidden bg-ivory"
      >
        <img
          src={image}
          alt={category.name}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-110"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-espresso/95 via-espresso/35 to-espresso/10 transition-opacity duration-500 group-hover:via-espresso/45" />

        <div className="absolute inset-x-0 top-0 p-3 sm:p-4 flex justify-end">
          <span className="text-[10px] uppercase tracking-[0.2em] text-cream/80 bg-espresso/40 backdrop-blur-sm px-2.5 py-1 border border-cream/10">
            {String(index + 1).padStart(2, '0')}
          </span>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 lg:p-6">
          <h3 className="font-display text-lg sm:text-xl lg:text-2xl text-cream leading-tight mb-2 group-hover:text-gold-light transition-colors duration-300">
            {category.name}
          </h3>

          {category.description && (
            <p className="text-cream/65 text-xs leading-relaxed line-clamp-2 mb-3 hidden sm:block opacity-0 max-h-0 group-hover:opacity-100 group-hover:max-h-12 transition-all duration-500">
              {category.description}
            </p>
          )}

          <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-gold-light font-medium">
            <span className="h-px w-0 bg-gold-light transition-all duration-500 group-hover:w-6" />
            Shop Now
            <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
