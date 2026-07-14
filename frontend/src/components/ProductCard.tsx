import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, Star } from 'lucide-react';
import { getDiscountPercent, cn } from '@/lib/utils';
import type { Product } from '@/types';
import { useCurrency } from '@/context/CurrencyContext';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
  onAddToWishlist?: (productId: number) => void;
  className?: string;
}

export default function ProductCard({ product, onQuickView, onAddToWishlist, className }: ProductCardProps) {
  const { formatProductPrice, productAmount } = useCurrency();
  const price = productAmount(product.price, product.price_inr);
  const comparePrice = productAmount(product.compare_price, product.compare_price_inr);
  const discount = comparePrice > price ? getDiscountPercent(price, comparePrice) : 0;

  return (
    <motion.article
      className={cn('group relative luxury-card', className)}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-ivory">
        <Link to={`/product/${product.slug}`}>
          <img
            src={product.primary_image || 'https://images.unsplash.com/photo-1600166898405-da9535204843?w=600'}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </Link>

        {discount > 0 && (
          <span className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-gold text-espresso text-[10px] sm:text-xs uppercase tracking-wider px-2 sm:px-3 py-0.5 sm:py-1">
            -{discount}%
          </span>
        )}
        {product.is_new_arrival && (
          <span className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-charcoal text-cream text-[10px] sm:text-xs uppercase tracking-wider px-2 sm:px-3 py-0.5 sm:py-1">
            New
          </span>
        )}

        <div className="absolute inset-x-0 bottom-0 p-2 sm:p-4 flex gap-2 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
          {onQuickView && (
            <button
              onClick={() => onQuickView(product)}
              className="flex-1 py-2 sm:py-2.5 bg-white/90 backdrop-blur text-charcoal text-[10px] sm:text-xs uppercase tracking-wider hover:bg-charcoal hover:text-cream transition-colors"
            >
              Quick View
            </button>
          )}
          {onAddToWishlist && (
            <button
              onClick={() => onAddToWishlist(product.id)}
              className="p-2 sm:p-2.5 bg-white/90 backdrop-blur text-charcoal hover:bg-charcoal hover:text-cream transition-colors"
              aria-label="Add to wishlist"
            >
              <Heart size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="p-3 sm:p-5">
        {product.material && (
          <p className="luxury-subheading mb-1.5 sm:mb-2 text-[10px] sm:text-xs">{product.material}</p>
        )}
        <Link to={`/product/${product.slug}`}>
          <h3 className="font-display text-base sm:text-xl text-charcoal mb-1.5 sm:mb-2 line-clamp-2 group-hover:text-gold-dark transition-colors duration-300">
            {product.name}
          </h3>
        </Link>

        {product.rating_avg > 0 && (
          <div className="flex items-center gap-1 mb-2 sm:mb-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={12}
                className={i < Math.round(product.rating_avg) ? 'fill-gold text-gold' : 'text-sand'}
              />
            ))}
            <span className="text-xs text-stone ml-1">({product.rating_count})</span>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span className="text-sm sm:text-lg font-medium text-charcoal">{formatProductPrice(product.price, product.price_inr)}</span>
          {(product.compare_price || product.compare_price_inr) && (
            <span className="text-xs sm:text-sm text-stone line-through">{formatProductPrice(product.compare_price, product.compare_price_inr)}</span>
          )}
        </div>
      </div>
    </motion.article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="luxury-card">
      <div className="aspect-[4/5] skeleton" />
      <div className="p-5 space-y-3">
        <div className="h-3 w-20 skeleton" />
        <div className="h-6 w-full skeleton" />
        <div className="h-4 w-24 skeleton" />
      </div>
    </div>
  );
}
