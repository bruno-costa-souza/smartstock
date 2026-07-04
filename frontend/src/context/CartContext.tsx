import { createContext, useContext, useState, ReactNode } from 'react';

export interface CartItem {
  id: string;
  nome: string;
  preco: number;
  imagemUrl?: string;
  quantidade: number;
}

interface CartContextType {
  items: CartItem[];
  count: number;
  total: number;
  add: (produto: Omit<CartItem, 'quantidade'>) => void;
  remove: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clear: () => void;
  isInCart: (id: string) => boolean;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const count = items.reduce((s, i) => s + i.quantidade, 0);
  const total = items.reduce((s, i) => s + i.preco * i.quantidade, 0);

  function add(produto: Omit<CartItem, 'quantidade'>) {
    setItems((prev) => {
      const exists = prev.find((i) => i.id === produto.id);
      if (exists) {
        return prev.map((i) => i.id === produto.id ? { ...i, quantidade: i.quantidade + 1 } : i);
      }
      return [...prev, { ...produto, quantidade: 1 }];
    });
  }

  function remove(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function updateQty(id: string, qty: number) {
    if (qty <= 0) { remove(id); return; }
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, quantidade: qty } : i));
  }

  function clear() { setItems([]); }

  function isInCart(id: string) { return items.some((i) => i.id === id); }

  return (
    <CartContext.Provider value={{ items, count, total, add, remove, updateQty, clear, isInCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
