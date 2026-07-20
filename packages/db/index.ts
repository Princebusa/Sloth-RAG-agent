import dotenv from "dotenv";
import { PrismaClient } from "./generated/prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set — check packages/db/.env or apps/backend/.env");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool as any);

export const prisma = new PrismaClient({ adapter });
export { PrismaClient };