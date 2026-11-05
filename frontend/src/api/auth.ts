import { api } from "./client";
import type { AuthResponse, User } from "../types";

export async function registerRequest(input: {
  name: string;
  email: string;
  password: string;
}) {
  const res = await api.post<{ data: AuthResponse }>("/auth/register", input);
  return res.data.data;
}

export async function loginRequest(input: { email: string; password: string }) {
  const res = await api.post<{ data: AuthResponse }>("/auth/login", input);
  return res.data.data;
}

export async function meRequest() {
  const res = await api.get<{ data: { user: User } }>("/auth/me");
  return res.data.data.user;
}
