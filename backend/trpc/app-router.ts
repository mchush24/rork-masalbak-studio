import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import { createStorybookProcedure } from "./routes/studio/create-storybook";
import { generateColoringPDFProcedure } from "./routes/studio/generate-coloring-pdf";
import { generateColoringFromDrawingProcedure } from "./routes/studio/generate-coloring-from-drawing";
import { listStorybooksProcedure, listColoringsProcedure, deleteStorybookProcedure, deleteColoringProcedure } from "./routes/studio/list-history";
import { getStorybookProcedure } from "./routes/studio/get-storybook";
import { getColoringProcedure } from "./routes/studio/get-coloring";
import { analyzeDrawingProcedure } from "./routes/studio/analyze-drawing";
import { generateStoryFromDrawingProcedure } from "./routes/studio/generate-story-from-drawing";
import { suggestStoryThemesProcedure } from "./routes/studio/suggest-story-themes";
import { saveCompletedColoringProcedure } from "./routes/studio/save-completed-coloring";
import { registerProcedure } from "./routes/auth/register";
import { verifyEmailProcedure } from "./routes/auth/verify-email";
import { completeOnboardingProcedure } from "./routes/auth/complete-onboarding";
import { loginWithPasswordProcedure } from "./routes/auth/login-with-password";
import { requestPasswordResetProcedure } from "./routes/auth/request-password-reset";
import { resetPasswordProcedure } from "./routes/auth/reset-password";
import { setPasswordProcedure } from "./routes/auth/set-password";
import { updateBiometricProcedure } from "./routes/auth/update-biometric";
import { checkEmailProcedure } from "./routes/auth/check-email";
import { getProfileProcedure } from "./routes/user/get-profile";
import { updateProfileProcedure } from "./routes/user/update-profile";
import { getUserStatsProcedure } from "./routes/user/get-user-stats";
import { getSettingsProcedure } from "./routes/user/get-settings";
import { updateSettingsProcedure } from "./routes/user/update-settings";
import { getChildrenProcedure } from "./routes/user/get-children";
import { updateChildrenProcedure } from "./routes/user/update-children";
import { deleteAccountProcedure } from "./routes/user/delete-account";
import { exportDataProcedure } from "./routes/user/export-data";
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
});

export type AppRouter = typeof appRouter;
