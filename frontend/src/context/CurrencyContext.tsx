import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  FREE_SHIPPING_INR,
  FREE_SHIPPING_USD,
  SHIPPING_FEE_INR,
  SHIPPING_FEE_USD,
  detectIndiaFromBrowser,
  detectIndiaFromGeo,
  formatInr,
  formatProductPrice,
  formatUsd,
  getProductAmount,
  type DisplayCurrency,
} from '@/lib/currency';

interface CurrencyContextValue {
  isIndia: boolean;
  currency: DisplayCurrency;
  formatProductPrice: (priceUsd: unknown, priceInr?: unknown) => string;
  productAmount: (priceUsd: unknown, priceInr?: unknown) => number;
  formatMoney: (amount: unknown) => string;
  freeShippingMin: number;
  shippingFee: number;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [isIndia, setIsIndia] = useState(() => detectIndiaFromBrowser());

  useEffect(() => {
    let active = true;

    if (detectIndiaFromBrowser()) {
      setIsIndia(true);
      return () => {
        active = false;
      };
    }

    detectIndiaFromGeo().then((india) => {
      if (active) setIsIndia(india);
    });

    return () => {
      active = false;
    };
  }, []);

  const value = useMemo<CurrencyContextValue>(() => ({
    isIndia,
    currency: isIndia ? 'INR' : 'USD',
    formatProductPrice: (priceUsd, priceInr) => formatProductPrice(priceUsd, priceInr, isIndia),
    productAmount: (priceUsd, priceInr) => getProductAmount(priceUsd, priceInr, isIndia),
    formatMoney: (amount) => (isIndia ? formatInr(amount) : formatUsd(amount)),
    freeShippingMin: isIndia ? FREE_SHIPPING_INR : FREE_SHIPPING_USD,
    shippingFee: isIndia ? SHIPPING_FEE_INR : SHIPPING_FEE_USD,
  }), [isIndia]);

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider');
  }
  return context;
}
