import { api } from "./client";
import type { Category } from "../types";

type CategoryResponse = { data: { category: Category } };

export async function createCategoryRequest(name: string) {
  const res = await api.post<CategoryResponse>("/categories", { name });
  return res.data.data.category;
}

export async function updateCategoryRequest(id: number, name: string) {
  const res = await api.put<CategoryResponse>(`/categories/${id}`, { name });
  return res.data.data.category;
}

export async function deleteCategoryRequest(id: number) {
  await api.delete(`/categories/${id}`);
}
