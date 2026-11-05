import { api } from "./client";
import type { Category, Product, ProductList } from "../types";

export interface ProductQuery {
  search?: string;
  categoryId?: number;
  page?: number;
  limit?: number;
}

export async function fetchProducts(query: ProductQuery) {
  const res = await api.get<{ data: ProductList }>("/products", {
    params: query,
  });
  return res.data.data;
}

export async function fetchProduct(id: number) {
  const res = await api.get<{ data: { product: Product } }>(`/products/${id}`);
  return res.data.data.product;
}

export async function fetchCategories() {
  const res = await api.get<{ data: { categories: Category[] } }>(
    "/categories",
  );
  return res.data.data.categories;
}
