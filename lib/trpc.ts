import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import type { AppRouter } from "../types/trpc";
import { QueryClient } from "@tanstack/react-query";
import superjson from "superjson";

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
  // Backend runs on port 3000
  return 'http://localhost:3000/api/trpc';
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