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
export interface ProductInput {
  name: string;
  description?: string;
  price: number;
  stock: number;
  categoryId: number;
  imageUrl?: string;
}

export async function createProductRequest(input: ProductInput) {
  const res = await api.post<{ data: { product: Product } }>(
    "/products",
    input,
  );
  return res.data.data.product;
}

export async function updateProductRequest(id: number, input: ProductInput) {
  const res = await api.put<{ data: { product: Product } }>(
    `/products/${id}`,
    input,
  );
  return res.data.data.product;
}

export async function deleteProductRequest(id: number) {
  await api.delete(`/products/${id}`);
}

export async function uploadProductImage(file: File) {
  const form = new FormData();
  form.append("image", file);
  const res = await api.post<{ data: { imageUrl: string } }>(
    "/products/upload-image",
    form,
  );
  return res.data.data.imageUrl;
}
