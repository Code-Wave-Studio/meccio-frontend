import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  HelpCircle,
  Package,
  RefreshCw,
  Ruler,
  Truck,
} from 'lucide-react';
import SEO from '@/components/SEO';
import { getSupportHeroImage, usePageImages } from '@/hooks/usePageImages';
import { cn } from '@/lib/utils';

const DEFAULT_SUPPORT_HERO = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1400';

export const SUPPORT_LINKS = [
  { id: 'faq', label: 'FAQ', short: 'FAQ', href: '/faq', icon: HelpCircle },
  { id: 'shipping', label: 'Shipping', short: 'Ship', href: '/shipping', icon: Truck },
  { id: 'returns', label: 'Returns & Refunds', short: 'Returns', href: '/refund', icon: RefreshCw },
  { id: 'tracking', label: 'Order Tracking', short: 'Track', href: '/order-tracking', icon: Package },
  { id: 'size-guide', label: 'Size Guide', short: 'Sizes', href: '/size-guide', icon: Ruler },
] as const;

interface SupportLayoutProps {
  active: (typeof SUPPORT_LINKS)[number]['id'];
  title: string;
  subtitle: string;
  seoTitle?: string;
  seoDescription?: string;
  children: React.ReactNode;
}

export default function SupportLayout({
  active,
  title,
  subtitle,
  seoTitle,
  seoDescription,
  children,
}: SupportLayoutProps) {
  const location = useLocation();
  const { supportHeroImages } = usePageImages();
  const heroImage = getSupportHeroImage(supportHeroImages, active, DEFAULT_SUPPORT_HERO);

  return (
    <>
      <SEO title={seoTitle ?? title} description={seoDescription} />

      <section className="relative overflow-hidden bg-gradient-to-br from-charcoal via-espresso to-charcoal text-cream">
        <div
          className="absolute inset-0 opacity-15 bg-cover bg-center"
          style={{ backgroundImage: `url('${heroImage}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-espresso/95 via-espresso/80 to-transparent" />
        <div className="container-luxury relative py-10 sm:py-14 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl"
          >
            <p className="luxury-subheading text-gold-light mb-2 sm:mb-3">Help Center</p>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-light mb-3 sm:mb-4">{title}</h1>
            <p className="text-cream/75 text-sm sm:text-base leading-relaxed">{subtitle}</p>
          </motion.div>
        </div>
      </section>

      <div className="container-luxury py-6 sm:py-8 md:py-14 pb-16 sm:pb-20">
        {/* Mobile nav chips */}
        <div className="lg:hidden -mx-4 px-4 mb-5 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 min-w-max pb-1">
            {SUPPORT_LINKS.map(({ id, short, href, icon: Icon }) => {
              const isActive = id === active || location.pathname === href;
              return (
                <Link
                  key={id}
                  to={href}
                  className={cn(
                    'inline-flex items-center gap-2 shrink-0 px-3.5 py-2.5 text-[11px] uppercase tracking-[0.12em] border transition-colors',
                    isActive
                      ? 'bg-charcoal text-cream border-charcoal'
                      : 'bg-white text-stone border-sand/50',
                  )}
                >
                  <Icon size={14} />
                  {short}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="grid lg:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[240px_minmax(0,1fr)] gap-6 lg:gap-10 xl:gap-14">
          <aside className="hidden lg:block lg:sticky lg:top-28 lg:self-start">
            <p className="luxury-subheading mb-4">Help Center</p>
            <nav className="flex flex-col gap-1.5">
              {SUPPORT_LINKS.map(({ id, label, href, icon: Icon }) => {
                const isActive = id === active || location.pathname === href;
                return (
                  <Link
                    key={id}
                    to={href}
                    className={cn(
                      'flex items-center gap-3 px-3.5 py-2.5 text-sm transition-colors border',
                      isActive
                        ? 'bg-charcoal text-cream border-charcoal'
                        : 'bg-white text-charcoal border-sand/40 hover:border-gold/40 hover:text-gold-dark',
                    )}
                  >
                    <Icon size={16} strokeWidth={1.5} />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="mt-8 p-5 bg-ivory border border-sand/40">
              <p className="text-sm text-charcoal font-medium mb-2">Need more help?</p>
              <p className="text-xs text-stone leading-relaxed mb-4">
                Our team is here for orders, sizing, and custom rug inquiries.
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-gold-dark hover:text-charcoal transition-colors"
              >
                Contact Us <ArrowRight size={14} />
              </Link>
            </div>
          </aside>

          <motion.main
            key={active}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="min-w-0"
          >
            {children}
          </motion.main>
        </div>

        {/* Mobile contact CTA */}
        <div className="lg:hidden mt-8 p-4 sm:p-5 bg-ivory border border-sand/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-sm text-charcoal font-medium">Need more help?</p>
            <p className="text-xs text-stone mt-1">Orders, sizing, and custom rug inquiries.</p>
          </div>
          <Link to="/contact" className="btn-outline text-xs w-full sm:w-auto text-center">
            Contact Us
          </Link>
        </div>
      </div>
    </>
  );
}
