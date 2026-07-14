import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './Navbar';
import Footer from './Footer';
import SearchOverlay from './SearchOverlay';
import ScrollProgress from './ScrollProgress';
import BackToTop from './BackToTop';
import PageLoader from './PageLoader';
import { useSiteSettings } from '@/hooks/useSiteSettings';

export default function Layout() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { pathname } = useLocation();
  const { data: settings = {} } = useSiteSettings();
  const showAnnouncement = settings.header_show_announcement !== '0';
  const hideBackToTop =
    pathname.startsWith('/dashboard') ||
    pathname === '/wishlist' ||
    pathname === '/cart' ||
    pathname === '/checkout';

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden w-full">
      <ScrollProgress />
      <Navbar onSearchOpen={() => setSearchOpen(true)} />
      <main className={`flex-1 w-full max-w-full overflow-x-hidden ${showAnnouncement ? 'pt-[104px]' : 'pt-[68px]'}`}>
        <Outlet />
      </main>
      <Footer />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      {!hideBackToTop && <BackToTop />}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#2C2825',
            color: '#FAF8F5',
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
          },
        }}
      />
    </div>
  );
}
