import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCurrency } from '@/context/CurrencyContext';
import { useCart } from '@/context/CartContext';
import type { Product } from '@/types';

interface QuickViewProps {
  product: Product | null;
  onClose: () => void;
}

export default function QuickView({ product, onClose }: QuickViewProps) {
  const { addToCart } = useCart();
  const { formatProductPrice } = useCurrency();

  if (!product) return null;

  const handleAdd = async () => {
    await addToCart(product.id);
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[70] bg-espresso/60 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-cream max-w-4xl w-full grid md:grid-cols-2 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="aspect-square md:aspect-auto bg-ivory">
            <img
              src={product.primary_image || ''}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-8 md:p-12 flex flex-col justify-center">
            <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:text-gold md:hidden">
              <X size={24} />
            </button>
            {product.material && <p className="luxury-subheading mb-3">{product.material}</p>}
            <h2 className="font-display text-3xl mb-4">{product.name}</h2>
            <p className="text-stone text-sm leading-relaxed mb-6 line-clamp-3">
              {product.short_description}
            </p>
            <p className="text-2xl font-medium mb-8">{formatProductPrice(product.price, product.price_inr)}</p>
            <div className="flex gap-4">
              <button onClick={handleAdd} className="btn-primary flex-1">
                <ShoppingBag size={16} /> Add to Cart
              </button>
              <Link to={`/product/${product.slug}`} onClick={onClose} className="btn-outline flex-1 text-center">
                View Details
              </Link>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
