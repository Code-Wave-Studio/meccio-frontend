import { useState, useEffect, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import Logo from '@/components/Logo';
import { usePageImages } from '@/hooks/usePageImages';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

const DEFAULT_AUTH_IMAGE =
  'https://images.unsplash.com/photo-1600166898405-da9535204843?w=1200';

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  const { authPanelImage } = usePageImages();
  const panelImage = authPanelImage || DEFAULT_AUTH_IMAGE;

  return (
    <div className="min-h-[calc(100vh-80px)] grid lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-gradient-to-br from-charcoal via-espresso to-charcoal text-cream p-12 xl:p-16">
        <div
          className="absolute inset-0 opacity-20 bg-cover bg-center"
          style={{ backgroundImage: `url('${panelImage}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-espresso/90 via-espresso/50 to-transparent" />

        <div className="relative z-10">
          <Logo imageClassName="h-16 w-16 xl:h-20 xl:w-20" wordmarkClassName="h-10 xl:h-12 w-auto" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10"
        >
          <p className="luxury-subheading text-gold-light mb-4">Luxury Interiors</p>
          <h2 className="font-display text-4xl xl:text-5xl font-light leading-tight mb-6">
            Timeless rugs.<br />Exceptional craft.
          </h2>
          <p className="text-cream/70 leading-relaxed max-w-md">
            Join MECCIO RUGS to track orders, save wishlists, and commission bespoke rugs tailored to your space.
          </p>
        </motion.div>

        <p className="relative z-10 text-xs text-cream/40 uppercase tracking-[0.2em]">
          Handmade carpets
        </p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center px-6 py-12 md:px-12 lg:px-16 bg-ivory">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-10 text-center">
            <Logo className="justify-center mx-auto" imageClassName="h-14 w-14 mx-auto" wordmarkClassName="h-8 w-auto" />
          </div>

          <div className="mb-8">
            <h1 className="font-display text-3xl md:text-4xl text-charcoal mb-2">{title}</h1>
            <p className="text-stone text-sm">{subtitle}</p>
          </div>

          {children}

          <div className="mt-8 text-center text-sm text-stone">{footer}</div>
        </div>
      </div>
    </div>
  );
}

export function FieldLabel({ children, required }: { children: ReactNode; required?: boolean }) {
  return (
    <label className="block text-[11px] uppercase tracking-[0.14em] text-stone font-medium mb-2">
      {children}
      {required && <span className="text-gold-dark ml-0.5">*</span>}
    </label>
  );
}

export function useOtpCooldown(seconds = 60) {
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const startCooldown = () => setCooldown(seconds);

  return { cooldown, startCooldown, canResend: cooldown === 0 };
}

export function getApiError(err: unknown, fallback: string): string {
  if (typeof err === 'object' && err !== null && 'response' in err) {
    const response = (err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } }).response;
    const errors = response?.data?.errors;
    if (errors && typeof errors === 'object') {
      const first = Object.values(errors).flat().find(Boolean);
      if (first) return first;
    }
    return response?.data?.message || fallback;
  }
  return fallback;
}
