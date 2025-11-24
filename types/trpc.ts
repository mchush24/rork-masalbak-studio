/**
 * tRPC Router type definition
 * Direct import from backend - safe because types are compile-time only
 */
import type { AppRouter as BackendAppRouter } from "../backend/trpc/app-router";

export type AppRouter = BackendAppRouter;
