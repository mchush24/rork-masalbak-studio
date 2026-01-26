/**
 * Standalone server for Hono backend
 * Run with: npm run backend
 */
import "dotenv/config";
import { serve } from "@hono/node-server";
import app from "./hono.js";
import { createLogger } from "./lib/logger.js";
import { validateEnvOrExit, isDevelopment } from "./lib/env-validator.js";

// Validate environment variables before starting
validateEnvOrExit();

const log = createLogger('Server');
const port = parseInt(process.env.PORT || "3000");

// Startup logging
log.info('Starting Hono backend server', { port });
if (isDevelopment()) {
  console.log(`🔑 OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? 'SET' : 'MISSING'}`);
  console.log(`🔑 ANTHROPIC_API_KEY: ${process.env.ANTHROPIC_API_KEY ? 'SET' : 'MISSING'}`);
  console.log(`🗄️ SUPABASE_URL: ${process.env.SUPABASE_URL ? 'SET' : 'MISSING'}`);
}

// Start server
const server = serve({
  fetch: app.fetch,
  port,
});

log.info('Backend server running', { url: `http://localhost:${port}`, trpc: `http://localhost:${port}/api/trpc` });

// ============================================
// GRACEFUL SHUTDOWN
// ============================================

const SHUTDOWN_TIMEOUT = 10000; // 10 seconds
let isShuttingDown = false;

async function gracefulShutdown(signal: string) {
  if (isShuttingDown) {
    log.warn('Shutdown already in progress, ignoring signal', { signal });
    return;
  }

  isShuttingDown = true;
  log.info('Graceful shutdown initiated', { signal });

  // Set a timeout for force exit
  const forceExitTimeout = setTimeout(() => {
    log.error('Graceful shutdown timeout, forcing exit');
    process.exit(1);
  }, SHUTDOWN_TIMEOUT);

  try {
    // Stop accepting new connections
    await new Promise<void>((resolve, reject) => {
      server.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    log.info('HTTP server closed');

    // Add any cleanup here (database connections, etc.)
    // Example: await closeDatabase();

    clearTimeout(forceExitTimeout);
    log.info('Graceful shutdown complete');
    process.exit(0);
  } catch (error) {
    log.error('Error during shutdown', error);
    clearTimeout(forceExitTimeout);
    process.exit(1);
  }
}

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  log.error('Uncaught exception', error);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason) => {
  log.error('Unhandled rejection', reason as Error);
  // Don't exit on unhandled rejection, just log it
});
