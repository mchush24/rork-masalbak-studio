import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="welcome" options={{ animation: 'fade' }} />
      <Stack.Screen name="value-proposition" />
      <Stack.Screen name="user-profile" />
      <Stack.Screen name="tour" />
      <Stack.Screen name="register" />
      <Stack.Screen name="login" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="set-password" />
      <Stack.Screen name="role-select" options={{ animation: 'slide_from_bottom' }} />
    </Stack>
  );
}
