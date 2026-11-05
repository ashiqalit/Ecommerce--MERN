import { z } from "zod";

export const listUsersQuerySchema = z.object({
  search: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
