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
export interface CartItem {
  id: number;
  productId: number;
  name: string;
  imageUrl: string | null;
  price: string;
  quantity: number;
  stock: number;
  exceedsStock: boolean;
  lineTotal: string;
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  subtotal: string;
  total: string;
}
export interface Address {
  id: number;
  userId: number;
  fullName: string;
  phone: string;
  place: string;
  city: string;
  state: string;
  pincode: string;
}

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export interface OrderItem {
  id: number;
  productId: number;
  name: string;
  imageUrl: string | null;
  quantity: number;
  price: string;
  lineTotal: string;
}

export interface Order {
  id: number;
  status: OrderStatus;
  paymentMethod: "COD";
  totalAmount: string;
  createdAt: string;
  updatedAt: string;
  address: Address;
  items: OrderItem[];
}

export interface OrderList {
  items: Order[];
  pagination: Pagination;
}
export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
  orderCount: number;
}

export interface UserList {
  items: AdminUser[];
  pagination: Pagination;
}

export interface UserOrderSummary {
  id: number;
  status: OrderStatus;
  totalAmount: string;
  createdAt: string;
  itemCount: number;
}

export interface UserDetail {
  id: number;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
  orders: UserOrderSummary[];
}

export interface AdminOrder extends Order {
  user: { id: number; name: string; email: string };
}

export interface AdminOrderList {
  items: AdminOrder[];
  pagination: Pagination;
}
