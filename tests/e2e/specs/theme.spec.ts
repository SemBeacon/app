import { test, expect } from '../fixtures';

test.describe('dark mode', () => {
    test.use({ colorScheme: 'dark' });

    test('follows the system preference', async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('body')).toHaveClass(/\bdark\b/);
        await page.locator('ion-menu-button').first().click();
        await expect(page.locator('ion-menu ion-list-header img')).toHaveAttribute(
            'src',
            /_alpha\.svg$/,
        );
    });
});

test('uses the light theme by default', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('ion-app')).toBeVisible();
    await expect(page.locator('body')).not.toHaveClass(/\bdark\b/);
});
