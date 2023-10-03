import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'org.sembeacon',
  appName: 'SemBeacon',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    iosScheme: "ionic",
    androidScheme: "http",
    hostname: "org.sembeacon"
  },
  loggingBehavior: "none"
};

export default config;
