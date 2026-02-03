import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ioo as IooMascot, IooMood } from '@/components/Ioo';

const MOODS: IooMood[] = ['happy', 'excited', 'sleepy', 'curious', 'talking', 'surprised', 'love', 'thinking'];
const SIZES = ['tiny', 'small', 'medium', 'large', 'hero', 'giant'] as const;

export default function MascotDemoScreen() {
  const [currentMood, setCurrentMood] = useState<IooMood>('happy');
  const [currentSize, setCurrentSize] = useState<typeof SIZES[number]>('large');
  const [tapCount, setTapCount] = useState(0);

  const handleMascotPress = () => {
    setTapCount(prev => prev + 1);
  };

  return (
    <LinearGradient
      colors={['#FFF5F7', '#F5F0FF', '#F0F7FF']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <Text style={styles.title}>Ioo Maskot Pro</Text>
          <Text style={styles.subtitle}>Premium soft 3D tasarım</Text>

          {/* Ana Maskot */}
          <View style={styles.mascotContainer}>
            <IooMascot
              size={currentSize}
              mood={currentMood}
              animated={true}
              onPress={handleMascotPress}
            />
            {tapCount > 0 && (
              <Text style={styles.tapText}>Dokunma: {tapCount}x</Text>
            )}
          </View>

          {/* Mood Seçici */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mood</Text>
            <View style={styles.buttonRow}>
              {MOODS.map((mood) => (
                <Pressable
                  key={mood}
                  style={[
                    styles.button,
                    currentMood === mood && styles.buttonActive,
                  ]}
                  onPress={() => setCurrentMood(mood)}
                >
                  <Text style={[
                    styles.buttonText,
                    currentMood === mood && styles.buttonTextActive,
                  ]}>
                    {mood === 'happy' && '😊'}
                    {mood === 'excited' && '🤩'}
                    {mood === 'sleepy' && '😴'}
                    {mood === 'curious' && '🤔'}
                    {mood === 'talking' && '💬'}
                    {mood === 'surprised' && '😲'}
                    {mood === 'love' && '🥰'}
                    {mood === 'thinking' && '🧠'}
                    {' '}{mood}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Size Seçici */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Boyut</Text>
            <View style={styles.buttonRow}>
              {SIZES.map((size) => (
                <Pressable
                  key={size}
                  style={[
                    styles.button,
                    currentSize === size && styles.buttonActive,
                  ]}
                  onPress={() => setCurrentSize(size)}
                >
                  <Text style={[
                    styles.buttonText,
                    currentSize === size && styles.buttonTextActive,
                  ]}>
                    {size}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Tüm Boyutlar Preview */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tüm Boyutlar</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.sizesRow}>
                {SIZES.filter(s => s !== 'giant').map((size) => (
                  <View key={size} style={styles.sizeItem}>
                    <IooMascot
                      size={size}
                      mood="happy"
                      animated={false}
                    />
                    <Text style={styles.sizeLabel}>{size}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Tüm Mood'lar Preview */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tüm Mood&apos;lar</Text>
            <View style={styles.moodsGrid}>
              {MOODS.map((mood) => (
                <View key={mood} style={styles.moodItem}>
                  <IooMascot
                    size="small"
                    mood={mood}
                    animated={true}
                  />
                  <Text style={styles.moodLabel}>{mood}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Özellikler */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Özellikler - Premium</Text>
            <View style={styles.featuresList}>
              <Text style={styles.featureItem}>🎨 Pixar kalitesinde soft 3D render</Text>
              <Text style={styles.featureItem}>✨ Derinlikli radial gradient gövde</Text>
              <Text style={styles.featureItem}>👀 Glossy gözler (iris + highlight katmanları)</Text>
              <Text style={styles.featureItem}>💗 Soft pembe yanaklar (glow efekti)</Text>
              <Text style={styles.featureItem}>🫧 Organik squash & stretch animasyonu</Text>
              <Text style={styles.featureItem}>🌊 Smooth floating animasyonu</Text>
              <Text style={styles.featureItem}>👆 Premium dokunma tepkisi (jelly bounce)</Text>
              <Text style={styles.featureItem}>😊 8 farklı mood (thinking dahil)</Text>
              <Text style={styles.featureItem}>📐 6 farklı boyut (giant dahil)</Text>
              <Text style={styles.featureItem}>🔆 Ambient glow efektleri</Text>
              <Text style={styles.featureItem}>🎭 Mood-specific animasyonlar</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginBottom: 20,
  },
  mascotContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
    minHeight: 300,
  },
  tapText: {
    marginTop: 10,
    fontSize: 14,
    color: '#C77DFF',
    fontWeight: '600',
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  button: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  buttonActive: {
    backgroundColor: '#C77DFF',
    borderColor: '#C77DFF',
  },
  buttonText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  buttonTextActive: {
    color: '#FFF',
  },
  sizesRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingVertical: 20,
  },
  sizeItem: {
    alignItems: 'center',
  },
  sizeLabel: {
    marginTop: 8,
    fontSize: 12,
    color: '#888',
  },
  moodsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 10,
  },
  moodItem: {
    alignItems: 'center',
    width: 80,
  },
  moodLabel: {
    marginTop: 4,
    fontSize: 11,
    color: '#888',
  },
  featuresList: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  featureItem: {
    fontSize: 14,
    color: '#555',
  },
});
