import {
  StyleSheet,
  Text,
  View,
  ScrollView,
} from "react-native";
import { BookOpen, Heart } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";

export default function StoriesScreen() {
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
            <BookOpen size={32} color="#EC4899" />
          </View>
          <Text style={styles.headerTitle}>Hikayeler</Text>
          <Text style={styles.headerSubtitle}>
            Kaydedilmiş analiz ve masallar
          </Text>
        </View>

        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Heart size={48} color="#E5E7EB" />
          </View>
          <Text style={styles.emptyTitle}>Henüz hikaye yok</Text>
          <Text style={styles.emptyDescription}>
            İlk çizim analizinizi yapın ve hikayeler burada görünecek
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            📚 Tüm analizleriniz burada saklanacak
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
    backgroundColor: "#FCE7F3",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#EC4899",
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
  emptyState: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 24,
    padding: 52,
    alignItems: "center",
    marginBottom: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
  },
  emptyIcon: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: Colors.background.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 26,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: Colors.neutral.darkest,
    marginBottom: 10,
    letterSpacing: -0.2,
  },
  emptyDescription: {
    fontSize: 16,
    color: Colors.neutral.medium,
    textAlign: "center",
    lineHeight: 26,
  },
  infoCard: {
    backgroundColor: "#FCE7F3",
    padding: 18,
    borderRadius: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#FBCFE8",
  },
  infoText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#9F1239",
    textAlign: "center",
    fontWeight: "500" as const,
  },
});
