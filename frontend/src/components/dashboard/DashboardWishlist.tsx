import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Heart, Loader2, Trash2 } from 'lucide-react';
import { wishlistApi } from '@/lib/api';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';

export default function DashboardWishlist() {
  const { formatProductPrice } = useCurrency();
  const { addToCart, removeFromWishlist } = useCart();

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
    <div className="bg-white border border-sand/40">
      <div className="p-4 sm:p-6 md:p-8 border-b border-sand/40 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl sm:text-2xl text-charcoal">My Wishlist</h2>
          <p className="text-xs sm:text-sm text-stone mt-1">
            {data?.length || 0} saved item{(data?.length || 0) === 1 ? '' : 's'}
          </p>
        </div>
        <Link to="/shop" className="btn-outline text-xs">Discover More</Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 size={28} className="animate-spin text-gold" />
        </div>
      ) : !data?.length ? (
        <div className="text-center py-12 sm:py-16 px-5">
          <Heart size={40} className="mx-auto mb-4 text-sand" />
          <p className="font-display text-lg sm:text-xl mb-3">Your wishlist is empty</p>
          <p className="text-stone text-sm mb-6">Save rugs you love and come back when you&apos;re ready.</p>
          <Link to="/shop" className="btn-primary">Explore Rugs</Link>
        </div>
      ) : (
        <div className="p-4 sm:p-6 md:p-8 grid grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-5 md:gap-6">
          {data.map((item: {
            id: number;
            product_id: number;
            slug: string;
            name: string;
            price: number;
            price_inr?: number;
            primary_image?: string;
          }) => (
            <div key={item.id} className="border border-sand/40 group">
              <Link to={`/product/${item.slug}`} className="block aspect-[4/5] overflow-hidden bg-ivory">
                <img
                  src={item.primary_image || ''}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </Link>
              <div className="p-3 sm:p-4">
                <Link to={`/product/${item.slug}`}>
                  <h3 className="font-display text-sm sm:text-lg hover:text-gold-dark transition-colors line-clamp-2">
                    {item.name}
                  </h3>
                </Link>
                <p className="font-medium text-sm sm:text-base mt-1.5 sm:mt-2 mb-3 sm:mb-4">
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
  );
}
