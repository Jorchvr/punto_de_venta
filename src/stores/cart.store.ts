import { create } from "zustand";
import type { MetodoPago } from "../db/ventas.repo";

export interface CartItem {
  productoId: number;
  nombre: string;
  precio: number;
  cantidad: number;
  stock: number;
  esServicio: number;
}

interface CartState {
  items: CartItem[];
  metodo: MetodoPago;
  recibido: string;
  add: (p: Omit<CartItem, "cantidad">) => void;
  inc: (id: number) => void;
  dec: (id: number) => void;
  remove: (id: number) => void;
  clear: () => void;
  setMetodo: (m: MetodoPago) => void;
  setRecibido: (s: string) => void;
  total: () => number;
  count: () => number;
}

export const useCart = create<CartState>((set, get) => ({
  items: [],
  metodo: "Efectivo",
  recibido: "",
  add: (p) =>
    set((s) => {
      const existing = s.items.find((i) => i.productoId === p.productoId);
      if (existing) {
        return {
          items: s.items.map((i) =>
            i.productoId === p.productoId
              ? { ...i, cantidad: i.cantidad + 1 }
              : i
          ),
        };
      }
      return { items: [...s.items, { ...p, cantidad: 1 }] };
    }),
  inc: (id) =>
    set((s) => ({
      items: s.items.map((i) =>
        i.productoId === id ? { ...i, cantidad: i.cantidad + 1 } : i
      ),
    })),
  dec: (id) =>
    set((s) => ({
      items: s.items
        .map((i) =>
          i.productoId === id ? { ...i, cantidad: i.cantidad - 1 } : i
        )
        .filter((i) => i.cantidad > 0),
    })),
  remove: (id) =>
    set((s) => ({ items: s.items.filter((i) => i.productoId !== id) })),
  clear: () => set({ items: [], recibido: "" }),
  setMetodo: (m) => set({ metodo: m, recibido: "" }),
  setRecibido: (s) => set({ recibido: s }),
  total: () => get().items.reduce((a, i) => a + i.precio * i.cantidad, 0),
  count: () => get().items.reduce((a, i) => a + i.cantidad, 0),
}));
