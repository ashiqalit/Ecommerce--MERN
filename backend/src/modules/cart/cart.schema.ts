import { z } from "zod";

export const addItemSchema = z.object({
  productId: z.coerce.number().int().positive("Product is required"),
  quantity: z.coerce
    .number()
    .int()
    .min(1, "Quantity must be at least 1")
    .max(1000)
    .default(1),
});

export const updateItemSchema = z.object({
  quantity: z.coerce
    .number()
    .int()
    .min(1, "Quantity must be at least 1")
    .max(1000),
});

export type AddItemInput = z.infer<typeof addItemSchema>;
export type UpdateItemInput = z.infer<typeof updateItemSchema>;
