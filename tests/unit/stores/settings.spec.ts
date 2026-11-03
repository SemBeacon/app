import { describe, expect, it } from 'vitest';
import { Preferences } from '@capacitor/preferences';
import { useSettings } from '@/stores/settings';

describe('settings store', () => {
    it('populates default UUIDs when nothing is stored', async () => {
        const settings = useSettings();
        await settings.load();
        expect(Object.keys(settings.data.uuids)).toContain('77f340db-ac0d-20e8-aa3a-f656a29f236c');
        // Defaults are persisted so the next load reads them back
        const stored = JSON.parse((await Preferences.get({ key: 'settings' })).value);
        expect(stored.data.uuids).toEqual(settings.data.uuids);
    });

    it('round-trips saved data', async () => {
        const settings = useSettings();
        settings.data.theme = 'DARK';
        settings.data.uuids = { abc: { name: 'Mine' } };
        await settings.save();

        settings.$reset();
        await settings.load();
        expect(settings.data.theme).toBe('DARK');
        expect(settings.data.uuids).toEqual({ abc: { name: 'Mine' } });
    });

    it('replaces data stored with an older version', async () => {
        await Preferences.set({
            key: 'settings',
            value: JSON.stringify({ version: 1, data: { theme: 'DARK', uuids: {} } }),
        });
        const settings = useSettings();
        await settings.load();
        expect(settings.data.theme).toBe('SYSTEM');
        expect(Object.keys(settings.data.uuids).length).toBeGreaterThan(0);
    });

    it('rejects corrupt stored JSON', async () => {
        await Preferences.set({ key: 'settings', value: '{not json' });
        await expect(useSettings().load()).rejects.toThrow();
    });

    it.each([
        ['DARK', true],
        ['LIGHT', false],
    ] as const)('darkMode is %s → %s', (theme, dark) => {
        const settings = useSettings();
        settings.data.theme = theme;
        expect(settings.darkMode).toBe(dark);
    });

    it('update() toggles the dark class on the body', async () => {
        const settings = useSettings();
        settings.data.theme = 'DARK';
        await settings.save();
        settings.update();
        await vi.waitFor(() => expect(document.body.classList.contains('dark')).toBe(true));
    });
});
