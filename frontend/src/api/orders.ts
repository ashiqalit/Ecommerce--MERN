import { api } from "./client";
import type { Order, OrderList } from "../types";

export async function placeOrderRequest(addressId: number) {
  const res = await api.post<{ data: { order: Order } }>("/orders", {
    addressId,
  });
  return res.data.data.order;
}

export async function fetchMyOrders(page: number) {
  const res = await api.get<{ data: OrderList }>("/orders", {
    params: { page, limit: 10 },
  });
  return res.data.data;
}

export async function fetchMyOrder(id: number) {
  const res = await api.get<{ data: { order: Order } }>(`/orders/${id}`);
  return res.data.data.order;
}
