import { api } from "./client";
import type { Cart } from "../types";

type CartResponse = { data: { cart: Cart } };

export async function fetchCart() {
  const res = await api.get<CartResponse>("/cart");
  return res.data.data.cart;
}

export async function addToCartRequest(productId: number, quantity: number) {
  const res = await api.post<CartResponse>("/cart/items", {
    productId,
    quantity,
  });
  return res.data.data.cart;
}

export async function updateCartItemRequest(
  productId: number,
  quantity: number,
) {
  const res = await api.patch<CartResponse>(`/cart/items/${productId}`, {
    quantity,
  });
  return res.data.data.cart;
}

export async function removeCartItemRequest(productId: number) {
  const res = await api.delete<CartResponse>(`/cart/items/${productId}`);
  return res.data.data.cart;
}
