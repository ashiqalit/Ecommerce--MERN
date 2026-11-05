import type { OrderStatus } from "../types";

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
});

export const formatPrice = (value: string | number) =>
  currency.format(Number(value));

export function stockInfo(stock: number) {
  if (stock <= 0) {
    return { label: "Out of stock", className: "bg-red-100 text-red-700" };
  }
  if (stock <= 5) {
    return {
      label: `Only ${stock} left`,
      className: "bg-amber-100 text-amber-700",
    };
  }
  return { label: "In stock", className: "bg-green-100 text-green-700" };
}

const dateTime = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
});

export const formatDateTime = (iso: string) => dateTime.format(new Date(iso));

const statuses: Record<OrderStatus, { label: string; className: string }> = {
  PENDING: { label: "Pending", className: "bg-amber-100 text-amber-700" },
  CONFIRMED: { label: "Confirmed", className: "bg-blue-100 text-blue-700" },
  SHIPPED: { label: "Shipped", className: "bg-indigo-100 text-indigo-700" },
  DELIVERED: { label: "Delivered", className: "bg-green-100 text-green-700" },
  CANCELLED: { label: "Cancelled", className: "bg-red-100 text-red-700" },
};

export const statusInfo = (status: OrderStatus) => statuses[status];
