import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import { createStorybookProcedure } from "./routes/studio/create-storybook";
import { generateColoringPDFProcedure } from "./routes/studio/generate-coloring-pdf";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  studio: createTRPCRouter({
    createStorybook: createStorybookProcedure,
    generateColoringPDF: generateColoringPDFProcedure,
  }),
});

export type AppRouter = typeof appRouter;
