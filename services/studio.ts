import * as FileSystem from "expo-file-system";
import { trpcClient } from "@/lib/trpc";

export type StoryPageInput = { text: string; prompt?: string };

export type StorybookResult = {
  pages: { text: string; img_url: string }[];
  pdf_url?: string;
  voice_urls?: string[];
  record?: any;
};

export async function createStorybook(
  pages: StoryPageInput[],
  options?: { lang?: "tr"|"en"; makePdf?: boolean; makeTts?: boolean; title?: string; user_id?: string|null }
): Promise<StorybookResult> {
  return await trpcClient.studio.createStorybook.mutate({
    pages,
    lang: options?.lang ?? "tr",
    makePdf: options?.makePdf ?? true,
    makeTts: options?.makeTts ?? true,
    title: options?.title ?? "Masal",
    user_id: options?.user_id ?? null
  });
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
  const dataUri = await toDataUri(imageUri);
  return await trpcClient.studio.generateColoringPDF.mutate({
    size: options?.size ?? "A4",
    title,
    pages: [dataUri],
    user_id: options?.user_id ?? null
  });
}

export async function listStorybooks(user_id?: string|null) {
  return await trpcClient.studio.listStorybooks.query({ user_id: user_id ?? null });
}

export async function listColorings(user_id?: string|null) {
  return await trpcClient.studio.listColorings.query({ user_id: user_id ?? null });
}
