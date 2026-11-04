import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";
import { CategoryInput } from "./category.schema";

async function getOrThrow(id: number) {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) throw ApiError.notFound("Category not found");
  return category;
}

export async function listCategories() {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });
}

export async function createCategory(input: CategoryInput) {
  const existing = await prisma.category.findUnique({
    where: { name: input.name },
  });
  if (existing) throw ApiError.conflict("Category already exists");

  return prisma.category.create({ data: input });
}

export async function updateCategory(id: number, input: CategoryInput) {
  await getOrThrow(id);

  const duplicate = await prisma.category.findUnique({
    where: { name: input.name },
  });
  if (duplicate && duplicate.id !== id) {
    throw ApiError.conflict("Category already exists");
  }

  return prisma.category.update({ where: { id }, data: input });
}

export async function deleteCategory(id: number) {
  await getOrThrow(id);

  const productCount = await prisma.product.count({
    where: { categoryId: id },
  });
  if (productCount > 0) {
    throw ApiError.conflict("Cannot delete a category that has products");
  }

  await prisma.category.delete({ where: { id } });
}
