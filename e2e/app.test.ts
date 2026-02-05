/**
 * E2E Tests - App Launch and Basic Navigation
 *
 * Prerequisites:
 * 1. Build the app: npx detox build --configuration ios.sim.debug
 * 2. Run tests: npx detox test --configuration ios.sim.debug
 */

import { device, element, by, expect } from 'detox';

describe('App Launch', () => {
  beforeAll(async () => {
    await device.launchApp({
      newInstance: true,
    });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should launch the app successfully', async () => {
    // App should launch without crashing
    // Check for any visible element
    await expect(element(by.text('RENKİOO'))).toBeVisible();
  });

  it('should show welcome screen for unauthenticated users', async () => {
    // Welcome screen elements
    await expect(element(by.text('Hoş Geldin'))).toBeVisible();
  });

  it('should navigate to login screen', async () => {
    // Tap on login button
    await element(by.text('Giriş Yap')).tap();

    // Should show login screen
    await expect(element(by.text('E-posta'))).toBeVisible();
    await expect(element(by.text('Şifre'))).toBeVisible();
  });

  it('should navigate to register screen', async () => {
    // Tap on register button
    await element(by.text('Kayıt Ol')).tap();

    // Should show register screen
    await expect(element(by.text('Hesap Oluştur'))).toBeVisible();
  });
});

describe('Login Flow', () => {
  beforeAll(async () => {
    await device.launchApp({
      newInstance: true,
    });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should show error for empty credentials', async () => {
    // Navigate to login
    await element(by.text('Giriş Yap')).tap();

    // Try to submit empty form
    await element(by.text('Giriş Yap')).atIndex(1).tap();

    // Should show validation error
    await expect(element(by.text('E-posta adresi gereklidir'))).toBeVisible();
  });

  it('should show error for invalid email format', async () => {
    // Navigate to login
    await element(by.text('Giriş Yap')).tap();

    // Enter invalid email
    await element(by.id('email-input')).typeText('invalid-email');
    await element(by.id('password-input')).typeText('password123');

    // Submit
    await element(by.text('Giriş Yap')).atIndex(1).tap();

    // Should show validation error
    await expect(element(by.text('Geçerli bir e-posta adresi girin'))).toBeVisible();
  });

  it('should show error for wrong credentials', async () => {
    // Navigate to login
    await element(by.text('Giriş Yap')).tap();

    // Enter wrong credentials
    await element(by.id('email-input')).typeText('wrong@email.com');
    await element(by.id('password-input')).typeText('wrongpassword');

    // Submit
    await element(by.text('Giriş Yap')).atIndex(1).tap();

    // Should show error (network or auth error)
    // Note: This will fail in CI without a real backend
    await waitFor(element(by.text(/hata|Hatalı/i)))
      .toBeVisible()
      .withTimeout(5000);
  });

  // This test requires test credentials
  it.skip('should login successfully with valid credentials', async () => {
    // Navigate to login
    await element(by.text('Giriş Yap')).tap();

    // Enter valid test credentials
    await element(by.id('email-input')).typeText('test@renkioo.com');
    await element(by.id('password-input')).typeText('testpassword123');

    // Submit
    await element(by.text('Giriş Yap')).atIndex(1).tap();

    // Should navigate to home screen
    await waitFor(element(by.id('home-screen')))
      .toBeVisible()
      .withTimeout(10000);
  });
});

describe('Navigation', () => {
  beforeAll(async () => {
    await device.launchApp({
      newInstance: true,
    });
  });

  it('should be able to go back from login', async () => {
    // Navigate to login
    await element(by.text('Giriş Yap')).tap();

    // Go back
    await element(by.id('back-button')).tap();

    // Should be back on welcome screen
    await expect(element(by.text('Hoş Geldin'))).toBeVisible();
  });
});
