import { test as base, expect, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { mockNetwork, loadDemoBeacons, sortScannerBy, inputValues } from '../e2e/fixtures';

const OUTPUT = join(__dirname, '..', '..', 'resources', 'video', 'raw');

const test = base.extend({
    context: async ({ context }, use) => {
        await mockNetwork(context, { allowMapTiles: true });
        await use(context);
    },
});

/** Draw a touch indicator so taps are visible in the footage. */
async function installTouchDots(page: Page) {
    await page.addInitScript(() => {
        window.addEventListener(
            'pointerdown',
            (e) => {
                const dot = document.createElement('div');
                dot.style.cssText = `position:fixed;z-index:2147483647;pointer-events:none;width:56px;height:56px;
                    margin:-28px 0 0 -28px;border-radius:50%;background:rgba(255,255,255,.55);
                    border:3px solid rgba(54,55,149,.8);left:${e.clientX}px;top:${e.clientY}px;
                    transition:transform .5s ease-out,opacity .5s ease-out`;
                document.body.appendChild(dot);
                requestAnimationFrame(() => {
                    dot.style.transform = 'scale(1.6)';
                    dot.style.opacity = '0';
                });
                setTimeout(() => dot.remove(), 600);
            },
            true,
        );
    });
}

/**
 * Emulate the iOS chrome the web build never sees: safe-area insets (Ionic reads
 * --ion-safe-area-*), status bar, Dynamic Island and home indicator.
 */
async function installIosChrome(page: Page, kind: 'iphone' | 'ipad') {
    await page.addInitScript((k) => {
        const phone = k === 'iphone';
        const top = phone ? 59 : 24;
        const bottom = phone ? 34 : 20;
        const install = () => {
            const style = document.createElement('style');
            style.textContent = `:root{--ion-safe-area-top:${top}px!important;--ion-safe-area-bottom:${bottom}px!important}
                .ios-chrome{position:fixed;z-index:2147483646;pointer-events:none;font-family:-apple-system,'SF Pro Text',Helvetica,Arial,sans-serif;color:#fff}
                .ios-status{left:0;right:0;top:0;height:${top}px;display:flex;align-items:${phone ? 'center' : 'flex-start'};
                    justify-content:space-between;padding:${phone ? '6px 40px 0 48px' : '8px 28px 0 28px'};font-weight:600;font-size:${phone ? 17 : 14}px}
                .ios-status svg{height:${phone ? 13 : 11}px;fill:#fff;margin-left:6px}
                .ios-island{left:50%;top:12px;width:122px;height:36px;margin-left:-61px;border-radius:20px;background:#000}
                .ios-home{left:50%;bottom:8px;width:${phone ? 140 : 220}px;height:5px;margin-left:${phone ? -70 : -110}px;border-radius:3px;background:#111}`;
            document.head.appendChild(style);
            const bar = document.createElement('div');
            bar.className = 'ios-chrome ios-status';
            const date = phone
                ? ''
                : '<span style="margin-left:10px;font-weight:500">Fri 14 Nov</span>';
            bar.innerHTML = `<span style="display:flex">9:41${date}</span>
              <span style="display:flex;align-items:center">
                <svg viewBox="0 0 19 12"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="5" width="3" height="7" rx="1"/><rect x="10" y="2.5" width="3" height="9.5" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg>
                <svg viewBox="0 0 17 12"><path d="M8.5 2.3c2.3 0 4.4.9 6 2.4l1-1.1A10.3 10.3 0 0 0 8.5.7 10.300 10.300 0 0 0 1.500 3.600l1 1.100a8.700 8.700 0 0 1 6-2.400zm0 3.500c1.400 0 2.600.5 3.600 1.400l1-1.100a7.300 7.300 0 0 0-9.200 0l1 1.100c1-.9 2.200-1.400 3.600-1.400zm0 3.400c.7 0 1.300.3 1.800.7L8.500 12 6.700 9.900c.5-.4 1.100-.7 1.800-.7z"/></svg>
                <svg viewBox="0 0 28 13" style="height:${phone ? 13 : 11}px"><rect x=".5" y=".5" width="23" height="12" rx="3.500" fill="none" stroke="#fff" opacity=".5"/><rect x="2" y="2" width="20" height="9" rx="2"/><rect x="25" y="4.500" width="2" height="4" rx="1" opacity=".5"/></svg>
              </span>`;
            document.body.appendChild(bar);
            if (phone) {
                const island = document.createElement('div');
                island.className = 'ios-chrome ios-island';
                document.body.appendChild(island);
            }
            const home = document.createElement('div');
            home.className = 'ios-chrome ios-home';
            document.body.appendChild(home);
        };
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', install);
        } else {
            install();
        }
    }, kind);
}

const pause = (page: Page, ms: number) => page.waitForTimeout(ms);

async function smoothScroll(page: Page, by: number) {
    await page.evaluate(async (distance) => {
        const el = document.querySelector('.ion-page:not(.ion-page-hidden) ion-content') as any;
        const scroller = await el.getScrollElement();
        const start = scroller.scrollTop;
        const t0 = performance.now();
        await new Promise<void>((done) => {
            const step = (t: number) => {
                const p = Math.min((t - t0) / 1400, 1);
                scroller.scrollTop = start + distance * (1 - Math.pow(1 - p, 3));
                if (p < 1) {
                    requestAnimationFrame(step);
                } else {
                    done();
                }
            };
            requestAnimationFrame(step);
        });
    }, by);
}

test('record walkthrough', async ({ page }, testInfo) => {
    await installTouchDots(page);
    await installIosChrome(page, testInfo.project.name as 'iphone' | 'ipad');
    await page.goto('/beacon/scanner');
    await loadDemoBeacons(page);
    await pause(page, 1500);
    await sortScannerBy(page, 'RSSI');
    await pause(page, 1200);
    await smoothScroll(page, 500);
    await pause(page, 800);
    await smoothScroll(page, -500);
    await pause(page, 600);

    await page.locator('.beacon-item', { hasText: 'BEACON_08' }).locator('ion-grid').click();
    await expect.poll(() => inputValues(page)).toContain('BEACON_08');
    await pause(page, 1800);
    await smoothScroll(page, 600);
    await pause(page, 1500);
    await smoothScroll(page, 700);
    await pause(page, 1500);
    await smoothScroll(page, -1300);
    await pause(page, 600);

    await page.goBack();
    await pause(page, 1000);
    const menuButton = page.locator('ion-menu-button').first();
    if (await menuButton.isVisible()) {
        await menuButton.click();
        await expect(page.locator('ion-menu')).toBeVisible();
        await pause(page, 2000);
    } else {
        await pause(page, 2000);
    }

    mkdirSync(OUTPUT, { recursive: true });
    const video = page.video()!;
    await page.close();
    await video.saveAs(join(OUTPUT, `${testInfo.project.name}.webm`));
});
