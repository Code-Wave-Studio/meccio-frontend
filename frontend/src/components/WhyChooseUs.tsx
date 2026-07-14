import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Award, Gem, HandHeart, ShieldCheck, Sparkles, Truck } from 'lucide-react';

const PILLARS = [
  {
    icon: HandHeart,
    title: 'Master Artisans',
    desc: 'Every rug is hand-knotted by skilled weavers with decades of experience in time-honored techniques passed down through generations.',
    accent: 'from-gold/20 to-transparent',
  },
  {
    icon: Gem,
    title: 'Premium Materials',
    desc: 'We source only the finest wools, silks, and natural dyes from ethical suppliers across New Zealand, India, and Persia.',
    accent: 'from-gold-light/15 to-transparent',
  },
  {
    icon: Truck,
    title: 'White-Glove Service',
    desc: 'From bespoke design consultation to professional delivery and placement — we handle every detail with meticulous care.',
    accent: 'from-gold/20 to-transparent',
  },
];

const STATS = [
  { end: 40, suffix: '+', label: 'Years of Craft' },
  { end: 5000, suffix: '+', label: 'Rugs Delivered', format: true },
  { end: 50, suffix: '+', label: 'Countries Served' },
  { end: 100, suffix: '%', label: 'Handmade' },
];

function formatCount(value: number, withComma = false): string {
  if (!withComma) return String(Math.round(value));
  return Math.round(value).toLocaleString('en-US');
}

function CountUpStat({
  end,
  suffix,
  label,
  format = false,
  active,
  delay = 0,
}: {
  end: number;
  suffix: string;
  label: string;
  format?: boolean;
  active: boolean;
  delay?: number;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active) {
      setCount(0);
      return;
    }

    let rafId = 0;
    const duration = 1600;
    const startAt = performance.now() + delay;

    const tick = (now: number) => {
      if (now < startAt) {
        rafId = requestAnimationFrame(tick);
        return;
      }
      const progress = Math.min((now - startAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(end * eased);
      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        setCount(end);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [active, delay, end]);

  return (
    <div className="text-center md:text-left">
      <p className="font-display text-2xl sm:text-3xl md:text-4xl text-gold mb-1.5 tabular-nums">
        {formatCount(count, format)}
        {suffix}
      </p>
      <p className="text-[10px] sm:text-xs uppercase tracking-[0.12em] sm:tracking-[0.15em] text-stone/70">{label}</p>
    </div>
  );
}

export default function WhyChooseUs() {
  const statsRef = useRef<HTMLDivElement>(null);
  const statsInView = useInView(statsRef, { once: true, amount: 0.4 });

  return (
    <section className="relative py-14 sm:py-20 md:py-28 lg:py-32 overflow-hidden bg-gradient-to-br from-charcoal via-espresso to-charcoal text-cream">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -top-32 right-0 w-[280px] sm:w-[480px] h-[280px] sm:h-[480px] rounded-full bg-gold/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-0 w-[220px] sm:w-[360px] h-[220px] sm:h-[360px] rounded-full bg-gold/5 blur-3xl" />

      <div className="container-luxury relative">
        <div className="grid lg:grid-cols-[1fr_1.4fr] gap-8 sm:gap-12 lg:gap-20 items-start">
          {/* Left — intro */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:sticky lg:top-32"
          >
            <div className="flex items-center gap-4 mb-4 sm:mb-5">
              <span className="h-px w-10 bg-gold" />
              <p className="luxury-subheading text-gold mb-0">The MECCIO Difference</p>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-light leading-tight mb-4 sm:mb-6">
              Why Choose Us
            </h2>
            <p className="text-stone/90 leading-relaxed max-w-md mb-6 sm:mb-10 text-sm sm:text-base">
              We don&apos;t just sell rugs — we craft heirlooms. Every piece reflects our commitment
              to artistry, quality, and an experience worthy of luxury interiors worldwide.
            </p>

            <div className="flex items-start gap-3 sm:gap-4 p-4 sm:p-5 rounded-sm border border-gold/20 bg-white/5 backdrop-blur-sm">
              <div className="shrink-0 w-10 h-10 rounded-full bg-gold/15 flex items-center justify-center">
                <ShieldCheck size={20} className="text-gold" />
              </div>
              <div>
                <p className="font-display text-base sm:text-lg mb-1">Lifetime Quality Promise</p>
                <p className="text-sm text-stone/80 leading-relaxed">
                  Rigorous inspection at every stage — backed by our commitment to lasting craftsmanship.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right — pillar cards */}
          <div className="space-y-4 sm:space-y-5">
            {PILLARS.map((item, i) => (
              <motion.article
                key={item.title}
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group relative overflow-hidden rounded-sm border border-white/10 bg-white/[0.04] backdrop-blur-sm p-5 sm:p-6 md:p-8 transition-all duration-500 hover:border-gold/30 hover:bg-white/[0.07]"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${item.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />
                <div className="relative flex gap-4 sm:gap-5 md:gap-6">
                  <div className="shrink-0">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border border-gold/40 flex items-center justify-center bg-gold/10 group-hover:bg-gold/20 group-hover:border-gold/60 transition-all duration-500">
                      <item.icon size={22} className="text-gold" strokeWidth={1.5} />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-[10px] uppercase tracking-[0.2em] text-gold/70 font-medium">
                        0{i + 1}
                      </span>
                      <span className="h-px flex-1 max-w-12 bg-gold/30 group-hover:max-w-20 transition-all duration-500" />
                    </div>
                    <h3 className="font-display text-xl sm:text-2xl md:text-[1.65rem] mb-2 sm:mb-3 group-hover:text-gold-light transition-colors duration-300">
                      {item.title}
                    </h3>
                    <p className="text-stone/80 text-sm md:text-[0.95rem] leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>

        {/* Stats strip */}
        <motion.div
          ref={statsRef}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-12 sm:mt-16 md:mt-20 pt-8 sm:pt-10 border-t border-white/10"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 md:gap-6">
            {STATS.map((stat, i) => (
              <CountUpStat
                key={stat.label}
                end={stat.end}
                suffix={stat.suffix}
                label={stat.label}
                format={stat.format}
                active={statsInView}
                delay={i * 120}
              />
            ))}
          </div>
        </motion.div>

        {/* Bottom accent */}
        <div className="flex items-center justify-center gap-2 mt-10 sm:mt-12 text-stone/50 px-2">
          <Sparkles size={14} className="text-gold/60 shrink-0" />
          <span className="text-[10px] sm:text-xs uppercase tracking-[0.15em] sm:tracking-[0.2em] text-center">
            Crafted with intention · Delivered with care
          </span>
          <Award size={14} className="text-gold/60 shrink-0" />
        </div>
      </div>
    </section>
  );
}
