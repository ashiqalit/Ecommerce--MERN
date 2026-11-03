import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma";

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || "Admin";

  if (!email || !password) {
    throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD in .env");
  }

  const hashed = await bcrypt.hash(password, 10);

  const admin = await prisma.user.upsert({
    where: { email },
    update: { role: "ADMIN" },
    create: {
      name,
      email,
      password: hashed,
      role: "ADMIN",
      cart: { create: {} },
    },
  });

  console.log(`Admin ready: ${admin.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
