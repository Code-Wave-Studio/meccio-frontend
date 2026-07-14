import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Globe, Minus, Plus, Shield, ShoppingBag, Trash2, Truck } from 'lucide-react';
import SEO from '@/components/SEO';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { cn } from '@/lib/utils';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart } = useCart();
  const { formatProductPrice, formatMoney, isIndia } = useCurrency();
  const items = cart?.items || [];
  const subtotal = isIndia ? (cart?.subtotal_inr ?? 0) : (cart?.subtotal || 0);
  const shipping = 0;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  return (
    <>
      <SEO title="Shopping Cart" noindex />

      <div className="container-luxury py-6 sm:py-8 md:py-10 pb-20 sm:pb-24">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6 sm:mb-8 md:mb-10">
          <div>
            <p className="luxury-subheading mb-2">Your Selection</p>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-charcoal">Shopping Cart</h1>
          </div>
          <p className="text-xs sm:text-sm text-stone">
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </p>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-14 sm:py-20 md:py-24 px-4 border border-sand/40 bg-white">
            <ShoppingBag size={40} className="mx-auto mb-5 text-sand" />
            <p className="font-display text-xl sm:text-2xl mb-3">Your cart is empty</p>
            <p className="text-stone text-sm mb-6 sm:mb-8 max-w-md mx-auto">
              Discover handcrafted rugs curated for luxury living spaces worldwide.
            </p>
            <Link to="/shop" className="btn-primary">Continue Shopping</Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px] gap-5 sm:gap-6 lg:gap-8 xl:gap-12">
            <div className="space-y-3 sm:space-y-4">
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="bg-white border border-sand/40 p-3.5 sm:p-5 md:p-6"
                >
                  <div className="grid grid-cols-[88px_1fr] sm:grid-cols-[110px_1fr_auto] md:grid-cols-[120px_1fr_auto] gap-3 sm:gap-5">
                    <Link
                      to={`/product/${item.slug}`}
                      className="aspect-[4/5] sm:aspect-square overflow-hidden bg-ivory shrink-0"
                    >
                      <img
                        src={item.image || ''}
                        alt={item.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                    </Link>

                    <div className="min-w-0 flex flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <Link to={`/product/${item.slug}`} className="min-w-0">
                          <h3 className="font-display text-base sm:text-xl hover:text-gold-dark transition-colors line-clamp-2">
                            {item.name}
                          </h3>
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="sm:hidden p-1.5 text-stone hover:text-red-600 transition-colors shrink-0"
                          aria-label="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {item.variant_name && (
                        <p className="text-xs sm:text-sm text-stone mt-1">Size: {item.variant_name}</p>
                      )}
                      <p className="text-[10px] sm:text-xs text-stone mt-1 uppercase tracking-[0.1em]">
                        SKU: {item.sku}
                      </p>
                      <p className="font-medium text-sm sm:text-base mt-2 sm:mt-4">
                        {formatProductPrice(item.unit_price, item.unit_price_inr)}
                      </p>

                      {/* Mobile qty + line total */}
                      <div className="sm:hidden flex items-center justify-between gap-3 mt-3 pt-3 border-t border-sand/30">
                        <div className="inline-flex items-center border border-sand/70 bg-ivory/40">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            className="p-2.5 hover:bg-white"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="min-w-[2rem] text-center text-sm font-medium">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-2.5 hover:bg-white"
                            aria-label="Increase quantity"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <p className="font-medium text-sm">
                          {formatProductPrice(item.line_total, item.line_total_inr)}
                        </p>
                      </div>
                    </div>

                    {/* Desktop controls */}
                    <div className="hidden sm:flex flex-col items-end justify-between gap-4">
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="text-stone hover:text-red-600 transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 size={18} />
                      </button>

                      <div className="inline-flex items-center border border-sand/70 bg-ivory/40">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          className="p-3 hover:bg-white"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="min-w-[2.5rem] text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-3 hover:bg-white"
                          aria-label="Increase quantity"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <p className="font-medium">
                        {formatProductPrice(item.line_total, item.line_total_inr)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <aside className="lg:sticky lg:top-28 lg:self-start">
              <div className="bg-white border border-sand/40 p-4 sm:p-6 md:p-8 shadow-sm">
                <h2 className="font-display text-xl sm:text-2xl mb-4 sm:mb-6">Order Summary</h2>

                <div className="space-y-3 text-sm mb-5 sm:mb-6">
                  <div className="flex justify-between">
                    <span className="text-stone">Subtotal</span>
                    <span>{formatMoney(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone">Shipping</span>
                    <span className="text-sage font-medium">Free Worldwide</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone">Estimated Tax</span>
                    <span>{formatMoney(tax)}</span>
                  </div>
                  <div className="flex justify-between pt-4 border-t border-sand/50 text-base sm:text-lg font-medium">
                    <span>Total</span>
                    <span>{formatMoney(total)}</span>
                  </div>
                </div>

                <div className="grid gap-2.5 sm:gap-3 mb-5 sm:mb-6">
                  <div className="flex items-start gap-3 p-3 bg-ivory/60 border border-sand/30 text-xs text-stone">
                    <Truck size={16} className="text-gold-dark shrink-0 mt-0.5" />
                    Complimentary worldwide shipping on every order.
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-ivory/60 border border-sand/30 text-xs text-stone">
                    <Shield size={16} className="text-gold-dark shrink-0 mt-0.5" />
                    Secure checkout with authenticity guaranteed.
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-ivory/60 border border-sand/30 text-xs text-stone">
                    <Globe size={16} className="text-gold-dark shrink-0 mt-0.5" />
                    We deliver to customers across the globe.
                  </div>
                </div>

                <Link to="/checkout" className={cn('btn-primary w-full justify-center text-sm')}>
                  Proceed to Checkout <ArrowRight size={16} />
                </Link>
                <Link
                  to="/shop"
                  className="block text-center text-xs sm:text-sm text-stone mt-4 hover:text-gold-dark transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            </aside>
          </div>
        )}
      </div>
    </>
  );
}
