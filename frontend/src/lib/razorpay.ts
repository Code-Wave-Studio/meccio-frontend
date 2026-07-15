/**
 * Ensure Razorpay Checkout.js is available before opening the modal.
 * Prefer index.html script; fall back to dynamic inject.
 */
export function loadRazorpay(): Promise<void> {
  if (typeof window !== 'undefined' && typeof window.Razorpay !== 'undefined') {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-razorpay-checkout]');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Razorpay script failed to load')));
      // Already loaded but window.Razorpay missing briefly
      if (typeof window.Razorpay !== 'undefined') resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.dataset.razorpayCheckout = '1';
    script.onload = () => {
      if (typeof window.Razorpay === 'undefined') {
        reject(new Error('Razorpay failed to initialize'));
        return;
      }
      resolve();
    };
    script.onerror = () => reject(new Error('Could not load Razorpay. Check your connection.'));
    document.head.appendChild(script);
  });
}

export function isMobileCheckout(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(
    navigator.userAgent,
  );
}

/** Normalize phone for Razorpay prefill (prefer 10-digit IN mobile). */
export function normalizeRazorpayContact(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1);
  return digits;
}

const CHECKOUT_STORAGE_KEY = 'meccio_pending_checkout';

export type PendingCheckoutStore = {
  checkout_token: string;
  razorpay_order_id: string;
  created_at: number;
};

export function savePendingCheckout(data: PendingCheckoutStore): void {
  try {
    sessionStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export function readPendingCheckout(): PendingCheckoutStore | null {
  try {
    const raw = sessionStorage.getItem(CHECKOUT_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PendingCheckoutStore;
  } catch {
    return null;
  }
}

export function clearPendingCheckout(): void {
  try {
    sessionStorage.removeItem(CHECKOUT_STORAGE_KEY);
  } catch {
    // ignore
  }
}
