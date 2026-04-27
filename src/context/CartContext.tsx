import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { CurrencyCode } from '@/types/catalog';

export interface CartItem {
  id: string;
  productSlug?: string;
  dimensionId?: string;
  name: string;
  image: string;
  price: number;
  currencyCode?: CurrencyCode;
  quantity: number;
  size: string;
  frame: string;
  series?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const cartStorageKey = 'bleedprints-cart';

const readCartFromStorage = (): CartItem[] => {
  if (typeof window === 'undefined') return [];

  try {
    const stored = window.localStorage.getItem(cartStorageKey);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Unable to restore cart from localStorage:', error);
    return [];
  }
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(readCartFromStorage);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(cartStorageKey, JSON.stringify(items));
  }, [items]);

  const addItem = (item: CartItem) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i);
      }
      return [...prev, item];
    });
  };

  const removeItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id));

  const updateQuantity = (id: string, qty: number) => {
    if (qty < 1) return removeItem(id);
    setItems(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i));
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, subtotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
