/**
 * Interactive Story tRPC Router
 *
 * Interaktif masal sistemi için tüm API endpointleri
 */

import { z } from "zod";
import { createTRPCRouter } from "../../create-context";
import { protectedProcedure } from "../../create-context";
import { authenticatedAiRateLimit } from "../../middleware/rate-limit";
import {
  generateInteractiveStory,
  generateNextSegment,
  getTraitInfo,
  getTherapeuticMapping,
} from "../../../lib/generate-interactive-story";
import {
  InteractiveStory,
  InteractiveStorySession,
  ChoiceMade,
  ParentReport,
  PersonalityTrait,
  TraitCount,
  ChoiceTimelineItem,
  ActivitySuggestion,
  TRAIT_DEFINITIONS,
  THERAPEUTIC_TRAIT_MAPPING,
  ConcernType,
  TherapeuticReportSection,
} from "../../../types/InteractiveStory";
import { createSupabaseClient } from "../../../lib/supabase";

// ============================================
// Zod Schemas
// ============================================

const generateInteractiveStorySchema = z.object({
  imageBase64: z.string(),
  childAge: z.number().min(2).max(12),
  childName: z.string().optional(),
  language: z.enum(["tr", "en"]).default("tr"),
  selectedTheme: z.string().optional(),
  therapeuticContext: z.object({
    concernType: z.string(),
    therapeuticApproach: z.string(),
  }).optional(),
});

const makeChoiceSchema = z.object({
  sessionId: z.string(),
  choicePointId: z.string(),
  optionId: z.string(),
});

const getSessionSchema = z.object({
  sessionId: z.string(),
});

const generateParentReportSchema = z.object({
  sessionId: z.string(),
  childName: z.string().optional(),
});

// ============================================
// Interactive Story Router
// ============================================

export const interactiveStoryRouter = createTRPCRouter({
  /**
   * Yeni interaktif hikaye oluştur
   */
  generate: protectedProcedure
    .use(authenticatedAiRateLimit)
    .input(generateInteractiveStorySchema)
    .mutation(async ({ ctx, input }) => {
      console.log("[Interactive Story API] 🚀 Generating new interactive story");

      try {
        // Hikayeyi üret
        const { story, firstSegment, firstChoicePoint } = await generateInteractiveStory(input);

        // Veritabanına kaydet
        const supabase = createSupabaseClient();

        // Storybook olarak kaydet (is_interactive = true)
        const { data: storybook, error: storybookError } = await supabase
          .from("storybooks")
          .insert({
            user_id_fk: ctx.userId,
            title: story.title,
            pages: firstSegment.pages,
            is_interactive: true,
            story_graph: {
              segments: story.segments,
              choicePoints: story.choicePoints,
              startSegmentId: story.startSegmentId,
              endingSegmentIds: story.endingSegmentIds,
              mainCharacter: story.mainCharacter,
              totalChoicePoints: story.totalChoicePoints,
              mood: story.mood,
              therapeuticContext: story.therapeuticContext,
              // Store generation parameters for later use
              language: input.language,
              childAge: input.childAge,
            },
            total_choice_points: story.totalChoicePoints,
          })
          .select()
          .single();

        if (storybookError) {
          console.error("[Interactive Story API] ❌ Storybook save error:", storybookError);
          throw new Error("Failed to save interactive story");
        }

        // Session oluştur
        const { data: session, error: sessionError } = await supabase
          .from("interactive_story_sessions")
          .insert({
            user_id_fk: ctx.userId,
            storybook_id: storybook.id,
            current_segment_id: story.startSegmentId,
            choices_made: [],
            path_taken: [story.startSegmentId],
            status: "in_progress",
          })
          .select()
          .single();

        if (sessionError) {
          console.error("[Interactive Story API] ❌ Session save error:", sessionError);
          throw new Error("Failed to create session");
        }

        console.log("[Interactive Story API] ✅ Interactive story created:", storybook.id);

        return {
          storyId: storybook.id,
          sessionId: session.id,
          story: {
            id: storybook.id,
            title: story.title,
            mainCharacter: story.mainCharacter,
            totalChoicePoints: story.totalChoicePoints,
            mood: story.mood,
          },
          currentSegment: firstSegment,
          currentChoicePoint: firstChoicePoint,
          progress: {
            currentChoice: 0,
            totalChoices: story.totalChoicePoints,
          },
        };
      } catch (error) {
        console.error("[Interactive Story API] ❌ Generation failed:", error);
        throw error;
      }
    }),

  /**
   * Seçim yap ve sonraki segmenti al
   */
  makeChoice: protectedProcedure
    .use(authenticatedAiRateLimit)
    .input(makeChoiceSchema)
    .mutation(async ({ ctx, input }) => {
      console.log("[Interactive Story API] 🎯 Making choice:", input.optionId);

      const supabase = createSupabaseClient();

      // Session'ı getir
      const { data: session, error: sessionError } = await supabase
        .from("interactive_story_sessions")
        .select("*, storybooks(*)")
        .eq("id", input.sessionId)
        .single();

      if (sessionError || !session) {
        throw new Error("Session not found");
      }

      // Story graph'ı al
      const storyGraph = session.storybooks.story_graph;
      const choicePoint = storyGraph.choicePoints[input.choicePointId];
      const selectedOption = choicePoint?.options.find((o: any) => o.id === input.optionId);

      if (!selectedOption) {
        throw new Error("Invalid choice");
      }

      // Seçimi kaydet
      const choiceMade: ChoiceMade = {
        choicePointId: input.choicePointId,
        optionId: input.optionId,
        trait: selectedOption.trait,
        timestamp: new Date().toISOString(),
      };

      const updatedChoices = [...(session.choices_made || []), choiceMade];
      const updatedPath = [...(session.path_taken || []), selectedOption.nextSegmentId];

      // Sonraki segmenti üret
      const previousChoices = updatedChoices.map((c: ChoiceMade) => {
        const cp = storyGraph.choicePoints[c.choicePointId];
        const opt = cp?.options.find((o: any) => o.id === c.optionId);
        return {
          question: cp?.question || "",
          chosen: opt?.text || "",
          trait: c.trait,
        };
      });

      // InteractiveStory nesnesini oluştur
      const story: InteractiveStory = {
        id: session.storybooks.id,
        title: session.storybooks.title,
        isInteractive: true,
        mainCharacter: storyGraph.mainCharacter,
        segments: storyGraph.segments,
        choicePoints: storyGraph.choicePoints,
        startSegmentId: storyGraph.startSegmentId,
        endingSegmentIds: storyGraph.endingSegmentIds,
        totalChoicePoints: storyGraph.totalChoicePoints,
        estimatedDuration: "",
        themes: [],
        educationalValue: "",
        mood: storyGraph.mood,
      };

      // Get language and childAge from story_graph (stored during story generation)
      const language = storyGraph.language || "tr";
      const childAge = storyGraph.childAge || 6;

      const { segment, nextChoicePoint, isEnding } = await generateNextSegment(
        story,
        input.choicePointId,
        input.optionId,
        previousChoices,
        language,
        childAge
      );

      // Session'ı güncelle
      const newStatus = isEnding ? "completed" : "in_progress";
      const { error: updateError } = await supabase
        .from("interactive_story_sessions")
        .update({
          current_segment_id: selectedOption.nextSegmentId,
          choices_made: updatedChoices,
          path_taken: updatedPath,
          status: newStatus,
          completed_at: isEnding ? new Date().toISOString() : null,
        })
        .eq("id", input.sessionId);

      if (updateError) {
        console.error("[Interactive Story API] ❌ Session update error:", updateError);
      }

      // Analytics kaydet
      await supabase.from("choice_analytics").insert({
        session_id: input.sessionId,
        choice_point_id: input.choicePointId,
        option_id: input.optionId,
        trait: selectedOption.trait,
      });

      // Story graph'ı güncelle (yeni segment ekle)
      const updatedStoryGraph = {
        ...storyGraph,
        segments: {
          ...storyGraph.segments,
          [selectedOption.nextSegmentId]: segment,
        },
      };

      await supabase
        .from("storybooks")
        .update({ story_graph: updatedStoryGraph })
        .eq("id", session.storybooks.id);

      console.log("[Interactive Story API] ✅ Choice made, segment generated");

      return {
        segment,
        nextChoicePoint,
        isEnding,
        progress: {
          currentChoice: updatedChoices.length,
          totalChoices: story.totalChoicePoints,
        },
        choiceMade: {
          trait: selectedOption.trait,
          traitInfo: getTraitInfo(selectedOption.trait, "tr"),
        },
      };
    }),

  /**
   * Mevcut oturumu getir
   */
  getSession: protectedProcedure
    .input(getSessionSchema)
    .query(async ({ ctx, input }) => {
      const supabase = createSupabaseClient();

      const { data: session, error } = await supabase
        .from("interactive_story_sessions")
        .select("*, storybooks(*)")
        .eq("id", input.sessionId)
        .single();

      if (error || !session) {
        throw new Error("Session not found");
      }

      const storyGraph = session.storybooks.story_graph;
      const currentSegment = storyGraph.segments[session.current_segment_id];

      // Sonraki seçim noktasını bul
      const currentChoiceIndex = (session.choices_made || []).length;
      const nextChoiceId = `choice_${currentChoiceIndex + 1}`;
      const nextChoicePoint = storyGraph.choicePoints[nextChoiceId];

      return {
        session: {
          id: session.id,
          status: session.status,
          choicesMade: session.choices_made || [],
          pathTaken: session.path_taken || [],
        },
        story: {
          id: session.storybooks.id,
          title: session.storybooks.title,
          mainCharacter: storyGraph.mainCharacter,
          totalChoicePoints: storyGraph.totalChoicePoints,
        },
        currentSegment,
        currentChoicePoint: nextChoicePoint,
        progress: {
          currentChoice: currentChoiceIndex,
          totalChoices: storyGraph.totalChoicePoints,
        },
        isEnding: session.status === "completed",
      };
    }),

  /**
   * Ebeveyn raporu oluştur
   */
  generateParentReport: protectedProcedure
    .input(generateParentReportSchema)
    .mutation(async ({ ctx, input }) => {
      console.log("[Interactive Story API] 📊 Generating parent report");

      const supabase = createSupabaseClient();

      // Session'ı getir
      const { data: session, error } = await supabase
        .from("interactive_story_sessions")
        .select("*, storybooks(*)")
        .eq("id", input.sessionId)
        .single();

      if (error || !session) {
        throw new Error("Session not found");
      }

      if (session.status !== "completed") {
        throw new Error("Story must be completed to generate report");
      }

      const storyGraph = session.storybooks.story_graph;
      const choicesMade: ChoiceMade[] = session.choices_made || [];

      // Trait sayımı
      const traitCounts: Record<PersonalityTrait, number> = {} as Record<PersonalityTrait, number>;
      const allTraits = Object.keys(TRAIT_DEFINITIONS) as PersonalityTrait[];
      allTraits.forEach(t => traitCounts[t] = 0);

      choicesMade.forEach(choice => {
        traitCounts[choice.trait]++;
      });

      const totalChoices = choicesMade.length;
      const dominantTraits: TraitCount[] = allTraits
        .filter(t => traitCounts[t] > 0)
        .map(trait => ({
          trait,
          count: traitCounts[trait],
          percentage: Math.round((traitCounts[trait] / totalChoices) * 100),
        }))
        .sort((a, b) => b.count - a.count);

      // Seçim zaman çizelgesi
      const choiceTimeline: ChoiceTimelineItem[] = choicesMade.map((choice, index) => {
        const cp = storyGraph.choicePoints[choice.choicePointId];
        const opt = cp?.options.find((o: any) => o.id === choice.optionId);
        const traitInfo = getTraitInfo(choice.trait, "tr");

        return {
          choiceNumber: index + 1,
          question: cp?.question || "",
          chosenOption: opt?.text || "",
          trait: choice.trait,
          insight: traitInfo.description,
        };
      });

      // Aktivite önerileri (baskın özellikler için)
      const activitySuggestions: ActivitySuggestion[] = dominantTraits
        .slice(0, 3)
        .map(tc => {
          const traitInfo = getTraitInfo(tc.trait, "tr");
          return {
            title: `${traitInfo.name} için aktivite`,
            description: traitInfo.activitySuggestion,
            forTrait: tc.trait,
            emoji: traitInfo.emoji,
          };
        });

      // Sohbet başlatıcıları
      const conversationStarters = [
        `"${session.storybooks.title}" hikayesinde en çok hangi kısmı sevdin?`,
        `${storyGraph.mainCharacter.name} gibi davranmak nasıl hissettirdi?`,
        "Başka bir seçim yapsaydın hikaye nasıl değişirdi sence?",
        "Bu hikayedeki gibi bir durumla karşılaşsan ne yapardın?",
      ];

      // Trait insights
      const traitInsights: Record<PersonalityTrait, string> = {} as Record<PersonalityTrait, string>;
      dominantTraits.forEach(tc => {
        traitInsights[tc.trait] = getTraitInfo(tc.trait, "tr").description;
      });

      // Terapötik bölüm (eğer terapötik bağlam varsa)
      let therapeuticSection: TherapeuticReportSection | undefined;

      if (storyGraph.therapeuticContext?.concernType) {
        const concernType = storyGraph.therapeuticContext.concernType as ConcernType;
        const mapping = getTherapeuticMapping(concernType);

        if (mapping) {
          // Çocuğun gösterdiği güçlü yanları belirle
          const childStrengths: string[] = [];
          dominantTraits.slice(0, 3).forEach(tc => {
            const traitDef = TRAIT_DEFINITIONS[tc.trait];
            if (mapping.recommendedTraits.includes(tc.trait)) {
              childStrengths.push(
                `${traitDef.name_tr}: Çocuğunuz önerilen terapötik özelliklerden birini güçlü bir şekilde gösterdi.`
              );
            } else {
              childStrengths.push(
                `${traitDef.name_tr}: ${traitDef.positive_description_tr}`
              );
            }
          });

          // Cesaretlendirici mesaj oluştur
          const topTraitName = dominantTraits[0]
            ? TRAIT_DEFINITIONS[dominantTraits[0].trait].name_tr
            : "özel";
          const encouragingMessage = `Çocuğunuz zorluklarla karşılaşırken ${topTraitName.toLowerCase()} özelliğini güçlü bir şekilde gösterdi. ${mapping.copingMechanism_tr}`;

          // Concern type isimlerini oluştur
          const concernNames: Record<ConcernType, { tr: string; en: string }> = {
            war: { tr: "Savaş/Çatışma", en: "War/Conflict" },
            violence: { tr: "Şiddet", en: "Violence" },
            fear: { tr: "Korku", en: "Fear" },
            loneliness: { tr: "Yalnızlık", en: "Loneliness" },
            loss: { tr: "Kayıp", en: "Loss" },
            death: { tr: "Ölüm", en: "Death" },
            bullying: { tr: "Zorbalık", en: "Bullying" },
            family_separation: { tr: "Aile Ayrılığı", en: "Family Separation" },
            anxiety: { tr: "Kaygı", en: "Anxiety" },
            anger: { tr: "Öfke", en: "Anger" },
            depression: { tr: "Depresyon", en: "Depression" },
            low_self_esteem: { tr: "Düşük Özgüven", en: "Low Self-Esteem" },
            disaster: { tr: "Felaket", en: "Disaster" },
            abuse: { tr: "İstismar", en: "Abuse" },
            neglect: { tr: "İhmal", en: "Neglect" },
            domestic_violence_witness: { tr: "Aile İçi Şiddete Tanıklık", en: "Domestic Violence Witness" },
            parental_addiction: { tr: "Ebeveyn Bağımlılığı", en: "Parental Addiction" },
            parental_mental_illness: { tr: "Ebeveyn Ruh Sağlığı Sorunu", en: "Parental Mental Illness" },
            medical_trauma: { tr: "Tıbbi Travma", en: "Medical Trauma" },
            school_stress: { tr: "Okul Stresi", en: "School Stress" },
            social_rejection: { tr: "Sosyal Reddedilme", en: "Social Rejection" },
            displacement: { tr: "Yerinden Edilme", en: "Displacement" },
            poverty: { tr: "Yoksulluk", en: "Poverty" },
            cyberbullying: { tr: "Siber Zorbalık", en: "Cyberbullying" },
            other: { tr: "Diğer", en: "Other" },
            none: { tr: "Yok", en: "None" },
          };

          therapeuticSection = {
            concernType,
            concernName_tr: concernNames[concernType]?.tr || concernType,
            concernName_en: concernNames[concernType]?.en || concernType,
            therapeuticApproach: mapping.therapeuticValue_tr,
            copingMechanism: mapping.copingMechanism_tr,
            recommendedTraits: mapping.recommendedTraits,
            parentGuidance: mapping.parentGuidance_tr,
            avoidTopics: mapping.avoidTopics_tr,
            childStrengths,
            encouragingMessage,
          };
        }
      }

      // Raporu oluştur
      const report: ParentReport = {
        id: `report_${Date.now()}`,
        sessionId: input.sessionId,
        childName: input.childName,
        storyTitle: session.storybooks.title,
        dominantTraits,
        traitInsights,
        choiceTimeline,
        activitySuggestions,
        conversationStarters,
        therapeuticSection,
        generatedAt: new Date().toISOString(),
        totalChoices,
      };

      // Veritabanına kaydet
      await supabase.from("parent_choice_reports").insert({
        session_id: input.sessionId,
        user_id_fk: ctx.userId,
        child_name: input.childName,
        dominant_traits: dominantTraits,
        trait_insights: traitInsights,
        choice_timeline: choiceTimeline,
        activity_suggestions: activitySuggestions,
        conversation_starters: conversationStarters,
        story_title: session.storybooks.title,
        therapeutic_section: therapeuticSection || null,
      });

      // Session'ı güncelle
      await supabase
        .from("interactive_story_sessions")
        .update({ parent_report_generated: true })
        .eq("id", input.sessionId);

      console.log("[Interactive Story API] ✅ Parent report generated");

      return report;
    }),

  /**
   * Kullanıcının interaktif hikayelerini listele
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    const supabase = createSupabaseClient();

    const { data: storybooks, error } = await supabase
      .from("storybooks")
      .select(`
        id,
        title,
        created_at,
        total_choice_points,
        story_graph,
        interactive_story_sessions (
          id,
          status,
          choices_made,
          completed_at
        )
      `)
      .eq("user_id_fk", ctx.userId)
      .eq("is_interactive", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[Interactive Story API] ❌ List error:", error);
      throw new Error("Failed to list interactive stories");
    }

    return storybooks.map((sb: any) => ({
      id: sb.id,
      title: sb.title,
      createdAt: sb.created_at,
      totalChoicePoints: sb.total_choice_points,
      mainCharacter: sb.story_graph?.mainCharacter,
      session: sb.interactive_story_sessions?.[0] || null,
      progress: sb.interactive_story_sessions?.[0]
        ? {
            currentChoice: (sb.interactive_story_sessions[0].choices_made || []).length,
            totalChoices: sb.total_choice_points,
            isCompleted: sb.interactive_story_sessions[0].status === "completed",
          }
        : null,
    }));
  }),
});
