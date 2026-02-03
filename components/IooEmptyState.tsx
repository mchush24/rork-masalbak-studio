/**
 * IooEmptyState - Boş durum komponenti
 *
 * Liste boş olduğunda, arama sonucu bulunamadığında vb.
 * kullanıcıya sevimli bir şekilde bilgi verir.
 *
 * Yeni IooMascotFinal kullanır (eski gökkuşaklı Ioo yerine)
 */

import React from 'react';
import { StyleSheet, View, Text, Pressable, ViewStyle } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Ioo, IooMood as NewIooMood } from './Ioo';

// Legacy mood type for backward compatibility
export type IooMood =
  | 'neutral'
  | 'happy'
  | 'excited'
  | 'thinking'
  | 'curious'
  | 'loving'
  | 'proud'
  | 'sleepy'
  | 'wink'
  | 'sad'
  | 'surprised'
  | 'shy'
  | 'determined'
  | 'angry'
  | 'confused'
  | 'calm'
  | 'playful';

// Map old moods to new IooMascotFinal moods
const MOOD_MAP: Record<IooMood, NewIooMood> = {
  neutral: 'happy',
  happy: 'happy',
  excited: 'excited',
  thinking: 'curious',
  curious: 'curious',
  loving: 'love',
  proud: 'happy',
  sleepy: 'sleepy',
  wink: 'happy',
  sad: 'sleepy',
  surprised: 'excited',
  shy: 'curious',
  determined: 'happy',
  angry: 'sleepy',
  confused: 'curious',
  calm: 'happy',
  playful: 'excited',
};

interface IooEmptyStateProps {
  title: string;
  message?: string;
  mood?: IooMood;
  action?: {
    label: string;
    onPress: () => void;
  };
  style?: ViewStyle;
}

// Preset boş durumlar
export const EMPTY_STATE_PRESETS = {
  noResults: {
    title: 'Sonuç bulunamadı',
    message: 'Farklı bir arama yapmayı deneyin.',
    mood: 'curious' as IooMood,
  },
  noData: {
    title: 'Henüz veri yok',
    message: 'Yeni bir şeyler eklemeye başlayın!',
    mood: 'thinking' as IooMood,
  },
  noColorings: {
    title: 'Henüz boyama yok',
    message: 'İlk boyanı oluşturmak için başla!',
    mood: 'excited' as IooMood,
  },
  noStories: {
    title: 'Henüz hikaye yok',
    message: 'Birlikte harika hikayeler yaratalım!',
    mood: 'curious' as IooMood,
  },
  noAnalysis: {
    title: 'Henüz analiz yok',
    message: 'Çizim yükleyerek ilk analizinizi yapın.',
    mood: 'curious' as IooMood,
  },
  error: {
    title: 'Bir şeyler ters gitti',
    message: 'Lütfen daha sonra tekrar deneyin.',
    mood: 'sad' as IooMood,
  },
  offline: {
    title: 'İnternet bağlantısı yok',
    message: 'Bağlantınızı kontrol edip tekrar deneyin.',
    mood: 'confused' as IooMood,
  },
  comingSoon: {
    title: 'Çok yakında!',
    message: 'Bu özellik üzerinde çalışıyoruz.',
    mood: 'wink' as IooMood,
  },
};

export function IooEmptyState({
  title,
  message,
  mood = 'thinking',
  action,
  style,
}: IooEmptyStateProps) {
  // Map legacy mood to new mood
  const mappedMood = MOOD_MAP[mood] || 'happy';

  return (
    <View style={[styles.container, style]}>
      <Animated.View entering={FadeIn.delay(100).duration(400)}>
        <Ioo
          mood={mappedMood}
          size="large"
          animated={true}
          showGlow
        />
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(200).duration(400)}
        style={styles.textContainer}
      >
        <Text style={styles.title}>{title}</Text>
        {message && <Text style={styles.message}>{message}</Text>}
      </Animated.View>

      {action && (
        <Animated.View entering={FadeInDown.delay(350).duration(400)}>
          <Pressable onPress={action.onPress} style={styles.actionButton}>
            <Text style={styles.actionText}>{action.label}</Text>
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  actionButton: {
    marginTop: 24,
    backgroundColor: '#7C3AED',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default IooEmptyState;
