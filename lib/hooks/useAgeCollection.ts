import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AGE_COLLECTED_KEY = '@zuna_age_collected';

export function useAgeCollection() {
  const [ageCollected, setAgeCollected] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAgeCollected();
  }, []);

  const checkAgeCollected = async () => {
    try {
      const value = await AsyncStorage.getItem(AGE_COLLECTED_KEY);
      setAgeCollected(value === 'true');
      setIsLoading(false);
    } catch (error) {
      console.error('Error checking age collected:', error);
      setAgeCollected(false);
      setIsLoading(false);
    }
  };

  const markAgeAsCollected = async () => {
    try {
      await AsyncStorage.setItem(AGE_COLLECTED_KEY, 'true');
      setAgeCollected(true);
    } catch (error) {
      console.error('Error marking age as collected:', error);
    }
  };

  return {
    ageCollected,
    isLoading,
    markAgeAsCollected,
  };
}
