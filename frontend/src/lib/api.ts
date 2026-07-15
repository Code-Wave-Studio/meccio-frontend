import axios from 'axios';

const PROD_API = 'https://navajowhite-stingray-123815.hostingersite.com/backend/api';
const PROD_UPLOADS = 'https://navajowhite-stingray-123815.hostingersite.com/backend/uploads';

/** Cloudflare / production Hostinger API */
const API_BASE = (import.meta.env.VITE_API_URL || PROD_API).replace(/\/$/, '');

/** Uploaded media base on Hostinger */
const UPLOAD_BASE = (import.meta.env.VITE_UPLOAD_URL || PROD_UPLOADS).replace(/\/$/, '');

/** Old DB paths (from local import) → rewrite to Hostinger uploads */
const LEGACY_UPLOAD_PREFIXES = [
  'http://localhost/meccio/uploads',
  'http://localhost/meccio/backend/uploads',
  'http://127.0.0.1/meccio/uploads',
  'http://127.0.0.1/meccio/backend/uploads',
] as const;

export function resolveMediaUrl(url?: string | null): string {
  if (!url) return '';
  if (!UPLOAD_BASE) return url;
  if (url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('https://images.unsplash.com')) {
    return url;
  }

  for (const prefix of LEGACY_UPLOAD_PREFIXES) {
    if (url.startsWith(prefix)) {
      return UPLOAD_BASE + url.slice(prefix.length);
    }
  }

  if (url.startsWith('/uploads/')) {
    return UPLOAD_BASE + url.slice('/uploads'.length);
  }
  if (url.startsWith('/backend/uploads/')) {
    return UPLOAD_BASE + url.slice('/backend/uploads'.length);
  }

  return url;
}

function rewriteMediaDeep<T>(data: T): T {
  if (!UPLOAD_BASE || data == null) return data;
  if (typeof data === 'string') {
    return resolveMediaUrl(data) as T;
  }
  if (Array.isArray(data)) {
    return data.map((item) => rewriteMediaDeep(item)) as T;
  }
  if (typeof data === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      out[key] = rewriteMediaDeep(value);
    }
    return out as T;
  }
  return data;
}

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('meccio_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const sessionId = localStorage.getItem('meccio_session') || generateSessionId();
  localStorage.setItem('meccio_session', sessionId);
  config.headers['X-Session-Id'] = sessionId;
  return config;
});

api.interceptors.response.use((response) => {
  if (response.data) {
    response.data = rewriteMediaDeep(response.data);
  }
  return response;
});

function generateSessionId(): string {
  return 'sess_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export default api;
export { API_BASE, UPLOAD_BASE };

// Auth
export const authApi = {
  register: (data: Record<string, string>) => api.post('/auth/register', data),
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  sendRegisterOtp: (data: { email: string; phone?: string }) => api.post('/auth/otp/register', data),
  sendLoginOtp: (identifier: string) => api.post('/auth/otp/login/send', { identifier }),
  loginWithOtp: (data: { identifier: string; otp: string }) => api.post('/auth/otp/login/verify', data),
  me: () => api.get('/auth/me'),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data: Record<string, string>) => api.post('/auth/reset-password', data),
  updateProfile: (data: Record<string, string>) => api.put('/auth/profile', data),
  uploadAvatar: (file: File) => {
    const fd = new FormData();
    fd.append('avatar', file);
    return api.post('/auth/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  changePassword: (data: Record<string, string>) => api.post('/auth/change-password', data),
};

// Products
export const productApi = {
  list: (params?: Record<string, string | number>) => api.get('/products', { params }),
  get: (slug: string) => api.get(`/products/${slug}`),
  filters: () => api.get('/products/filters'),
};

// Categories & Collections
export const categoryApi = {
  list: () => api.get('/categories'),
  get: (slug: string) => api.get(`/categories/${slug}`),
};

export const collectionApi = {
  list: () => api.get('/collections'),
  get: (slug: string) => api.get(`/collections/${slug}`),
};

// Cart
export const cartApi = {
  get: () => api.get('/cart'),
  add: (data: { product_id: number; variant_id?: number; quantity?: number }) => api.post('/cart/add', data),
  update: (id: number, quantity: number) => api.put(`/cart/${id}`, { quantity }),
  remove: (id: number) => api.delete(`/cart/${id}`),
  saveForLater: (id: number) => api.post(`/cart/${id}/save-for-later`),
  applyCoupon: (code: string) => api.post('/cart/coupon', { code }),
};

// Wishlist
export const wishlistApi = {
  get: () => api.get('/wishlist'),
  add: (product_id: number) => api.post('/wishlist/add', { product_id }),
  remove: (productId: number) => api.delete(`/wishlist/${productId}`),
};

// Orders
export const orderApi = {
  create: (data: Record<string, unknown>) => api.post('/orders', data),
  list: () => api.get('/orders'),
  get: (orderNumber: string) => api.get(`/orders/${orderNumber}`),
  track: (order_number: string, email: string) => api.get('/orders/track', { params: { order_number, email } }),
};

// Payments
export const paymentApi = {
  createRazorpay: (order_id: number) => api.post('/payments/razorpay/create', { order_id }),
  verify: (data: Record<string, unknown>) => api.post('/payments/razorpay/verify', data),
};

// Content
export const contentApi = {
  settings: () => api.get('/settings'),
  homepage: () => api.get('/homepage'),
  testimonials: () => api.get('/testimonials'),
  faqs: () => api.get('/faqs'),
  sizeGuide: () => api.get('/support/size-guide'),
  shippingInfo: () => api.get('/support/shipping'),
  returnsInfo: () => api.get('/support/returns'),
  recentlyViewed: () => api.get('/recently-viewed'),
  contact: (data: Record<string, string>) => api.post('/contact', data),
  customRug: (data: Record<string, string>) => api.post('/custom-rug-inquiry', data),
  newsletter: (email: string) => api.post('/newsletter', { email }),
};

// Reviews & Addresses
export const reviewApi = {
  create: (data: Record<string, unknown>) => api.post('/reviews', data),
};

export const addressApi = {
  list: () => api.get('/addresses'),
  create: (data: Record<string, unknown>) => api.post('/addresses', data),
  update: (id: number, data: Record<string, unknown>) => api.put(`/addresses/${id}`, data),
  delete: (id: number) => api.delete(`/addresses/${id}`),
};

// Admin
export const adminApi = {
  dashboard: () => api.get('/admin/dashboard'),
  products: {
    list: (params?: Record<string, string | number>) => api.get('/admin/products', { params }),
    get: (id: number) => api.get(`/admin/products/${id}`),
    create: (data: Record<string, unknown>) => api.post('/admin/products', data),
    update: (id: number, data: Record<string, unknown>) => api.put(`/admin/products/${id}`, data),
    delete: (id: number) => api.delete(`/admin/products/${id}`),
  },
  orders: {
    list: (params?: Record<string, string>) => api.get('/admin/orders', { params }),
    get: (id: number) => api.get(`/admin/orders/${id}`),
    updateStatus: (id: number, data: Record<string, unknown>) => api.put(`/admin/orders/${id}/status`, data),
  },
  customers: {
    list: (params?: Record<string, string>) => api.get('/admin/customers', { params }),
    get: (id: number) => api.get(`/admin/customers/${id}`),
    update: (id: number, data: Record<string, unknown>) => api.put(`/admin/customers/${id}`, data),
  },
  coupons: {
    list: () => api.get('/admin/coupons'),
    get: (id: number) => api.get(`/admin/coupons/${id}`),
    create: (data: Record<string, unknown>) => api.post('/admin/coupons', data),
    update: (id: number, data: Record<string, unknown>) => api.put(`/admin/coupons/${id}`, data),
    delete: (id: number) => api.delete(`/admin/coupons/${id}`),
  },
  reviews: {
    list: (params?: Record<string, string>) => api.get('/admin/reviews', { params }),
    create: (data: Record<string, unknown>) => api.post('/admin/reviews', data),
    update: (id: number, data: Record<string, unknown>) => api.put(`/admin/reviews/${id}`, data),
    approve: (id: number) => api.put(`/admin/reviews/${id}/approve`),
    reject: (id: number) => api.put(`/admin/reviews/${id}/reject`),
    delete: (id: number) => api.delete(`/admin/reviews/${id}`),
  },
  media: {
    list: () => api.get('/admin/media'),
    upload: (file: File) => {
      const fd = new FormData();
      fd.append('image', file);
      return api.post('/admin/media', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    },
  },
  categories: {
    list: () => api.get('/admin/categories'),
    create: (data: Record<string, unknown>) => api.post('/admin/categories', data),
    update: (id: number, data: Record<string, unknown>) => api.put(`/admin/categories/${id}`, data),
    delete: (id: number) => api.delete(`/admin/categories/${id}`),
  },
  collections: {
    list: () => api.get('/admin/collections'),
    create: (data: Record<string, unknown>) => api.post('/admin/collections', data),
    update: (id: number, data: Record<string, unknown>) => api.put(`/admin/collections/${id}`, data),
    delete: (id: number) => api.delete(`/admin/collections/${id}`),
  },
  testimonials: {
    list: () => api.get('/admin/testimonials'),
    create: (data: Record<string, unknown>) => api.post('/admin/testimonials', data),
    update: (id: number, data: Record<string, unknown>) => api.put(`/admin/testimonials/${id}`, data),
    delete: (id: number) => api.delete(`/admin/testimonials/${id}`),
  },
  faqs: {
    list: () => api.get('/admin/faqs'),
    create: (data: Record<string, unknown>) => api.post('/admin/faqs', data),
    update: (id: number, data: Record<string, unknown>) => api.put(`/admin/faqs/${id}`, data),
    delete: (id: number) => api.delete(`/admin/faqs/${id}`),
    updateMeta: (data: Record<string, unknown>) => api.put('/admin/faqs/meta', data),
  },
  messages: {
    list: () => api.get('/admin/messages'),
    markRead: (id: number) => api.put(`/admin/messages/${id}/read`),
  },
  settings: {
    get: () => api.get('/admin/settings'),
    update: (data: Record<string, unknown>) => api.put('/admin/settings', data),
  },
  pageImages: {
    get: () => api.get('/admin/page-images'),
    update: (data: Record<string, unknown>) => api.put('/admin/page-images', data),
  },
  support: {
    sizeGuideGet: () => api.get('/admin/support/size-guide'),
    sizeGuideSave: (data: Record<string, unknown>) => api.put('/admin/support/size-guide', data),
    shippingGet: () => api.get('/admin/support/shipping'),
    shippingSave: (data: Record<string, unknown>) => api.put('/admin/support/shipping', data),
    returnsGet: () => api.get('/admin/support/returns'),
    returnsSave: (data: Record<string, unknown>) => api.put('/admin/support/returns', data),
  },
};
