import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";
import { AddressInput } from "./address.schema";

async function getOwned(userId: number, id: number) {
  const address = await prisma.address.findFirst({ where: { id, userId } });
  if (!address) throw ApiError.notFound("Address not found");
  return address;
}

async function assertNotUsedByOrder(id: number, action: "edited" | "deleted") {
  const used = await prisma.order.count({ where: { addressId: id } });
  if (used > 0) {
    throw ApiError.conflict(
      `This address is used by an existing order and cannot be ${action}. Add a new address instead.`,
    );
  }
}

export async function listAddresses(userId: number) {
  return prisma.address.findMany({
    where: { userId },
    orderBy: { id: "desc" },
  });
}

export async function createAddress(userId: number, input: AddressInput) {
  return prisma.address.create({ data: { ...input, userId } });
}

export async function updateAddress(
  userId: number,
  id: number,
  input: AddressInput,
) {
  await getOwned(userId, id);
  await assertNotUsedByOrder(id, "edited");
  return prisma.address.update({ where: { id }, data: input });
}

export async function deleteAddress(userId: number, id: number) {
  await getOwned(userId, id);
  await assertNotUsedByOrder(id, "deleted");
  await prisma.address.delete({ where: { id } });
}
