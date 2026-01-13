import { createTRPCRouter } from "./create-context.js";
import hiRoute from "./routes/example/hi/route.js";
import { createStorybookProcedure } from "./routes/studio/create-storybook.js";
import { generateColoringPDFProcedure } from "./routes/studio/generate-coloring-pdf.js";
import { generateColoringFromDrawingProcedure } from "./routes/studio/generate-coloring-from-drawing.js";
import { listStorybooksProcedure, listColoringsProcedure, deleteStorybookProcedure, deleteColoringProcedure } from "./routes/studio/list-history.js";
import { getStorybookProcedure } from "./routes/studio/get-storybook.js";
import { getColoringProcedure } from "./routes/studio/get-coloring.js";
import { analyzeDrawingProcedure } from "./routes/studio/analyze-drawing.js";
import { generateStoryFromDrawingProcedure } from "./routes/studio/generate-story-from-drawing.js";
import { suggestStoryThemesProcedure } from "./routes/studio/suggest-story-themes.js";
import { saveCompletedColoringProcedure } from "./routes/studio/save-completed-coloring.js";
import { registerProcedure } from "./routes/auth/register.js";
import { verifyEmailProcedure } from "./routes/auth/verify-email.js";
import { completeOnboardingProcedure } from "./routes/auth/complete-onboarding.js";
import { loginWithPasswordProcedure } from "./routes/auth/login-with-password.js";
import { requestPasswordResetProcedure } from "./routes/auth/request-password-reset.js";
import { resetPasswordProcedure } from "./routes/auth/reset-password.js";
import { setPasswordProcedure } from "./routes/auth/set-password.js";
import { updateBiometricProcedure } from "./routes/auth/update-biometric.js";
import { checkEmailProcedure } from "./routes/auth/check-email.js";
import { getProfileProcedure } from "./routes/user/get-profile.js";
import { updateProfileProcedure } from "./routes/user/update-profile.js";
import { getUserStatsProcedure } from "./routes/user/get-user-stats.js";
import { getSettingsProcedure } from "./routes/user/get-settings.js";
import { updateSettingsProcedure } from "./routes/user/update-settings.js";
import { getChildrenProcedure } from "./routes/user/get-children.js";
import { updateChildrenProcedure } from "./routes/user/update-children.js";
import { deleteAccountProcedure } from "./routes/user/delete-account.js";
import { exportDataProcedure } from "./routes/user/export-data.js";
import { saveAnalysisProcedure } from "./routes/analysis/save-analysis.js";
import { listAnalysesProcedure } from "./routes/analysis/list-analyses.js";
import { getAnalysisProcedure } from "./routes/analysis/get-analysis.js";
import { updateAnalysisProcedure } from "./routes/analysis/update-analysis.js";
import { deleteAnalysisProcedure } from "./routes/analysis/delete-analysis.js";
import { interactiveStoryRouter } from "./routes/interactive-story/index.js";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  auth: createTRPCRouter({
    register: registerProcedure,
    verifyEmail: verifyEmailProcedure,
    completeOnboarding: completeOnboardingProcedure,
    loginWithPassword: loginWithPasswordProcedure,
    requestPasswordReset: requestPasswordResetProcedure,
    resetPassword: resetPasswordProcedure,
    setPassword: setPasswordProcedure,
    updateBiometric: updateBiometricProcedure,
    checkEmail: checkEmailProcedure,
  }),
  user: createTRPCRouter({
    getProfile: getProfileProcedure,
    updateProfile: updateProfileProcedure,
    getUserStats: getUserStatsProcedure,
    getSettings: getSettingsProcedure,
    updateSettings: updateSettingsProcedure,
    getChildren: getChildrenProcedure,
    updateChildren: updateChildrenProcedure,
    deleteAccount: deleteAccountProcedure,
    exportData: exportDataProcedure,
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
    generateStoryFromDrawing: generateStoryFromDrawingProcedure,
    listStorybooks: listStorybooksProcedure,
    listColorings: listColoringsProcedure,
    getStorybook: getStorybookProcedure,
    getColoring: getColoringProcedure,
    deleteStorybook: deleteStorybookProcedure,
    deleteColoring: deleteColoringProcedure,
    saveCompletedColoring: saveCompletedColoringProcedure,
    analyzeDrawing: analyzeDrawingProcedure,
    suggestStoryThemes: suggestStoryThemesProcedure,
  }),
  interactiveStory: interactiveStoryRouter,
});

export type AppRouter = typeof appRouter;
