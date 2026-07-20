import dotenv from "dotenv";
import Redis from "ioredis";

dotenv.config();

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  throw new Error("REDIS_URL is not set — check apps/backend/.env");
}

export const redisStream = new Redis(redisUrl);


redisStream.on("connect", () => {
  console.log("Redis connected");
});

redisStream.on("error", (err) => {
  console.error("Redis error:", err.message);
});
