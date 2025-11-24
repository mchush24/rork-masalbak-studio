/**
 * Standalone server for Hono backend
 * Run with: npm run backend
 */
import "dotenv/config";
import { serve } from "@hono/node-server";
import app from "./hono";

const port = parseInt(process.env.PORT || "3000");

console.log(`🚀 Starting Hono backend server on port ${port}...`);
console.log(`🔑 OPENAI_API_KEY loaded: ${process.env.OPENAI_API_KEY?.substring(0, 20)}...${process.env.OPENAI_API_KEY?.slice(-4)}`);

serve({
  fetch: app.fetch,
  port,
});

console.log(`✅ Backend server running at http://localhost:${port}`);
console.log(`📡 tRPC endpoint: http://localhost:${port}/api/trpc`);
