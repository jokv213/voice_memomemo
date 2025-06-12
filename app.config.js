import 'dotenv/config';

export default {
  expo: {
    name: 'トレーニング声メモくん',
    slug: 'training-voice-memo',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    newArchEnabled: false,
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      deploymentTarget: '15.0',
      bundleIdentifier: 'com.training.voicememo',
      buildNumber: '1',
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      edgeToEdgeEnabled: false,
      minSdkVersion: 28,
      compileSdkVersion: 34,
      targetSdkVersion: 34,
      package: 'com.training.voicememo',
      versionCode: 1,
      permissions: [
        'RECORD_AUDIO',
        'CAMERA',
        'READ_EXTERNAL_STORAGE',
        'WRITE_EXTERNAL_STORAGE',
        'NOTIFICATIONS',
        'WAKE_LOCK',
      ],
    },
    web: {
      favicon: './assets/favicon.png',
      bundler: 'metro',
    },
    plugins: [
      'expo-secure-store',
      [
        'expo-av',
        {
          microphonePermission:
            'Allow $(PRODUCT_NAME) to access your microphone for voice recording.',
        },
      ],
      [
        'expo-notifications',
        {
          icon: './assets/icon.png',
          color: '#3498db',
          defaultChannel: 'default',
        },
      ],
    ],
    extra: {
      eas: {
        projectId: process.env.EAS_PROJECT_ID || 'your-eas-project-id',
      },
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
      openaiApiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
    },
    updates: {
      url: 'https://u.expo.dev/your-eas-project-id',
    },
    runtimeVersion: {
      policy: 'appVersion',
    },
  },
};
