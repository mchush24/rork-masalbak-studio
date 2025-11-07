import {
  StyleSheet,
  Text,
  View,
  Pressable,
  ScrollView,
} from "react-native";
import { Wand2, BookText, Palette } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";

export default function StudioScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Wand2 size={32} color="#9333EA" />
          </View>
          <Text style={styles.headerTitle}>Stüdyo</Text>
          <Text style={styles.headerSubtitle}>
            Çizimden yaratıcı içerikler oluştur
          </Text>
        </View>

        <View style={styles.features}>
          <View style={[styles.featureCard, styles.featureStory]}>
            <View style={styles.featureIcon}>
              <BookText size={40} color="#FF6B6B" />
            </View>
            <Text style={styles.featureTitle}>Masal Kitabı</Text>
            <Text style={styles.featureDescription}>
              Çizimden özel masal kitabı oluştur
            </Text>
            <Pressable style={styles.comingSoonBadge}>
              <Text style={styles.comingSoonText}>Yakında</Text>
            </Pressable>
          </View>

          <View style={[styles.featureCard, styles.featureColoring]}>
            <View style={styles.featureIcon}>
              <Palette size={40} color="#4ECDC4" />
            </View>
            <Text style={styles.featureTitle}>Boyama PDF</Text>
            <Text style={styles.featureDescription}>
              Çizimden boyama sayfası oluştur
            </Text>
            <Pressable style={styles.comingSoonBadge}>
              <Text style={styles.comingSoonText}>Yakında</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            ✨ Çizimlerinizden benzersiz içerikler oluşturun
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 36,
  },
  headerIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F3E8FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: Colors.secondary.lavender,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 40,
    fontWeight: "800" as const,
    color: Colors.neutral.darkest,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 17,
    color: Colors.neutral.medium,
    textAlign: "center",
    lineHeight: 24,
  },
  features: {
    gap: 18,
    marginBottom: 32,
  },
  featureCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
  },
  featureStory: {
    borderTopWidth: 5,
    borderTopColor: Colors.primary.coral,
  },
  featureColoring: {
    borderTopWidth: 5,
    borderTopColor: Colors.secondary.mint,
  },
  featureIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.background.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },
  featureTitle: {
    fontSize: 26,
    fontWeight: "700" as const,
    color: Colors.neutral.darkest,
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  featureDescription: {
    fontSize: 16,
    color: Colors.neutral.medium,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 24,
  },
  comingSoonBadge: {
    backgroundColor: "#FFF9F0",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.secondary.sunshine,
  },
  comingSoonText: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: "#8B5A00",
    letterSpacing: 0.5,
  },
  infoCard: {
    backgroundColor: "#F3E8FF",
    padding: 18,
    borderRadius: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E9D5FF",
  },
  infoText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#6B21A8",
    textAlign: "center",
    fontWeight: "500" as const,
  },
});
