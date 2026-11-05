import type { Role } from "../types";

export const homePathFor = (role: Role) => (role === "ADMIN" ? "/admin" : "/");
