import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { cartApi, wishlistApi } from '@/lib/api';
import toast from 'react-hot-toast';
import type { Cart } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { isAdminUser } from '@/lib/adminAuth';

interface CartContextType {
  cart: Cart | null;
  wishlistCount: number;
  isLoading: boolean;
  refreshCart: () => Promise<void>;
  addToCart: (productId: number, variantId?: number, quantity?: number) => Promise<void>;
  updateQuantity: (id: number, quantity: number) => Promise<void>;
  removeFromCart: (id: number) => Promise<void>;
  addToWishlist: (productId: number) => Promise<void>;
  removeFromWishlist: (productId: number) => Promise<void>;
  refreshWishlist: () => Promise<void>;
}

const CartContext = createContext<CartContextType | null>(null);

const emptyCart: Cart = { items: [], subtotal: 0, item_count: 0 };

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();
  const { pathname } = useLocation();
  const [cart, setCart] = useState<Cart | null>(null);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const skipStorefrontCart = isAdminUser(user) || pathname.startsWith('/admin');

  const refreshCart = useCallback(async () => {
    if (isAdminUser(user)) {
      setCart(emptyCart);
      return;
    }
    try {
      const res = await cartApi.get();
      setCart(res.data?.data ?? emptyCart);
    } catch {
      setCart(emptyCart);
    }
  }, [user]);

  const refreshWishlist = useCallback(async () => {
    if (isAdminUser(user)) {
      setWishlistCount(0);
      return;
    }
    try {
      const res = await wishlistApi.get();
      const items = res.data?.data;
      setWishlistCount(Array.isArray(items) ? items.length : 0);
    } catch {
      setWishlistCount(0);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    if (skipStorefrontCart) {
      setCart(emptyCart);
      setWishlistCount(0);
      return;
    }
    refreshCart();
    refreshWishlist();
  }, [authLoading, skipStorefrontCart, refreshCart, refreshWishlist]);

  const addToCart = useCallback(async (productId: number, variantId?: number, quantity = 1) => {
    setIsLoading(true);
    try {
      const res = await cartApi.add({ product_id: productId, variant_id: variantId, quantity });
      setCart(res.data.data);
      toast.success('Added to cart');
    } catch {
      toast.error('Failed to add to cart');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateQuantity = useCallback(async (id: number, quantity: number) => {
    try {
      const res = await cartApi.update(id, quantity);
      setCart(res.data.data);
    } catch {
      toast.error('Failed to update cart');
    }
  }, []);

  const removeFromCart = useCallback(async (id: number) => {
    try {
      await cartApi.remove(id);
      await refreshCart();
      toast.success('Removed from cart');
    } catch {
      toast.error('Failed to remove item');
    }
  }, [refreshCart]);

  const addToWishlist = useCallback(async (productId: number) => {
    try {
      await wishlistApi.add(productId);
      await refreshWishlist();
      toast.success('Added to wishlist');
    } catch {
      toast.error('Failed to add to wishlist');
    }
  }, [refreshWishlist]);

  const removeFromWishlist = useCallback(async (productId: number) => {
    try {
      await wishlistApi.remove(productId);
      await refreshWishlist();
      toast.success('Removed from wishlist');
    } catch {
      toast.error('Failed to remove from wishlist');
    }
  }, [refreshWishlist]);

  return (
    <CartContext.Provider value={{
      cart, wishlistCount, isLoading, refreshCart, addToCart,
      updateQuantity, removeFromCart, addToWishlist, removeFromWishlist, refreshWishlist,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
