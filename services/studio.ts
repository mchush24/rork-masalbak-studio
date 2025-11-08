type PageSpec = { text: string; prompt?: string };

interface StorybookOptions {
  title: string;
  pages: PageSpec[];
  makePdf?: boolean;
  makeTts?: boolean;
}

interface StorybookResult {
  title: string;
  pages: { text: string; img_url: string }[];
  pdf_url?: string;
  voice_urls?: string[];
}

export async function createStorybook(
  pages: PageSpec[],
  options: { makePdf?: boolean; makeTts?: boolean } = {}
): Promise<StorybookResult> {
  const input: StorybookOptions = {
    title: "Çocuk Masalı",
    pages,
    ...options,
  };

  const response = await fetch("/api/trpc/studio.createStorybook", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ json: input }),
  });

  if (!response.ok) {
    throw new Error(`Storybook creation failed: ${response.status}`);
  }

  const data = await response.json();
  return data.result.data.json;
}

export async function generateColoringPDF(
  imageUri: string,
  title: string,
  size: "A4" | "A3" = "A4"
): Promise<string> {
  const response = await fetch("/api/trpc/studio.generateColoringPDF", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      json: {
        imageUri,
        title,
        size,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Coloring PDF generation failed: ${response.status}`);
  }

  const data = await response.json();
  return data.result.data.json.pdf_url;
}
