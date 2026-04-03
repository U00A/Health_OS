import { test, expect } from '@playwright/test';

test.describe('Pharmacy Operational Flow', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'pharmacy@hospital.local');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await page.waitForNavigation();
  });

  test('Dispense authorization lock pipeline verifies immutable change', async ({ page }) => {
    // Navigate to pharmacy portal
    await page.goto('/pharmacy');

    // Attempt to access secure prescription vault for a known patient ID
    // (mock ID used to trigger generic websocket query resolution)
    const patientInput = page.locator('input[placeholder="Search patient UID..."]');
    await patientInput.fill('jx7110z41xmocked');
    await page.click('button:has-text("Search"), button:has(.lucide-search)'); // Fallback selector

    // Evaluate websocket loading state
    await expect(page.locator('text=Accessing secure records...')).toBeVisible();

    // Verify Active Scripts populate (Mock expects at least one element for this ID in seeded DB)
    const activeLabel = page.locator('text=ACTIVE').first();
    await activeLabel.waitFor({ state: 'visible', timeout: 5000 });
    
    // Authenticate dispensing mechanism
    const dispenseBtn = page.locator('button:has-text("Acknowledge and Authenticate Dispense")').first();
    
    const popupPromise = page.waitForEvent('dialog');
    await dispenseBtn.click();
    
    const dialog = await popupPromise;
    expect(dialog.message()).toContain('Verification successful');
    await dialog.accept();

    // End-state Verification: The button should organically disappear as state updates over WebSockets
    await expect(dispenseBtn).toHaveCount(0);
    // Dispensed label should apply
    await expect(page.locator('text=DISPENSED').first()).toBeVisible();
  });
});
