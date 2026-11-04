import { z } from "zod";

const imageUrl = z
  .string()
  .trim()
  .max(500)
  .refine(
    (value) => /^https?:\/\//.test(value) || value.startsWith("/uploads/"),
    "Image must be an http(s) URL or an /uploads/ path",
  );

const productFields = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(120, "Name must be at most 120 characters"),
  description: z.string().trim().max(2000).optional(),
  price: z.coerce
    .number()
    .positive("Price must be greater than 0")
    .max(99999999.99, "Price is too large"),
  imageUrl: imageUrl.optional(),
  stock: z.coerce
    .number()
    .int("Stock must be a whole number")
    .min(0, "Stock cannot be negative")
    .optional(),
  categoryId: z.coerce.number().int().positive("Category is required"),
});

export const createProductSchema = productFields;

export const updateProductSchema = productFields
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one field to update",
  });

export const listProductsQuerySchema = z.object({
  search: z.string().trim().optional(),
  categoryId: z.coerce.number().int().positive().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;
