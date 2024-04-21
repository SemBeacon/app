import { CapacitorConfig } from '@capacitor/cli';
import { CapacitorElectronConfig } from '@capacitor-community/electron';

const config: CapacitorConfig & CapacitorElectronConfig = {
  appId: 'org.sembeacon',
  appName: 'SemBeacon',
  webDir: 'dist',
  server: {
    iosScheme: "ionic",
    androidScheme: "https",
    hostname: "app.sembeacon.org"
  },
  loggingBehavior: "none",
  android: {
    includePlugins: [
      '@capacitor/splash-screen',
      '@capacitor/preferences',
      'capacitor-native-settings',
      '@capawesome-team/capacitor-android-foreground-service',
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
      '@capacitor/splash-screen',
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
  electron: {
  },
  plugins: {
    SplashScreen: {
      backgroundColor: "#363795",
      androidScaleType: "CENTER_CROP",
      androidSplashResourceName: 'splash',
      splashFullScreen: true,
      splashImmersive: false,
      launchAutoHide: false
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon",
      iconColor: "#488AFF",
    }
  }
};

export default config;
