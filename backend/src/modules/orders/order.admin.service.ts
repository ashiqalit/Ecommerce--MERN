import { prisma } from "../../config/prisma";
import { Prisma } from "../../generated/prisma/client";
import { ApiError } from "../../utils/ApiError";
import { orderInclude, toOrderView } from "./order.service";
import { AdminListOrdersQuery, OrderStatusValue } from "./order.schema";

const adminOrderInclude = {
  ...orderInclude,
  user: { select: { id: true, name: true, email: true } },
} satisfies Prisma.OrderInclude;

type AdminOrder = Prisma.OrderGetPayload<{ include: typeof adminOrderInclude }>;

function toAdminOrderView(order: AdminOrder) {
  return { ...toOrderView(order), user: order.user };
}

const allowedTransitions: Record<OrderStatusValue, OrderStatusValue[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

export async function listAllOrders(query: AdminListOrdersQuery) {
  const { status, page, limit } = query;
  const where: Prisma.OrderWhereInput = status ? { status } : {};

  const [orders, total] = await prisma.$transaction([
    prisma.order.findMany({
      where,
      include: adminOrderInclude,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  return {
    items: orders.map(toAdminOrderView),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getOrder(id: number) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: adminOrderInclude,
  });
  if (!order) throw ApiError.notFound("Order not found");
  return toAdminOrderView(order);
}

export async function updateOrderStatus(
  id: number,
  nextStatus: OrderStatusValue,
) {
  await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!order) throw ApiError.notFound("Order not found");

    if (!allowedTransitions[order.status].includes(nextStatus)) {
      throw ApiError.badRequest(
        `Cannot change status from ${order.status} to ${nextStatus}`,
      );
    }

    const updated = await tx.order.updateMany({
      where: { id, status: order.status },
      data: { status: nextStatus },
    });
    if (updated.count === 0) {
      throw ApiError.conflict(
        "This order was just changed by someone else. Refresh and try again.",
      );
    }

    if (nextStatus === "CANCELLED") {
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }
    }
  });

  return getOrder(id);
}
