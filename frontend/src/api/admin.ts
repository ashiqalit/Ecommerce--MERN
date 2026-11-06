import { api } from "./client";
import type {
  AdminOrder,
  AdminOrderList,
  OrderStatus,
  UserDetail,
  UserList,
} from "../types";

export async function fetchAdminUsers(query: {
  search?: string;
  page?: number;
  limit?: number;
}) {
  const res = await api.get<{ data: UserList }>("/admin/users", {
    params: query,
  });
  return res.data.data;
}

export async function fetchAdminUser(id: number) {
  const res = await api.get<{ data: { user: UserDetail } }>(
    `/admin/users/${id}`,
  );
  return res.data.data.user;
}

export async function fetchAdminOrders(query: {
  status?: OrderStatus;
  page?: number;
  limit?: number;
}) {
  const res = await api.get<{ data: AdminOrderList }>("/admin/orders", {
    params: query,
  });
  return res.data.data;
}

export async function fetchAdminOrder(id: number) {
  const res = await api.get<{ data: { order: AdminOrder } }>(
    `/admin/orders/${id}`,
  );
  return res.data.data.order;
}

export async function updateOrderStatusRequest(
  id: number,
  status: OrderStatus,
) {
  const res = await api.patch<{ data: { order: AdminOrder } }>(
    `/admin/orders/${id}/status`,
    { status },
  );
  return res.data.data.order;
}
