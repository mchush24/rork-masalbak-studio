import { publicProcedure } from "../../create-context";
import { z } from "zod";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const suggestStoryThemesInputSchema = z.object({
  imageBase64: z.string(),
  language: z.enum(["tr", "en"]).default("tr"),
});

type ThemeSuggestion = {
  title: string;
  theme: string;
  emoji: string;
};

export const suggestStoryThemesProcedure = publicProcedure
  .input(suggestStoryThemesInputSchema)
  .mutation(async ({ input }: { input: z.infer<typeof suggestStoryThemesInputSchema> }) => {
    console.log("[Suggest Story Themes] 🎨 Analyzing drawing for theme suggestions");
    console.log("[Suggest Story Themes] Language:", input.language);

    try {
      const isTurkish = input.language === "tr";

      const prompt = isTurkish
        ? `Bu çocuk çizimini analiz et ve 3 farklı masal teması öner.

Her tema için:
- title: Çekici, yaratıcı bir masal başlığı (3-5 kelime)
- theme: Masalın ana teması ve duygusal tonu (1 cümle)
- emoji: Temayı temsil eden tek bir emoji

KURALLAR:
1. Çizimdeki ana öğeleri kullan (karakter, nesne, ortam)
2. Çocuk dostu, hayal gücünü tetikleyen başlıklar
3. Her tema farklı bir duygusal ton taşısın (macera, dostluk, keşif, cesaret, vb.)
4. Pozitif ve iyimser yaklaşım
5. Çocuğun yaşına uygun (3-10 yaş arası)

JSON formatında yanıt ver:
{
  "suggestions": [
    {
      "title": "Başlık örneği",
      "theme": "Tema açıklaması",
      "emoji": "🌟"
    }
  ]
}

Sadece JSON yanıt ver, başka açıklama ekleme.`
        : `Analyze this child's drawing and suggest 3 different story themes.

For each theme:
- title: Engaging, creative story title (3-5 words)
- theme: Main theme and emotional tone (1 sentence)
- emoji: Single emoji representing the theme

RULES:
1. Use main elements from the drawing (character, object, setting)
2. Child-friendly, imagination-sparking titles
3. Each theme has different emotional tone (adventure, friendship, discovery, courage, etc.)
4. Positive and optimistic approach
5. Age-appropriate (3-10 years old)

Respond in JSON format:
{
  "suggestions": [
    {
      "title": "Example Title",
      "theme": "Theme description",
      "emoji": "🌟"
    }
  ]
}

Only respond with JSON, no other explanation.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt,
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${input.imageBase64}`,
                },
              },
            ],
          },
        ],
        max_tokens: 500,
        temperature: 0.8, // More creative suggestions
      });

      const content = response.choices[0]?.message?.content || "";
      console.log("[Suggest Story Themes] ✅ Raw response:", content);

      // Parse JSON response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Failed to parse JSON from response");
      }

      const parsed = JSON.parse(jsonMatch[0]);
      const suggestions: ThemeSuggestion[] = parsed.suggestions || [];

      if (suggestions.length === 0) {
        throw new Error("No suggestions returned");
      }

      console.log("[Suggest Story Themes] ✅ Generated", suggestions.length, "theme suggestions");
      return { suggestions };
    } catch (error) {
      console.error("[Suggest Story Themes] ❌ Error:", error);
      throw new Error(
        `Story theme suggestion failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  });
