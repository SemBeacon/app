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
      backgroundColor: "#363795"
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon",
      iconColor: "#488AFF",
    }
  }
};

export default config;
