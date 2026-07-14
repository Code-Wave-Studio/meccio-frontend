import { useQuery } from '@tanstack/react-query';
import { Globe, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import SupportLayout from '@/components/SupportLayout';
import { contentApi } from '@/lib/api';
import { getSupportIcon } from '@/lib/supportIcons';

const FALLBACK_OPTIONS = [
  { title: 'Standard Delivery', time_label: '7–14 business days', description: 'In-stock rugs shipped with secure packaging and full tracking.', icon: 'package' },
  { title: 'Luxury & Custom', time_label: '14–21 business days', description: 'Handcrafted and made-to-order pieces require additional lead time.', icon: 'shield' },
  { title: 'White-Glove Delivery', time_label: 'By appointment', description: 'Premium placement service available for large and luxury rugs.', icon: 'truck' },
];

const FALLBACK_STEPS = [
  "Place your order — you'll receive a confirmation email with your order number.",
  'Our team prepares your rug with protective packaging for transit.',
  "Once shipped, you'll receive tracking details via email.",
  'Delivery completes your order — inspect upon arrival and contact us with any concerns.',
];

export default function ShippingPage() {
  const { data } = useQuery({
    queryKey: ['support', 'shipping'],
    queryFn: () => contentApi.shippingInfo().then((r) => r.data.data),
  });

  const meta = data?.meta ?? {};
  const options = data?.options?.length ? data.options : FALLBACK_OPTIONS;
  const steps = data?.steps?.length ? data.steps : FALLBACK_STEPS;

  return (
    <SupportLayout
      active="shipping"
      title={meta.title ?? 'Shipping Information'}
      subtitle={meta.subtitle ?? 'Worldwide delivery with care — from our artisans to your home.'}
      seoDescription="MECCIO worldwide shipping, delivery times, and complimentary delivery information."
    >
      <div className="space-y-6 sm:space-y-8 md:space-y-10">
        <div className="p-4 sm:p-6 md:p-8 bg-gradient-to-r from-charcoal to-espresso text-cream">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              <Globe size={20} className="text-gold-light" />
            </div>
            <div>
              <p className="luxury-subheading text-gold-light mb-2">Worldwide Shipping</p>
              <p className="font-display text-xl sm:text-2xl md:text-3xl mb-2">Complimentary shipping on every order</p>
              <p className="text-cream/70 text-xs sm:text-sm leading-relaxed max-w-2xl">
                We deliver MECCIO rugs to customers around the world with secure packaging, tracking, and white-glove care for premium pieces.
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5 md:p-6 border border-sand/40 bg-ivory flex items-start gap-3 sm:gap-4">
          <Truck size={20} className="text-gold-dark shrink-0 mt-0.5" />
          <div>
            <h2 className="font-display text-lg sm:text-xl text-charcoal mb-2">Free Shipping Policy</h2>
            <p className="text-xs sm:text-sm text-stone leading-relaxed">
              All orders currently include complimentary worldwide shipping. International deliveries may be subject to customs duties and import taxes, which are the responsibility of the recipient.
            </p>
          </div>
        </div>

        <div>
          <h2 className="font-display text-xl sm:text-2xl text-charcoal mb-4 sm:mb-6">Delivery Options</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            {options.map((opt: { title: string; time_label: string; description: string; icon: string }) => {
              const Icon = getSupportIcon(opt.icon);
              return (
                <div key={opt.title} className="p-4 sm:p-6 bg-white border border-sand/40">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-ivory flex items-center justify-center mb-3 sm:mb-4">
                    <Icon size={18} className="text-gold-dark" />
                  </div>
                  <h3 className="font-display text-base sm:text-lg mb-1">{opt.title}</h3>
                  <p className="text-[10px] sm:text-xs uppercase tracking-[0.12em] text-gold-dark mb-2 sm:mb-3">{opt.time_label}</p>
                  <p className="text-xs sm:text-sm text-stone leading-relaxed">{opt.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h2 className="font-display text-xl sm:text-2xl text-charcoal mb-4">How It Works</h2>
          <ol className="space-y-3 sm:space-y-4">
            {steps.map((step: string, i: number) => (
              <li key={step} className="flex gap-3 sm:gap-4 p-3.5 sm:p-4 bg-white border border-sand/30">
                <span className="shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-gold/40 flex items-center justify-center text-[10px] sm:text-xs font-medium text-gold-dark">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className="text-xs sm:text-sm text-stone leading-relaxed pt-1">{step}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="p-4 sm:p-6 bg-ivory border border-sand/40 text-xs sm:text-sm text-stone leading-relaxed">
          <strong className="text-charcoal">Note:</strong>{' '}
          {meta.customs_note ?? 'International orders may be subject to customs duties and import taxes, which are the responsibility of the recipient.'}
          {' '}Need help with delivery? <Link to="/contact" className="text-gold-dark hover:underline">Contact our team</Link>.
        </div>
      </div>
    </SupportLayout>
  );
}
