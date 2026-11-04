import { prisma } from "../../config/prisma";
import { Prisma } from "../../generated/prisma/client";
import { ApiError } from "../../utils/ApiError";
import { CheckoutInput, ListOrdersQuery } from "./order.schema";

export const orderInclude = {
  address: true,
  items: {
    orderBy: { id: "asc" },
    include: {
      product: { select: { id: true, name: true, imageUrl: true } },
    },
  },
} satisfies Prisma.OrderInclude;

type OrderWithDetails = Prisma.OrderGetPayload<{
  include: typeof orderInclude;
}>;

export function toOrderView(order: OrderWithDetails) {
  return {
    id: order.id,
    status: order.status,
    paymentMethod: order.paymentMethod,
    totalAmount: order.totalAmount.toFixed(2),
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    address: order.address,
    items: order.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      name: item.product.name,
      imageUrl: item.product.imageUrl,
      quantity: item.quantity,
      price: item.priceAtPurchase.toFixed(2),
      lineTotal: item.priceAtPurchase.mul(item.quantity).toFixed(2),
    })),
  };
}

export async function placeOrder(userId: number, input: CheckoutInput) {
  const orderId = await prisma.$transaction(async (tx) => {
    const address = await tx.address.findFirst({
      where: { id: input.addressId, userId },
    });
    if (!address) throw ApiError.badRequest("Delivery address not found");

    const cart = await tx.cart.findUnique({
      where: { userId },
      include: {
        items: { orderBy: { id: "asc" }, include: { product: true } },
      },
    });
    if (!cart || cart.items.length === 0) {
      throw ApiError.badRequest("Your cart is empty");
    }

    let total = new Prisma.Decimal(0);

    for (const item of cart.items) {
      const updated = await tx.product.updateMany({
        where: { id: item.productId, stock: { gte: item.quantity } },
        data: { stock: { decrement: item.quantity } },
      });
      if (updated.count === 0) {
        throw ApiError.conflict(`Not enough stock for "${item.product.name}"`);
      }
      total = total.plus(item.product.price.mul(item.quantity));
    }

    const order = await tx.order.create({
      data: {
        userId,
        addressId: address.id,
        totalAmount: total,
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            priceAtPurchase: item.product.price,
          })),
        },
      },
    });

    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    return order.id;
  });

  return getMyOrder(userId, orderId);
}

export async function listMyOrders(userId: number, query: ListOrdersQuery) {
  const { page, limit } = query;

  const [orders, total] = await prisma.$transaction([
    prisma.order.findMany({
      where: { userId },
      include: orderInclude,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.order.count({ where: { userId } }),
  ]);

  return {
    items: orders.map(toOrderView),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getMyOrder(userId: number, id: number) {
  const order = await prisma.order.findFirst({
    where: { id, userId },
    include: orderInclude,
  });
  if (!order) throw ApiError.notFound("Order not found");
  return toOrderView(order);
}
