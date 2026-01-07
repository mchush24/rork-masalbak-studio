import "dotenv/config";
import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { cors } from "hono/cors";
import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";
import { generalRateLimiter } from "./middleware/rate-limit";

const app = new Hono();

// CORS Configuration - Production Ready
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",").map(o => o.trim()) || [];
const isDevelopment = process.env.NODE_ENV !== "production";

console.log("[CORS] Environment:", process.env.NODE_ENV || "development");
console.log("[CORS] Allowed origins:", allowedOrigins);

app.use("*", cors({
  origin: (origin) => {
    // In development, allow all origins for easier testing
    if (isDevelopment) {
      console.log("[CORS] Development mode - allowing origin:", origin);
      return origin;
    }

    // In production, check against whitelist
    if (!origin) {
      // Allow requests with no origin (e.g., mobile apps, Postman)
      return origin;
    }

    // Check if origin matches any allowed pattern
    const isAllowed = allowedOrigins.some((allowedOrigin) => {
      // Support wildcard patterns (e.g., exp://192.168.*)
      if (allowedOrigin.includes("*")) {
        const pattern = new RegExp("^" + allowedOrigin.replace(/\*/g, ".*") + "$");
        return pattern.test(origin);
      }
      return origin === allowedOrigin;
    });

    if (isAllowed) {
      console.log("[CORS] ✅ Allowed origin:", origin);
      return origin;
    }

    console.warn("[CORS] ❌ Blocked origin:", origin);
    return null; // Block the request
  },
  credentials: true,
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
  exposeHeaders: ["Content-Length", "X-Request-Id"],
  maxAge: 3600, // Cache preflight for 1 hour
}));

// Apply rate limiting to all tRPC endpoints
app.use("/api/trpc/*", generalRateLimiter);

app.use(
  "/api/trpc/*",
  trpcServer({
    router: appRouter,
    createContext,
    endpoint: "/api/trpc",
  })
);

app.get("/", (c) => {
  return c.json({ status: "ok", message: "API is running" });
});

app.get("/health", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

export default app;
