import { createContext, useContext, useState, ReactNode } from 'react';

export interface CartItem {
  id: string;
  name: string;
  image: string;
  price: number;
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

const defaultItems: CartItem[] = [
  {
    id: '1',
    name: 'The Summer Solstice',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD07QOcSnUiBGpsQWrQDA2-IV90jEfAD3Knc3UA73Ty0atlTRoaXCN8_3inWgoTKvKhhYbga1bw2M9udQWLcHKtRyXA0HbvkiS6ujQ-xzBlbFiKVe9yHVeLsBHO8m7UqUUrcGhA3fXC3O4H9EpYCuBrMU8_ksvjvoEqfLj8xWdXat86eL-K2FdOBUtP9Fn3dOvCVsPfROSlhjco6M4xiFDEaeS8rktOZWPtv0QPxHMu6V4BoHUG_hXO18yavC-uMQZH2lOkuHuSCw',
    price: 124.00,
    quantity: 1,
    size: 'A3 (29.7 x 42 cm)',
    frame: 'Natural Oak',
    series: 'Limited Edition',
  },
  {
    id: '2',
    name: 'Geometric Void',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA6B1WFplu9CoUeQ6TZkWTNFjE7xEzVITxqnG6qLb7-co8kn4PulSIZfH2Li6MiGYtNl3HQventLJCbf6_PqAEOGdRr09q4ZZ-30_Jbp44yDADq8z82bRe3pnuzzpjUszWnA3e6rWKqo8-mn5UcUnEKOjn6D4wMBXUic2lLFp_kMNTiqSum8t1BmyhJCAUhBxQ3wgtPcmG77NPtJyP_TL3g506OHD3cnTycggJAkoPHAUtdRta4gK01Y71VMJZmyPfv6dK13d-hfg',
    price: 89.00,
    quantity: 2,
    size: 'A2 (42 x 59.4 cm)',
    frame: 'Unframed (Rolled)',
    series: 'Curated Series',
  },
];

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(defaultItems);

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
