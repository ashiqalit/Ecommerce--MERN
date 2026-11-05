import { prisma } from "../../config/prisma";
import { Prisma } from "../../generated/prisma/client";
import { ApiError } from "../../utils/ApiError";
import { ListUsersQuery } from "./user.schema";

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
} as const;

export async function listUsers(query: ListUsersQuery) {
  const { search, page, limit } = query;

  const where: Prisma.UserWhereInput = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      }
    : {};

  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      select: { ...userSelect, _count: { select: { orders: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    items: users.map(({ _count, ...user }) => ({
      ...user,
      orderCount: _count.orders,
    })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getUser(id: number) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      ...userSelect,
      orders: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          status: true,
          totalAmount: true,
          createdAt: true,
          _count: { select: { items: true } },
        },
      },
    },
  });
  if (!user) throw ApiError.notFound("User not found");

  return {
    ...user,
    orders: user.orders.map((order) => ({
      id: order.id,
      status: order.status,
      totalAmount: order.totalAmount.toFixed(2),
      createdAt: order.createdAt,
      itemCount: order._count.items,
    })),
  };
}
