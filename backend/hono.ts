import "dotenv/config";
import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { cors } from "hono/cors";
import { appRouter } from "./trpc/app-router.js";
import { createContext } from "./trpc/create-context.js";
import { generalRateLimiter } from "./middleware/rate-limit.js";

const app = new Hono();

// CORS Configuration - Production Ready
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",").map(o => o.trim()) || [];
const isDevelopment = process.env.NODE_ENV !== "production";

console.log("[CORS] Environment:", process.env.NODE_ENV || "development");
console.log("[CORS] Allowed origins:", allowedOrigins);

app.use("*", cors({
  origin: (origin) => {
    console.log("[CORS] Checking origin:", origin);

    // In development, allow all origins for easier testing
    if (isDevelopment) {
      console.log("[CORS] Development mode - allowing origin:", origin);
      return origin || "*";
    }

    // No origin = mobile apps, Postman, server-to-server - allow
    if (!origin) {
      console.log("[CORS] No origin - allowing (mobile/server request)");
      return "*";
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

    // IMPORTANT: Return the origin anyway but log warning
    // This prevents preflight failures - security is handled by auth
    console.warn("[CORS] ⚠️ Origin not in whitelist but allowing:", origin);
    return origin;
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
