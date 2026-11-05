import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  addToCartRequest,
  fetchCart,
  removeCartItemRequest,
  updateCartItemRequest,
} from "../api/cart";
import type { Cart } from "../types";
import { getErrorMessage } from "../utils/errors";
import { CartContext } from "./cart-context";
import { useAuth } from "./useAuth";

interface CartState {
  userId: number;
  cart: Cart | null;
  error: string;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.role === "CUSTOMER" ? user.id : null;

  const [state, setState] = useState<CartState | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const current = state !== null && state.userId === userId ? state : null;
  const cart = current?.cart ?? null;
  const error = current?.error ?? "";
  const loading = userId !== null && current === null;

  useEffect(() => {
    if (userId === null) return;
    let cancelled = false;

    fetchCart()
      .then((result) => {
        if (!cancelled) setState({ userId, cart: result, error: "" });
      })
      .catch((err) => {
        if (!cancelled) {
          setState({ userId, cart: null, error: getErrorMessage(err) });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [userId, reloadKey]);

  const apply = useCallback(
    async (request: () => Promise<Cart>) => {
      const result = await request();
      if (userId !== null) setState({ userId, cart: result, error: "" });
      return result;
    },
    [userId],
  );

  const addItem = useCallback(
    (productId: number, quantity: number) =>
      apply(() => addToCartRequest(productId, quantity)),
    [apply],
  );

  const updateItem = useCallback(
    (productId: number, quantity: number) =>
      apply(() => updateCartItemRequest(productId, quantity)),
    [apply],
  );

  const removeItem = useCallback(
    (productId: number) => apply(() => removeCartItemRequest(productId)),
    [apply],
  );

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  const value = useMemo(
    () => ({
      cart,
      totalItems: cart?.totalItems ?? 0,
      loading,
      error,
      addItem,
      updateItem,
      removeItem,
      reload,
    }),
    [cart, loading, error, addItem, updateItem, removeItem, reload],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
