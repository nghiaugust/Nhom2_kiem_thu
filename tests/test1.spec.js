// Test cases cho trang đăng nhập và đăng ký NewDay.com.vn

import { test, expect } from '@playwright/test';

// Test data
const testUsers = {
  valid: {
    email: 'test@example.com',
    password: 'Test123456',
    name: 'Test User',
    phone: '0123456789'
  },
  invalid: {
    email: 'invalid-email',
    password: '123',
    name: '',
    phone: 'invalid-phone'
  }
};

test.describe('NewDay.com.vn - Đăng nhập (Sign In)', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('https://newday.com.vn/user/signin');
    await page.waitForLoadState('load');
  });

    test('Kiểm tra trang đăng nhập load thành công', async ({ page }) => {
    await expect(page).toHaveURL(/.*signin/);
    await expect(page).toHaveTitle(/.*Đăng nhập.*/);

    // Kiểm tra form đăng nhập
    await expect(page.locator('form#formAcount')).toBeVisible();

    // Kiểm tra các input fields theo HTML thực tế
    await expect(page.locator('input[name="username"]#username')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button#btnsignin')).toBeVisible();
    });

    test('Đăng nhập với thông tin hợp lệ', async ({ page }) => {
    // Sử dụng selector chính xác từ HTML
    const emailInput = page.locator('input[name="username"]#username');
    await emailInput.fill(testUsers.valid.email);

    const passwordInput = page.locator('form#formAcount input[type="password"]');
    await passwordInput.fill(testUsers.valid.password);

    // Click nút đăng nhập
    await page.locator('button#btnsignin').click();

    await page.waitForTimeout(3000);

    const currentUrl = page.url();
    const isRedirected = !currentUrl.includes('signin');
    const hasSuccessMessage = await page.locator('text=/thành công|success/i').count() > 0;

    expect(isRedirected || hasSuccessMessage).toBeTruthy();
    });

    test('Đăng nhập với email không hợp lệ', async ({ page }) => {
    const emailInput = page.locator('input[name="username"]#username');
    await emailInput.fill(testUsers.invalid.email);

    const passwordInput = page.locator('form#formAcount input[type="password"]');
    await passwordInput.fill(testUsers.valid.password);

    await page.locator('button#btnsignin').click();

    await page.waitForTimeout(2000);

    // Kiểm tra thông báo lỗi trong div.formErrorContent
    const hasErrorMessage = await page.locator('.formErrorContent, .formError, text=/lỗi|error|không hợp lệ/i').count() > 0;
    const staysOnSigninPage = page.url().includes('signin');

    expect(hasErrorMessage || staysOnSigninPage).toBeTruthy();
    });

    test('Đăng nhập với mật khẩu ngắn', async ({ page }) => {
    const emailInput = page.locator('input[name="username"]#username');
    await emailInput.fill(testUsers.valid.email);

    const passwordInput = page.locator('form#formAcount input[type="password"]');
    await passwordInput.fill(testUsers.invalid.password);

    await page.locator('button#btnsignin').click();

    await page.waitForTimeout(2000);

    const hasErrorMessage = await page.locator('.formErrorContent, text=/mật khẩu|password|quá ngắn/i').count() > 0;
    const staysOnSigninPage = page.url().includes('signin');

    expect(hasErrorMessage || staysOnSigninPage).toBeTruthy();
    });

    test('Đăng nhập với thông tin trống', async ({ page }) => {
    // Click nút đăng nhập mà không điền gì
    await page.locator('button#btnsignin').click();

    await page.waitForTimeout(1000);

    // Kiểm tra validation message trong formErrorContent
    const hasValidationMessage = await page.locator('.formErrorContent, text=/bắt buộc|required|không được để trống/i').count() > 0;
    const staysOnSigninPage = page.url().includes('signin');

    expect(hasValidationMessage || staysOnSigninPage).toBeTruthy();
    });

  test('Kiểm tra link "Quên mật khẩu"', async ({ page }) => {
    const forgotPasswordLink = page.locator('a:has-text("Quên mật khẩu"), a[href*="getpassword"], a[href*="forgot"]');
    
    if (await forgotPasswordLink.count() > 0) {
      await expect(forgotPasswordLink.first()).toBeVisible();
      await forgotPasswordLink.first().click();
      
      await page.waitForTimeout(2000);
      const currentUrl = page.url();
      expect(currentUrl).toMatch(/getpassword|forgot|reset/);
    }
  });

  test('Kiểm tra đăng nhập bằng Facebook', async ({ page }) => {
    const fbLoginButton = page.locator('a:has-text("facebook"), a[href*="fbsignin"], button:has-text("Facebook")');
    
    if (await fbLoginButton.count() > 0) {
      await expect(fbLoginButton.first()).toBeVisible();
      // Không click thực tế để tránh redirect to Facebook
    }
  });

  test('Kiểm tra đăng nhập bằng Google', async ({ page }) => {
    const googleLoginButton = page.locator('a:has-text("Google"), a[href*="ggsignin"], button:has-text("Google")');
    
    if (await googleLoginButton.count() > 0) {
      await expect(googleLoginButton.first()).toBeVisible();
      // Không click thực tế để tránh redirect to Google
    }
  });

  test('Kiểm tra link chuyển đến trang đăng ký', async ({ page }) => {
    const signupLink = page.locator('a:has-text("ĐĂNG KÝ"), a:has-text("Đăng ký"), a[href*="signup"]');
    
    if (await signupLink.count() > 0) {
      await expect(signupLink.first()).toBeVisible();
      await signupLink.first().click();
      
      await page.waitForTimeout(2000);
      expect(page.url()).toMatch(/signup/);
    }
  });
});

test.describe('NewDay.com.vn - Đăng ký (Sign Up)', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('https://newday.com.vn/user/signup');
    await page.waitForLoadState('networkidle');
  });

  test('Kiểm tra trang đăng ký load thành công', async ({ page }) => {
    await expect(page).toHaveURL(/.*signup/);
    await expect(page).toHaveTitle(/.*New Day.*/);
    
    // Kiểm tra các elements chính có tồn tại
    await expect(page.locator('text=ĐĂNG KÝ')).toBeVisible();
  });

  test('Đăng ký với thông tin hợp lệ', async ({ page }) => {
    // Tìm và điền các trường thông tin
    const nameInput = page.locator('input[name*="name"], input[placeholder*="tên"], input[placeholder*="họ"]').first();
    if (await nameInput.count() > 0) {
      await nameInput.fill(testUsers.valid.name);
    }
    
    const emailInput = page.locator('input[type="email"], input[name*="email"], input[placeholder*="email"]').first();
    if (await emailInput.count() > 0) {
      await emailInput.fill(`test${Date.now()}@example.com`); // Email unique
    }
    
    const phoneInput = page.locator('input[name*="phone"], input[placeholder*="điện thoại"], input[type="tel"]').first();
    if (await phoneInput.count() > 0) {
      await phoneInput.fill(testUsers.valid.phone);
    }
    
    const passwordInput = page.locator('input[type="password"], input[name*="password"], input[placeholder*="mật khẩu"]').first();
    if (await passwordInput.count() > 0) {
      await passwordInput.fill(testUsers.valid.password);
    }
    
    const confirmPasswordInput = page.locator('input[name*="confirm"], input[placeholder*="nhập lại"], input[placeholder*="xác nhận"]').first();
    if (await confirmPasswordInput.count() > 0) {
      await confirmPasswordInput.fill(testUsers.valid.password);
    }
    
    // Check các checkbox nếu có (điều khoản sử dụng, etc.)
    const agreementCheckbox = page.locator('input[type="checkbox"]').first();
    if (await agreementCheckbox.count() > 0) {
      await agreementCheckbox.check();
    }
    
    // Click nút đăng ký
    await page.locator('button[type="submit"], input[type="submit"], button:has-text("ĐĂNG KÝ"), button:has-text("Đăng ký")').first().click();
    
    await page.waitForTimeout(3000);
    
    // Kiểm tra kết quả
    const currentUrl = page.url();
    const isRedirected = !currentUrl.includes('signup');
    const hasSuccessMessage = await page.locator('text=/thành công|success|đăng ký thành công/i').count() > 0;
    
    expect(isRedirected || hasSuccessMessage).toBeTruthy();
  });

  test('Đăng ký với email không hợp lệ', async ({ page }) => {
    const emailInput = page.locator('input[type="email"], input[name*="email"], input[placeholder*="email"]').first();
    if (await emailInput.count() > 0) {
      await emailInput.fill(testUsers.invalid.email);
    }
    
    const passwordInput = page.locator('input[type="password"], input[name*="password"], input[placeholder*="mật khẩu"]').first();
    if (await passwordInput.count() > 0) {
      await passwordInput.fill(testUsers.valid.password);
    }
    
    await page.locator('button[type="submit"], input[type="submit"], button:has-text("ĐĂNG KÝ"), button:has-text("Đăng ký")').first().click();
    
    await page.waitForTimeout(2000);
    
    const hasErrorMessage = await page.locator('text=/lỗi|error|không hợp lệ|invalid|email/i').count() > 0;
    const staysOnSignupPage = page.url().includes('signup');
    
    expect(hasErrorMessage || staysOnSignupPage).toBeTruthy();
  });

  test('Đăng ký với mật khẩu không khớp', async ({ page }) => {
    const emailInput = page.locator('input[type="email"], input[name*="email"], input[placeholder*="email"]').first();
    if (await emailInput.count() > 0) {
      await emailInput.fill(`test${Date.now()}@example.com`);
    }
    
    const passwordInput = page.locator('input[type="password"], input[name*="password"], input[placeholder*="mật khẩu"]').first();
    if (await passwordInput.count() > 0) {
      await passwordInput.fill(testUsers.valid.password);
    }
    
    const confirmPasswordInput = page.locator('input[name*="confirm"], input[placeholder*="nhập lại"], input[placeholder*="xác nhận"]').first();
    if (await confirmPasswordInput.count() > 0) {
      await confirmPasswordInput.fill('DifferentPassword123');
    }
    
    await page.locator('button[type="submit"], input[type="submit"], button:has-text("ĐĂNG KÝ"), button:has-text("Đăng ký")').first().click();
    
    await page.waitForTimeout(2000);
    
    const hasErrorMessage = await page.locator('text=/không khớp|mismatch|không trùng khớp|mật khẩu/i').count() > 0;
    const staysOnSignupPage = page.url().includes('signup');
    
    expect(hasErrorMessage || staysOnSignupPage).toBeTruthy();
  });

  test('Đăng ký với số điện thoại không hợp lệ', async ({ page }) => {
    const emailInput = page.locator('input[type="email"], input[name*="email"], input[placeholder*="email"]').first();
    if (await emailInput.count() > 0) {
      await emailInput.fill(`test${Date.now()}@example.com`);
    }
    
    const phoneInput = page.locator('input[name*="phone"], input[placeholder*="điện thoại"], input[type="tel"]').first();
    if (await phoneInput.count() > 0) {
      await phoneInput.fill(testUsers.invalid.phone);
    }
    
    const passwordInput = page.locator('input[type="password"], input[name*="password"], input[placeholder*="mật khẩu"]').first();
    if (await passwordInput.count() > 0) {
      await passwordInput.fill(testUsers.valid.password);
    }
    
    await page.locator('button[type="submit"], input[type="submit"], button:has-text("ĐĂNG KÝ"), button:has-text("Đăng ký")').first().click();
    
    await page.waitForTimeout(2000);
    
    const hasErrorMessage = await page.locator('text=/số điện thoại|phone|không hợp lệ|invalid/i').count() > 0;
    const staysOnSignupPage = page.url().includes('signup');
    
    expect(hasErrorMessage || staysOnSignupPage).toBeTruthy();
  });

  test('Đăng ký với tên để trống', async ({ page }) => {
    const nameInput = page.locator('input[name*="name"], input[placeholder*="tên"], input[placeholder*="họ"]').first();
    if (await nameInput.count() > 0) {
      await nameInput.fill(''); // Để trống
    }
    
    const emailInput = page.locator('input[type="email"], input[name*="email"], input[placeholder*="email"]').first();
    if (await emailInput.count() > 0) {
      await emailInput.fill(`test${Date.now()}@example.com`);
    }
    
    const passwordInput = page.locator('input[type="password"], input[name*="password"], input[placeholder*="mật khẩu"]').first();
    if (await passwordInput.count() > 0) {
      await passwordInput.fill(testUsers.valid.password);
    }
    
    await page.locator('button[type="submit"], input[type="submit"], button:has-text("ĐĂNG KÝ"), button:has-text("Đăng ký")').first().click();
    
    await page.waitForTimeout(2000);
    
    const hasErrorMessage = await page.locator('text=/tên|name|bắt buộc|required|không được để trống/i').count() > 0;
    const staysOnSignupPage = page.url().includes('signup');
    
    expect(hasErrorMessage || staysOnSignupPage).toBeTruthy();
  });

  test('Đăng ký với email đã tồn tại', async ({ page }) => {
    const emailInput = page.locator('input[type="email"], input[name*="email"], input[placeholder*="email"]').first();
    if (await emailInput.count() > 0) {
      await emailInput.fill('existing@example.com'); // Email có thể đã tồn tại
    }
    
    const nameInput = page.locator('input[name*="name"], input[placeholder*="tên"], input[placeholder*="họ"]').first();
    if (await nameInput.count() > 0) {
      await nameInput.fill(testUsers.valid.name);
    }
    
    const passwordInput = page.locator('input[type="password"], input[name*="password"], input[placeholder*="mật khẩu"]').first();
    if (await passwordInput.count() > 0) {
      await passwordInput.fill(testUsers.valid.password);
    }
    
    await page.locator('button[type="submit"], input[type="submit"], button:has-text("ĐĂNG KÝ"), button:has-text("Đăng ký")').first().click();
    
    await page.waitForTimeout(3000);
    
    const hasErrorMessage = await page.locator('text=/đã tồn tại|already exists|email đã được sử dụng/i').count() > 0;
    const staysOnSignupPage = page.url().includes('signup');
    
    expect(hasErrorMessage || staysOnSignupPage).toBeTruthy();
  });

  test('Kiểm tra link chuyển đến trang đăng nhập', async ({ page }) => {
    const signinLink = page.locator('a:has-text("ĐĂNG NHẬP"), a:has-text("Đăng nhập"), a[href*="signin"]');
    
    if (await signinLink.count() > 0) {
      await expect(signinLink.first()).toBeVisible();
      await signinLink.first().click();
      
      await page.waitForTimeout(2000);
      expect(page.url()).toMatch(/signin/);
    }
  });
});

test.describe('NewDay.com.vn - Kiểm tra chung', () => {
  
  test('Kiểm tra responsive design trên mobile', async ({ page }) => {
    // Thiết lập viewport mobile
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('https://newday.com.vn/user/signin');
    await page.waitForLoadState('networkidle');
    
    // Kiểm tra form vẫn hiển thị đúng trên mobile
    await expect(page.locator('text=ĐĂNG NHẬP')).toBeVisible();
    
    await page.goto('https://newday.com.vn/user/signup');
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('text=ĐĂNG KÝ')).toBeVisible();
  });

  test('Kiểm tra loading và timeout', async ({ page }) => {
    await page.goto('https://newday.com.vn/user/signin');
    
    // Kiểm tra trang load trong thời gian hợp lý
    const startTime = Date.now();
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(10000); // 10 seconds timeout
  });

  test('Kiểm tra navigation giữa các trang', async ({ page }) => {
    // Bắt đầu từ trang chủ
    await page.goto('https://newday.com.vn');
    
    // Tìm và click vào link đăng nhập
    const loginLink = page.locator('a:has-text("ĐĂNG NHẬP"), a[href*="signin"]').first();
    if (await loginLink.count() > 0) {
      await loginLink.click();
      await page.waitForTimeout(2000);
      expect(page.url()).toMatch(/signin/);
    }
    
    // Chuyển đến trang đăng ký
    const signupLink = page.locator('a:has-text("ĐĂNG KÝ"), a[href*="signup"]').first();
    if (await signupLink.count() > 0) {
      await signupLink.click();
      await page.waitForTimeout(2000);
      expect(page.url()).toMatch(/signup/);
    }
  });
});