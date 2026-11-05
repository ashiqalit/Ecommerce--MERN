import { z } from "zod";

export const checkoutSchema = z.object({
  addressId: z.coerce.number().int().positive("Delivery address is required"),
});

export const listOrdersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type ListOrdersQuery = z.infer<typeof listOrdersQuerySchema>;

export const orderStatuses = [
  "PENDING",
  "CONFIRMED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

export type OrderStatusValue = (typeof orderStatuses)[number];

export const adminListOrdersQuerySchema = listOrdersQuerySchema.extend({
  status: z.enum(orderStatuses).optional(),
});

export const updateStatusSchema = z.object({
  status: z.enum(orderStatuses),
});

export type AdminListOrdersQuery = z.infer<typeof adminListOrdersQuerySchema>;
