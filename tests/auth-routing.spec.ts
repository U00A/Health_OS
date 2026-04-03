import { test, expect } from '@playwright/test';

// Configuration for robust role-based navigation testing
const ROLES = [
  { username: 'admin@hospital.local', expectedPath: '/admin' },
  { username: 'doctor@hospital.local', expectedPath: '/doctor' },
  { username: 'private@clinic.local', expectedPath: '/private' },
  { username: 'staff@hospital.local', expectedPath: '/staff' },
  { username: 'pharmacy@hospital.local', expectedPath: '/pharmacy' },
  { username: 'lab@hospital.local', expectedPath: '/lab' },
  { username: 'patient@hospital.local', expectedPath: '/patient-portal' },
];

test.describe('Role-Based Access Control and Edge Routing', () => {
  
  // Note: These tests rely on predefined seeded credentials existing in the Convex backend database.
  
  for (const role of ROLES) {
    test(`Authenticates ${role.username} and strictly routes to ${role.expectedPath}`, async ({ page }) => {
      // 1. Visit Login Page
      await page.goto('/login');
      
      // 2. Input universal mock credentials
      await page.fill('input[type="email"]', role.username); // Assuming universal identifier locator
      await page.fill('input[type="password"]', 'Password123!');
      
      // 3. Initiate authentication action
      await page.click('button[type="submit"]');

      // 4. Wait for network resolution and middleware edge evaluation
      await page.waitForNavigation({ waitUntil: 'networkidle' });

      // 5. Assert strict route confinement (the user should cleanly land in their role domain)
      expect(page.url()).toContain(role.expectedPath);
      
      // 6. Assert that traversing into restricted territory forcibly ejects the user back
      const maliciousPath = role.expectedPath === '/admin' ? '/doctor' : '/admin';
      const maliciousResponse = await page.goto(maliciousPath);
      
      // Edge Middleware redirects unauthorized access
      expect(page.url()).not.toContain(maliciousPath);
    });
  }
});
