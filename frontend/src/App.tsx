import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useParams, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { CurrencyProvider } from '@/context/CurrencyContext';
import Layout from '@/components/Layout';
import ScrollToTop from '@/components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminRoute from '@/components/AdminRoute';
import AdminLayout from '@/admin/AdminLayout';

const HomePage = lazy(() => import('@/pages/HomePage'));
const ShopPage = lazy(() => import('@/pages/ShopPage'));
const ProductPage = lazy(() => import('@/pages/ProductPage'));
const CartPage = lazy(() => import('@/pages/CartPage'));
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage'));
const OrderTrackingPage = lazy(() => import('@/pages/support/OrderTrackingPage'));
const WishlistPage = lazy(() => import('@/pages/WishlistPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const ContactPage = lazy(() => import('@/pages/ContactPage'));

const AdminDashboardPage = lazy(() => import('@/admin/pages/AdminDashboardPage'));
const AdminProductsPage = lazy(() => import('@/admin/pages/AdminProductsPage'));
const AdminOrdersPage = lazy(() => import('@/admin/pages/AdminOrdersPage'));
const AdminCustomersPage = lazy(() => import('@/admin/pages/AdminCustomersPage'));
const AdminCouponsPage = lazy(() => import('@/admin/pages/AdminCouponsPage'));
const AdminReviewsPage = lazy(() => import('@/admin/pages/AdminReviewsPage'));
const AdminCategoriesPage = lazy(() => import('@/admin/pages/AdminCategoriesPage'));
const AdminCollectionsPage = lazy(() => import('@/admin/pages/AdminCollectionsPage'));
const AdminTestimonialsPage = lazy(() => import('@/admin/pages/AdminTestimonialsPage'));
const AdminFaqsPage = lazy(() => import('@/admin/pages/AdminFaqsPage'));
const AdminMessagesPage = lazy(() => import('@/admin/pages/AdminMessagesPage'));
const AdminSettingsPage = lazy(() => import('@/admin/pages/AdminSettingsPage'));
const AdminPageImagesPage = lazy(() => import('@/admin/pages/AdminPageImagesPage'));
const AdminSizeGuidePage = lazy(() => import('@/admin/pages/AdminSizeGuidePage'));
const AdminShippingPage = lazy(() => import('@/admin/pages/AdminShippingPage'));
const AdminReturnsPage = lazy(() => import('@/admin/pages/AdminReturnsPage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 5 * 60 * 1000, retry: 1 },
  },
});

function CollectionRoute() {
  const { slug } = useParams();
  return <ShopPage title={slug?.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'Collection'} defaultFilters={{ collection: slug || '' }} />;
}

function PageLoader() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <CurrencyProvider>
            <BrowserRouter>
            <ScrollToTop />
            <CartProvider>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Admin panel — outside storefront layout */}
                  <Route
                    path="/admin"
                    element={
                      <AdminRoute>
                        <AdminLayout />
                      </AdminRoute>
                    }
                  >
                    <Route index element={<AdminDashboardPage />} />
                    <Route path="products" element={<AdminProductsPage />} />
                    <Route path="orders" element={<AdminOrdersPage />} />
                    <Route path="customers" element={<AdminCustomersPage />} />
                    <Route path="coupons" element={<AdminCouponsPage />} />
                    <Route path="reviews" element={<AdminReviewsPage />} />
                    <Route path="categories" element={<AdminCategoriesPage />} />
                    <Route path="collections" element={<AdminCollectionsPage />} />
                    <Route path="testimonials" element={<AdminTestimonialsPage />} />
                    <Route path="faqs" element={<AdminFaqsPage />} />
                    <Route path="size-guide" element={<AdminSizeGuidePage />} />
                    <Route path="shipping" element={<AdminShippingPage />} />
                    <Route path="returns" element={<AdminReturnsPage />} />
                    <Route path="messages" element={<AdminMessagesPage />} />
                    <Route path="settings" element={<AdminSettingsPage />} />
                    <Route path="page-images" element={<AdminPageImagesPage />} />
                    <Route path="*" element={<Navigate to="/admin" replace />} />
                  </Route>

                  <Route element={<Layout />}>
                    <Route index element={<HomePage />} />
                    <Route path="shop" element={<ShopPage />} />
                    <Route path="product/:slug" element={<ProductPage />} />
                    <Route path="cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
                    <Route path="checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
                    <Route path="wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
                    <Route path="order-tracking" element={<OrderTrackingPage />} />
                    <Route path="dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />

                    <Route path="collections" element={<LazyCollections />} />
                    <Route path="collections/:slug" element={<CollectionRoute />} />

                    <Route path="new-arrivals" element={<ShopPage title="New Arrivals" defaultFilters={{ is_new_arrival: '1' }} seoDescription="Discover the latest luxury rug arrivals at MECCIO." />} />
                    <Route path="best-sellers" element={<ShopPage title="Best Sellers" defaultFilters={{ is_best_seller: '1' }} seoDescription="Shop our most popular luxury carpets and rugs." />} />

                    <Route path="about" element={<LazyAbout />} />
                    <Route path="contact" element={<ContactPage />} />
                    <Route path="custom-rugs" element={<LazyCustomRugs />} />
                    <Route path="testimonials" element={<LazyTestimonials />} />
                    <Route path="faq" element={<LazyFAQ />} />
                    <Route path="size-guide" element={<LazySizeGuide />} />

                    <Route path="privacy" element={<LazyPrivacy />} />
                    <Route path="terms" element={<LazyTerms />} />
                    <Route path="license" element={<LazyLicense />} />
                    <Route path="shipping" element={<LazyShipping />} />
                    <Route path="refund" element={<LazyRefund />} />

                    <Route path="login" element={<LazyLogin />} />
                    <Route path="register" element={<LazyRegister />} />
                    <Route path="forgot-password" element={<LazyForgotPassword />} />
                  </Route>
                </Routes>
              </Suspense>
            </CartProvider>
            </BrowserRouter>
          </CurrencyProvider>
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

const LazyCollections = lazy(() => import('@/pages/CollectionsPage').then(m => ({ default: m.CollectionsPage })));
const LazyAbout = lazy(() => import('@/pages/ContentPages'));
const LazyCustomRugs = lazy(() => import('@/pages/CustomRugsPage'));
const LazyTestimonials = lazy(() => import('@/pages/ContentPages').then(m => ({ default: m.TestimonialsPage })));
const LazyFAQ = lazy(() => import('@/pages/support/FAQPage'));
const LazySizeGuide = lazy(() => import('@/pages/support/SizeGuidePage'));
const LazyPrivacy = lazy(() => import('@/pages/StaticPages').then(m => ({ default: m.PrivacyPage })));
const LazyTerms = lazy(() => import('@/pages/StaticPages').then(m => ({ default: m.TermsPage })));
const LazyLicense = lazy(() => import('@/pages/StaticPages').then(m => ({ default: m.LicensePage })));
const LazyShipping = lazy(() => import('@/pages/support/ShippingPage'));
const LazyRefund = lazy(() => import('@/pages/support/ReturnsPage'));
const LazyLogin = lazy(() => import('@/pages/AuthPages'));
const LazyRegister = lazy(() => import('@/pages/AuthPages').then(m => ({ default: m.RegisterPage })));
const LazyForgotPassword = lazy(() => import('@/pages/AuthPages').then(m => ({ default: m.ForgotPasswordPage })));
