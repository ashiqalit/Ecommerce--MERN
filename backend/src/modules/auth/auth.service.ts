import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { prisma } from "../../config/prisma";
import { env } from "../../config/env";
import { ApiError } from "../../utils/ApiError";
import { LoginInput, RegisterInput } from "./auth.schema";

const safeUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
} as const;

function signToken(user: { id: number; role: string }) {
  return jwt.sign({ id: user.id, role: user.role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn as SignOptions["expiresIn"],
  });
}

export async function register(input: RegisterInput) {
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  });
  if (existing) {
    throw ApiError.conflict("Email is already registered");
  }

  const hashedPassword = await bcrypt.hash(input.password, 10);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      password: hashedPassword,
      cart: { create: {} },
    },
    select: safeUserSelect,
  });

  return { user, token: signToken(user) };
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  const passwordMatches =
    user && (await bcrypt.compare(input.password, user.password));

  if (!user || !passwordMatches) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  const { password: _password, ...safeUser } = user;
  return { user: safeUser, token: signToken(user) };
}

export async function getProfile(userId: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: safeUserSelect,
  });
  if (!user) {
    throw ApiError.notFound("User not found");
  }
  return user;
}
