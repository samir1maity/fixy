import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({
  connectionString,
  connectionTimeoutMillis: 5_000,
  idleTimeoutMillis: 300_000,
});
export const prisma = new PrismaClient({ adapter });

export async function connectDb(): Promise<void> {
  await prisma.$queryRaw`SELECT 1`;
  console.log("Database connection established.");
}