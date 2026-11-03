import 'reflect-metadata';
import { afterEach, beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

beforeEach(() => {
    // Capacitor's web implementation of Preferences is backed by localStorage
    localStorage.clear();
    setActivePinia(createPinia());
});

afterEach(() => {
    document.body.classList.remove('dark');
});
