module.exports = {
  expo: {
    name: "Renkioo",
    slug: "renkioo",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "rork-app",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    splash: {
      image: "./assets/images/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#4A90A4"
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
        backgroundColor: "#ffffff"
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
      [
        "expo-router",
        {
          origin: "https://rork.com/"
        }
      ],
      "expo-font",
      "expo-web-browser",
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
      "expo-secure-store"
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      // These are loaded from .env file and available via expo-constants
      EXPO_PUBLIC_API: process.env.EXPO_PUBLIC_API || "http://localhost:3000",
      EXPO_PUBLIC_RORK_API_BASE_URL: process.env.EXPO_PUBLIC_RORK_API_BASE_URL || "http://localhost:3000",
      EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
      EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
    }
  }
};
