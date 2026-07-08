"use client";

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";

export type CartLine = {
  key: string; // variantId, or productId for CONTACT_PRICE
  productId: string;
  productName: string;
  productType: "REGULAR" | "PASS_THROUGH" | "CONTACT_PRICE";
  variantId?: string;
  sku?: string;
  optionLabel?: string;
  unitPrice: number;
  qty: number;
  maxStock: number | null;
  imageUrl?: string | null;
};

type CartContextValue = {
  lines: CartLine[];
  addLine: (line: CartLine) => void;
  updateQty: (key: string, qty: number) => void;
  removeLine: (key: string) => void;
  clear: () => void;
  subtotal: number;
  count: number;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "rs_store_cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch {
      // ignore malformed cart data
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, loaded]);

  const addLine = useCallback((line: CartLine) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.key === line.key);
      if (existing) {
        return prev.map((l) => (l.key === line.key ? { ...l, qty: l.qty + line.qty } : l));
      }
      return [...prev, line];
    });
  }, []);

  const updateQty = useCallback((key: string, qty: number) => {
    setLines((prev) => {
      if (qty <= 0) return prev.filter((l) => l.key !== key);
      return prev.map((l) => (l.key === key ? { ...l, qty } : l));
    });
  }, []);

  const removeLine = useCallback((key: string) => {
    setLines((prev) => prev.filter((l) => l.key !== key));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const subtotal = useMemo(() => lines.reduce((sum, l) => sum + l.unitPrice * l.qty, 0), [lines]);
  const count = useMemo(() => lines.reduce((sum, l) => sum + l.qty, 0), [lines]);

  return (
    <CartContext.Provider value={{ lines, addLine, updateQty, removeLine, clear, subtotal, count }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
