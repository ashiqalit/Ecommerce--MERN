import { API_URL } from "../api/client";

export function imageSrc(path: string | null | undefined): string {
  if (!path) return "";
  return path.startsWith("/uploads/") ? `${API_URL}${path}` : path;
}
