/**
 * Interactive Story Screen
 *
 * Interaktif hikaye okuma ve secim ekrani
 */

import React, { useState, useEffect } from "react";
import { View, StyleSheet, StatusBar } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { trpc } from "@/lib/trpc";
import {
  InteractiveStoryReader,
  EndingCelebration,
  ParentReport,
} from "@/components/interactive-story";
import {
  StorySegment,
  ChoicePoint,
  InteractiveCharacter,
  ChoiceMade,
  ParentReport as ParentReportType,
} from "@/types/InteractiveStory";

type ScreenState = "reading" | "ending" | "report";

export default function InteractiveStoryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id: string;
    sessionId?: string;
  }>();

  const [screenState, setScreenState] = useState<ScreenState>("reading");
  const [currentSegment, setCurrentSegment] = useState<StorySegment | null>(null);
  const [currentChoicePoint, setCurrentChoicePoint] = useState<ChoicePoint | undefined>();
  const [choicesMade, setChoicesMade] = useState<ChoiceMade[]>([]);
  const [progress, setProgress] = useState({ currentChoice: 0, totalChoices: 5 });
  const [isEnding, setIsEnding] = useState(false);
  const [report, setReport] = useState<ParentReportType | null>(null);

  // Story ve character bilgisi
  const [storyInfo, setStoryInfo] = useState<{
    title: string;
    character: InteractiveCharacter;
  } | null>(null);

  // Session bilgisini getir (varsa)
  const sessionQuery = trpc.interactiveStory.getSession.useQuery(
    { sessionId: params.sessionId || "" },
    { enabled: !!params.sessionId }
  );

  // Secim mutation
  const makeChoiceMutation = trpc.interactiveStory.makeChoice.useMutation({
    onSuccess: (data) => {
      setCurrentSegment(data.segment);
      setCurrentChoicePoint(data.nextChoicePoint);
      setProgress(data.progress);
      setIsEnding(data.isEnding);

      if (data.choiceMade) {
        setChoicesMade(prev => [...prev, {
          choicePointId: currentChoicePoint?.id || "",
          optionId: data.choiceMade.trait,
          trait: data.choiceMade.trait,
          timestamp: new Date().toISOString(),
        }]);
      }
    },
  });

  // Rapor olustur mutation
  const generateReportMutation = trpc.interactiveStory.generateParentReport.useMutation({
    onSuccess: (data) => {
      setReport(data);
      setScreenState("report");
    },
  });

  // Session yuklendiginde state'i guncelle
  useEffect(() => {
    if (sessionQuery.data) {
      const data = sessionQuery.data;
      setStoryInfo({
        title: data.story.title,
        character: data.story.mainCharacter,
      });
      setCurrentSegment(data.currentSegment);
      setCurrentChoicePoint(data.currentChoicePoint);
      setProgress(data.progress);
      setIsEnding(data.isEnding);
      setChoicesMade(data.session.choicesMade);

      if (data.isEnding) {
        setScreenState("ending");
      }
    }
  }, [sessionQuery.data]);

  // Secim yapildiginda
  const handleChoiceMade = (optionId: string) => {
    if (!params.sessionId || !currentChoicePoint) return;

    makeChoiceMutation.mutate({
      sessionId: params.sessionId,
      choicePointId: currentChoicePoint.id,
      optionId,
    });
  };

  // Hikaye tamamlandiginda
  const handleStoryComplete = () => {
    setScreenState("ending");
  };

  // Rapor gorme
  const handleViewReport = () => {
    if (!params.sessionId) return;
    generateReportMutation.mutate({ sessionId: params.sessionId });
  };

  // Ana sayfaya don
  const handleGoHome = () => {
    router.replace("/(tabs)/stories");
  };

  // Yukleniyor
  if (sessionQuery.isLoading || !storyInfo || !currentSegment) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <InteractiveStoryReader
          title=""
          character={{
            name: "",
            type: "",
            age: 0,
            appearance: "",
            personality: [],
            speechStyle: "",
            arc: { start: "", middle: "", end: "" },
          }}
          currentSegment={{ id: "", pages: [], endsWithChoice: false }}
          onChoiceMade={() => {}}
          onStoryComplete={() => {}}
          isLoading={true}
          isEnding={false}
          progress={{ currentChoice: 0, totalChoices: 5 }}
        />
      </View>
    );
  }

  // Rapor ekrani
  if (screenState === "report" && report) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <ParentReport
          report={report}
          onClose={handleGoHome}
        />
      </View>
    );
  }

  // Bitis kutlama ekrani
  if (screenState === "ending") {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <EndingCelebration
          character={storyInfo.character}
          totalChoices={progress.totalChoices}
          onViewReport={handleViewReport}
          onGoHome={handleGoHome}
        />
      </View>
    );
  }

  // Hikaye okuma ekrani
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <InteractiveStoryReader
        title={storyInfo.title}
        character={storyInfo.character}
        currentSegment={currentSegment}
        currentChoicePoint={currentChoicePoint}
        onChoiceMade={handleChoiceMade}
        onStoryComplete={handleStoryComplete}
        isLoading={makeChoiceMutation.isPending}
        isEnding={isEnding}
        progress={progress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF5FF",
  },
});
