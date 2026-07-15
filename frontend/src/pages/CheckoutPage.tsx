import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  CreditCard,
  Globe,
  Loader2,
  Lock,
  MapPin,
  Package,
  Shield,
  Truck,
  User,
} from 'lucide-react';
import SEO from '@/components/SEO';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { addressApi, orderApi, paymentApi } from '@/lib/api';
import { useCurrency } from '@/context/CurrencyContext';
import { COUNTRIES } from '@/lib/countries';
import { cn } from '@/lib/utils';
import type { SavedAddress } from '@/types';
import toast from 'react-hot-toast';

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

interface CheckoutForm {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  notes: string;
}

const STEPS = ['Contact', 'Shipping', 'Payment'];

export default function CheckoutPage() {
  const { cart, refreshCart } = useCart();
  const { formatProductPrice, formatMoney, isIndia, currency } = useCurrency();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<CheckoutForm>({
    defaultValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      postal_code: '',
      country: isIndia ? 'IN' : 'US',
      notes: '',
    },
  });

  const { data: savedAddresses = [] } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => addressApi.list().then((r) => r.data.data as SavedAddress[]),
    enabled: !!user,
  });

  const [selectedAddressId, setSelectedAddressId] = useState<number | 'manual' | null>(null);
  const [addressPrefillDone, setAddressPrefillDone] = useState(false);

  useEffect(() => {
    if (!user || addressPrefillDone || !savedAddresses.length) return;
    const primary = savedAddresses.find((a) => a.is_default) || savedAddresses[0];
    if (!primary) return;
    setSelectedAddressId(primary.id);
    setValue('first_name', primary.first_name || user.first_name || '');
    setValue('last_name', primary.last_name || user.last_name || '');
    setValue('phone', primary.phone || user.phone || '');
    setValue('address_line1', primary.address_line1 || '');
    setValue('address_line2', primary.address_line2 || '');
    setValue('city', primary.city || '');
    setValue('state', primary.state || '');
    setValue('postal_code', primary.postal_code || '');
    setValue('country', primary.country || (isIndia ? 'IN' : 'US'));
    setAddressPrefillDone(true);
  }, [user, savedAddresses, addressPrefillDone, setValue, isIndia]);

  const applySavedAddress = (address: SavedAddress) => {
    setSelectedAddressId(address.id);
    setValue('first_name', address.first_name);
    setValue('last_name', address.last_name);
    setValue('phone', address.phone || user?.phone || '');
    setValue('address_line1', address.address_line1);
    setValue('address_line2', address.address_line2 || '');
    setValue('city', address.city);
    setValue('state', address.state || '');
    setValue('postal_code', address.postal_code);
    setValue('country', address.country);
  };

  const country = watch('country');
  const subtotal = isIndia ? (cart?.subtotal_inr ?? 0) : (cart?.subtotal || 0);
  const shipping = 0;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const onSubmit = async (data: CheckoutForm) => {
    if (!cart?.items?.length) {
      toast.error('Cart is empty');
      return;
    }

    setLoading(true);
    try {
      const shippingAddress = {
        first_name: data.first_name,
        last_name: data.last_name,
        address_line1: data.address_line1,
        address_line2: data.address_line2,
        city: data.city,
        state: data.state,
        postal_code: data.postal_code,
        country: data.country,
        phone: data.phone,
      };

      const orderRes = await orderApi.create({
        shipping_address: shippingAddress,
        billing_address: shippingAddress,
        coupon_code: couponCode || undefined,
        notes: data.notes,
        currency,
      });

      const { order_id, order_number } = orderRes.data.data;

      const paymentRes = await paymentApi.createRazorpay(order_id);
      const { razorpay_order_id, amount, currency: payCurrency, key_id } = paymentRes.data.data;

      if (typeof window.Razorpay !== 'undefined') {
        const siteBase = (
          import.meta.env.VITE_SITE_URL || window.location.origin
        ).replace(/\/$/, '');
        const brandLogo = `${window.location.origin}/icon.png`;

        const rzp = new window.Razorpay({
          key: key_id,
          amount,
          currency: payCurrency,
          name: 'MECCIO',
          description: `Luxury Carpets & Rugs · Order ${order_number}`,
          image: brandLogo,
          order_id: razorpay_order_id,
          handler: async (response: Record<string, string>) => {
            await paymentApi.verify({
              order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });
            await refreshCart();
            navigate(`/order-tracking?order=${order_number}&success=1`);
          },
          prefill: {
            name: `${data.first_name} ${data.last_name}`,
            email: data.email,
            contact: data.phone,
          },
          notes: {
            company: 'MECCIO',
            website: siteBase,
            order_number,
          },
          theme: {
            color: '#C4A962',
          },
        });
        rzp.open();
      } else {
        await paymentApi.verify({
          order_id,
          razorpay_payment_id: 'demo_payment',
          razorpay_order_id,
          razorpay_signature: 'demo_sig',
        });
        await refreshCart();
        navigate(`/order-tracking?order=${order_number}&success=1`);
      }
    } catch {
      toast.error('Checkout failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!cart?.items?.length) {
    return (
      <div className="container-luxury py-16 sm:py-24 md:py-32 text-center px-4">
        <h1 className="font-display text-2xl sm:text-3xl mb-4">Your cart is empty</h1>
        <Link to="/shop" className="btn-primary">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <>
      <SEO title="Checkout" noindex />
      <script src="https://checkout.razorpay.com/v1/checkout.js" async />

      <div className="container-luxury py-6 sm:py-8 md:py-10 pb-20 sm:pb-24">
        <div className="mb-6 sm:mb-8 md:mb-10">
          <p className="luxury-subheading mb-2">Secure Checkout</p>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-charcoal mb-5 sm:mb-6">
            Complete Your Order
          </h1>

          {/* Mobile progress bar */}
          <div className="sm:hidden mb-4">
            <div className="flex justify-between text-[10px] uppercase tracking-[0.12em] text-stone mb-2">
              <span>{STEPS[step]}</span>
              <span>Step {step + 1} of {STEPS.length}</span>
            </div>
            <div className="h-1 bg-sand/40 overflow-hidden">
              <div
                className="h-full bg-charcoal transition-all duration-300"
                style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="hidden sm:flex flex-wrap gap-2 md:gap-3">
            {STEPS.map((label, index) => (
              <button
                key={label}
                type="button"
                onClick={() => setStep(index)}
                className={cn(
                  'px-3 md:px-4 py-2 text-[10px] md:text-xs uppercase tracking-[0.12em] border transition-colors',
                  step === index
                    ? 'bg-charcoal text-cream border-charcoal'
                    : 'bg-white text-stone border-sand/40 hover:border-gold/50',
                )}
              >
                {String(index + 1).padStart(2, '0')} {label}
              </button>
            ))}
          </div>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px] gap-5 sm:gap-6 lg:gap-8 xl:gap-12"
        >
          <div className="space-y-4 sm:space-y-6">
            {/* Contact — always show active step clearly on mobile */}
            <motion.section
              key="contact"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: step === 0 ? 1 : 0.55 }}
              className={cn(
                'bg-white border border-sand/40 p-4 sm:p-6 md:p-8',
                step !== 0 && 'pointer-events-none hidden sm:block',
              )}
            >
              <div className="flex items-center gap-3 mb-5 sm:mb-6">
                <User size={18} className="text-gold-dark shrink-0" />
                <h2 className="font-display text-xl sm:text-2xl">Contact Information</h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <input {...register('first_name', { required: true })} placeholder="First Name *" className="input-luxury" />
                  {errors.first_name && <p className="text-red-500 text-xs mt-1">Required</p>}
                </div>
                <div>
                  <input {...register('last_name', { required: true })} placeholder="Last Name *" className="input-luxury" />
                </div>
                <div className="sm:col-span-2">
                  <input
                    {...register('email', { required: true })}
                    type="email"
                    placeholder="Email *"
                    className="input-luxury"
                    readOnly={!!user?.email}
                  />
                </div>
                <div className="sm:col-span-2">
                  <input {...register('phone', { required: true })} placeholder="Phone *" className="input-luxury" />
                </div>
              </div>
              {step === 0 && (
                <button type="button" onClick={() => setStep(1)} className="btn-outline mt-5 sm:mt-6 w-full sm:w-auto">
                  Continue to Shipping
                </button>
              )}
            </motion.section>

            <motion.section
              key="shipping"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: step === 1 ? 1 : 0.55 }}
              className={cn(
                'bg-white border border-sand/40 p-4 sm:p-6 md:p-8',
                step !== 1 && 'pointer-events-none hidden sm:block',
              )}
            >
              <div className="flex items-center gap-3 mb-5 sm:mb-6">
                <MapPin size={18} className="text-gold-dark shrink-0" />
                <h2 className="font-display text-xl sm:text-2xl">Shipping Address</h2>
              </div>

              {user && savedAddresses.length > 0 && (
                <div className="mb-5 space-y-2">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-stone mb-2">Saved addresses</p>
                  <div className="grid gap-2">
                    {savedAddresses.map((addr) => (
                      <button
                        key={addr.id}
                        type="button"
                        onClick={() => applySavedAddress(addr)}
                        className={cn(
                          'text-left border p-3 text-sm transition-colors',
                          selectedAddressId === addr.id
                            ? 'border-charcoal bg-ivory/60'
                            : 'border-sand/40 hover:border-gold/60',
                        )}
                      >
                        <span className="font-medium text-charcoal">
                          {addr.label || 'Address'}
                          {addr.is_default ? ' · Primary' : ''}
                        </span>
                        <span className="block text-stone text-xs mt-1">
                          {addr.address_line1}, {addr.city} {addr.postal_code}
                        </span>
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setSelectedAddressId('manual')}
                      className={cn(
                        'text-left border p-3 text-sm transition-colors',
                        selectedAddressId === 'manual'
                          ? 'border-charcoal bg-ivory/60'
                          : 'border-sand/40 hover:border-gold/60',
                      )}
                    >
                      Enter a new address
                    </button>
                  </div>
                </div>
              )}

              <div className="grid gap-3 sm:gap-4">
                <input {...register('address_line1', { required: true })} placeholder="Address Line 1 *" className="input-luxury" />
                <input {...register('address_line2')} placeholder="Address Line 2 (Apartment, suite, etc.)" className="input-luxury" />
                <div className="grid sm:grid-cols-3 gap-3 sm:gap-4">
                  <input {...register('city', { required: true })} placeholder="City *" className="input-luxury" />
                  <input {...register('state')} placeholder="State / Province" className="input-luxury" />
                  <input {...register('postal_code', { required: true })} placeholder="Postal Code *" className="input-luxury" />
                </div>
                <select {...register('country', { required: true })} className="input-luxury">
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                </select>
                <textarea {...register('notes')} rows={3} placeholder="Delivery notes (optional)" className="input-luxury resize-none" />
              </div>
              <div className="flex flex-col-reverse sm:flex-row gap-3 mt-5 sm:mt-6">
                <button type="button" onClick={() => setStep(0)} className="btn-outline w-full sm:w-auto">Back</button>
                <button type="button" onClick={() => setStep(2)} className="btn-primary w-full sm:w-auto">
                  Continue to Payment
                </button>
              </div>
            </motion.section>

            <motion.section
              key="payment"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: step === 2 ? 1 : 0.55 }}
              className={cn(
                'bg-white border border-sand/40 p-4 sm:p-6 md:p-8',
                step !== 2 && 'pointer-events-none hidden sm:block',
              )}
            >
              <div className="flex items-center gap-3 mb-5 sm:mb-6">
                <CreditCard size={18} className="text-gold-dark shrink-0" />
                <h2 className="font-display text-xl sm:text-2xl">Payment & Coupon</h2>
              </div>

              <div className="p-3 sm:p-4 bg-ivory border border-sand/30 mb-4 text-xs sm:text-sm text-stone flex items-start gap-3">
                <Lock size={16} className="text-gold-dark shrink-0 mt-0.5" />
                Secure payment powered by Razorpay. Your order is protected and encrypted.
              </div>

              <input
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Coupon code (optional)"
                className="input-luxury"
              />

              <div className="flex flex-col-reverse sm:flex-row gap-3 mt-5 sm:mt-6">
                <button type="button" onClick={() => setStep(1)} className="btn-outline w-full sm:w-auto">Back</button>
                <button
                  type="submit"
                  disabled={loading || step !== 2}
                  className="btn-primary flex-1 justify-center w-full disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Processing...
                    </>
                  ) : (
                    'Pay Securely'
                  )}
                </button>
              </div>
            </motion.section>
          </div>

          <aside className="lg:sticky lg:top-28 lg:self-start order-first lg:order-none">
            <div className="bg-white border border-sand/40 p-4 sm:p-6 md:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <Package size={18} className="text-gold-dark shrink-0" />
                <h2 className="font-display text-xl sm:text-2xl">Order Summary</h2>
              </div>

              <div className="space-y-3 sm:space-y-4 mb-5 sm:mb-6 max-h-56 sm:max-h-72 overflow-y-auto pr-1">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-14 h-[4.5rem] sm:w-16 sm:h-20 bg-ivory overflow-hidden shrink-0">
                      <img src={item.image || ''} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium line-clamp-2">{item.name}</p>
                      {item.variant_name && <p className="text-[10px] sm:text-xs text-stone mt-0.5">{item.variant_name}</p>}
                      <p className="text-[10px] sm:text-xs text-stone mt-0.5">Qty {item.quantity}</p>
                    </div>
                    <p className="text-xs sm:text-sm font-medium shrink-0">
                      {formatProductPrice(item.line_total, item.line_total_inr)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-2.5 sm:space-y-3 text-sm border-t border-sand/40 pt-4 mb-5 sm:mb-6">
                <div className="flex justify-between">
                  <span className="text-stone">Subtotal</span>
                  <span>{formatMoney(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone">Shipping</span>
                  <span className="text-sage font-medium">Free Worldwide</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone">Tax</span>
                  <span>{formatMoney(tax)}</span>
                </div>
                <div className="flex justify-between text-base sm:text-lg font-medium pt-3 border-t">
                  <span>Total</span>
                  <span>{formatMoney(total)}</span>
                </div>
              </div>

              <div className="space-y-2.5 sm:space-y-3 text-[11px] sm:text-xs text-stone">
                <div className="flex items-center gap-2">
                  <Truck size={14} className="text-gold-dark shrink-0" /> Complimentary worldwide delivery
                </div>
                <div className="flex items-center gap-2">
                  <Globe size={14} className="text-gold-dark shrink-0" />
                  Shipping to {COUNTRIES.find((c) => c.code === country)?.name || 'your country'}
                </div>
                <div className="flex items-center gap-2">
                  <Shield size={14} className="text-gold-dark shrink-0" />
                  <span className="truncate">Logged in as {user?.email}</span>
                </div>
              </div>
            </div>
          </aside>
        </form>
      </div>
    </>
  );
}
