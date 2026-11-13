import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'org.sembeacon',
    appName: 'SemBeacon',
    webDir: 'dist',
    server: {
        iosScheme: 'ionic',
        androidScheme: 'https',
        hostname: 'app.sembeacon.org',
    },
    // Console output in logcat/Xcode for debug builds only
    loggingBehavior: 'debug',
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
            'cordova-plugin-bluetoothle',
            '@capawesome/capacitor-android-edge-to-edge-support',
            '@capawesome/capacitor-app-integrity',
        ],
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
        ],
    },
    plugins: {
        SplashScreen: {
            backgroundColor: '#363795',
            androidScaleType: 'CENTER_CROP',
            androidSplashResourceName: 'splash',
            splashFullScreen: true,
            splashImmersive: false,
            launchAutoHide: false,
        },
        LocalNotifications: {
            smallIcon: 'ic_stat_icon',
            iconColor: '#488AFF',
        },
        EdgeToEdge: {
            backgroundColor: '#363795',
        },
        // Capacitor's built-in inset handling is enabled by default and adds the status bar
        // height to env(safe-area-inset-top) while the EdgeToEdge plugin already insets the
        // WebView, which pushes the header down twice. Let the plugin own the insets.
        SystemBars: {
            insetsHandling: 'disable',
        },
        StatusBar: {
            overlaysWebView: false,
        },
    },
};

export default config;
