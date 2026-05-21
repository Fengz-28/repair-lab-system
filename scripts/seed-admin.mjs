import bcrypt from "bcryptjs";
import { PrismaClient, UserRole } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;
const name = process.env.ADMIN_NAME?.trim() || "Admin";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required.");
}

if (!email || !password) {
  throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required.");
}

if (password.length < 10) {
  throw new Error("ADMIN_PASSWORD must be at least 10 characters.");
}

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

const passwordHash = await bcrypt.hash(password, 12);

await prisma.user.upsert({
  where: { email },
  create: {
    email,
    name,
    passwordHash,
    role: UserRole.ADMIN,
    isActive: true,
  },
  update: {
    name,
    passwordHash,
    role: UserRole.ADMIN,
    isActive: true,
  },
});

await prisma.$disconnect();

console.log(`Admin user ready: ${email}`);
