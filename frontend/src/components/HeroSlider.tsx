import { useEffect, useState } from 'react';
import type { HeroSlide } from '@/hooks/usePageImages';

interface HeroSliderProps {
  slides: HeroSlide[];
  intervalMs?: number;
}

export default function HeroSlider({ slides, intervalMs = 5000 }: HeroSliderProps) {
  const [active, setActive] = useState(0);
  const items = slides.filter((slide) => slide.url?.trim());

  useEffect(() => {
    if (items.length <= 1) return undefined;

    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % items.length);
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [items.length, intervalMs]);

  const overlay = (
    <>
      <div className="absolute inset-0 bg-gradient-to-r from-espresso/90 via-espresso/55 to-espresso/25" />
      <div className="absolute inset-0 bg-gradient-to-t from-espresso/80 via-transparent to-espresso/20" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_50%,transparent_0%,rgba(26,23,20,0.35)_100%)]" />
    </>
  );

  if (!items.length) {
    return (
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_40%,rgba(196,169,98,0.08)_0%,transparent_55%)]" />
        {overlay}
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden">
      {items.map((slide, index) => (
        <div
          key={`${slide.url}-${index}`}
          className={`absolute inset-0 transition-opacity duration-[1400ms] ease-out ${
            index === active ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img
            src={slide.url}
            alt={slide.alt || 'Hero image'}
            className={`absolute inset-0 w-full h-full object-cover transition-transform duration-[8000ms] ease-out ${
              index === active ? 'scale-105' : 'scale-100'
            }`}
          />
        </div>
      ))}
      {overlay}

      {items.length > 1 && (
        <div className="absolute bottom-8 right-6 md:right-12 lg:right-16 xl:right-24 z-20 flex items-center gap-4">
          <div className="hidden sm:flex gap-2">
            {items.map((slide, index) => (
              <button
                key={`bar-${slide.url}-${index}`}
                type="button"
                aria-label={`Show slide ${index + 1}`}
                onClick={() => setActive(index)}
                className={`h-[2px] transition-all duration-500 ${
                  index === active ? 'w-10 bg-gold' : 'w-6 bg-cream/35 hover:bg-cream/60'
                }`}
              />
            ))}
          </div>
          <span className="text-cream/70 text-xs tracking-[0.25em] font-medium tabular-nums">
            {String(active + 1).padStart(2, '0')}
            <span className="text-cream/35 mx-2">/</span>
            {String(items.length).padStart(2, '0')}
          </span>
        </div>
      )}
    </div>
  );
}
