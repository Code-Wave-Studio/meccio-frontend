import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import HeroSlider from '@/components/HeroSlider';
import { usePageImages } from '@/hooks/usePageImages';
import { useSiteSettings } from '@/hooks/useSiteSettings';

export default function HomeHero() {
  const { homeHeroSlides } = usePageImages();
  const { data: settings = {} } = useSiteSettings();
  const showAnnouncement = settings.header_show_announcement !== '0';
  const headerOffset = showAnnouncement ? 104 : 68;

  return (
    <section
      className="relative w-full max-w-full flex items-center overflow-hidden bg-espresso"
      style={{
        marginTop: `-${headerOffset}px`,
        paddingTop: `${headerOffset}px`,
        minHeight: '100dvh',
      }}
    >
      <HeroSlider slides={homeHeroSlides} />

      <div className="relative z-10 w-full px-5 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:px-28 py-20 md:py-24">
        <div className="w-full max-w-[1920px] mx-auto grid lg:grid-cols-12 gap-10 lg:gap-16 items-center min-h-[calc(100dvh-10rem)]">
          <motion.div
            initial={{ opacity: 0, y: 48 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-8 xl:col-span-7 2xl:col-span-6"
          >
            <div className="flex items-center gap-4 mb-6 md:mb-8">
              <span className="h-px w-10 md:w-14 bg-gold" />
              <p className="luxury-subheading text-gold-light mb-0">TIMELESS LUXURY</p>
            </div>

            <h1 className="font-display text-[clamp(2.75rem,7vw,6.5rem)] text-cream font-light leading-[0.92] tracking-tight mb-6 md:mb-8">
              Where Every Rug
              <br />
              <span className="italic text-cream/95">Becomes a Masterpiece</span>
            </h1>

            <p className="text-cream/75 text-base sm:text-lg md:text-xl leading-relaxed mb-8 md:mb-10 max-w-xl lg:max-w-2xl">
              Handcrafted luxury carpets and rugs that transform exceptional interiors with timeless elegance, unmatched craftsmanship, and refined design.
            </p>

            <div className="flex flex-wrap gap-3 sm:gap-4">
              <Link
                to="/shop"
                className="inline-flex items-center justify-center px-8 sm:px-10 py-3.5 sm:py-4 bg-gold text-espresso text-xs sm:text-sm uppercase tracking-[0.18em] font-medium transition-all duration-500 hover:bg-gold-light hover:shadow-[0_12px_40px_rgba(196,169,98,0.35)]"
              >
                Explore Collection
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center justify-center px-8 sm:px-10 py-3.5 sm:py-4 border border-cream/50 text-cream text-xs sm:text-sm uppercase tracking-[0.18em] font-medium backdrop-blur-sm bg-white/5 transition-all duration-500 hover:bg-cream hover:text-charcoal hover:border-cream"
              >
                Discover Our Story
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
