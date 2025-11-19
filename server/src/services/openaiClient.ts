import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.warn("[OpenAI] OPENAI_API_KEY not set");
}

const openai = new OpenAI({ apiKey: apiKey || "" });

export async function analyzeDrawingWithOpenAI(
  prompt: string,
  maxTokens: number = 1500
): Promise<string> {
  try {
    console.log("[OpenAI] Analyzing drawing...");

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: maxTokens,
      temperature: 0.7,
    });

    const text = response.choices[0]?.message?.content || "";

    if (!text) {
      throw new Error("No text content in response");
    }

    console.log("[OpenAI] Analysis complete");
    return text;
  } catch (error) {
    console.error("[OpenAI] Error:", error);
    throw error;
  }
}