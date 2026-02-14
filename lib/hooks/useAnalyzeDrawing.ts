import { trpc } from '@/lib/trpc';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';

export interface UseAnalyzeDrawingReturn {
  analysis: unknown | null;
  error: string | null;
  isLoading: boolean;
  analyze: (payload: {
    taskType: string;
    childAge?: number;
    imageUri?: string;
    imageBase64?: string;
    language?: 'tr' | 'en';
  }) => Promise<void>;
}

export function useAnalyzeDrawing(): UseAnalyzeDrawingReturn {
  const [analysis, setAnalysis] = useState<unknown | null>(null);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const mutation = trpc.studio.analyzeDrawing.useMutation({
    onMutate: variables => {
      console.log('[Hook] 🔄 Mutation starting with variables:', variables);
    },
    onSuccess: data => {
      console.log('[Hook] ✅ Analysis successful:', data);
      // Backend'den gelen data'yı olduğu gibi kullan - dönüştürme yapma!
      setAnalysis(data);
      setError(null);

      // Invalidate analysis list so history shows the new analysis immediately
      queryClient.invalidateQueries({ queryKey: [['analysis']] });
      queryClient.invalidateQueries({ queryKey: [['studio']] });
    },
    onError: (err: unknown) => {
      console.error('[Hook] ❌ Analysis failed:', err);
      const errorMessage = (err instanceof Error ? err.message : null) || 'Analiz başarısız oldu';
      setError(errorMessage);
      setAnalysis(null);
    },
  });

  const analyze = async (payload: {
    taskType: string;
    childAge?: number;
    imageUri?: string;
    imageBase64?: string;
    language?: 'tr' | 'en';
  }) => {
    console.log('[Hook] 📸 Starting analysis with payload:', {
      taskType: payload.taskType,
      childAge: payload.childAge,
      hasImageUri: !!payload.imageUri,
      hasImageBase64: !!payload.imageBase64,
      base64Length: payload.imageBase64?.length || 0,
    });
    setError(null);
    setAnalysis(null);

    try {
      let imageBase64: string | undefined = payload.imageBase64;

      // Eğer base64 zaten sağlanmışsa, okuma işlemini atla
      if (imageBase64) {
        console.log('[Hook] ✅ Using provided base64 data, size:', imageBase64.length, 'bytes');
      } else if (payload.imageUri) {
        console.log('[Hook] 🔄 Base64 not provided, converting image...');
        console.log('[Hook] 📁 Image URI:', payload.imageUri);
        console.log('[Hook] 🖥️  Platform:', Platform.OS);

        try {
          if (Platform.OS === 'web') {
            // Web için fetch kullan
            console.log('[Hook] 🌐 Using web fetch method...');
            console.log('[Hook] 🔗 URI type:', payload.imageUri.substring(0, 20));

            // Eğer zaten data: URL ise direkt kullan
            if (payload.imageUri.startsWith('data:')) {
              console.log('[Hook] 📄 Already a data URL, extracting base64...');
              const base64Data = payload.imageUri.split(',')[1];
              imageBase64 = base64Data;
              console.log(
                '[Hook] ✅ Image extracted (data URL), size:',
                imageBase64.length,
                'bytes'
              );
            } else {
              // blob: URL veya http URL için fetch kullan
              console.log('[Hook] 🌐 Fetching blob/http URL...');

              const response = await fetch(payload.imageUri);
              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }

              const blob = await response.blob();
              console.log('[Hook] 📦 Blob received, size:', blob.size, 'type:', blob.type);

              // Blob'u base64'e çevir
              imageBase64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                  const base64String = reader.result as string;
                  // data:image/png;base64, kısmını çıkar
                  const base64Data = base64String.split(',')[1];
                  resolve(base64Data);
                };
                reader.onerror = error => {
                  console.error('[Hook] ❌ FileReader error:', error);
                  reject(error);
                };
                reader.readAsDataURL(blob);
              });

              console.log('[Hook] ✅ Image converted (blob), size:', imageBase64.length, 'bytes');
            }
          } else {
            // Native için FileSystem kullan
            console.log('[Hook] 📱 Using native FileSystem method...');

            let uri = payload.imageUri;

            // iOS file:// protokolü kontrolü
            if (!uri.startsWith('file://') && !uri.startsWith('content://')) {
              uri = `file://${uri}`;
            }

            console.log('[Hook] 📂 Reading from:', uri);

            // Dosya var mı kontrol et
            const fileInfo = await FileSystem.getInfoAsync(uri);
            console.log('[Hook] 📊 File info:', fileInfo);

            if (!fileInfo.exists) {
              throw new Error('Dosya bulunamadı');
            }

            imageBase64 = await FileSystem.readAsStringAsync(uri, {
              encoding: 'base64',
            });

            console.log('[Hook] ✅ Image converted (native), size:', imageBase64.length, 'bytes');
          }
        } catch (readErr) {
          console.error('[Hook] ❌ Error reading file:', readErr);
          console.error('[Hook] ❌ Error details:', JSON.stringify(readErr));
          setError(
            `Resim okunamadı: ${readErr instanceof Error ? readErr.message : 'Bilinmeyen hata'}`
          );
          return;
        }
      }

      console.log('[Hook] 🚀 Sending to backend...');

      const mutationPayload = {
        taskType: payload.taskType as
          | 'DAP'
          | 'HTP'
          | 'Family'
          | 'Cactus'
          | 'Tree'
          | 'Garden'
          | 'BenderGestalt2'
          | 'ReyOsterrieth',
        childAge: payload.childAge,
        imageBase64,
        language: (payload.language || 'tr') as 'tr' | 'en' | 'ru' | 'tk' | 'uz',
        userRole: 'parent' as const,
        featuresJson: {},
      };

      console.log('[Hook] 📦 Mutation payload:', {
        taskType: mutationPayload.taskType,
        childAge: mutationPayload.childAge,
        hasImageBase64: !!mutationPayload.imageBase64,
        imageBase64Length: mutationPayload.imageBase64?.length || 0,
      });

      // Validate payload before sending
      if (!mutationPayload || typeof mutationPayload !== 'object') {
        console.error('[Hook] ❌ Invalid payload:', mutationPayload);
        setError('Geçersiz payload');
        return;
      }

      if (!mutationPayload.taskType) {
        console.error('[Hook] ❌ Missing taskType');
        setError('taskType eksik');
        return;
      }

      console.log('[Hook] ✅ Payload validated, calling mutation...');

      // Backend'e gönder
      mutation.mutate(mutationPayload);
    } catch (err) {
      console.error('[Hook] ❌ Unexpected error:', err);
      setError('Beklenmeyen hata oluştu');
    }
  };

  return {
    analysis,
    error,
    isLoading: mutation.isPending,
    analyze,
  };
}
