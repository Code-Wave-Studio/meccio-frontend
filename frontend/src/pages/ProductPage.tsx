import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Award,
  CheckCircle2,
  ChevronRight,
  Heart,
  Minus,
  Package,
  Plus,
  RotateCcw,
  Ruler,
  Shield,
  ShoppingBag,
  Sparkles,
  Star,
  Truck,
  X,
  ZoomIn,
} from 'lucide-react';
import SEO, { ProductSchema, BreadcrumbSchema } from '@/components/SEO';
import ProductCard from '@/components/ProductCard';
import { productApi, reviewApi } from '@/lib/api';
import { cn, getDiscountPercent, parseAmount } from '@/lib/utils';
import type { Product, ProductImage, ProductVariant, Review } from '@/types';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useCurrency } from '@/context/CurrencyContext';
import { parseSettingJson, useSiteSettings } from '@/hooks/useSiteSettings';
import toast from 'react-hot-toast';
import { getApiError } from '@/components/AuthLayout';

const productBadgeIconMap = {
  award: Award,
  heart: Heart,
  package: Package,
  return: RotateCcw,
  shield: Shield,
  truck: Truck,
};

const defaultProductTrustBadges = [
  { icon: 'truck', text: 'Free worldwide shipping' },
  { icon: 'shield', text: 'Authenticity guaranteed' },
  { icon: 'return', text: '30-day returns' },
] as const;

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<number | undefined>();
  const [zoomOpen, setZoomOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewContent, setReviewContent] = useState('');
  const [reviewName, setReviewName] = useState('');
  const [reviewEmail, setReviewEmail] = useState('');
  const { addToCart, addToWishlist, isLoading: isCartLoading } = useCart();
  const { user } = useAuth();
  const { formatProductPrice, isIndia } = useCurrency();
  const { data: settings = {} } = useSiteSettings();

  const { data: product, isLoading: isProductLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => productApi.get(slug!).then((r) => r.data.data),
    enabled: !!slug,
  });

  const reviewMutation = useMutation({
    mutationFn: () =>
      reviewApi.create({
        product_id: product!.id,
        rating: reviewRating,
        title: reviewTitle.trim(),
        content: reviewContent.trim(),
        author_name: user ? undefined : reviewName.trim(),
        author_email: user ? undefined : reviewEmail.trim(),
      }),
    onSuccess: () => {
      toast.success('Review submitted — pending approval');
      setReviewTitle('');
      setReviewContent('');
      setReviewRating(5);
      queryClient.invalidateQueries({ queryKey: ['product', slug] });
    },
    onError: (err) => toast.error(getApiError(err, 'Could not submit review')),
  });

  useEffect(() => {
    if (product?.variants?.length && selectedVariant === undefined) {
      setSelectedVariant(product.variants[0].id);
    }
  }, [product, selectedVariant]);

  if (isProductLoading) {
    return (
      <div className="container-luxury py-8 md:py-12">
        <div className="h-4 w-64 skeleton mb-8" />
        <div className="grid lg:grid-cols-[minmax(0,1.08fr)_minmax(380px,0.92fr)] gap-8 lg:gap-14">
          <div className="space-y-4">
            <div className="aspect-[4/5] md:aspect-square skeleton" />
            <div className="grid grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-square skeleton" />
              ))}
            </div>
          </div>
          <div className="space-y-5">
            <div className="h-3 w-24 skeleton" />
            <div className="h-12 w-full skeleton" />
            <div className="h-8 w-48 skeleton" />
            <div className="h-24 skeleton" />
            <div className="h-14 skeleton" />
            <div className="h-14 skeleton" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container-luxury py-32 text-center">
        <SEO title="Product Not Found" noindex />
        <h1 className="font-display text-3xl mb-4">Product Not Found</h1>
        <Link to="/shop" className="btn-primary">Continue Shopping</Link>
      </div>
    );
  }

  const images = product.images?.length ? product.images : [{ url: product.primary_image || '', alt_text: product.name }];
  const variant = product.variants?.find((v: ProductVariant) => v.id === selectedVariant);
  const priceUsd = parseAmount(product.price) + parseAmount(variant?.price_adjustment ?? 0);
  const priceInr = parseAmount(product.price_inr) + parseAmount(variant?.price_adjustment_inr ?? 0);
  const price = isIndia ? priceInr : priceUsd;
  const comparePrice = isIndia ? product.compare_price_inr : product.compare_price;
  const discount = comparePrice
    ? getDiscountPercent(price, comparePrice)
    : 0;
  const availableStock = variant?.stock_quantity ?? product.stock_quantity;
  const isOutOfStock = availableStock <= 0;
  const dimensionSummary = product.variants?.length
    ? product.variants.map((v: ProductVariant) => v.name).join(', ')
    : product.dimensions;
  const productTrustBadges = parseSettingJson<{ icon: keyof typeof productBadgeIconMap; text: string }[]>(
    settings.product_trust_badges,
    [...defaultProductTrustBadges],
  );

  const selectedImageData = images[selectedImage] ?? images[0];
  const selectedVariantPriceLabel = variant && (parseAmount(variant.price_adjustment_inr) > 0 || parseAmount(variant.price_adjustment) > 0)
    ? `+${formatProductPrice(variant.price_adjustment, variant.price_adjustment_inr)}`
    : null;

  const productHighlights = [
    product.material ? { label: 'Material', value: product.material, icon: Sparkles } : null,
    product.color ? { label: 'Color', value: product.color, icon: Award } : null,
    (variant?.name || dimensionSummary) ? { label: 'Size', value: variant?.name || dimensionSummary, icon: Ruler } : null,
  ].filter(Boolean) as { label: string; value: string; icon: typeof Sparkles }[];

  const handleAddToCart = async () => {
    await addToCart(product.id, selectedVariant, quantity);
  };

  const handleBuyNow = async () => {
    await addToCart(product.id, selectedVariant, quantity);
    navigate('/checkout');
  };

  return (
    <>
      <SEO
        title={product.meta_title || product.name}
        description={product.meta_description || product.short_description || product.description?.slice(0, 160)}
        image={images[0]?.url}
        url={`/product/${product.slug}`}
        type="product"
        keywords={`${product.name}, luxury rug, ${product.material || 'handcrafted'}, MECCIO RUGS`}
      />
      <ProductSchema product={{ ...product, primary_image: images[0]?.url, stock_quantity: availableStock }} />
      <BreadcrumbSchema items={[
        { name: 'Shop', url: '/shop' },
        ...(product.categories?.[0]
          ? [{ name: product.categories[0].name, url: `/shop?category=${product.categories[0].slug}` }]
          : []),
        { name: product.name, url: `/product/${product.slug}` },
      ]} />

      <div className="container-luxury pt-6 sm:pt-8 pb-16 md:pb-24">
        <div className="grid lg:grid-cols-[minmax(0,1.08fr)_minmax(390px,0.92fr)] gap-8 lg:gap-14 xl:gap-20">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="lg:sticky lg:top-28 lg:self-start"
          >
            <div className="relative overflow-hidden bg-ivory border border-sand/40 group">
              <div className="aspect-[4/5] sm:aspect-square">
                <img
                  src={selectedImageData?.url}
                  alt={selectedImageData?.alt_text || product.name}
                  className="w-full h-full object-cover cursor-zoom-in transition-transform duration-700 group-hover:scale-[1.03]"
                  onClick={() => setZoomOpen(true)}
                />
              </div>

              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                {product.is_new_arrival && (
                  <span className="bg-charcoal text-cream text-[11px] uppercase tracking-[0.14em] px-3 py-1.5">New Arrival</span>
                )}
                {product.is_best_seller && (
                  <span className="bg-gold text-espresso text-[11px] uppercase tracking-[0.14em] px-3 py-1.5">Best Seller</span>
                )}
                {discount > 0 && (
                  <span className="bg-white/90 backdrop-blur text-gold-dark text-[11px] uppercase tracking-[0.14em] px-3 py-1.5">
                    Save {discount}%
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => setZoomOpen(true)}
                className="nav-link absolute bottom-4 right-4 inline-flex items-center gap-2 bg-white/90 backdrop-blur px-4 py-2 text-xs uppercase tracking-[0.14em] text-charcoal opacity-0 group-hover:opacity-100 transition-all hover:bg-charcoal hover:text-cream"
                aria-label="Open product image zoom"
              >
                <ZoomIn size={15} /> View
              </button>
            </div>

            {images.length > 1 && (
              <div className="mt-4 grid grid-cols-4 sm:grid-cols-5 gap-3">
                {images.map((img: ProductImage, i: number) => (
                  <button
                    key={`${img.url}-${i}`}
                    type="button"
                    onClick={() => setSelectedImage(i)}
                    className={cn(
                      'relative aspect-square overflow-hidden border bg-ivory transition-all',
                      selectedImage === i ? 'border-charcoal ring-1 ring-charcoal' : 'border-sand/40 hover:border-gold/70',
                    )}
                    aria-label={`View product image ${i + 1}`}
                  >
                    <img src={img.url} alt={img.alt_text || product.name} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            <div className="mt-8 hidden lg:block bg-white border border-sand/40 p-6 xl:p-8">
              <p className="luxury-subheading mb-3">Product Story</p>
              <h2 className="font-display text-2xl xl:text-3xl text-charcoal mb-4">Details & Craft</h2>
              <div className="text-stone text-sm leading-relaxed whitespace-pre-line">
                {product.description || product.short_description || 'A thoughtfully crafted rug designed to bring texture, warmth, and timeless character to your space.'}
              </div>
            </div>
          </motion.div>

          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.08 }}
            className="lg:pt-2"
          >
            <div className="mb-5 flex flex-wrap items-center gap-2">
              {product.brand && <span className="luxury-subheading">{product.brand}</span>}
              {product.categories?.[0] && (
                <Link
                  to={`/shop?category=${product.categories[0].slug}`}
                  className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.12em] text-stone hover:text-gold-dark transition-colors"
                >
                  {product.categories[0].name} <ChevronRight size={13} />
                </Link>
              )}
            </div>

            <h1 className="font-display text-4xl md:text-5xl xl:text-6xl font-light text-charcoal leading-[1.02] mb-5">
              {product.name}
            </h1>

            <div className="flex flex-wrap items-center gap-4 mb-7">
              {product.rating_avg > 0 ? (
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={16} className={i < Math.round(product.rating_avg) ? 'fill-gold text-gold' : 'text-sand'} />
                    ))}
                  </div>
                  <span className="text-sm text-stone">{product.rating_avg} · {product.rating_count} reviews</span>
                </div>
              ) : (
                <span className="text-sm text-stone">No reviews yet</span>
              )}
              <span className={cn('inline-flex items-center gap-1.5 text-sm', isOutOfStock ? 'text-stone' : 'text-sage')}>
                <CheckCircle2 size={15} />
                {isOutOfStock ? 'Currently out of stock' : `${availableStock} available`}
              </span>
            </div>

            <div className="mb-7 flex flex-wrap items-end gap-3">
              <span className="font-display text-4xl text-charcoal">{formatProductPrice(priceUsd, priceInr)}</span>
              {(product.compare_price || product.compare_price_inr) && (
                <span className="pb-1 text-lg text-stone line-through">
                  {formatProductPrice(product.compare_price, product.compare_price_inr)}
                </span>
              )}
              {discount > 0 && (
                <span className="mb-1 bg-gold/15 text-gold-dark text-xs uppercase tracking-[0.12em] px-3 py-1.5">
                  {discount}% off
                </span>
              )}
            </div>

            {product.short_description && (
              <p className="text-stone leading-relaxed text-base md:text-lg mb-8 max-w-2xl">
                {product.short_description}
              </p>
            )}

            {productHighlights.length > 0 && (
              <div className="grid sm:grid-cols-3 gap-3 mb-8">
                {productHighlights.map(({ label, value, icon: Icon }) => (
                  <div key={label} className="p-4 bg-ivory/70 border border-sand/40">
                    <Icon size={17} className="text-gold-dark mb-2" />
                    <p className="text-[11px] uppercase tracking-[0.12em] text-stone mb-1">{label}</p>
                    <p className="text-sm text-charcoal font-medium line-clamp-2">{value}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="rounded-none border border-sand/50 bg-white p-5 md:p-6 shadow-sm">
              {product.variants && product.variants.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between gap-4 mb-3">
                    <p className="luxury-subheading">Select Size</p>
                    {selectedVariantPriceLabel && (
                      <span className="text-xs text-stone">{selectedVariantPriceLabel} for selected size</span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {product.variants.map((v: ProductVariant) => {
                      const isSelected = selectedVariant === v.id;
                      const adjustment = parseAmount(v.price_adjustment_inr) > 0 || parseAmount(v.price_adjustment) > 0
                        ? `+${formatProductPrice(v.price_adjustment, v.price_adjustment_inr)}`
                        : '';
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => setSelectedVariant(v.id)}
                          className={cn(
                            'nav-link border px-4 py-3 text-left transition-all',
                            isSelected
                              ? 'border-charcoal bg-charcoal text-cream'
                              : 'border-sand/60 bg-white hover:border-gold/70 hover:bg-ivory/70',
                          )}
                        >
                          <span className="block text-sm font-medium">{v.name}</span>
                          {adjustment && <span className={cn('mt-1 block text-xs', isSelected ? 'text-cream/70' : 'text-stone')}>{adjustment}</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="inline-flex w-fit items-center border border-sand/70 bg-ivory/40">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="nav-link p-4 hover:bg-white"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="min-w-[3.5rem] px-4 py-4 text-center font-medium">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(isOutOfStock ? quantity : Math.min(availableStock, quantity + 1))}
                    className="nav-link p-4 hover:bg-white"
                    aria-label="Increase quantity"
                    disabled={isOutOfStock || quantity >= availableStock}
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <p className="text-sm text-stone">
                  {isOutOfStock ? 'Notify us for availability' : 'Ready to ship from our curated rug collection.'}
                </p>
              </div>

              <div className="grid sm:grid-cols-[1fr_auto] gap-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="btn-primary justify-center"
                  disabled={isOutOfStock || isCartLoading}
                >
                  <ShoppingBag size={17} /> {isCartLoading ? 'Adding...' : 'Add to Cart'}
                </button>
                <button
                  type="button"
                  onClick={() => addToWishlist(product.id)}
                  className="btn-outline justify-center px-6"
                  aria-label="Add to wishlist"
                >
                  <Heart size={17} /> <span className="sm:hidden">Wishlist</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleBuyNow}
                className="mt-3 w-full border border-charcoal bg-charcoal/95 px-6 py-3.5 text-sm uppercase tracking-[0.14em] text-cream transition-colors hover:bg-espresso disabled:opacity-60"
                disabled={isOutOfStock || isCartLoading}
              >
                Buy Now
              </button>

              {!!product.etsy_enabled && product.etsy_url ? (
                <a
                  href={product.etsy_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 flex w-full items-center justify-center gap-2 border border-[#F1641E] bg-[#F1641E] px-6 py-3.5 text-sm uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#d95516]"
                >
                  Buy with Etsy
                </a>
              ) : null}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-8">
              {productTrustBadges.slice(0, 3).map(({ icon, text }) => {
                const Icon = productBadgeIconMap[icon] || Shield;
                return (
                  <div key={`${icon}-${text}`} className="flex items-center gap-3 border border-sand/40 bg-ivory/40 p-4">
                    <Icon size={19} className="text-gold-dark shrink-0" />
                    <p className="text-xs leading-relaxed text-stone">{text}</p>
                  </div>
                );
              })}
            </div>

            <div className="border-y border-sand/40 divide-y divide-sand/30 text-sm">
              <div className="flex justify-between gap-5 py-3.5">
                <span className="text-stone">SKU</span>
                <span className="text-right text-charcoal">{variant?.sku || product.sku}</span>
              </div>
              {product.material && (
                <div className="flex justify-between gap-5 py-3.5">
                  <span className="text-stone">Material</span>
                  <span className="text-right text-charcoal">{product.material}</span>
                </div>
              )}
              {product.color && (
                <div className="flex justify-between gap-5 py-3.5">
                  <span className="text-stone">Color</span>
                  <span className="text-right text-charcoal">{product.color}</span>
                </div>
              )}
              {dimensionSummary && (
                <div className="flex justify-between gap-5 py-3.5">
                  <span className="text-stone">Dimensions</span>
                  <span className="text-right text-charcoal">{variant?.name || dimensionSummary}</span>
                </div>
              )}
            </div>

            {(product.care_instructions || product.shipping_details) && (
              <div className="mt-8 hidden lg:grid gap-4">
                {product.care_instructions && (
                  <div className="bg-ivory border border-sand/40 p-5">
                    <h3 className="font-display text-lg mb-2">Care Instructions</h3>
                    <p className="text-stone text-sm leading-relaxed">{product.care_instructions}</p>
                  </div>
                )}
                {product.shipping_details && (
                  <div className="bg-charcoal text-cream p-5">
                    <h3 className="font-display text-lg mb-2">Shipping Details</h3>
                    <p className="text-cream/75 text-sm leading-relaxed">{product.shipping_details}</p>
                  </div>
                )}
              </div>
            )}
          </motion.section>
        </div>

        <section className="mt-12 md:mt-16 lg:hidden">
          <div className="bg-white border border-sand/40 p-6 md:p-8">
            <p className="luxury-subheading mb-3">Product Story</p>
            <h2 className="font-display text-3xl text-charcoal mb-5">Details & Craft</h2>
            <div className="text-stone leading-relaxed whitespace-pre-line">
              {product.description || product.short_description || 'A thoughtfully crafted rug designed to bring texture, warmth, and timeless character to your space.'}
            </div>
          </div>

          {(product.care_instructions || product.shipping_details) && (
            <div className="mt-6 grid gap-4">
              {product.care_instructions && (
                <div className="bg-ivory border border-sand/40 p-6">
                  <h3 className="font-display text-xl mb-3">Care Instructions</h3>
                  <p className="text-stone text-sm leading-relaxed">{product.care_instructions}</p>
                </div>
              )}
              {product.shipping_details && (
                <div className="bg-charcoal text-cream p-6">
                  <h3 className="font-display text-xl mb-3">Shipping Details</h3>
                  <p className="text-cream/75 text-sm leading-relaxed">{product.shipping_details}</p>
                </div>
              )}
            </div>
          )}
        </section>

        <section className="mt-16 md:mt-24">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <p className="luxury-subheading mb-2">Customer Notes</p>
                <h2 className="font-display text-3xl text-charcoal">Reviews</h2>
              </div>
            </div>

          {product.reviews && product.reviews.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4 mb-10">
              {product.reviews.map((review: Review) => (
                <article key={review.id} className="bg-white border border-sand/40 p-5 md:p-6">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="flex gap-0.5 mb-2">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <Star key={i} size={13} className="fill-gold text-gold" />
                        ))}
                      </div>
                      <p className="font-medium text-sm">{review.author_name}</p>
                    </div>
                    {review.is_verified && (
                      <span className="text-[11px] uppercase tracking-[0.12em] text-sage">Verified</span>
                    )}
                  </div>
                  {review.title && <p className="font-display text-lg mb-2 text-charcoal">{review.title}</p>}
                  <p className="text-stone text-sm leading-relaxed">{review.content}</p>
                </article>
              ))}
            </div>
          ) : (
            <p className="text-sm text-stone mb-8">No reviews yet — be the first to share your experience.</p>
          )}

          <div className="bg-white border border-sand/40 p-5 md:p-8 max-w-2xl">
            <h3 className="font-display text-xl md:text-2xl text-charcoal mb-2">Write a Review</h3>
            <p className="text-sm text-stone mb-6">Your review will appear after admin approval.</p>

            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (reviewContent.trim().length < 10) {
                  toast.error('Please write at least 10 characters');
                  return;
                }
                if (!user && !reviewName.trim()) {
                  toast.error('Please enter your name');
                  return;
                }
                reviewMutation.mutate();
              }}
            >
              <div>
                <p className="text-[11px] uppercase tracking-[0.14em] text-stone mb-2">Rating</p>
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => {
                    const value = i + 1;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setReviewRating(value)}
                        className="p-1"
                        aria-label={`${value} stars`}
                      >
                        <Star
                          size={22}
                          className={value <= reviewRating ? 'fill-gold text-gold' : 'text-sand'}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {!user && (
                <div className="grid sm:grid-cols-2 gap-3">
                  <input
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    placeholder="Your name *"
                    className="input-luxury"
                    required
                  />
                  <input
                    value={reviewEmail}
                    onChange={(e) => setReviewEmail(e.target.value)}
                    type="email"
                    placeholder="Email (optional)"
                    className="input-luxury"
                  />
                </div>
              )}

              <input
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                placeholder="Review title (optional)"
                className="input-luxury"
              />
              <textarea
                value={reviewContent}
                onChange={(e) => setReviewContent(e.target.value)}
                rows={4}
                placeholder="Share your experience with this rug (min. 10 characters) *"
                className="input-luxury resize-none"
                required
              />
              <button
                type="submit"
                disabled={reviewMutation.isPending}
                className="btn-primary disabled:opacity-60"
              >
                {reviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        </section>

        {product.related && product.related.length > 0 && (
          <section className="mt-16 md:mt-24">
            <div className="flex items-end justify-between gap-4 mb-8">
              <div>
                <p className="luxury-subheading mb-2">Curated for You</p>
                <h2 className="font-display text-3xl text-charcoal">You May Also Like</h2>
              </div>
              <Link to="/shop" className="hidden sm:inline-flex text-xs uppercase tracking-[0.14em] text-gold-dark hover:text-charcoal transition-colors">
                View All Rugs
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
              {product.related.map((p: Product) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>

      {zoomOpen && (
        <div
          className="fixed inset-0 z-[80] bg-espresso/95 flex items-center justify-center p-4"
          onClick={() => setZoomOpen(false)}
        >
          <button
            type="button"
            onClick={() => setZoomOpen(false)}
            className="nav-link absolute top-5 right-5 p-3 bg-white/10 text-cream hover:bg-white/20"
            aria-label="Close image preview"
          >
            <X size={20} />
          </button>
          <img
            src={selectedImageData?.url}
            alt={selectedImageData?.alt_text || product.name}
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}
    </>
  );
}
