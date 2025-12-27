import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import type { AppRouter } from "../types/trpc";
import { QueryClient } from "@tanstack/react-query";
import superjson from "superjson";
import { Platform } from "react-native";
import Constants from "expo-constants";

export const trpc = createTRPCReact<AppRouter>();

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 dakika
    },
  },
});

// Backend server URL (runs separately from Expo dev server)
const getApiUrl = () => {
  // Use environment variable if available (production Railway URL)
  const envApiUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_API || process.env.EXPO_PUBLIC_API;

  if (envApiUrl) {
    const url = `${envApiUrl}/api/trpc`;
    console.log('[tRPC] Using environment API URL:', url);
    return url;
  }

  // Fallback to localhost for local development
  const debuggerHost = Constants.expoConfig?.hostUri;
  const host = debuggerHost?.split(':')[0];

  console.log('[tRPC] Platform:', Platform.OS);
  console.log('[tRPC] Debugger host:', debuggerHost);
  console.log('[tRPC] Extracted host:', host);

  // Platform-specific URL handling for local development
  if (Platform.OS === 'android') {
    // Android emulator: 10.0.2.2 maps to host's localhost
    const baseUrl = host || '10.0.2.2';
    const url = `http://${baseUrl}:3000/api/trpc`;
    console.log('[tRPC] Android URL:', url);
    return url;
  } else if (Platform.OS === 'ios') {
    // iOS simulator can use localhost
    const baseUrl = host || 'localhost';
    const url = `http://${baseUrl}:3000/api/trpc`;
    console.log('[tRPC] iOS URL:', url);
    return url;
  } else {
    // Web - use Railway URL in production
    const url = `${envApiUrl || 'http://localhost:3000'}/api/trpc`;
    console.log('[tRPC] Web URL:', url);
    return url;
  }
};

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: getApiUrl(),
      maxURLLength: 2083,
      transformer: superjson,
      fetch(url, options) {
        console.log('[tRPC Client] 🚀 Sending request to:', url);
        console.log('[tRPC Client] 📦 Options:', JSON.stringify(options).substring(0, 300));
        return fetch(url, options);
      },
      async headers() {
        return {
          "Content-Type": "application/json",
        };
      },
    }),
  ],
});