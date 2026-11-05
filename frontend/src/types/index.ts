export type Role = "ADMIN" | "CUSTOMER";

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Category {
  id: number;
  name: string;
  _count?: { products: number };
}

export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: string;
  imageUrl: string | null;
  stock: number;
  categoryId: number;
  createdAt: string;
  category: { id: number; name: string };
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ProductList {
  items: Product[];
  pagination: Pagination;
}
