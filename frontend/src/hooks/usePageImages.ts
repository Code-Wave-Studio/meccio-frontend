import { useMemo } from 'react';
import { parseSettingJson, useSiteSettings } from '@/hooks/useSiteSettings';

export interface HeroSlide {
  url: string;
  alt: string;
}

export type SupportPageId = 'faq' | 'shipping' | 'returns' | 'tracking' | 'size-guide';

const SUPPORT_HERO_SETTING_KEYS: Record<SupportPageId, string> = {
  faq: 'page_faq_hero_image',
  shipping: 'page_shipping_hero_image',
  returns: 'page_returns_hero_image',
  tracking: 'page_order_tracking_hero_image',
  'size-guide': 'page_size_guide_hero_image',
};

function parseHeroSlides(raw: string | undefined): HeroSlide[] {
  const slides = parseSettingJson<HeroSlide[]>(raw, [])
    .filter((slide) => slide?.url?.trim());
  return slides.map((slide, index) => ({
    url: slide.url.trim(),
    alt: slide.alt?.trim() || `Hero slide ${index + 1}`,
  }));
}

export function usePageImages() {
  const { data: settings = {} } = useSiteSettings();

  return useMemo(() => {
    const supportHeroImages = Object.fromEntries(
      (Object.entries(SUPPORT_HERO_SETTING_KEYS) as [SupportPageId, string][]).map(([id, key]) => [
        id,
        settings[key]?.trim() || '',
      ])
    ) as Record<SupportPageId, string>;

    return {
      homeHeroSlides: parseHeroSlides(settings.page_home_hero_slides),
      homeLuxuryImage: settings.page_home_luxury_image?.trim() || '',
      homeCraftImage: settings.page_home_craft_image?.trim() || '',
      aboutHeroImage: settings.page_about_hero_image?.trim() || '',
      aboutCraftImage: settings.page_about_craft_image?.trim() || '',
      customRugsHeroImage: settings.page_custom_rugs_hero_image?.trim() || '',
      collectionHeroImage: settings.page_collection_hero_image?.trim() || '',
      authPanelImage: settings.page_auth_panel_image?.trim() || '',
      supportHeroImages,
    };
  }, [settings]);
}

export function getSupportHeroImage(
  supportHeroImages: Record<SupportPageId, string>,
  pageId: SupportPageId,
  fallback: string
): string {
  return supportHeroImages[pageId] || fallback;
}
