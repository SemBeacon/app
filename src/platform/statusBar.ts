import { Capacitor } from '@capacitor/core';
import { Animation, StatusBar } from '@capacitor/status-bar';

/**
 * Colour the status bar (native apps only). Best effort: Android 15+ draws apps edge to
 * edge and no longer supports status bar colours (the EdgeToEdge plugin colours the inset
 * instead), so failures are ignored.
 */
export async function setStatusBarColor(color: string): Promise<void> {
    if (Capacitor.getPlatform() === 'web') {
        return;
    }
    try {
        await StatusBar.setBackgroundColor({ color });
        await StatusBar.show({ animation: Animation.None });
    } catch (err) {
        console.debug('Status bar colour not supported', err);
    }
}
