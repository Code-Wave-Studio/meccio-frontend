import { useEffect, useState, type ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  ADMIN_INPUT,
  AdminCard,
  AdminField,
  AdminRepeatableSection,
} from '@/admin/components/AdminFormBits';
import { adminApi } from '@/lib/api';
import { parseSettingJson } from '@/hooks/useSiteSettings';
import { cn } from '@/lib/utils';
import {
  DEFAULT_CUSTOM_RUG_FORM_FIELDS,
  normalizeCustomRugFields,
  slugifyFieldKey,
  type CustomRugFormField,
  type CustomRugFieldSection,
  type CustomRugFieldType,
} from '@/lib/customRugForm';
import {
  DEFAULT_SHOP_FILTERS,
  normalizeShopFilters,
  type ShopFiltersConfig,
} from '@/lib/shopFilters';

interface NavLink {
  label: string;
  href: string;
  mega: boolean;
}

interface MegaItem {
  label: string;
  href: string;
  description: string;
}

interface FooterLink {
  label: string;
  href: string;
}

interface SocialLink {
  label: string;
  url: string;
  icon: string;
}

interface TrustBadge {
  icon: string;
  text: string;
}

type FooterColumns = {
  shop: FooterLink[];
  company: FooterLink[];
  support: FooterLink[];
  legal: FooterLink[];
};

type TabId = 'general' | 'header' | 'footer' | 'product' | 'custom' | 'about' | 'shop';

const TABS: { id: TabId; label: string; hint: string }[] = [
  { id: 'general', label: 'General', hint: 'Brand & contact' },
  { id: 'header', label: 'Header', hint: 'Nav & announcement' },
  { id: 'footer', label: 'Footer', hint: 'Links & social' },
  { id: 'shop', label: 'Shop', hint: 'Filters & sort' },
  { id: 'about', label: 'About', hint: 'Craftsmanship' },
  { id: 'custom', label: 'Custom Form', hint: 'Custom rugs fields' },
  { id: 'product', label: 'Product', hint: 'Trust badges' },
];

const DEFAULT_ABOUT_CRAFT = {
  eyebrow: 'Craftsmanship',
  title: 'Where Tradition Meets Innovation',
  paragraph_1:
    "From the highlands of Tibet to the workshops of Isfahan, we partner with the world's most skilled weavers. Each MECCIO rug passes through the hands of artisans who have dedicated their lives to the craft.",
  paragraph_2:
    'Our design studio in New York collaborates with interior designers, architects, and hospitality brands to create bespoke pieces that define spaces.',
};

const FOOTER_COLUMN_META: { key: keyof FooterColumns; label: string }[] = [
  { key: 'shop', label: 'Shop links' },
  { key: 'company', label: 'Company links' },
  { key: 'support', label: 'Support links' },
  { key: 'legal', label: 'Legal links' },
];

const SOCIAL_ICONS = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'twitter', label: 'Twitter / X' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'etsy', label: 'Etsy' },
  { value: 'globe', label: 'Website' },
];

const TRUST_ICONS = [
  { value: 'truck', label: 'Truck' },
  { value: 'shield', label: 'Shield' },
  { value: 'return', label: 'Return' },
  { value: 'package', label: 'Package' },
  { value: 'check', label: 'Check' },
];

const emptyNav = (): NavLink => ({ label: '', href: '/', mega: false });
const emptyMega = (): MegaItem => ({ label: '', href: '/', description: '' });
const emptyFooterLink = (): FooterLink => ({ label: '', href: '/' });
const emptySocial = (): SocialLink => ({ label: '', url: 'https://', icon: 'instagram' });
const emptyBadge = (): TrustBadge => ({ icon: 'truck', text: '' });

const emptyFooterColumns = (): FooterColumns => ({
  shop: [emptyFooterLink()],
  company: [emptyFooterLink()],
  support: [emptyFooterLink()],
  legal: [emptyFooterLink()],
});

function parseFooterLinks(raw: string | undefined): FooterColumns {
  const parsed = parseSettingJson<Partial<FooterColumns>>(raw, {});
  const next = emptyFooterColumns();
  for (const { key } of FOOTER_COLUMN_META) {
    const list = parsed[key];
    next[key] = Array.isArray(list) && list.length
      ? list.map((l) => ({ label: l.label || '', href: l.href || '/' }))
      : [emptyFooterLink()];
  }
  return next;
}

function Panel({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="bg-[#faf8f5] border border-[#e8e0d5] p-4 sm:p-5 space-y-4">
      <div>
        <h2 className="text-sm font-medium text-[#1a1714]">{title}</h2>
        {description && <p className="text-xs text-[#9c8b7a] mt-1">{description}</p>}
      </div>
      {children}
    </section>
  );
}

export default function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<TabId>('general');

  const [general, setGeneral] = useState({
    site_name: '',
    site_tagline: '',
    contact_email: '',
    contact_phone: '',
    default_currency: 'INR',
  });

  const [announcement, setAnnouncement] = useState({
    header_announcement: '',
    header_show_announcement: false,
  });

  const [footer, setFooter] = useState({
    footer_email: '',
    footer_phone: '',
    footer_address: '',
    footer_description: '',
  });

  const [navLinks, setNavLinks] = useState<NavLink[]>([emptyNav()]);
  const [megaMenu, setMegaMenu] = useState<MegaItem[]>([emptyMega()]);
  const [footerLinks, setFooterLinks] = useState<FooterColumns>(emptyFooterColumns());
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([emptySocial()]);
  const [trustBadges, setTrustBadges] = useState<TrustBadge[]>([emptyBadge()]);
  const [customFields, setCustomFields] = useState<CustomRugFormField[]>(DEFAULT_CUSTOM_RUG_FORM_FIELDS);
  const [aboutCraft, setAboutCraft] = useState(DEFAULT_ABOUT_CRAFT);
  const [shopFilters, setShopFilters] = useState<ShopFiltersConfig>(DEFAULT_SHOP_FILTERS);

  const { data: settings, isLoading } = useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: async () => {
      const res = await adminApi.settings.get();
      return (res.data?.data ?? {}) as Record<string, string>;
    },
  });

  useEffect(() => {
    if (!settings) return;

    setGeneral({
      site_name: settings.site_name || '',
      site_tagline: settings.site_tagline || '',
      contact_email: settings.contact_email || '',
      contact_phone: settings.contact_phone || '',
      default_currency: settings.default_currency || 'INR',
    });

    setAnnouncement({
      header_announcement: settings.header_announcement || '',
      header_show_announcement: settings.header_show_announcement !== '0',
    });

    setFooter({
      footer_email: settings.footer_email || '',
      footer_phone: settings.footer_phone || '',
      footer_address: settings.footer_address || '',
      footer_description: settings.footer_description || '',
    });

    const nav = parseSettingJson<NavLink[]>(settings.header_nav_links, []);
    setNavLinks(
      nav.length
        ? nav.map((n) => ({ label: n.label || '', href: n.href || '/', mega: Boolean(n.mega) }))
        : [emptyNav()],
    );

    const mega = parseSettingJson<MegaItem[]>(settings.header_mega_menu, []);
    setMegaMenu(
      mega.length
        ? mega.map((m) => ({
            label: m.label || '',
            href: m.href || '/',
            description: m.description || '',
          }))
        : [emptyMega()],
    );

    setFooterLinks(parseFooterLinks(settings.footer_links));

    const social = parseSettingJson<SocialLink[]>(settings.footer_social_links, []);
    setSocialLinks(
      social.length
        ? social.map((s) => ({
            label: s.label || '',
            url: s.url || 'https://',
            icon: s.icon || 'instagram',
          }))
        : [emptySocial()],
    );

    const badges = parseSettingJson<TrustBadge[]>(settings.product_trust_badges, []);
    setTrustBadges(
      badges.length
        ? badges.map((b) => ({ icon: b.icon || 'truck', text: b.text || '' }))
        : [emptyBadge()],
    );

    setCustomFields(
      normalizeCustomRugFields(
        parseSettingJson(settings.custom_rug_form_fields, DEFAULT_CUSTOM_RUG_FORM_FIELDS),
      ),
    );

    const craft = parseSettingJson<Partial<typeof DEFAULT_ABOUT_CRAFT>>(
      settings.about_craftsmanship,
      {},
    );
    setAboutCraft({ ...DEFAULT_ABOUT_CRAFT, ...craft });
    setShopFilters(
      normalizeShopFilters(parseSettingJson(settings.shop_filters, DEFAULT_SHOP_FILTERS)),
    );
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: () => {
      const cleanNav = navLinks.filter((n) => n.label.trim() && n.href.trim());
      const cleanMega = megaMenu.filter((m) => m.label.trim() && m.href.trim());
      const cleanSocial = socialLinks.filter((s) => s.label.trim() && s.url.trim());
      const cleanBadges = trustBadges.filter((b) => b.text.trim());

      const cleanFooter: FooterColumns = {
        shop: footerLinks.shop.filter((l) => l.label.trim() && l.href.trim()),
        company: footerLinks.company.filter((l) => l.label.trim() && l.href.trim()),
        support: footerLinks.support.filter((l) => l.label.trim() && l.href.trim()),
        legal: footerLinks.legal.filter((l) => l.label.trim() && l.href.trim()),
      };

      return adminApi.settings.update({
        ...general,
        header_announcement: announcement.header_announcement,
        header_show_announcement: announcement.header_show_announcement ? '1' : '0',
        ...footer,
        header_nav_links: cleanNav,
        header_mega_menu: cleanMega,
        footer_links: cleanFooter,
        footer_social_links: cleanSocial,
        product_trust_badges: cleanBadges,
        custom_rug_form_fields: customFields.map((f, i) => ({
          ...f,
          id: f.id || f.key || `field_${i}`,
          key: f.key || slugifyFieldKey(f.label),
          options: f.type === 'select' ? (f.options || []).filter(Boolean) : undefined,
        })),
        about_craftsmanship: aboutCraft,
        shop_filters: shopFilters,
      });
    },
    onSuccess: () => {
      toast.success('Settings saved');
      queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] });
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
    onError: () => toast.error('Could not save settings'),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="animate-spin text-[#c4a962]" />
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-medium">Settings</h1>
          <p className="text-sm text-[#9c8b7a] mt-1">Manage storefront content by section</p>
        </div>
        <button
          type="button"
          disabled={saveMutation.isPending}
          onClick={() => saveMutation.mutate()}
          className="px-6 py-3 bg-[#1a1714] text-white text-sm uppercase tracking-wider disabled:opacity-60 shrink-0"
        >
          {saveMutation.isPending ? 'Saving…' : 'Save Settings'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-[#e8e0d5] pb-px -mx-1 px-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              'px-4 py-3 text-left whitespace-nowrap border-b-2 transition-colors',
              tab === t.id
                ? 'border-[#c4a962] text-[#1a1714]'
                : 'border-transparent text-[#9c8b7a] hover:text-[#1a1714]',
            )}
          >
            <span className="block text-sm font-medium">{t.label}</span>
            <span className="block text-[11px] mt-0.5 opacity-70">{t.hint}</span>
          </button>
        ))}
      </div>

      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          saveMutation.mutate();
        }}
      >
        {tab === 'general' && (
          <Panel title="Brand & contact" description="Used across the site for SEO and contact surfaces">
            <div className="grid sm:grid-cols-2 gap-3">
              <AdminField label="Site name">
                <input className={ADMIN_INPUT} value={general.site_name} onChange={(e) => setGeneral({ ...general, site_name: e.target.value })} />
              </AdminField>
              <AdminField label="Tagline">
                <input className={ADMIN_INPUT} value={general.site_tagline} onChange={(e) => setGeneral({ ...general, site_tagline: e.target.value })} />
              </AdminField>
              <AdminField label="Contact email">
                <input className={ADMIN_INPUT} type="email" value={general.contact_email} onChange={(e) => setGeneral({ ...general, contact_email: e.target.value })} />
              </AdminField>
              <AdminField label="Contact phone">
                <input className={ADMIN_INPUT} value={general.contact_phone} onChange={(e) => setGeneral({ ...general, contact_phone: e.target.value })} />
              </AdminField>
              <AdminField label="Default currency">
                <select className={ADMIN_INPUT} value={general.default_currency} onChange={(e) => setGeneral({ ...general, default_currency: e.target.value })}>
                  <option value="INR">INR</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </AdminField>
            </div>
          </Panel>
        )}

        {tab === 'header' && (
          <>
            <Panel title="Announcement bar" description="Optional top bar above the navbar">
              <label className="inline-flex items-center gap-2 text-sm text-[#5c5248]">
                <input
                  type="checkbox"
                  checked={announcement.header_show_announcement}
                  onChange={(e) => setAnnouncement({ ...announcement, header_show_announcement: e.target.checked })}
                />
                Show announcement bar
              </label>
              <AdminField label="Announcement text">
                <textarea
                  className={`${ADMIN_INPUT} resize-none`}
                  rows={2}
                  value={announcement.header_announcement}
                  onChange={(e) => setAnnouncement({ ...announcement, header_announcement: e.target.value })}
                />
              </AdminField>
            </Panel>

            <div className="bg-white border border-[#e8e0d5] p-4 sm:p-5 space-y-4">
              <AdminRepeatableSection
                title="Header navigation"
                description="Main menu links"
                addLabel="Add link"
                onAdd={() => setNavLinks((p) => [...p, emptyNav()])}
              >
                {navLinks.map((link, index) => (
                  <AdminCard
                    key={index}
                    index={index}
                    title={link.label || `Link ${index + 1}`}
                    onRemove={() => setNavLinks((p) => p.filter((_, i) => i !== index))}
                  >
                    <div className="grid sm:grid-cols-2 gap-3">
                      <AdminField label="Label">
                        <input className={ADMIN_INPUT} value={link.label} onChange={(e) => setNavLinks((p) => p.map((n, i) => (i === index ? { ...n, label: e.target.value } : n)))} />
                      </AdminField>
                      <AdminField label="URL / path">
                        <input className={ADMIN_INPUT} placeholder="/shop" value={link.href} onChange={(e) => setNavLinks((p) => p.map((n, i) => (i === index ? { ...n, href: e.target.value } : n)))} />
                      </AdminField>
                    </div>
                    <label className="inline-flex items-center gap-2 text-sm text-[#5c5248]">
                      <input type="checkbox" checked={link.mega} onChange={(e) => setNavLinks((p) => p.map((n, i) => (i === index ? { ...n, mega: e.target.checked } : n)))} />
                      Open mega menu
                    </label>
                  </AdminCard>
                ))}
              </AdminRepeatableSection>
            </div>

            <div className="bg-white border border-[#e8e0d5] p-4 sm:p-5 space-y-4">
              <AdminRepeatableSection
                title="Collections mega menu"
                description="Shown when a nav link has mega menu enabled"
                addLabel="Add item"
                onAdd={() => setMegaMenu((p) => [...p, emptyMega()])}
              >
                {megaMenu.map((item, index) => (
                  <AdminCard
                    key={index}
                    index={index}
                    title={item.label || `Item ${index + 1}`}
                    onRemove={() => setMegaMenu((p) => p.filter((_, i) => i !== index))}
                  >
                    <div className="grid sm:grid-cols-2 gap-3">
                      <AdminField label="Label">
                        <input className={ADMIN_INPUT} value={item.label} onChange={(e) => setMegaMenu((p) => p.map((m, i) => (i === index ? { ...m, label: e.target.value } : m)))} />
                      </AdminField>
                      <AdminField label="URL / path">
                        <input className={ADMIN_INPUT} value={item.href} onChange={(e) => setMegaMenu((p) => p.map((m, i) => (i === index ? { ...m, href: e.target.value } : m)))} />
                      </AdminField>
                    </div>
                    <AdminField label="Description">
                      <input className={ADMIN_INPUT} value={item.description} onChange={(e) => setMegaMenu((p) => p.map((m, i) => (i === index ? { ...m, description: e.target.value } : m)))} />
                    </AdminField>
                  </AdminCard>
                ))}
              </AdminRepeatableSection>
            </div>
          </>
        )}

        {tab === 'footer' && (
          <>
            <Panel title="Footer contact" description="Shown in the footer brand column">
              <AdminField label="Description">
                <textarea
                  className={`${ADMIN_INPUT} resize-none`}
                  rows={3}
                  value={footer.footer_description}
                  onChange={(e) => setFooter({ ...footer, footer_description: e.target.value })}
                />
              </AdminField>
              <div className="grid sm:grid-cols-2 gap-3">
                <AdminField label="Email">
                  <input className={ADMIN_INPUT} type="email" value={footer.footer_email} onChange={(e) => setFooter({ ...footer, footer_email: e.target.value })} />
                </AdminField>
                <AdminField label="Phone">
                  <input className={ADMIN_INPUT} value={footer.footer_phone} onChange={(e) => setFooter({ ...footer, footer_phone: e.target.value })} />
                </AdminField>
              </div>
              <AdminField label="Address">
                <input className={ADMIN_INPUT} value={footer.footer_address} onChange={(e) => setFooter({ ...footer, footer_address: e.target.value })} />
              </AdminField>

              <div className="rounded border border-[#e8e0d5] bg-white px-4 py-3 text-xs text-[#5c5248] leading-relaxed">
                <p className="uppercase tracking-wider text-[#9c8b7a] mb-1.5">Fixed copyright (not editable)</p>
                <p>
                  © 2026 MECCIO. All rights reserved. Designed &amp; Developed by{' '}
                  <a href="https://codewavestudio.space" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 text-[#5c5248] hover:text-[#1a1714]">
                    CodeWave Studio
                  </a>
                </p>
                <p className="mt-1 text-[#9c8b7a]">License page: /license</p>
              </div>
            </Panel>

            {FOOTER_COLUMN_META.map(({ key, label }) => (
              <div key={key} className="bg-white border border-[#e8e0d5] p-4 sm:p-5 space-y-4">
                <AdminRepeatableSection
                  title={label}
                  addLabel="Add link"
                  onAdd={() =>
                    setFooterLinks((p) => ({
                      ...p,
                      [key]: [...p[key], emptyFooterLink()],
                    }))
                  }
                >
                  {footerLinks[key].map((link, index) => (
                    <AdminCard
                      key={index}
                      index={index}
                      title={link.label || `Link ${index + 1}`}
                      onRemove={() =>
                        setFooterLinks((p) => ({
                          ...p,
                          [key]: p[key].filter((_, i) => i !== index),
                        }))
                      }
                    >
                      <div className="grid sm:grid-cols-2 gap-3">
                        <AdminField label="Label">
                          <input
                            className={ADMIN_INPUT}
                            value={link.label}
                            onChange={(e) =>
                              setFooterLinks((p) => ({
                                ...p,
                                [key]: p[key].map((l, i) => (i === index ? { ...l, label: e.target.value } : l)),
                              }))
                            }
                          />
                        </AdminField>
                        <AdminField label="URL / path">
                          <input
                            className={ADMIN_INPUT}
                            value={link.href}
                            onChange={(e) =>
                              setFooterLinks((p) => ({
                                ...p,
                                [key]: p[key].map((l, i) => (i === index ? { ...l, href: e.target.value } : l)),
                              }))
                            }
                          />
                        </AdminField>
                      </div>
                    </AdminCard>
                  ))}
                </AdminRepeatableSection>
              </div>
            ))}

            <div className="bg-white border border-[#e8e0d5] p-4 sm:p-5 space-y-4">
              <AdminRepeatableSection
                title="Social links"
                description="Icons in the footer"
                addLabel="Add social"
                onAdd={() => setSocialLinks((p) => [...p, emptySocial()])}
              >
                {socialLinks.map((link, index) => (
                  <AdminCard
                    key={index}
                    index={index}
                    title={link.label || `Social ${index + 1}`}
                    onRemove={() => setSocialLinks((p) => p.filter((_, i) => i !== index))}
                  >
                    <div className="grid sm:grid-cols-3 gap-3">
                      <AdminField label="Label">
                        <input className={ADMIN_INPUT} value={link.label} onChange={(e) => setSocialLinks((p) => p.map((s, i) => (i === index ? { ...s, label: e.target.value } : s)))} />
                      </AdminField>
                      <AdminField label="Icon">
                        <select className={ADMIN_INPUT} value={link.icon} onChange={(e) => setSocialLinks((p) => p.map((s, i) => (i === index ? { ...s, icon: e.target.value } : s)))}>
                          {SOCIAL_ICONS.map((icon) => (
                            <option key={icon.value} value={icon.value}>{icon.label}</option>
                          ))}
                        </select>
                      </AdminField>
                      <AdminField label="URL">
                        <input className={ADMIN_INPUT} value={link.url} onChange={(e) => setSocialLinks((p) => p.map((s, i) => (i === index ? { ...s, url: e.target.value } : s)))} />
                      </AdminField>
                    </div>
                  </AdminCard>
                ))}
              </AdminRepeatableSection>
            </div>
          </>
        )}

        {tab === 'about' && (
          <Panel
            title="Craftsmanship section"
            description="Edit the About page Craftsmanship block only. Image is managed under Page Images → About — craft."
          >
            <AdminField label="Eyebrow">
              <input
                className={ADMIN_INPUT}
                value={aboutCraft.eyebrow}
                onChange={(e) => setAboutCraft({ ...aboutCraft, eyebrow: e.target.value })}
              />
            </AdminField>
            <AdminField label="Title">
              <input
                className={ADMIN_INPUT}
                value={aboutCraft.title}
                onChange={(e) => setAboutCraft({ ...aboutCraft, title: e.target.value })}
              />
            </AdminField>
            <AdminField label="Paragraph 1">
              <textarea
                className={`${ADMIN_INPUT} resize-none`}
                rows={4}
                value={aboutCraft.paragraph_1}
                onChange={(e) => setAboutCraft({ ...aboutCraft, paragraph_1: e.target.value })}
              />
            </AdminField>
            <AdminField label="Paragraph 2">
              <textarea
                className={`${ADMIN_INPUT} resize-none`}
                rows={4}
                value={aboutCraft.paragraph_2}
                onChange={(e) => setAboutCraft({ ...aboutCraft, paragraph_2: e.target.value })}
              />
            </AdminField>
          </Panel>
        )}

        {tab === 'custom' && (
          <div className="bg-white border border-[#e8e0d5] p-4 sm:p-5 space-y-4">
            <AdminRepeatableSection
              title="Custom Rugs form fields"
              description="Add, remove, or reorder fields shown on /custom-rugs. Name & Email are required and cannot be deleted."
              addLabel="Add field"
              onAdd={() => {
                const id = `field_${Date.now().toString(36)}`;
                setCustomFields((p) => [
                  ...p,
                  {
                    id,
                    key: id,
                    label: 'New Field',
                    type: 'text',
                    required: false,
                    enabled: true,
                    placeholder: '',
                    section: 'preferences',
                    width: 'full',
                    options: [],
                  },
                ]);
              }}
            >
              {customFields.map((field, index) => (
                <AdminCard
                  key={field.id}
                  index={index}
                  title={field.label || `Field ${index + 1}`}
                  onRemove={() => {
                    if (field.locked) {
                      toast.error('Name and Email fields cannot be removed');
                      return;
                    }
                    setCustomFields((p) => p.filter((_, i) => i !== index));
                  }}
                >
                  <div className="grid sm:grid-cols-2 gap-3">
                    <AdminField label="Label">
                      <input
                        className={ADMIN_INPUT}
                        value={field.label}
                        onChange={(e) => {
                          const label = e.target.value;
                          setCustomFields((p) =>
                            p.map((f, i) =>
                              i === index
                                ? {
                                    ...f,
                                    label,
                                    key: f.locked ? f.key : slugifyFieldKey(label) || f.key,
                                  }
                                : f,
                            ),
                          );
                        }}
                      />
                    </AdminField>
                    <AdminField label="Field key">
                      <input
                        className={ADMIN_INPUT}
                        value={field.key}
                        disabled={field.locked}
                        onChange={(e) =>
                          setCustomFields((p) =>
                            p.map((f, i) =>
                              i === index
                                ? { ...f, key: slugifyFieldKey(e.target.value) || f.key }
                                : f,
                            ),
                          )
                        }
                      />
                    </AdminField>
                    <AdminField label="Type">
                      <select
                        className={ADMIN_INPUT}
                        value={field.type}
                        onChange={(e) =>
                          setCustomFields((p) =>
                            p.map((f, i) =>
                              i === index
                                ? { ...f, type: e.target.value as CustomRugFieldType }
                                : f,
                            ),
                          )
                        }
                      >
                        <option value="text">Text</option>
                        <option value="email">Email</option>
                        <option value="tel">Phone</option>
                        <option value="select">Dropdown</option>
                        <option value="textarea">Textarea</option>
                      </select>
                    </AdminField>
                    <AdminField label="Section">
                      <select
                        className={ADMIN_INPUT}
                        value={field.section}
                        onChange={(e) =>
                          setCustomFields((p) =>
                            p.map((f, i) =>
                              i === index
                                ? { ...f, section: e.target.value as CustomRugFieldSection }
                                : f,
                            ),
                          )
                        }
                      >
                        <option value="contact">Contact</option>
                        <option value="project">Project</option>
                        <option value="preferences">Preferences</option>
                      </select>
                    </AdminField>
                    <AdminField label="Width">
                      <select
                        className={ADMIN_INPUT}
                        value={field.width}
                        onChange={(e) =>
                          setCustomFields((p) =>
                            p.map((f, i) =>
                              i === index
                                ? { ...f, width: e.target.value === 'half' ? 'half' : 'full' }
                                : f,
                            ),
                          )
                        }
                      >
                        <option value="full">Full width</option>
                        <option value="half">Half width</option>
                      </select>
                    </AdminField>
                    <AdminField label="Placeholder">
                      <input
                        className={ADMIN_INPUT}
                        value={field.placeholder || ''}
                        onChange={(e) =>
                          setCustomFields((p) =>
                            p.map((f, i) => (i === index ? { ...f, placeholder: e.target.value } : f)),
                          )
                        }
                      />
                    </AdminField>
                  </div>

                  {field.type === 'select' && (
                    <AdminField label="Dropdown options (one per line)">
                      <textarea
                        className={`${ADMIN_INPUT} resize-y min-h-[88px] font-mono text-xs`}
                        value={(field.options || []).join('\n')}
                        onChange={(e) =>
                          setCustomFields((p) =>
                            p.map((f, i) =>
                              i === index
                                ? {
                                    ...f,
                                    options: e.target.value
                                      .split('\n')
                                      .map((o) => o.trim())
                                      .filter(Boolean),
                                  }
                                : f,
                            ),
                          )
                        }
                      />
                    </AdminField>
                  )}

                  <div className="flex flex-wrap gap-4">
                    <label className="inline-flex items-center gap-2 text-sm text-[#5c5248]">
                      <input
                        type="checkbox"
                        checked={field.required}
                        disabled={field.locked}
                        onChange={(e) =>
                          setCustomFields((p) =>
                            p.map((f, i) => (i === index ? { ...f, required: e.target.checked } : f)),
                          )
                        }
                      />
                      Required
                    </label>
                    <label className="inline-flex items-center gap-2 text-sm text-[#5c5248]">
                      <input
                        type="checkbox"
                        checked={field.enabled}
                        disabled={field.locked}
                        onChange={(e) =>
                          setCustomFields((p) =>
                            p.map((f, i) => (i === index ? { ...f, enabled: e.target.checked } : f)),
                          )
                        }
                      />
                      Show on form
                    </label>
                    {field.locked && (
                      <span className="text-[11px] uppercase tracking-wider text-[#9c8b7a]">Locked field</span>
                    )}
                  </div>
                </AdminCard>
              ))}
            </AdminRepeatableSection>
          </div>
        )}

        {tab === 'shop' && (
          <div className="space-y-4">
            <Panel title="Visible filters" description="Turn shop sidebar / drawer filters on or off">
              <div className="grid sm:grid-cols-2 gap-2">
                {(
                  [
                    ['show_search', 'Search bar'],
                    ['show_sort', 'Sort by'],
                    ['show_category', 'Category'],
                    ['show_collection', 'Collection'],
                    ['show_material', 'Material'],
                    ['show_color', 'Color'],
                    ['show_price', 'Price range'],
                  ] as const
                ).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 text-sm min-h-[40px] bg-white border border-[#e8e0d5] px-3">
                    <input
                      type="checkbox"
                      checked={shopFilters[key]}
                      onChange={(e) => setShopFilters({ ...shopFilters, [key]: e.target.checked })}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </Panel>

            <Panel title="Filter labels" description="Titles shown above each filter group on the shop page">
              <div className="grid sm:grid-cols-2 gap-3">
                {(
                  [
                    ['sort', 'Sort label'],
                    ['category', 'Category label'],
                    ['collection', 'Collection label'],
                    ['material', 'Material label'],
                    ['color', 'Color label'],
                    ['price', 'Price label'],
                    ['clear', 'Clear button text'],
                  ] as const
                ).map(([key, label]) => (
                  <AdminField key={key} label={label}>
                    <input
                      className={ADMIN_INPUT}
                      value={shopFilters.labels[key]}
                      onChange={(e) =>
                        setShopFilters({
                          ...shopFilters,
                          labels: { ...shopFilters.labels, [key]: e.target.value },
                        })
                      }
                    />
                  </AdminField>
                ))}
              </div>
            </Panel>

            <Panel title="Sort options" description="Enable options and set the default sort for /shop">
              <AdminField label="Default sort">
                <select
                  className={ADMIN_INPUT}
                  value={shopFilters.default_sort}
                  onChange={(e) => setShopFilters({ ...shopFilters, default_sort: e.target.value })}
                >
                  {shopFilters.sort_options
                    .filter((o) => o.enabled)
                    .map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                </select>
              </AdminField>
              <div className="space-y-3 pt-2">
                {shopFilters.sort_options.map((opt, index) => (
                  <div key={opt.value} className="grid sm:grid-cols-[1fr_auto] gap-3 items-end border border-[#e8e0d5] bg-white p-3">
                    <AdminField label={`Label · ${opt.value}`}>
                      <input
                        className={ADMIN_INPUT}
                        value={opt.label}
                        onChange={(e) =>
                          setShopFilters({
                            ...shopFilters,
                            sort_options: shopFilters.sort_options.map((s, i) =>
                              i === index ? { ...s, label: e.target.value } : s,
                            ),
                          })
                        }
                      />
                    </AdminField>
                    <label className="flex items-center gap-2 text-sm min-h-[42px] pb-0.5">
                      <input
                        type="checkbox"
                        checked={opt.enabled}
                        onChange={(e) =>
                          setShopFilters({
                            ...shopFilters,
                            sort_options: shopFilters.sort_options.map((s, i) =>
                              i === index ? { ...s, enabled: e.target.checked } : s,
                            ),
                          })
                        }
                      />
                      Enabled
                    </label>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        )}

        {tab === 'product' && (
          <div className="bg-white border border-[#e8e0d5] p-4 sm:p-5 space-y-4">
            <AdminRepeatableSection
              title="Product trust badges"
              description="Shown on product pages under the buy box"
              addLabel="Add badge"
              onAdd={() => setTrustBadges((p) => [...p, emptyBadge()])}
            >
              {trustBadges.map((badge, index) => (
                <AdminCard
                  key={index}
                  index={index}
                  title={badge.text || `Badge ${index + 1}`}
                  onRemove={() => setTrustBadges((p) => p.filter((_, i) => i !== index))}
                >
                  <div className="grid sm:grid-cols-2 gap-3">
                    <AdminField label="Icon">
                      <select className={ADMIN_INPUT} value={badge.icon} onChange={(e) => setTrustBadges((p) => p.map((b, i) => (i === index ? { ...b, icon: e.target.value } : b)))}>
                        {TRUST_ICONS.map((icon) => (
                          <option key={icon.value} value={icon.value}>{icon.label}</option>
                        ))}
                      </select>
                    </AdminField>
                    <AdminField label="Text">
                      <input className={ADMIN_INPUT} value={badge.text} onChange={(e) => setTrustBadges((p) => p.map((b, i) => (i === index ? { ...b, text: e.target.value } : b)))} />
                    </AdminField>
                  </div>
                </AdminCard>
              ))}
            </AdminRepeatableSection>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saveMutation.isPending}
            className="w-full sm:w-auto px-6 py-3 bg-[#1a1714] text-white text-sm uppercase tracking-wider disabled:opacity-60"
          >
            {saveMutation.isPending ? 'Saving…' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
