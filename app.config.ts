import { ExpoConfig, ConfigContext } from 'expo/config';

const parseList = (value: string | undefined, fallback: string[]): string[] => {
  if (!value) {
    return fallback;
  }

  const items = value
    .split(',')
    .map(entry => entry.trim())
    .filter(Boolean);

  return items.length > 0 ? items : fallback;
};

export default (_ctx: ConfigContext): ExpoConfig => {
  const appName = process.env.EXPO_PUBLIC_APP_NAME ?? 'Chatwoot';
  const appSlug = process.env.EXPO_PUBLIC_APP_SLUG || 'chatwoot-mobile';
  const iosBundleIdentifier =
    process.env.EXPO_PUBLIC_IOS_BUNDLE_IDENTIFIER ?? 'com.chatwoot.app';
  const androidPackageName = process.env.EXPO_PUBLIC_ANDROID_PACKAGE ?? 'com.chatwoot.app';
  const urlScheme = process.env.EXPO_PUBLIC_URL_SCHEME ?? 'chatwootapp';
  const associatedDomains = parseList(process.env.EXPO_PUBLIC_IOS_ASSOCIATED_DOMAINS, [
    'applinks:app.chatwoot.com',
  ]);
  const androidIntentHost = process.env.EXPO_PUBLIC_ANDROID_INTENT_HOST ?? 'app.chatwoot.com';
  const androidIntentPathPrefix =
    process.env.EXPO_PUBLIC_ANDROID_INTENT_PATH_PREFIX ?? '/app/accounts/';
  const androidIntentPathPattern =
    process.env.EXPO_PUBLIC_ANDROID_INTENT_PATH_PATTERN ?? '/*/conversations/*';
  const easOwner = process.env.EXPO_PUBLIC_EAS_OWNER || 'chatwoot';

  return {
    name: appName,
    slug: appSlug,
    version: '4.3.10',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    newArchEnabled: false,
    scheme: urlScheme,
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
      enableFullScreenImage_legacy: true,
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: iosBundleIdentifier,
      infoPlist: {
        NSCameraUsageDescription:
          'This app requires access to the camera to upload images and videos.',
        NSPhotoLibraryUsageDescription:
          'This app requires access to the photo library to upload images.',
        NSMicrophoneUsageDescription: 'This app requires access to the microphone to record audio.',
        NSAppleMusicUsageDescription:
          'This app does not use Apple Music, but a system API may require this permission.',
        UIBackgroundModes: ['fetch', 'remote-notification'],
        ITSAppUsesNonExemptEncryption: false,
      },
      // Please use the relative path to the google-services.json file
      googleServicesFile: process.env.EXPO_PUBLIC_IOS_GOOGLE_SERVICES_FILE,
      entitlements: { 'aps-environment': 'production' },
      associatedDomains,
    },
    android: {
      adaptiveIcon: { foregroundImage: './assets/adaptive-icon.png', backgroundColor: '#ffffff' },
      package: androidPackageName,
      permissions: ['android.permission.CAMERA', 'android.permission.RECORD_AUDIO'],
      // Please use the relative path to the google-services.json file
      googleServicesFile: process.env.EXPO_PUBLIC_ANDROID_GOOGLE_SERVICES_FILE,
      intentFilters: [
        {
          action: 'VIEW',
          autoVerify: true,
          data: [
            {
              scheme: 'https',
              host: androidIntentHost,
              pathPrefix: androidIntentPathPrefix,
              pathPattern: androidIntentPathPattern,
            },
          ],
          category: ['BROWSABLE', 'DEFAULT'],
        },
        {
          action: 'VIEW',
          data: [
            {
              scheme: urlScheme,
            },
          ],
          category: ['BROWSABLE', 'DEFAULT'],
        },
      ],
    },
    extra: {
      defaultInstallationUrl: process.env.EXPO_PUBLIC_CHATWOOT_BASE_URL,
      saraApiBaseUrl: process.env.EXPO_PUBLIC_SARA_API_BASE_URL,
      eas: {
        projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
        storybookEnabled: process.env.EXPO_STORYBOOK_ENABLED,
      },
    },
    owner: easOwner,
    plugins: [
      'expo-font',
      ['react-native-permissions', { iosPermissions: ['Camera', 'PhotoLibrary', 'MediaLibrary'] }],
      [
        '@sentry/react-native/expo',
        {
          url: 'https://sentry.io/',
          project: process.env.EXPO_PUBLIC_SENTRY_PROJECT_NAME,
          organization: process.env.EXPO_PUBLIC_SENTRY_ORG_NAME,
        },
      ],
      '@react-native-firebase/app',
      '@react-native-firebase/messaging',
      [
        'expo-build-properties',
        {
          // https://github.com/invertase/notifee/issues/808#issuecomment-2175934609
          android: {
            minSdkVersion: 24,
            compileSdkVersion: 35,
            targetSdkVersion: 35,
            enableProguardInReleaseBuilds: true,
          },
          ios: { useFrameworks: 'static' },
        },
      ],
      './with-ffmpeg-pod.js',
    ],
    androidNavigationBar: { backgroundColor: '#ffffff' },
  };
};
