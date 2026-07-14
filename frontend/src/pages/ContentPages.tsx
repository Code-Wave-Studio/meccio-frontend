import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, useInView } from 'framer-motion';
import { Star } from 'lucide-react';
import SEO from '@/components/SEO';
import { contentApi } from '@/lib/api';
import { usePageImages } from '@/hooks/usePageImages';
import { parseSettingJson, useSiteSettings } from '@/hooks/useSiteSettings';
import type { Testimonial } from '@/types';

const DEFAULT_CRAFT = {
  eyebrow: 'Craftsmanship',
  title: 'Where Tradition Meets Innovation',
  paragraph_1:
    "From the highlands of Tibet to the workshops of Isfahan, we partner with the world's most skilled weavers. Each MECCIO rug passes through the hands of artisans who have dedicated their lives to the craft.",
  paragraph_2:
    'Our design studio in New York collaborates with interior designers, architects, and hospitality brands to create bespoke pieces that define spaces.',
};

const ABOUT_STATS = [
  { end: 500, suffix: '+', label: 'Unique Designs' },
  { end: 50, suffix: '+', label: 'Master Artisans' },
  { end: 30, suffix: '+', label: 'Countries Served' },
];

function CountUpStat({
  end,
  suffix,
  label,
  active,
  delay = 0,
}: {
  end: number;
  suffix: string;
  label: string;
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
      setCount(Math.round(end * eased));
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
    <div className="text-center">
      <p className="font-display text-5xl text-gold mb-2 tabular-nums">
        {count}
        {suffix}
      </p>
      <p className="luxury-subheading">{label}</p>
    </div>
  );
}

export default function AboutPage() {
  const { aboutHeroImage, aboutCraftImage } = usePageImages();
  const { data: settings = {} } = useSiteSettings();
  const statsRef = useRef<HTMLDivElement>(null);
  const statsInView = useInView(statsRef, { once: true, amount: 0.4 });

  const craft = {
    ...DEFAULT_CRAFT,
    ...parseSettingJson<Partial<typeof DEFAULT_CRAFT>>(settings.about_craftsmanship, {}),
  };

  return (
    <>
      <SEO title="About Us" description="Discover the MECCIO story - luxury carpets and rugs crafted by master artisans for discerning spaces worldwide." />

      <div className="relative h-[60vh] overflow-hidden">
        <img src={aboutHeroImage} alt="MECCIO craftsmanship" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-espresso/50 flex items-center justify-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <p className="luxury-subheading text-gold-light mb-4">Est. 2018</p>
            <h1 className="font-display text-5xl md:text-7xl text-cream font-light">Our Story</h1>
          </motion.div>
        </div>
      </div>

      <div className="container-luxury py-24">
        <div className="max-w-3xl mx-auto text-center mb-24">
          <p className="font-display text-2xl md:text-3xl leading-relaxed text-charcoal/80 italic">
            &ldquo;We believe every floor deserves to be a canvas. MECCIO was born from a passion for
            preserving ancient weaving traditions while pushing the boundaries of contemporary design.&rdquo;
          </p>
        </div>

        <div ref={statsRef} className="grid md:grid-cols-3 gap-12 mb-24">
          {ABOUT_STATS.map((stat, i) => (
            <CountUpStat
              key={stat.label}
              end={stat.end}
              suffix={stat.suffix}
              label={stat.label}
              active={statsInView}
              delay={i * 120}
            />
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-24" id="craftsmanship">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="luxury-subheading mb-3">{craft.eyebrow || DEFAULT_CRAFT.eyebrow}</p>
            <h2 className="luxury-heading text-4xl mb-6">{craft.title || DEFAULT_CRAFT.title}</h2>
            <p className="text-stone leading-relaxed mb-4">
              {craft.paragraph_1 || DEFAULT_CRAFT.paragraph_1}
            </p>
            <p className="text-stone leading-relaxed">
              {craft.paragraph_2 || DEFAULT_CRAFT.paragraph_2}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="relative"
          >
            <div className="absolute -inset-3 sm:-inset-4 border border-gold/25 pointer-events-none" aria-hidden="true" />
            <div className="absolute top-0 left-0 w-16 h-px bg-gold/60" aria-hidden="true" />
            <div className="absolute top-0 left-0 w-px h-16 bg-gold/60" aria-hidden="true" />
            <div className="absolute bottom-0 right-0 w-16 h-px bg-gold/60" aria-hidden="true" />
            <div className="absolute bottom-0 right-0 w-px h-16 bg-gold/60" aria-hidden="true" />

            <div className="relative overflow-hidden bg-ivory shadow-[0_24px_60px_rgba(44,40,37,0.12)]">
              <img
                src={aboutCraftImage}
                alt="Craftsmanship"
                className="aspect-[4/5] w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-espresso/35 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                <p className="text-[10px] uppercase tracking-[0.2em] text-cream/80 mb-1">Handcrafted</p>
                <p className="font-display text-cream text-xl sm:text-2xl">Artisan atelier</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}

export function TestimonialsPage() {
  const { data: testimonials } = useQuery({
    queryKey: ['testimonials'],
    queryFn: () => contentApi.testimonials().then((r) => r.data.data),
  });

  return (
    <>
      <SEO title="Testimonials" description="Read what interior designers, architects, and homeowners say about MECCIO luxury rugs." />
      <div className="container-luxury py-8 sm:py-12">
        <h1 className="luxury-heading text-3xl sm:text-4xl md:text-5xl mb-10 sm:mb-16 text-center">Client Stories</h1>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {(testimonials || []).map((t: Testimonial) => (
            <div key={t.id} className="glass-card p-8">
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} size={14} className="fill-gold text-gold" />
                ))}
              </div>
              <p className="text-charcoal/80 leading-relaxed mb-6 italic">&ldquo;{t.content}&rdquo;</p>
              <p className="font-medium">{t.author_name}</p>
              <p className="text-sm text-stone">{t.author_title}{t.author_location && ` · ${t.author_location}`}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
