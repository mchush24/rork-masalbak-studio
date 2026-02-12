// template
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Modal, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { useTheme } from '@/lib/theme/ThemeProvider';

export default function ModalScreen() {
  const { colors, isDark } = useTheme();

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={true}
      onRequestClose={() => router.back()}
    >
      <Pressable
        style={[styles.overlay, { backgroundColor: colors.surface.overlay }]}
        onPress={() => router.back()}
      >
        <View style={[styles.modalContent, { backgroundColor: colors.surface.card }]}>
          <Text style={[styles.title, { color: colors.text.primary }]}>Modal</Text>
          <Text style={[styles.description, { color: colors.text.secondary }]}>
            This is an example modal with proper fade animation. You can edit it in app/modal.tsx.
          </Text>

          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: colors.secondary.sky }]}
            onPress={() => router.back()}
          >
            <Text style={[styles.closeButtonText, { color: '#FFFFFF' }]}>Close</Text>
          </TouchableOpacity>
        </View>
      </Pressable>

      {/* Use a light status bar on iOS to account for the black space above the modal */}
      <StatusBar style={isDark ? 'light' : Platform.OS === 'ios' ? 'light' : 'auto'} />
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    margin: 20,
    alignItems: 'center',
    minWidth: 300,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  description: {
    textAlign: 'center',
    marginBottom: 24,
    color: Colors.neutral.medium,
    lineHeight: 20,
  },
  closeButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    minWidth: 100,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
  },
});
