import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import { createStorybookProcedure } from "./routes/studio/create-storybook";
import { generateColoringPDFProcedure } from "./routes/studio/generate-coloring-pdf";
import { generateColoringFromDrawingProcedure } from "./routes/studio/generate-coloring-from-drawing";
import { listStorybooksProcedure, listColoringsProcedure } from "./routes/studio/list-history";
import { analyzeDrawingProcedure } from "./routes/studio/analyze-drawing";
import { registerProcedure } from "./routes/auth/register";
import { verifyEmailProcedure } from "./routes/auth/verify-email";
import { completeOnboardingProcedure } from "./routes/auth/complete-onboarding";
import { getProfileProcedure } from "./routes/user/get-profile";
import { updateProfileProcedure } from "./routes/user/update-profile";
import { getUserStatsProcedure } from "./routes/user/get-user-stats";
import { getSettingsProcedure } from "./routes/user/get-settings";
import { updateSettingsProcedure } from "./routes/user/update-settings";
import { saveAnalysisProcedure } from "./routes/analysis/save-analysis";
import { listAnalysesProcedure } from "./routes/analysis/list-analyses";
import { getAnalysisProcedure } from "./routes/analysis/get-analysis";
import { updateAnalysisProcedure } from "./routes/analysis/update-analysis";
import { deleteAnalysisProcedure } from "./routes/analysis/delete-analysis";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  auth: createTRPCRouter({
    register: registerProcedure,
    verifyEmail: verifyEmailProcedure,
    completeOnboarding: completeOnboardingProcedure,
  }),
  user: createTRPCRouter({
    getProfile: getProfileProcedure,
    updateProfile: updateProfileProcedure,
    getUserStats: getUserStatsProcedure,
    getSettings: getSettingsProcedure,
    updateSettings: updateSettingsProcedure,
  }),
  analysis: createTRPCRouter({
    save: saveAnalysisProcedure,
    list: listAnalysesProcedure,
    get: getAnalysisProcedure,
    update: updateAnalysisProcedure,
    delete: deleteAnalysisProcedure,
  }),
  studio: createTRPCRouter({
    createStorybook: createStorybookProcedure,
    generateColoringPDF: generateColoringPDFProcedure,
    generateColoringFromDrawing: generateColoringFromDrawingProcedure,
    listStorybooks: listStorybooksProcedure,
    listColorings: listColoringsProcedure,
    analyzeDrawing: analyzeDrawingProcedure,
  }),
});

export type AppRouter = typeof appRouter;
