import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Heart, Loader2, Trash2 } from 'lucide-react';
import SEO from '@/components/SEO';
import { wishlistApi } from '@/lib/api';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';

export default function WishlistPage() {
  const { formatProductPrice } = useCurrency();
  const { removeFromWishlist, addToCart } = useCart();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => {
      try {
        const res = await wishlistApi.get();
        return res.data?.data ?? [];
      } catch {
        return [];
      }
    },
  });

  const handleRemove = async (productId: number) => {
    await removeFromWishlist(productId);
    refetch();
  };

  return (
    <>
      <SEO title="Wishlist" noindex />

      <div className="container-luxury py-6 sm:py-8 md:py-12 pb-16 sm:pb-20">
        <div className="mb-6 sm:mb-8 md:mb-10">
          <p className="luxury-subheading mb-2">Saved Pieces</p>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-charcoal">My Wishlist</h1>
            <p className="text-xs sm:text-sm text-stone">
              {data?.length || 0} {(data?.length || 0) === 1 ? 'item' : 'items'}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 size={28} className="animate-spin text-gold" />
          </div>
        ) : !data?.length ? (
          <div className="text-center py-14 sm:py-20 px-4 border border-sand/40 bg-white">
            <Heart size={40} className="mx-auto mb-5 text-sand" />
            <p className="font-display text-xl sm:text-2xl mb-3">Your wishlist is empty</p>
            <p className="text-stone text-sm mb-6 max-w-md mx-auto">
              Save rugs you love and come back when you&apos;re ready to order.
            </p>
            <Link to="/shop" className="btn-primary">Discover Rugs</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5 md:gap-6">
            {data.map((item: {
              id: number;
              product_id: number;
              slug: string;
              name: string;
              price: number;
              price_inr?: number;
              primary_image?: string;
            }) => (
              <div key={item.id} className="bg-white border border-sand/40 group">
                <Link to={`/product/${item.slug}`} className="block aspect-[4/5] overflow-hidden bg-ivory">
                  <img
                    src={item.primary_image || ''}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </Link>
                <div className="p-3 sm:p-4 md:p-5">
                  <Link to={`/product/${item.slug}`}>
                    <h3 className="font-display text-sm sm:text-lg md:text-xl mb-1.5 sm:mb-2 hover:text-gold-dark transition-colors line-clamp-2">
                      {item.name}
                    </h3>
                  </Link>
                  <p className="font-medium text-sm sm:text-base mb-3 sm:mb-4">
                    {formatProductPrice(item.price, item.price_inr)}
                  </p>
                  <div className="flex gap-1.5 sm:gap-2">
                    <button
                      type="button"
                      onClick={() => addToCart(item.product_id)}
                      className="btn-primary flex-1 text-[10px] sm:text-xs py-2 px-2"
                    >
                      Add to Cart
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemove(item.product_id)}
                      className="p-2 border border-sand hover:border-red-400 hover:text-red-500 transition-colors"
                      aria-label="Remove from wishlist"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
