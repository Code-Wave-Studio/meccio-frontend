import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { productApi } from '@/lib/api';
import { useCurrency } from '@/context/CurrencyContext';
import type { Product } from '@/types';

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

export default function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const { formatProductPrice } = useCurrency();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setResults([]);
    }
  }, [open]);

  useEffect(() => {
    const search = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const res = await productApi.list({ search: query, per_page: 6 });
        setResults(res.data.data?.items || []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    };
    const debounce = setTimeout(search, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    if (open) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] bg-espresso/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="bg-cream max-w-3xl mx-auto mt-20 p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-4 border-b border-sand pb-4 mb-6">
              <Search size={24} className="text-stone" />
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search luxury rugs..."
                className="flex-1 bg-transparent text-xl font-display text-charcoal placeholder:text-stone/50 focus:outline-none"
              />
              <button onClick={onClose} className="p-2 hover:text-gold transition-colors">
                <X size={24} />
              </button>
            </div>

            {loading && <p className="text-stone text-sm">Searching...</p>}

            {results.length > 0 && (
              <div className="space-y-4">
                {results.map((product) => (
                  <Link
                    key={product.id}
                    to={`/product/${product.slug}`}
                    onClick={onClose}
                    className="flex items-center gap-4 p-3 hover:bg-ivory transition-colors group"
                  >
                    <img
                      src={product.primary_image || ''}
                      alt={product.name}
                      className="w-16 h-20 object-cover"
                    />
                    <div>
                      <h4 className="font-display text-lg group-hover:text-gold-dark transition-colors">{product.name}</h4>
                      <p className="text-sm text-stone">{formatProductPrice(product.price, product.price_inr)}</p>
                    </div>
                  </Link>
                ))}
                <Link
                  to={`/shop?search=${query}`}
                  onClick={onClose}
                  className="block text-center text-sm uppercase tracking-wider text-gold-dark hover:text-gold pt-4"
                >
                  View all results
                </Link>
              </div>
            )}

            {query.length >= 2 && !loading && results.length === 0 && (
              <p className="text-stone text-center py-8">No products found for "{query}"</p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
