// @ts-check
import { test, expect } from '@playwright/test';

// Sử dụng page của Playwright cho từng test, không dùng pageInstance toàn cục

test.beforeEach(async ({ page }) => {
  await page.goto('https://newday.com.vn/user/login');
});

test('ĐN_1: Giao diện: Trang hiển thị như lúc đầu khi chưa đăng nhập', async ({ page }) => {
  await page.fill('input[name="username"]', '');
  await page.fill('input[name="password"]', '');
  await page.click('#btnsignin');
  await expect(page).toHaveURL('https://newday.com.vn/user/signin?redirect=/user/login');
  // Kiểm tra vị trí scroll sau khi báo lỗi
  const scrollY = await page.evaluate(() => window.scrollY);
  expect(scrollY).toBeLessThan(50); // Trang không bị kéo xuống dưới
  // Kiểm tra ô nhập username vẫn hiển thị trên màn hình
  const usernameBox = await page.locator('input[name="username"]').boundingBox();
  expect(usernameBox).not.toBeNull();
  if (usernameBox) expect(usernameBox.y).toBeLessThan(200);
});

test('ĐN_2: Giao diện: Placeholder đúng với logic hệ thống', async ({ page }) => {
  const usernamePlaceholder = await page.getAttribute('input[name="username"]', 'placeholder');
  const lower = usernamePlaceholder?.toLowerCase() || '';
  // Nếu placeholder chứa các từ không hợp lệ thì fail
  const invalidWords = ['tên đăng nhập', 'username', 'tên tài khoản', 'user'];
  for (const word of invalidWords) {
    expect(lower).not.toContain(word);
  }
  // Vẫn kiểm tra phải có chữ email
  expect(lower).toContain('email');
  const passwordPlaceholder = await page.getAttribute('input[name="password"]', 'placeholder');
  expect(passwordPlaceholder?.toLowerCase()).toContain('mật khẩu');
});

test('ĐN_3: Giao diện: Nút đăng nhập hiển thị và khả dụng', async ({ page }) => {
  const btn = page.locator('#btnsignin');
  await expect(btn).toBeVisible();
  await expect(btn).toBeEnabled();
});

test('ĐN_4: Giao diện: Tab chuyển đổi giữa các trường hoạt động', async ({ page }) => {
  await page.focus('input[name="username"]');
  await page.keyboard.press('Tab');
  const isPasswordFocused = await page.evaluate(() => document.activeElement && document.activeElement.getAttribute('name') === 'password');
  expect(isPasswordFocused).toBeTruthy();
});

test('ĐN_5: Giao diện: Placeholder đúng cho ô username và password', async ({ page }) => {
  const usernamePlaceholder = await page.getAttribute('input[name="username"]', 'placeholder');
  const passwordPlaceholder = await page.getAttribute('input[name="password"]', 'placeholder');
  expect(usernamePlaceholder?.toLowerCase()).toContain('email');
  expect(passwordPlaceholder?.toLowerCase()).toContain('mật khẩu');
});

test('ĐN_6: Giao diện: Logo hoặc tiêu đề trang hiển thị', async ({ page }) => {
  // Giả sử có logo hoặc tiêu đề với selector phổ biến
  const logo = page.locator('img[alt*="logo" i], .logo, h1, h2');
  await expect(logo.first()).toBeVisible();
});

test('ĐN_7: Đăng nhập thiếu username', async ({ page }) => {
  await page.fill('input[name="username"]', '');
  await page.fill('input[name="password"]', 'abcdef');
  await page.click('#btnsignin');
  await expect(page).toHaveURL('https://newday.com.vn/user/signin?redirect=/user/login');
  await expect(page.locator('div.form-group').nth(0).locator('.formErrorContent')).toBeVisible();
  // Kiểm tra có alert không
  const alertVisible = await page.locator('.alert, .alert-danger, .alert-error').isVisible().catch(() => false);
  if (alertVisible) {
    expect(alertVisible).toBeTruthy();
  }
});

test('ĐN_8: Đăng nhập thiếu password', async ({ page }) => {
  await page.fill('input[name="username"]', 'anhba766@gmail.com');
  await page.fill('input[name="password"]', '');
  await page.click('#btnsignin');
  await expect(page).toHaveURL('https://newday.com.vn/user/signin?redirect=/user/login');
  let errorVisible = false;
  try {
    errorVisible = await page.locator('div.form-group').nth(1).locator('.formErrorContent').isVisible({ timeout: 2000 });
  } catch {}
  if (!errorVisible) {
    // Nếu không có lỗi ở trường password, kiểm tra alert tổng
    const alertVisible = await page.locator('.alert, .alert-danger, .alert-error').isVisible().catch(() => false);
    expect(alertVisible).toBeTruthy();
  } else {
    expect(errorVisible).toBeTruthy();
  }
});

test('ĐN_9: Đăng nhập Thiếu cả hai', async ({ page }) => {
  await page.fill('input[name="username"]', '');
  await page.fill('input[name="password"]', '');
  await page.click('#btnsignin');
  await expect(page).toHaveURL('https://newday.com.vn/user/signin?redirect=/user/login');
  await expect(page.locator('div.form-group').nth(0).locator('.formErrorContent')).toBeVisible();
  await expect(page.locator('div.form-group').nth(1).locator('.formErrorContent')).toBeVisible();
  // Kiểm tra có alert không
  const alertVisible = await page.locator('.alert, .alert-danger, .alert-error').isVisible().catch(() => false);
  if (alertVisible) {
    expect(alertVisible).toBeTruthy();
  }
});

test('ĐN_10: Đăng nhập sai mật khẩu', async ({ page }) => {
  await page.fill('input[name="username"]', 'anhba766@gmail.com');
  await page.fill('input[name="password"]', 'saimatkhau');
  // Lắng nghe alert bằng Promise
  const dialogPromise = new Promise(resolve => {
    page.once('dialog', async dialog => {
      await dialog.dismiss();
      resolve(dialog.message());
    });
  });
  await page.click('#btnsignin');
  await expect(page).toHaveURL('https://newday.com.vn/user/signin?redirect=/user/login');
  const alertMessage = await dialogPromise;
  expect(alertMessage).toContain('không chính xác');
});

test('ĐN_11: Đăng nhập sai email', async ({ page }) => {
  await page.fill('input[name="username"]', 'saiuser@gmail.com');
  await page.fill('input[name="password"]', 'abcdef');
  const dialogPromise = new Promise(resolve => {
    page.once('dialog', async dialog => {
      await dialog.dismiss();
      resolve(dialog.message());
    });
  });
  await page.click('#btnsignin');
  await expect(page).toHaveURL('https://newday.com.vn/user/signin?redirect=/user/login');
  const alertMessage = await dialogPromise;
  expect(alertMessage).toContain('không chính xác');
});

test('ĐN_12: Đăng nhập với password hoa thường lộn xộn, mong đợi có thông báo lỗi', async ({ page }) => {
  await page.fill('input[name="username"]', 'anhba766@gmail.com');
  await page.fill('input[name="password"]', 'aBcDeF');
  await page.click('#btnsignin');
  await expect(page).toHaveURL('https://newday.com.vn/user/signin?redirect=/user/login');
  // Kiểm tra alert hoặc form error content
  let alertMessage = '';
  let errorText = '';
  const dialogPromise = new Promise(resolve => {
    page.once('dialog', async dialog => {
      alertMessage = dialog.message();
      await dialog.dismiss();
      resolve(alertMessage);
    });
  });
  await Promise.race([
    dialogPromise,
    page.waitForTimeout(2000)
  ]);
  if (alertMessage) {
    expect(alertMessage.toLowerCase()).toMatch(/không chính xác|sai|mật khẩu/);
  } else {
    try {
      const errorLocator = page.locator('.formErrorContent, .alert, .alert-danger, .alert-error');
      if (await errorLocator.isVisible({ timeout: 2000 })) {
        errorText = (await errorLocator.innerText()).toLowerCase();
      }
    } catch {}
    expect(errorText).toMatch(/không chính xác|sai|mật khẩu/);
  }
});

test('ĐN_13: Đăng nhập với username hoa thường lộn xộn', async ({ page }) => {
  await page.fill('input[name="username"]', 'AnHbA766@GmAil.CoM');
  await page.fill('input[name="password"]', 'abcdef');
  await page.click('#btnsignin');
  await expect(page).toHaveURL('https://newday.com.vn');
});

test('ĐN_14: Đăng nhập với cả tài khoản và mật khẩu đều hoa thường lộn xộn, mong đợi có thông báo lỗi', async ({ page }) => {
  await page.fill('input[name="username"]', 'AnHbA766@GmAil.CoM');
  await page.fill('input[name="password"]', 'aBcDeF');
  await page.click('#btnsignin');
  await expect(page).toHaveURL('https://newday.com.vn/user/signin?redirect=/user/login');
  let alertMessage = '';
  let errorText = '';
  const dialogPromise = new Promise(resolve => {
    page.once('dialog', async dialog => {
      alertMessage = dialog.message();
      await dialog.dismiss();
      resolve(alertMessage);
    });
  });
  await Promise.race([
    dialogPromise,
    page.waitForTimeout(2000)
  ]);
  if (alertMessage) {
    expect(alertMessage.toLowerCase()).toMatch(/không chính xác|sai|mật khẩu/);
  } else {
    try {
      const errorLocator = page.locator('.formErrorContent, .alert, .alert-danger, .alert-error');
      if (await errorLocator.isVisible({ timeout: 2000 })) {
        errorText = (await errorLocator.innerText()).toLowerCase();
      }
    } catch {}
    expect(errorText).toMatch(/không chính xác|sai|mật khẩu/);
  }
});

test('ĐN_14b: Đăng nhập sai tài khoản/mật khẩu quá 5 lần liên tiếp', async ({ page }) => {
  let lastAlert = '';
  for (let i = 1; i <= 10; i++) {
    await page.fill('input[name="username"]', 'saiuser@gmail.com');
    await page.fill('input[name="password"]', 'saimatkhau');
    const dialogPromise = new Promise(resolve => {
      page.once('dialog', async dialog => {
        await dialog.dismiss();
        resolve(dialog.message());
      });
    });
    await page.click('#btnsignin');
    await expect(page).toHaveURL('https://newday.com.vn/user/signin?redirect=/user/login');
    lastAlert = await dialogPromise;
    await page.waitForTimeout(500); // Chờ nhỏ giữa các lần thử
  }
  // Kiểm tra thông báo lần cuối cùng có thể là bị khóa hoặc cảnh báo vượt quá số lần
  expect(lastAlert.toLowerCase()).toMatch(/quá số lần|tạm khóa|vượt quá|thử lại/i);
});

test('ĐN_15: Đăng nhập đúng tài khoản và mật khẩu', async ({ page }) => {
  await page.fill('input[name="username"]', 'anhba766@gmail.com');
  await page.fill('input[name="password"]', 'abcdef');
  await page.click('#btnsignin');
  await expect(page).toHaveURL('https://newday.com.vn', { timeout: 10000 });
});





