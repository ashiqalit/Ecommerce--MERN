import { prisma } from "../../config/prisma";
import { Prisma } from "../../generated/prisma/client";
import { ApiError } from "../../utils/ApiError";
import {
  CreateProductInput,
  ListProductsQuery,
  UpdateProductInput,
} from "./product.schema";

const withCategory = {
  category: { select: { id: true, name: true } },
} as const;

async function assertCategoryExists(categoryId: number) {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });
  if (!category) throw ApiError.badRequest("Category does not exist");
}

export async function listProducts(query: ListProductsQuery) {
  const { search, categoryId, page, limit } = query;

  const where: Prisma.ProductWhereInput = {
    ...(search && { name: { contains: search, mode: "insensitive" } }),
    ...(categoryId && { categoryId }),
  };

  const [items, total] = await prisma.$transaction([
    prisma.product.findMany({
      where,
      include: withCategory,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    items,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getProduct(id: number) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: withCategory,
  });
  if (!product) throw ApiError.notFound("Product not found");
  return product;
}

export async function createProduct(input: CreateProductInput) {
  await assertCategoryExists(input.categoryId);
  return prisma.product.create({ data: input, include: withCategory });
}

export async function updateProduct(id: number, input: UpdateProductInput) {
  await getProduct(id);
  if (input.categoryId !== undefined) {
    await assertCategoryExists(input.categoryId);
  }
  return prisma.product.update({
    where: { id },
    data: input,
    include: withCategory,
  });
}

export async function deleteProduct(id: number) {
  await getProduct(id);

  const orderedCount = await prisma.orderItem.count({
    where: { productId: id },
  });
  if (orderedCount > 0) {
    throw ApiError.conflict(
      "This product has been ordered and cannot be deleted. Set its stock to 0 instead.",
    );
  }

  await prisma.$transaction([
    prisma.cartItem.deleteMany({ where: { productId: id } }),
    prisma.product.delete({ where: { id } }),
  ]);
}
