ecepekyalcin@192 rork-masalbak-studio % cd /Users/ecepekyalcin/rork-masalbak-studio/server
ls src

index.ts        routers         trpc.ts
ecepekyalcin@192 server % cat src/index.ts

import { router } from "../trpc";
import { healthRouter } from "./health";
import { drawAnalysisRouter } from "./drawAnalysis";

export const appRouter = router({
  health: healthRouter,
  drawAnalysis: drawAnalysisRouter
});

export type AppRouter = typeof appRouter;
ecepekyalcin@192 server %

COMMAND   PID   USER   FD   TYPE             DEVICE SIZE/OFF NODE NAME
node    12345 user    21u  IPv6 0x1234567890abcdef      0t0  TCP *:4000 (LISTEN)