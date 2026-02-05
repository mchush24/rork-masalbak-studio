module.exports = {
  expo: {
    name: "Renkioo",
    slug: "renkioo",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "renkioo",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    splash: {
      image: "./assets/images/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#F5F3EE"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.renkioo.studio",
      infoPlist: {
        NSCameraUsageDescription: "Allow $(PRODUCT_NAME) to access your camera",
        NSMicrophoneUsageDescription: "Allow $(PRODUCT_NAME) to access your microphone",
        NSPhotoLibraryUsageDescription: "Allow $(PRODUCT_NAME) to access your photos",
        NSFaceIDUsageDescription: "Face ID ile hızlı ve güvenli giriş yapmanızı sağlar"
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#F5F3EE"
      },
      package: "com.renkioo.studio",
      permissions: [
        "CAMERA",
        "RECORD_AUDIO",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "android.permission.VIBRATE",
        "INTERNET"
      ]
    },
    web: {
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      "expo-font",
      "expo-asset",
      "expo-web-browser",
      "expo-audio",
      [
        "expo-camera",
        {
          cameraPermission: "Allow $(PRODUCT_NAME) to access your camera",
          microphonePermission: "Allow $(PRODUCT_NAME) to access your microphone",
          recordAudioAndroid: true
        }
      ],
      [
        "expo-image-picker",
        {
          photosPermission: "The app accesses your photos to let you share them with your friends."
        }
      ],
      "expo-local-authentication",
      "expo-secure-store",
      // Sentry error tracking - uncomment and configure for production builds
      // [
      //   "@sentry/react-native/expo",
      //   {
      //     organization: "your-org",
      //     project: "renkioo",
      //     // url: "https://sentry.io/", // For self-hosted Sentry
      //   }
      // ]
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      // These are loaded from .env file and available via expo-constants
      EXPO_PUBLIC_API: process.env.EXPO_PUBLIC_API || "http://localhost:3000",
      EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
      EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      // Sentry DSN for error tracking (optional)
      EXPO_PUBLIC_SENTRY_DSN: process.env.EXPO_PUBLIC_SENTRY_DSN
    }
  }
};
