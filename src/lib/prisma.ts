import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

const adapter = process.env.DATABASE_URL
  ? new PrismaPg({ connectionString: process.env.DATABASE_URL })
  : new PrismaPg({
      connectionString: "postgresql://postgres:postgres@localhost:5432/happyscake",
    });

export const prisma =
  global.prisma ??
  new PrismaClient(
    ({
      adapter,
      log:
        process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    }) as never,
  );

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}
