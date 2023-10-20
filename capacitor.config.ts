import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'org.sembeacon',
  appName: 'SemBeacon',
  webDir: 'dist',
  server: {
    iosScheme: "ionic",
    androidScheme: "http",
    hostname: "org.sembeacon"
  },
  loggingBehavior: "none",
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
