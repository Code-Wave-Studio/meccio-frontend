export type DisplayCurrency = 'INR' | 'USD';
export type PriceRegion = 'IN' | 'INTL';

export const FREE_SHIPPING_USD = 0;
export const FREE_SHIPPING_INR = 0;
export const SHIPPING_FEE_USD = 0;
export const SHIPPING_FEE_INR = 0;

export function parseAmount(value: unknown): number {
  if (value === null || value === undefined || value === '') return 0;
  const num = typeof value === 'number' ? value : Number(String(value).replace(/,/g, ''));
  return Number.isFinite(num) ? num : 0;
}

export function detectIndiaFromBrowser(): boolean {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (timezone === 'Asia/Kolkata' || timezone === 'Asia/Calcutta') return true;

  const language = (navigator.language || '').toLowerCase();
  return language.endsWith('-in') || language === 'hi' || language === 'hi-in';
}

export async function detectIndiaFromGeo(): Promise<boolean> {
  try {
    const response = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(4000) });
    if (!response.ok) return false;
    const data = await response.json() as { country_code?: string };
    return data.country_code === 'IN';
  } catch {
    return false;
  }
}

export function formatInr(amountInr: unknown): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(parseAmount(amountInr));
}

export function formatUsd(amountUsd: unknown): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(parseAmount(amountUsd));
}

/** India = INR price from admin, International = USD price from admin */
export function formatProductPrice(
  priceUsd: unknown,
  priceInr: unknown,
  isIndia: boolean,
): string {
  return isIndia ? formatInr(priceInr) : formatUsd(priceUsd);
}

export function getProductAmount(
  priceUsd: unknown,
  priceInr: unknown,
  isIndia: boolean,
): number {
  return isIndia ? parseAmount(priceInr) : parseAmount(priceUsd);
}
