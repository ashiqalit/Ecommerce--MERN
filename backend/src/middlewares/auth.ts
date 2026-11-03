import { RequestHandler } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { env } from "../config/env";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";

export const authenticate: RequestHandler = async (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    throw ApiError.unauthorized("Authentication required");
  }

  let payload: JwtPayload;
  try {
    payload = jwt.verify(header.slice(7), env.jwtSecret) as JwtPayload;
  } catch {
    throw ApiError.unauthorized("Invalid or expired token");
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.id },
    select: { id: true, role: true },
  });
  if (!user) {
    throw ApiError.unauthorized("User no longer exists");
  }

  req.user = user;
  next();
};

export const authorize =
  (...roles: Array<"ADMIN" | "CUSTOMER">): RequestHandler =>
  (req, _res, next) => {
    if (!req.user) {
      throw ApiError.unauthorized("Authentication required");
    }
    if (!roles.includes(req.user.role)) {
      throw ApiError.forbidden("You do not have permission to do this");
    }
    next();
  };
