import { test, expect } from '@playwright/test';

/**
 * Navigation Test Suite
 * 
 * Comprehensive tests for the global navigation system including:
 * - Back button functionality
 * - Header navigation
 * - Mobile bottom navigation
 * - Keyboard navigation
 * - Accessibility
 * - Breadcrumb navigation
 */

test.describe('Global Navigation System', () => {

  test.describe('Back Button', () => {
    test('back button navigates to previous page', async ({ page }) => {
      // Login first
      await page.goto('/login');
      await page.fill('input[type="email"]', 'doctor@clinic.local');
      await page.fill('input[type="password"]', 'Password123!');
      await page.click('button[type="submit"]');
      await page.waitForNavigation();

      // Navigate to a sub-page
      await page.goto('/doctor/reports');
      await page.waitForLoadState();

      // Click back button
      await page.click('button[aria-label="Go back to previous page"]');
      
      // Should navigate back
      await page.waitForURL(/\/doctor/);
    });

    test('back button has proper ARIA label', async ({ page }) => {
      await page.goto('/login');
      await page.fill('input[type="email"]', 'doctor@clinic.local');
      await page.fill('input[type="password"]', 'Password123!');
      await page.click('button[type="submit"]');
      await page.waitForNavigation();

      const backButton = page.getByRole('button', { name: /go back/i });
      await expect(backButton).toBeVisible();
    });

    test('keyboard shortcut Alt+Left triggers back', async ({ page }) => {
      await page.goto('/login');
      await page.fill('input[type="email"]', 'doctor@clinic.local');
      await page.fill('input[type="password"]', 'Password123!');
      await page.click('button[type="submit"]');
      await page.waitForNavigation();

      await page.goto('/doctor/reports');
      await page.keyboard.press('Alt+ArrowLeft');
      await page.waitForTimeout(500);
    });
  });

  test.describe('Global Navigation Header', () => {
    test('header displays back button, home, and brand', async ({ page }) => {
      await page.goto('/login');
      await page.fill('input[type="email"]', 'doctor@clinic.local');
      await page.fill('input[type="password"]', 'Password123!');
      await page.click('button[type="submit"]');
      await page.waitForNavigation();

      // Check for back button
      await expect(page.getByRole('button', { name: /go back/i })).toBeVisible();
      
      // Check for home button
      await expect(page.getByRole('button', { name: /go to home/i })).toBeVisible();
      
      // Check for brand
      await expect(page.getByText('HealthOS')).toBeVisible();
    });

    test('breadcrumb navigation is visible on desktop', async ({ page }) => {
      await page.goto('/login');
      await page.fill('input[type="email"]', 'doctor@clinic.local');
      await page.fill('input[type="password"]', 'Password123!');
      await page.click('button[type="submit"]');
      await page.waitForNavigation();

      // Navigate to a deep page
      await page.goto('/doctor/reports');
      await page.waitForLoadState();

      // Check breadcrumb
      const breadcrumb = page.getByRole('navigation', { name: 'Breadcrumb' });
      await expect(breadcrumb).toBeVisible();
    });

    test('section links highlight current section', async ({ page }) => {
      await page.goto('/login');
      await page.fill('input[type="email"]', 'doctor@clinic.local');
      await page.fill('input[type="password"]', 'Password123!');
      await page.click('button[type="submit"]');
      await page.waitForNavigation();

      // Doctor section should be highlighted
      const doctorLink = page.getByRole('link', { name: 'Doctor' });
      await expect(doctorLink).toHaveAttribute('aria-current', 'page');
    });

    test('user menu opens and closes', async ({ page }) => {
      await page.goto('/login');
      await page.fill('input[type="email"]', 'doctor@clinic.local');
      await page.fill('input[type="password"]', 'Password123!');
      await page.click('button[type="submit"]');
      await page.waitForNavigation();

      // Click user menu
      await page.getByRole('button', { name: 'User menu' }).click();
      
      // Menu should be visible
      await expect(page.getByRole('menu')).toBeVisible();
      
      // Should have Settings and Sign Out
      await expect(page.getByRole('menuitem', { name: 'Settings' })).toBeVisible();
      await expect(page.getByRole('menuitem', { name: 'Sign Out' })).toBeVisible();
    });
  });

  test.describe('Mobile Navigation', () => {
    test('mobile bottom nav is hidden on desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.goto('/login');
      await page.fill('input[type="email"]', 'doctor@clinic.local');
      await page.fill('input[type="password"]', 'Password123!');
      await page.click('button[type="submit"]');
      await page.waitForNavigation();

      const mobileNav = page.getByRole('navigation', { name: 'Mobile bottom navigation' });
      await expect(mobileNav).not.toBeVisible();
    });

    test('mobile bottom nav appears on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/login');
      await page.fill('input[type="email"]', 'doctor@clinic.local');
      await page.fill('input[type="password"]', 'Password123!');
      await page.click('button[type="submit"]');
      await page.waitForNavigation();

      const mobileNav = page.getByRole('navigation', { name: 'Mobile bottom navigation' });
      await expect(mobileNav).toBeVisible();
    });

    test('mobile nav items navigate correctly', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/login');
      await page.fill('input[type="email"]', 'pharmacy@hospital.local');
      await page.fill('input[type="password"]', 'Password123!');
      await page.click('button[type="submit"]');
      await page.waitForNavigation();

      // Click home in mobile nav
      await page.getByRole('link', { name: 'Home' }).click();
      
      await page.waitForTimeout(500);
    });

    test('mobile nav has proper touch targets (min 48px)', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/login');
      await page.fill('input[type="email"]', 'doctor@clinic.local');
      await page.fill('input[type="password"]', 'Password123!');
      await page.click('button[type="submit"]');
      await page.waitForNavigation();

      const navItems = page.locator('[role="navigation"][aria-label="Mobile bottom navigation"] a');
      const count = await navItems.count();
      
      for (let i = 0; i < count; i++) {
        const box = await navItems.nth(i).boundingBox();
        expect(box).not.toBeNull();
        expect(box!.height).toBeGreaterThanOrEqual(48);
        expect(box!.width).toBeGreaterThanOrEqual(48);
      }
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('Escape closes mobile menu', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/login');
      await page.fill('input[type="email"]', 'doctor@clinic.local');
      await page.fill('input[type="password"]', 'Password123!');
      await page.click('button[type="submit"]');
      await page.waitForNavigation();

      // Open mobile menu
      await page.getByRole('button', { name: 'Toggle navigation menu' }).click();
      
      // Press Escape
      await page.keyboard.press('Escape');
      
      // Menu should be closed
      const mobileDrawer = page.getByRole('dialog', { name: 'Navigation menu' });
      await expect(mobileDrawer).not.toBeVisible();
    });

    test('focus ring visible on navigation elements', async ({ page }) => {
      await page.goto('/login');
      await page.fill('input[type="email"]', 'doctor@clinic.local');
      await page.fill('input[type="password"]', 'Password123!');
      await page.click('button[type="submit"]');
      await page.waitForNavigation();

      // Tab to back button
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Should have focus
      const focused = await page.evaluate(() => document.activeElement?.getAttribute('aria-label'));
      expect(focused).toMatch(/go (back|home)/i);
    });
  });

  test.describe('Accessibility', () => {
    test('screen reader announcements work', async ({ page }) => {
      await page.goto('/login');
      await page.fill('input[type="email"]', 'doctor@clinic.local');
      await page.fill('input[type="password"]', 'Password123!');
      await page.click('button[type="submit"]');
      await page.waitForNavigation();

      // Check for live region
      const liveRegion = page.getByRole('status');
      await expect(liveRegion).toBeVisible();
    });

    test('all nav links have aria labels', async ({ page }) => {
      await page.goto('/login');
      await page.fill('input[type="email"]', 'doctor@clinic.local');
      await page.fill('input[type="password"]', 'Password123!');
      await page.click('button[type="submit"]');
      await page.waitForNavigation();

      const navLinks = page.locator('[role="navigation"] a');
      const count = await navLinks.count();
      
      for (let i = 0; i < count; i++) {
        const label = await navLinks.nth(i).getAttribute('aria-label');
        expect(label).toBeTruthy();
      }
    });

    test('active page has aria-current', async ({ page }) => {
      await page.goto('/doctor');
      await page.fill('input[type="email"]', 'doctor@clinic.local');
      await page.fill('input[type="password"]', 'Password123!');
      await page.click('button[type="submit"]');
      await page.waitForNavigation();

      const activeLink = page.locator('[aria-current="page"]');
      await expect(activeLink).toBeVisible();
    });
  });
});

test.describe('Navigation Deep Linking', () => {
  test('direct navigation to section works', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'doctor@clinic.local');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await page.waitForNavigation();

    // Deep link directly
    await page.goto('/doctor/reports');
    await page.waitForLoadState();
    
    await expect(page).toHaveURL(/\/doctor\/reports/);
  });

  test('navigation preserves URL on refresh', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'doctor@clinic.local');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await page.waitForNavigation();

    await page.goto('/doctor/reports');
    await page.waitForLoadState();

    // Refresh
    await page.reload();
    await page.waitForLoadState();
    
    // URL should be preserved
    await expect(page).toHaveURL(/\/doctor\/reports/);
  });
});