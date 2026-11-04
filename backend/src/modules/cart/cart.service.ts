import { prisma } from "../../config/prisma";
import { Prisma } from "../../generated/prisma/client";
import { ApiError } from "../../utils/ApiError";
import { AddItemInput } from "./cart.schema";

async function loadCart(userId: number) {
  return prisma.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
    include: {
      items: {
        orderBy: { id: "asc" },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              imageUrl: true,
              stock: true,
            },
          },
        },
      },
    },
  });
}

type LoadedCart = Awaited<ReturnType<typeof loadCart>>;

function toCartView(cart: LoadedCart) {
  let subtotal = new Prisma.Decimal(0);

  const items = cart.items.map((item) => {
    const lineTotal = item.product.price.mul(item.quantity);
    subtotal = subtotal.plus(lineTotal);

    return {
      id: item.id,
      productId: item.product.id,
      name: item.product.name,
      imageUrl: item.product.imageUrl,
      price: item.product.price.toFixed(2),
      quantity: item.quantity,
      stock: item.product.stock,
      exceedsStock: item.quantity > item.product.stock,
      lineTotal: lineTotal.toFixed(2),
    };
  });

  return {
    items,
    totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: subtotal.toFixed(2),
    total: subtotal.toFixed(2),
  };
}

function assertWithinStock(quantity: number, stock: number) {
  if (stock === 0) throw ApiError.badRequest("Product is out of stock");
  if (quantity > stock)
    throw ApiError.badRequest(`Only ${stock} left in stock`);
}

export async function getCart(userId: number) {
  return toCartView(await loadCart(userId));
}

export async function addItem(userId: number, input: AddItemInput) {
  const product = await prisma.product.findUnique({
    where: { id: input.productId },
  });
  if (!product) throw ApiError.notFound("Product not found");

  const cart = await loadCart(userId);
  const existing = cart.items.find(
    (item) => item.productId === input.productId,
  );

  const newQuantity = (existing?.quantity ?? 0) + input.quantity;
  assertWithinStock(newQuantity, product.stock);

  await prisma.cartItem.upsert({
    where: {
      cartId_productId: { cartId: cart.id, productId: input.productId },
    },
    update: { quantity: newQuantity },
    create: {
      cartId: cart.id,
      productId: input.productId,
      quantity: input.quantity,
    },
  });

  return getCart(userId);
}

export async function setQuantity(
  userId: number,
  productId: number,
  quantity: number,
) {
  const cart = await loadCart(userId);
  const item = cart.items.find((i) => i.productId === productId);
  if (!item) throw ApiError.notFound("Item is not in your cart");

  assertWithinStock(quantity, item.product.stock);

  await prisma.cartItem.update({
    where: { id: item.id },
    data: { quantity },
  });

  return getCart(userId);
}

export async function removeItem(userId: number, productId: number) {
  const cart = await loadCart(userId);

  const result = await prisma.cartItem.deleteMany({
    where: { cartId: cart.id, productId },
  });
  if (result.count === 0) throw ApiError.notFound("Item is not in your cart");

  return getCart(userId);
}
