import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'org.sembeacon',
  appName: 'SemBeacon',
  webDir: 'dist',
  server: {
    iosScheme: "ionic",
    androidScheme: "https",
    hostname: "sembeacon.org"
  },
  loggingBehavior: "none",
  android: {
    includePlugins: [
      '@capacitor/preferences',
      'capacitor-native-settings',
      '@capacitor/toast',
      '@capacitor/status-bar',
      '@capacitor/local-notifications',
      '@capacitor/geolocation',
      '@capacitor/filesystem',
      '@capacitor/device',
      '@capacitor/browser',
      '@capacitor/app',
      '@capacitor-community/bluetooth-le',
      'cordova-plugin-bluetoothle'
    ]
  },
  ios: {
    includePlugins: [
      '@capacitor/preferences',
      'capacitor-native-settings',
      '@capacitor/toast',
      '@capacitor/status-bar',
      '@capacitor/local-notifications',
      '@capacitor/geolocation',
      '@capacitor/filesystem',
      '@capacitor/device',
      '@capacitor/browser',
      '@capacitor/app',
      '@capacitor-community/bluetooth-le',
      'cordova-plugin-bluetoothle',
      'cordova-plugin-ibeacon',
      'cordova-plugin-device',
    ]
  },
  plugins: {
    SplashScreen: {
      backgroundColor: "#363795",
      androidScaleType: "CENTER_CROP",
      launchShowDuration: 3000,
      launchAutoHide: true,
      androidSplashResourceName: 'splash',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon",
      iconColor: "#488AFF",
    }
  }
};

export default config;
