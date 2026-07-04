import { config } from '@vue/test-utils';

// Mock Capacitor plugins
const mockCapacitorPlugin = () => ({
    get: jest.fn().mockResolvedValue({ value: null }),
    set: jest.fn().mockResolvedValue({}),
    keys: jest.fn().mockResolvedValue({ keys: [] }),
    remove: jest.fn().mockResolvedValue({}),
    clear: jest.fn().mockResolvedValue({}),
    requestPermissions: jest.fn().mockResolvedValue({ state: 'granted' }),
    addListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
    removeAllListeners: jest.fn(),
    open: jest.fn().mockResolvedValue({}),
    show: jest.fn().mockResolvedValue({}),
    hide: jest.fn().mockResolvedValue({}),
    setBackgroundColor: jest.fn().mockResolvedValue({}),
    setStyle: jest.fn().mockResolvedValue({}),
    getInfo: jest.fn().mockResolvedValue({ version: '1.0.0', build: '1' }),
    writeFile: jest.fn().mockResolvedValue({ uri: '' }),
    mkdir: jest.fn().mockResolvedValue({ uri: '' }),
    registerActionTypes: jest.fn().mockResolvedValue({}),
    createChannel: jest.fn().mockResolvedValue({}),
    schedule: jest.fn().mockResolvedValue({}),
    cancel: jest.fn().mockResolvedValue({}),
});

// Mock @capacitor/core
jest.mock('@capacitor/core', () => ({
    Capacitor: {
        getPlatform: jest.fn().mockReturnValue('web'),
        isNativePlatform: jest.fn().mockReturnValue(false),
    },
}));

// Mock @capacitor/preferences
jest.mock('@capacitor/preferences', () => ({
    Preferences: mockCapacitorPlugin(),
}));

// Mock @capacitor/toast
jest.mock('@capacitor/toast', () => ({
    Toast: {
        show: jest.fn().mockResolvedValue({}),
    },
}));

// Mock @capacitor/filesystem
jest.mock('@capacitor/filesystem', () => ({
    Filesystem: mockCapacitorPlugin(),
    Directory: {
        Documents: 'Documents',
    },
    Encoding: {
        UTF8: 'utf8',
    },
}));

// Mock @capacitor/status-bar
jest.mock('@capacitor/status-bar', () => ({
    StatusBar: mockCapacitorPlugin(),
    Animation: {
        None: 'none',
    },
    Style: {
        Dark: 'dark',
        Light: 'light',
    },
}));

// Mock @capacitor/splash-screen
jest.mock('@capacitor/splash-screen', () => ({
    SplashScreen: mockCapacitorPlugin(),
}));

// Mock @capacitor/browser
jest.mock('@capacitor/browser', () => ({
    Browser: mockCapacitorPlugin(),
}));

// Mock @capacitor/app
jest.mock('@capacitor/app', () => ({
    App: {
        addListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
        getInfo: jest.fn().mockResolvedValue({ version: '1.0.0', buildNumber: '1' }),
    },
}));

// Mock @capacitor/local-notifications
jest.mock('@capacitor/local-notifications', () => ({
    LocalNotifications: mockCapacitorPlugin(),
}));

// Mock @capawesome-team/capacitor-android-foreground-service
jest.mock('@capawesome-team/capacitor-android-foreground-service', () => ({
    ForegroundService: {
        startForegroundService: jest.fn().mockResolvedValue({}),
        stopForegroundService: jest.fn().mockResolvedValue({}),
        requestPermissions: jest.fn().mockResolvedValue({}),
        addListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
    },
}));

// Mock @capacitor/geolocation
jest.mock('@capacitor/geolocation', () => ({
    Geolocation: {
        getCurrentPosition: jest.fn().mockResolvedValue({ coords: { latitude: 51.2, longitude: 4.4 } }),
        requestPermissions: jest.fn().mockResolvedValue({ location: 'granted' }),
    },
}));

// Mock @capacitor/keyboard
jest.mock('@capacitor/keyboard', () => ({
    Keyboard: mockCapacitorPlugin(),
}));

// Mock global window properties
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});

// Mock document.body.classList
Object.defineProperty(document.body.style, 'transform', {
    value: () => ({
        enumerable: true,
        get: () => '',
    }),
    configurable: true,
});

// Global Vue test utils config
config.global.stubs = {
    IonApp: true,
    IonPage: true,
    IonHeader: true,
    IonFooter: true,
    IonContent: true,
    IonToolbar: true,
    IonTitle: true,
    IonMenu: true,
    IonMenuButton: true,
    IonBackButton: true,
    IonButtons: true,
    IonButton: true,
    IonIcon: true,
    IonItem: true,
    IonLabel: true,
    IonList: true,
    IonInput: true,
    IonSelect: true,
    IonSelectOption: true,
    IonToggle: true,
    IonCard: true,
    IonCardHeader: true,
    IonCardContent: true,
    IonCardTitle: true,
    IonCardSubtitle: true,
    IonAvatar: true,
    IonThumbnail: true,
    IonRow: true,
    IonCol: true,
    IonGrid: true,
    IonFab: true,
    IonFabButton: true,
    IonSpinner: true,
    IonProgressBar: true,
    IonSegment: true,
    IonSegmentButton: true,
    IonListHeader: true,
    IonMenuToggle: true,
    IonSplitPane: true,
    IonRouterOutlet: true,
    IonNote: true,
    IonItemSliding: true,
    IonItemOptions: true,
    IonItemOption: true,
    IonCheckbox: true,
    IonSearchbar: true,
    IonActionSheet: true,
};
