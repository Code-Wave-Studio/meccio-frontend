import { Link } from 'react-router-dom';
import {
  Globe,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from 'lucide-react';
import Logo from '@/components/Logo';
import { parseSettingJson, useSiteSettings } from '@/hooks/useSiteSettings';

const defaultFooterLinks = {
  shop: [
    { label: 'All Rugs', href: '/shop' },
    { label: 'New Arrivals', href: '/new-arrivals' },
    { label: 'Best Sellers', href: '/best-sellers' },
    { label: 'Luxury Collection', href: '/collections/luxury-collection' },
    { label: 'Custom Rugs', href: '/custom-rugs' },
  ],
  company: [
    { label: 'About Us', href: '/about' },
    { label: 'Craftsmanship', href: '/about#craftsmanship' },
    { label: 'Testimonials', href: '/testimonials' },
    { label: 'Contact', href: '/contact' },
  ],
  support: [
    { label: 'FAQ', href: '/faq' },
    { label: 'Shipping', href: '/shipping' },
    { label: 'Returns & Refunds', href: '/refund' },
    { label: 'Order Tracking', href: '/order-tracking' },
    { label: 'Size Guide', href: '/size-guide' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
  ],
};

type IconProps = { size?: number };

function InstagramIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M14 8.5V7.1c0-.7.2-1.1 1.2-1.1H17V3.2c-.8-.1-1.6-.2-2.4-.2-2.4 0-4.1 1.5-4.1 4.1v1.4H8v3.1h2.5V21H14v-9.4h2.5l.5-3.1H14Z" />
    </svg>
  );
}

function TwitterIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.8 3h3.1l-6.8 7.8L22 21h-6.2l-4.9-6.4L5.3 21H2.2l7.3-8.4L2 3h6.4l4.4 5.8L17.8 3Zm-1.1 16.2h1.7L7.5 4.7H5.7l11 14.5Z" />
    </svg>
  );
}

function LinkedinIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6.9 8.8H3.6V21h3.3V8.8ZM5.3 3a1.9 1.9 0 1 0 0 3.8 1.9 1.9 0 0 0 0-3.8Zm8 11.2c0-1.7.8-2.7 2.2-2.7 1.3 0 1.9.9 1.9 2.7V21h3.3v-7.5c0-3.2-1.7-4.9-4.3-4.9-1.9 0-2.8 1-3.2 1.7V8.8H10V21h3.3v-6.8Z" />
    </svg>
  );
}

function YoutubeIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M21.6 7.2s-.2-1.5-.8-2.1c-.8-.8-1.7-.8-2.1-.9C15.8 4 12 4 12 4s-3.8 0-6.7.2c-.4 0-1.3.1-2.1.9-.6.6-.8 2.1-.8 2.1S2.2 9 2.2 10.8v1.7c0 1.8.2 3.6.2 3.6s.2 1.5.8 2.1c.8.8 1.9.8 2.4.9 1.7.2 6.4.2 6.4.2s3.8 0 6.7-.2c.4 0 1.3-.1 2.1-.9.6-.6.8-2.1.8-2.1s.2-1.8.2-3.6v-1.7c0-1.8-.2-3.6-.2-3.6ZM10.1 14.7V8.5l5.8 3.1-5.8 3.1Z" />
    </svg>
  );
}

function EtsyIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8.3 6.4c.2-1.5 1.2-2.5 2.9-2.5h5.4V6H11.5c-.7 0-1 .3-1.1.9v2.3h5.8v2.1H10.4v4.4c0 .7.3 1 .9 1H16.6V19H11c-2 0-3.1-1.1-3.1-3.1V6.4h.4Z" />
    </svg>
  );
}

const socialIconMap = {
  facebook: FacebookIcon,
  globe: Globe,
  instagram: InstagramIcon,
  linkedin: LinkedinIcon,
  twitter: TwitterIcon,
  whatsapp: MessageCircle,
  youtube: YoutubeIcon,
  etsy: EtsyIcon,
};

export default function Footer() {
  const { data: settings = {} } = useSiteSettings();
  const footerLinks = parseSettingJson<typeof defaultFooterLinks>(
    settings.footer_links,
    defaultFooterLinks,
  );
  const socialLinks = parseSettingJson<{ label: string; url: string; icon?: keyof typeof socialIconMap }[]>(
    settings.footer_social_links,
    [],
  );

  return (
    <footer className="text-cream w-full max-w-full overflow-x-hidden bg-espresso">
      <div className="container-luxury py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          <div className="lg:col-span-2">
            <Logo className="mb-6" imageClassName="h-10 w-auto brightness-0 invert opacity-90" />
            <p className="text-stone/80 text-sm leading-relaxed mb-8 max-w-sm">
              {settings.footer_description || 'Crafting luxury carpets and rugs for discerning spaces worldwide. Hand-selected materials, master artisans, timeless design.'}
            </p>
            <div className="space-y-3 text-sm text-stone/80 mb-7">
              {settings.footer_email && (
                <a href={`mailto:${settings.footer_email}`} className="flex items-center gap-3 hover:text-gold">
                  <Mail size={16} /> {settings.footer_email}
                </a>
              )}
              {settings.footer_phone && (
                <a href={`tel:${settings.footer_phone}`} className="flex items-center gap-3 hover:text-gold">
                  <Phone size={16} /> {settings.footer_phone}
                </a>
              )}
              {settings.footer_address && (
                <p className="flex items-start gap-3"><MapPin size={16} className="mt-0.5 shrink-0" /> {settings.footer_address}</p>
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((social) => {
                const Icon = socialIconMap[social.icon || 'globe'] || Globe;
                return (
                  <a
                    key={`${social.label}-${social.url}`}
                    href={social.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={social.label}
                    title={social.label}
                    className="p-2 border border-stone/30 hover:border-gold hover:text-gold transition-colors"
                  >
                    <Icon size={18} />
                  </a>
                );
              })}
            </div>
          </div>

          {Object.entries(footerLinks).filter(([title]) => title !== 'legal').map(([title, links]) => (
            <div key={title}>
              <h4 className="luxury-subheading text-gold mb-6">
                {title}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link to={link.href} className="text-sm text-stone/80 hover:text-cream transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-stone/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-stone/60 text-center md:text-left leading-relaxed max-w-xl">
            © 2026 MECCIO. All rights reserved.{' '}
            <Link to="/license" className="hover:text-cream transition-colors underline-offset-2 hover:underline">
              License
            </Link>
            .{' '}
            Designed &amp; Developed by{' '}
            <a
              href="https://codewavestudio.space"
              target="_blank"
              rel="noopener noreferrer"
              className="text-stone/60 hover:text-cream transition-colors"
            >
              CodeWave Studio
            </a>
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            {(footerLinks.legal || defaultFooterLinks.legal).map((link) => (
              <Link key={link.href} to={link.href} className="text-xs text-stone/60 hover:text-cream transition-colors">
                {link.label}
              </Link>
            ))}
            <Link to="/license" className="text-xs text-stone/60 hover:text-cream transition-colors">
              License
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
