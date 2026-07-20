import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Search, ShoppingBag, Heart, User, ChevronDown } from 'lucide-react';
import Logo from '@/components/Logo';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { parseSettingJson, useSiteSettings } from '@/hooks/useSiteSettings';

const defaultNavLinks = [
  { label: 'Shop', href: '/shop' },
  { label: 'Collections', href: '/collections', mega: true },
  { label: 'Custom Rugs', href: '/custom-rugs' },
  { label: 'About', href: '/about' },
];

const defaultMegaMenu = [
  { label: 'Luxury Collection', href: '/collections/luxury-collection', description: 'The pinnacle of artisan craftsmanship' },
  { label: 'Modern Collection', href: '/collections/modern-collection', description: 'Contemporary designs for modern living' },
  { label: 'Persian Collection', href: '/collections/persian-collection', description: 'Timeless Persian artistry' },
  { label: 'Handmade Collection', href: '/collections/handmade-collection', description: 'Hand-knotted by master artisans' },
  { label: 'Wool Collection', href: '/collections/wool-collection', description: 'Premium natural wool rugs' },
  { label: 'Silk Collection', href: '/collections/silk-collection', description: 'Lustrous silk masterpieces' },
];

export default function Navbar({ onSearchOpen }: { onSearchOpen: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const { cart, wishlistCount } = useCart();
  const { user } = useAuth();
  const { data: settings = {} } = useSiteSettings();
  const location = useLocation();
  const navLinks = parseSettingJson<{ label: string; href: string; mega?: boolean }[]>(
    settings.header_nav_links,
    defaultNavLinks,
  );
  const megaMenuItems = parseSettingJson<{ label: string; href: string; description?: string }[]>(
    settings.header_mega_menu,
    defaultMegaMenu,
  );
  const announcement = settings.header_announcement || 'Complimentary shipping on orders over $500 · Handcrafted luxury worldwide';
  const showAnnouncement = settings.header_show_announcement !== '0';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setMegaOpen(false);
  }, [location]);

  return (
    <>
      {/* Top announcement bar */}
      {showAnnouncement && (
        <div className="fixed top-0 left-0 right-0 z-[51] bg-espresso text-cream text-center text-xs tracking-[0.15em] uppercase py-2.5">
          {announcement}
        </div>
      )}

      <header
        className={`fixed left-0 right-0 z-50 transition-all duration-500 border-b ${
          showAnnouncement ? 'top-[36px]' : 'top-0'
        } ${
          scrolled
            ? 'bg-white/97 backdrop-blur-lg shadow-[0_4px_30px_rgba(44,40,37,0.08)] border-gold py-3'
            : 'bg-black border-transparent py-4'
        }`}
      >
        <div className="container-luxury flex items-center justify-between gap-6">
          <Logo
            className="shrink-0"
            imageClassName="h-11 w-11 md:h-12 md:w-12 lg:h-14 lg:w-14"
          />

          <nav className="hidden xl:flex items-center justify-center gap-7 flex-1">
            {navLinks.map((link) => (
              <div
                key={link.href}
                className="relative"
                onMouseEnter={() => link.mega && setMegaOpen(true)}
                onMouseLeave={() => link.mega && setMegaOpen(false)}
              >
                <Link
                  to={link.href}
                  className={`nav-link text-[11px] uppercase tracking-[0.14em] font-medium transition-colors duration-300 flex items-center gap-1 link-underline ${
                    scrolled ? 'text-charcoal hover:text-gold-dark' : 'text-cream hover:text-gold-light'
                  }`}
                >
                  {link.label}
                  {link.mega && <ChevronDown size={13} />}
                </Link>
              </div>
            ))}
          </nav>

          <div className={`flex items-center gap-1 md:gap-2 shrink-0 ${scrolled ? 'text-charcoal' : 'text-cream'}`}>
            <button onClick={onSearchOpen} className="nav-link p-2.5 hover:text-gold transition-colors" aria-label="Search">
              <Search size={20} />
            </button>
            <Link to="/wishlist" className="nav-link p-2.5 hover:text-gold transition-colors relative hidden sm:block" aria-label="Wishlist">
              <Heart size={20} />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-gold text-espresso text-[10px] rounded-full flex items-center justify-center font-medium">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <Link to="/cart" className="nav-link p-2.5 hover:text-gold transition-colors relative" aria-label="Cart">
              <ShoppingBag size={20} />
              {(cart?.item_count ?? 0) > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-gold text-espresso text-[10px] rounded-full flex items-center justify-center font-medium">
                  {cart?.item_count}
                </span>
              )}
            </Link>
            <Link to={user ? '/dashboard' : '/login'} className="nav-link p-2.5 hover:text-gold transition-colors hidden md:block" aria-label="Account">
              <User size={20} />
            </Link>
            <button
              className="nav-link xl:hidden p-2.5"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {megaOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="absolute top-full left-0 right-0 bg-cream/98 backdrop-blur-xl border-t border-sand/30 shadow-xl"
              onMouseEnter={() => setMegaOpen(true)}
              onMouseLeave={() => setMegaOpen(false)}
            >
              <div className="container-luxury py-10 grid grid-cols-2 lg:grid-cols-3 gap-4">
                {megaMenuItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className="nav-link group p-5 rounded-sm hover:bg-white transition-colors duration-300 border border-transparent hover:border-sand/50"
                  >
                    <h4 className="font-display text-xl mb-1 group-hover:text-gold-dark transition-colors">{item.label}</h4>
                    {item.description && (
                      <p className="text-sm text-stone leading-relaxed">{item.description}</p>
                    )}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 z-[60] bg-cream xl:hidden overflow-y-auto"
          >
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-sand/40">
              <p className="text-xs uppercase tracking-[0.14em] text-stone">Menu</p>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="nav-link inline-flex items-center gap-2 px-3 py-2 border border-sand/50 text-charcoal hover:border-charcoal transition-colors"
                aria-label="Close menu"
              >
                <X size={20} />
                <span className="text-[11px] uppercase tracking-[0.12em]">Close</span>
              </button>
            </div>
            <nav className="flex flex-col gap-1 px-6 pt-4 pb-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="nav-link text-xl font-display text-charcoal border-b border-sand/30 py-4"
                >
                  {link.label}
                </Link>
              ))}
              <Link to="/wishlist" className="text-lg text-stone py-3">Wishlist</Link>
              <Link to={user ? '/dashboard' : '/login'} className="text-lg text-stone py-3">
                {user ? 'My Account' : 'Sign In'}
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
