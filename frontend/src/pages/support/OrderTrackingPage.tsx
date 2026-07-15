import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  ExternalLink,
  Loader2,
  Mail,
  Package,
  Search,
  Truck,
} from 'lucide-react';
import SupportLayout from '@/components/SupportLayout';
import { orderApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';

const STATUS_STEPS = [
  { key: 'pending', label: 'Placed', icon: Package },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
  { key: 'processing', label: 'Processing', icon: Package },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle },
];

export default function OrderTrackingPage() {
  const [searchParams] = useSearchParams();
  const success = searchParams.get('success');
  const orderParam = searchParams.get('order');
  const [order, setOrder] = useState<Record<string, string> | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, setValue } = useForm({
    defaultValues: { order_number: orderParam || '', email: '' },
  });

  useEffect(() => {
    if (orderParam) setValue('order_number', orderParam);
  }, [orderParam, setValue]);

  const onTrack = async (data: Record<string, string>) => {
    setLoading(true);
    setError('');
    try {
      const res = await orderApi.track(data.order_number, data.email);
      setOrder(res.data.data);
    } catch {
      setError('Order not found. Please check your order number and email.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const currentStep = order ? STATUS_STEPS.findIndex((s) => s.key === order.status) : -1;

  return (
    <SupportLayout
      active="tracking"
      title="Track Your Order"
      subtitle="Enter your order number and email to see real-time status and shipping details."
      seoTitle="Order Tracking"
      seoDescription="Track your MECCIO luxury rug order status and courier delivery details."
    >
      <div className="space-y-5 sm:space-y-8">
        {success && orderParam && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 sm:p-8 bg-sage/10 border border-sage/30 text-center"
          >
            <CheckCircle size={40} className="mx-auto mb-4 text-sage" strokeWidth={1.5} />
            <h2 className="font-display text-xl sm:text-2xl md:text-3xl text-charcoal mb-2">Thank You for Your Order</h2>
            <p className="text-stone text-sm sm:text-base mb-5 sm:mb-6">
              Order <strong className="text-charcoal">{orderParam}</strong> has been placed successfully. A confirmation email is on its way.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/shop" className="btn-primary">Continue Shopping</Link>
              <Link to="/dashboard" className="btn-outline">My Account</Link>
            </div>
          </motion.div>
        )}

        <form
          onSubmit={handleSubmit(onTrack)}
          className="p-4 sm:p-6 md:p-8 bg-white border border-sand/40 shadow-[0_8px_30px_rgba(44,40,37,0.04)]"
        >
          <div className="flex items-center gap-3 mb-5 sm:mb-6">
            <div className="w-9 h-9 rounded-full bg-ivory flex items-center justify-center shrink-0">
              <Search size={18} className="text-gold-dark" />
            </div>
            <div>
              <h2 className="font-display text-lg sm:text-xl text-charcoal">Look up your order</h2>
              <p className="text-[11px] sm:text-xs text-stone">Use the email address from checkout</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 sm:gap-5 mb-5">
            <div>
              <label className="block text-[11px] uppercase tracking-[0.14em] text-stone font-medium mb-2">
                Order Number
              </label>
              <input
                {...register('order_number', { required: true })}
                placeholder="e.g. MEC-ABC12345"
                className="input-luxury"
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-[0.14em] text-stone font-medium mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone" />
                <input
                  {...register('email', { required: true })}
                  type="email"
                  placeholder="you@example.com"
                  className="input-luxury pl-11"
                />
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full sm:w-auto disabled:opacity-60">
            {loading ? <Loader2 size={18} className="animate-spin" /> : 'Track Order'}
          </button>

          {error && (
            <p className="mt-4 text-sm text-red-600 bg-red-50 border border-red-100 px-4 py-3">{error}</p>
          )}
        </form>

        {order && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 sm:p-6 md:p-8 bg-white border border-sand/40"
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-6 sm:mb-10">
              <div>
                <p className="luxury-subheading mb-1">Order</p>
                <h2 className="font-display text-xl sm:text-2xl md:text-3xl text-charcoal break-all">{order.order_number}</h2>
                <p className="text-xs sm:text-sm text-stone mt-2">Placed {formatDate(order.created_at)}</p>
              </div>
              <span className="inline-flex self-start px-3 sm:px-4 py-2 bg-ivory border border-sand/40 text-[10px] sm:text-xs uppercase tracking-[0.12em] text-charcoal">
                {order.status}
              </span>
            </div>

            <div className="relative mb-6 sm:mb-10">
              <div className="absolute top-5 left-0 right-0 h-px bg-sand hidden sm:block" />
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 sm:gap-2">
                {STATUS_STEPS.map((step, i) => {
                  const Icon = step.icon;
                  const active = i <= currentStep;
                  const isCurrent = i === currentStep;
                  return (
                    <div key={step.key} className="relative flex flex-col items-center text-center">
                      <div
                        className={`relative z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors ${
                          active ? 'bg-charcoal text-cream' : 'bg-sand/60 text-stone'
                        } ${isCurrent ? 'ring-2 ring-gold ring-offset-2' : ''}`}
                      >
                        <Icon size={14} />
                      </div>
                      <span className={`text-[10px] sm:text-xs mt-2 capitalize ${active ? 'text-charcoal font-medium' : 'text-stone'}`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="p-3.5 sm:p-4 bg-ivory border border-sand/30">
                <p className="text-[10px] sm:text-xs uppercase tracking-[0.12em] text-stone mb-1">Payment</p>
                <p className="text-sm font-medium capitalize text-charcoal">{order.payment_status}</p>
              </div>
              {(order.tracking_number || order.courier_name) && (
                <div className="p-3.5 sm:p-4 bg-ivory border border-sand/30 sm:col-span-1">
                  <p className="text-[10px] sm:text-xs uppercase tracking-[0.12em] text-stone mb-1">
                    Courier Tracking
                  </p>
                  {order.courier_name && (
                    <p className="text-xs text-stone mb-1">Courier: <span className="text-charcoal font-medium">{order.courier_name}</span></p>
                  )}
                  {order.tracking_number ? (
                    <>
                      <p className="text-[10px] uppercase tracking-[0.1em] text-stone mb-0.5">Delivery AWB / Tracking No.</p>
                      <p className="text-sm font-medium text-charcoal break-all">{order.tracking_number}</p>
                      {order.tracking_url && (
                        <a
                          href={order.tracking_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-gold-dark hover:underline mt-2"
                        >
                          Track shipment <ExternalLink size={12} />
                        </a>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-stone">Tracking number will appear once assigned.</p>
                  )}
                </div>
              )}
            </div>

            {!order.tracking_number && order.status === 'shipped' && (
              <p className="text-xs sm:text-sm text-stone mt-4">
                Your order is shipped. Courier tracking details will show here once the admin adds them.
              </p>
            )}

            {order.shipped_at && (
              <p className="text-xs sm:text-sm text-stone mt-4">Shipped on {formatDate(order.shipped_at)}</p>
            )}
            {order.delivered_at && (
              <p className="text-xs sm:text-sm text-stone">Delivered on {formatDate(order.delivered_at)}</p>
            )}
          </motion.div>
        )}

        <p className="text-xs sm:text-sm text-stone text-center">
          Questions about your order?{' '}
          <Link to="/contact" className="text-gold-dark hover:underline">Contact our support team</Link>
        </p>
      </div>
    </SupportLayout>
  );
}
