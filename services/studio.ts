import * as FileSystem from "expo-file-system/legacy";

export type StoryPageInput = { text: string; prompt?: string };

export type StorybookResult = {
  pages: { text: string; img_url: string }[];
  pdf_url?: string;
  voice_urls?: string[];
  record?: any;
};

/**
 * Studio backend is now integrated via /backend/trpc/routes/studio.
 * Use tRPC client directly: trpc.studio.createStorybook.useMutation()
 */
export async function createStorybook(
  pages: StoryPageInput[],
  options?: { lang?: "tr"|"en"; makePdf?: boolean; makeTts?: boolean; title?: string; user_id?: string|null }
): Promise<StorybookResult> {
  throw new Error("Please use tRPC client directly: trpc.studio.createStorybook.useMutation()");
}

export type ColoringPDFResult = { pdf_url: string; record?: any };

async function toDataUri(localUri: string): Promise<string> {
  const base64 = await FileSystem.readAsStringAsync(localUri, { encoding: "base64" });
  const ext = (localUri.split(".").pop() || "jpg").toLowerCase();
  const mime = ext === "jpg" ? "jpeg" : ext;
  return `data:image/${mime};base64,${base64}`;
}

export async function generateColoringPDF(
  imageUri: string,
  title: string,
  options?: { size?: "A4"|"A3"; user_id?: string|null }
): Promise<ColoringPDFResult> {
  throw new Error("Please use tRPC client directly: trpc.studio.generateColoringPDF.useMutation()");
}

export async function listStorybooks(user_id?: string|null) {
  throw new Error("Please use tRPC client directly: trpc.studio.listStorybooks.useQuery()");
}

export async function listColorings(user_id?: string|null) {
  throw new Error("Please use tRPC client directly: trpc.studio.listColorings.useQuery()");
}
