import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import type { AssessmentOutput } from "@/types/AssessmentSchema";
import { Colors } from "@/constants/colors";
import { Sparkles, MessageCircle, Lightbulb, Shield } from "lucide-react-native";

interface ResultCardProps {
  data: AssessmentOutput;
  onDetails?: () => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({ data, onDetails }) => {
  const themeLabels: Record<string, string> = {
    yakınlık_ozlemi: "Yakınlık Özlemi",
    kaygi: "Kaygı",
    guven_arayisi: "Güven Arayışı",
    ic_dunya: "İç Dünya",
    dis_dunya: "Dış Dünya",
    aidiyet: "Aidiyet",
    savunma: "Savunma",
    agresyon: "Agresyon",
    enerji: "Enerji",
    benlik_gucu: "Benlik Gücü",
    dikkat_organizasyon: "Dikkat/Organizasyon",
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Sparkles size={24} color={Colors.primary.coral} />
        <Text style={styles.headerTitle}>Pedagojik Özet</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎨 Tespit Edilen Temalar</Text>
        {data.reflective_hypotheses.slice(0, 3).map((h, i) => (
          <View key={i} style={styles.hypothesis}>
            <View style={styles.hypothesisHeader}>
              <Text style={styles.themeName}>
                {themeLabels[h.theme] || h.theme}
              </Text>
              <View style={[styles.confidenceBadge, { 
                backgroundColor: h.confidence > 0.6 ? "#D1FAE5" : "#FEF3C7" 
              }]}>
                <Text style={[styles.confidenceText, {
                  color: h.confidence > 0.6 ? "#065F46" : "#92400E"
                }]}>
                  {(h.confidence * 100).toFixed(0)}%
                </Text>
              </View>
            </View>
            <View style={styles.evidenceContainer}>
              {h.evidence.map((ev, idx) => (
                <View key={idx} style={styles.evidenceItem}>
                  <View style={styles.evidenceDot} />
                  <Text style={styles.evidenceText}>{ev}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <View style={styles.iconHeader}>
          <MessageCircle size={20} color={Colors.secondary.sky} />
          <Text style={styles.sectionTitle}>Sohbet Soruları</Text>
        </View>
        {data.conversation_prompts.map((q, i) => (
          <View key={i} style={styles.promptItem}>
            <Text style={styles.promptNumber}>{i + 1}</Text>
            <Text style={styles.promptText}>{q}</Text>
          </View>
        ))}
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <View style={styles.iconHeader}>
          <Lightbulb size={20} color={Colors.secondary.sunshine} />
          <Text style={styles.sectionTitle}>Etkinlik Önerileri</Text>
        </View>
        {data.activity_ideas.map((activity, i) => (
          <View key={i} style={styles.activityItem}>
            <View style={styles.activityIcon}>
              <Text style={styles.activityEmoji}>✨</Text>
            </View>
            <Text style={styles.activityText}>{activity}</Text>
          </View>
        ))}
      </View>

      {(data.safety_flags.self_harm || data.safety_flags.abuse_concern) && (
        <View style={styles.safetyAlert}>
          <Shield size={20} color="#DC2626" />
          <View style={styles.safetyContent}>
            <Text style={styles.safetyTitle}>Güvenlik Uyarısı</Text>
            <Text style={styles.safetyText}>Uzman görüşü önerilir.</Text>
          </View>
        </View>
      )}

      <View style={styles.disclaimerContainer}>
        <Text style={styles.disclaimerText}>
          ⚠️ {data.disclaimers.join(" ")}
        </Text>
      </View>

      {onDetails && (
        <Pressable onPress={onDetails} style={styles.detailsButton}>
          <Text style={styles.detailsButtonText}>Detaylı Rapor</Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 24,
    padding: 24,
    gap: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary.soft,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800" as const,
    color: Colors.neutral.darkest,
    letterSpacing: -0.3,
  },
  section: {
    gap: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.neutral.darkest,
    letterSpacing: 0.2,
  },
  iconHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  hypothesis: {
    backgroundColor: Colors.primary.soft,
    padding: 16,
    borderRadius: 16,
    gap: 10,
  },
  hypothesisHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  themeName: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.neutral.darkest,
    flex: 1,
  },
  confidenceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  confidenceText: {
    fontSize: 14,
    fontWeight: "700" as const,
  },
  evidenceContainer: {
    gap: 6,
  },
  evidenceItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  evidenceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary.coral,
    marginTop: 6,
  },
  evidenceText: {
    flex: 1,
    fontSize: 14,
    color: Colors.neutral.dark,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.neutral.lighter,
  },
  promptItem: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: "#EFF6FF",
    padding: 14,
    borderRadius: 14,
    alignItems: "flex-start",
  },
  promptNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.secondary.sky,
    color: Colors.neutral.white,
    fontSize: 14,
    fontWeight: "700" as const,
    textAlign: "center",
    lineHeight: 28,
  },
  promptText: {
    flex: 1,
    fontSize: 15,
    color: "#1E40AF",
    lineHeight: 22,
  },
  activityItem: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: "#FFFBEB",
    padding: 14,
    borderRadius: 14,
    alignItems: "flex-start",
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.neutral.white,
    justifyContent: "center",
    alignItems: "center",
  },
  activityEmoji: {
    fontSize: 16,
  },
  activityText: {
    flex: 1,
    fontSize: 15,
    color: "#92400E",
    lineHeight: 22,
  },
  safetyAlert: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: "#FEE2E2",
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#FCA5A5",
  },
  safetyContent: {
    flex: 1,
    gap: 4,
  },
  safetyTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#DC2626",
  },
  safetyText: {
    fontSize: 14,
    color: "#991B1B",
    lineHeight: 20,
  },
  disclaimerContainer: {
    backgroundColor: "#F3F4F6",
    padding: 14,
    borderRadius: 12,
  },
  disclaimerText: {
    fontSize: 12,
    color: Colors.neutral.medium,
    lineHeight: 18,
    textAlign: "center",
  },
  detailsButton: {
    backgroundColor: Colors.secondary.lavender,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 4,
    shadowColor: Colors.secondary.lavender,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  detailsButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.neutral.white,
    letterSpacing: 0.3,
  },
});
