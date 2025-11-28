import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FIRST_TIME_KEY = '@zuna_first_time_user';

export function useFirstTimeUser() {
  const [isFirstTime, setIsFirstTime] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkFirstTime();
  }, []);

  const checkFirstTime = async () => {
    try {
      const value = await AsyncStorage.getItem(FIRST_TIME_KEY);
      setIsFirstTime(value === null);
      setIsLoading(false);
    } catch (error) {
      console.error('Error checking first time user:', error);
      setIsFirstTime(false);
      setIsLoading(false);
    }
  };

  const markAsReturningUser = async () => {
    try {
      await AsyncStorage.setItem(FIRST_TIME_KEY, 'false');
      setIsFirstTime(false);
    } catch (error) {
      console.error('Error marking as returning user:', error);
    }
  };

  return {
    isFirstTime,
    isLoading,
    markAsReturningUser,
  };
}
