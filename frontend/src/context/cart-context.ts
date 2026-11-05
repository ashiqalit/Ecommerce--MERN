import { createContext } from "react";
import type { Cart } from "../types";

export interface CartContextValue {
  cart: Cart | null;
  totalItems: number;
  loading: boolean;
  error: string;
  addItem: (productId: number, quantity: number) => Promise<Cart>;
  updateItem: (productId: number, quantity: number) => Promise<Cart>;
  removeItem: (productId: number) => Promise<Cart>;
  reload: () => void;
}

export const CartContext = createContext<CartContextValue | null>(null);
