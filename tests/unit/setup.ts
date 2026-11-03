import 'reflect-metadata';
import 'fake-indexeddb/auto';
import { afterEach, beforeEach, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

// iOS-only iBeacon source (Cordova); its published ESM also fails to load in Node.
vi.mock('@openhps/cordova-ibeacon', () => ({ BLEiBeaconSourceNode: class {} }));

beforeEach(() => {
    // Capacitor's web implementation of Preferences is backed by localStorage
    localStorage.clear();
    setActivePinia(createPinia());
});

afterEach(() => {
    document.body.classList.remove('dark');
});
