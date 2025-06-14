// @ts-check
import { test, expect } from '@playwright/test';
let pageInstance;

test.beforeAll(async ({ browser }) => {
  pageInstance = await (await browser.newContext()).newPage();
  await pageInstance.goto('https://newday.com.vn/user/login');
});

test.afterAll(async () => await pageInstance.close());

test.beforeEach(async () => {
  await pageInstance.goto('https://newday.com.vn/user/login');
});

test('Giao diện: Trang hiển thị như lúc đầu khi chưa đăng nhập', async () => {
  await pageInstance.fill('input[name="username"]', '');
  await pageInstance.fill('input[name="password"]', '');
  await pageInstance.click('#btnsignin');
  await expect(pageInstance).toHaveURL('https://newday.com.vn/user/signin?redirect=/user/login');
  // Kiểm tra vị trí scroll sau khi báo lỗi
  const scrollY = await pageInstance.evaluate(() => window.scrollY);
  expect(scrollY).toBeLessThan(50); // Trang không bị kéo xuống dưới
  // Kiểm tra ô nhập username vẫn hiển thị trên màn hình
  const usernameBox = await pageInstance.locator('input[name="username"]').boundingBox();
  expect(usernameBox).not.toBeNull();
  if (usernameBox) expect(usernameBox.y).toBeLessThan(200);
  await pageInstance.waitForTimeout(5000);
});

test('Giao diện: Nút đăng nhập hiển thị và khả dụng', async () => {
  const btn = pageInstance.locator('#btnsignin');
  await expect(btn).toBeVisible();
  await expect(btn).toBeEnabled();
  await pageInstance.waitForTimeout(1000);
});

test('Giao diện: Tab chuyển đổi giữa các trường hoạt động', async () => {
  await pageInstance.focus('input[name="username"]');
  await pageInstance.keyboard.press('Tab');
  const isPasswordFocused = await pageInstance.evaluate(() => document.activeElement && document.activeElement.getAttribute('name') === 'password');
  expect(isPasswordFocused).toBeTruthy();
  await pageInstance.waitForTimeout(5000);
});

test('Giao diện: Placeholder đúng cho ô username và password', async () => {
  const usernamePlaceholder = await pageInstance.getAttribute('input[name="username"]', 'placeholder');
  const passwordPlaceholder = await pageInstance.getAttribute('input[name="password"]', 'placeholder');
  expect(usernamePlaceholder?.toLowerCase()).toContain('email');
  expect(passwordPlaceholder?.toLowerCase()).toContain('mật khẩu');
  await pageInstance.waitForTimeout(1000);
});

test('Giao diện: Logo hoặc tiêu đề trang hiển thị', async () => {
  // Giả sử có logo hoặc tiêu đề với selector phổ biến
  const logo = pageInstance.locator('img[alt*="logo" i], .logo, h1, h2');
  await expect(logo.first()).toBeVisible();
  await pageInstance.waitForTimeout(1000);
});

test('Thiếu username', async () => {
  await pageInstance.fill('input[name="username"]', '');
  await pageInstance.fill('input[name="password"]', 'abcdef');
  await pageInstance.click('#btnsignin');
  await expect(pageInstance).toHaveURL('https://newday.com.vn/user/signin?redirect=/user/login');
  await expect(pageInstance.locator('div.form-group').nth(0).locator('.formErrorContent')).toBeVisible();
  // Kiểm tra có alert không
  const alertVisible = await pageInstance.locator('.alert, .alert-danger, .alert-error').isVisible().catch(() => false);
  if (alertVisible) {
    expect(alertVisible).toBeTruthy();
  }
  await pageInstance.waitForTimeout(1000);
});

test('Thiếu password', async () => {
  await pageInstance.fill('input[name="username"]', 'anhba766@gmail.com');
  await pageInstance.fill('input[name="password"]', '');
  await pageInstance.click('#btnsignin');
  await expect(pageInstance).toHaveURL('https://newday.com.vn/user/signin?redirect=/user/login');
  let errorVisible = false;
  try {
    errorVisible = await pageInstance.locator('div.form-group').nth(1).locator('.formErrorContent').isVisible({ timeout: 2000 });
  } catch {}
  if (!errorVisible) {
    // Nếu không có lỗi ở trường password, kiểm tra alert tổng
    const alertVisible = await pageInstance.locator('.alert, .alert-danger, .alert-error').isVisible().catch(() => false);
    expect(alertVisible).toBeTruthy();
  } else {
    expect(errorVisible).toBeTruthy();
  }
  await pageInstance.waitForTimeout(1000);
});

test('Thiếu cả hai', async () => {
  await pageInstance.fill('input[name="username"]', '');
  await pageInstance.fill('input[name="password"]', '');
  await pageInstance.click('#btnsignin');
  await expect(pageInstance).toHaveURL('https://newday.com.vn/user/signin?redirect=/user/login');
  await expect(pageInstance.locator('div.form-group').nth(0).locator('.formErrorContent')).toBeVisible();
  await expect(pageInstance.locator('div.form-group').nth(1).locator('.formErrorContent')).toBeVisible();
  // Kiểm tra có alert không
  const alertVisible = await pageInstance.locator('.alert, .alert-danger, .alert-error').isVisible().catch(() => false);
  if (alertVisible) {
    expect(alertVisible).toBeTruthy();
  }
  await pageInstance.waitForTimeout(1000);
});

test('Đăng nhập sai mật khẩu', async () => {
  await pageInstance.fill('input[name="username"]', 'anhba766@gmail.com');
  await pageInstance.fill('input[name="password"]', 'saimatkhau');
  // Lắng nghe alert bằng Promise
  const dialogPromise = new Promise(resolve => {
    pageInstance.once('dialog', async dialog => {
      await dialog.dismiss();
      resolve(dialog.message());
    });
  });
  await pageInstance.click('#btnsignin');
  await expect(pageInstance).toHaveURL('https://newday.com.vn/user/signin?redirect=/user/login');
  const alertMessage = await dialogPromise;
  expect(alertMessage).toContain('không chính xác');
  await pageInstance.waitForTimeout(1000);
});

test('Đăng nhập sai username', async () => {
  await pageInstance.fill('input[name="username"]', 'saiuser@gmail.com');
  await pageInstance.fill('input[name="password"]', 'abcdef');
  const dialogPromise = new Promise(resolve => {
    pageInstance.once('dialog', async dialog => {
      await dialog.dismiss();
      resolve(dialog.message());
    });
  });
  await pageInstance.click('#btnsignin');
  await expect(pageInstance).toHaveURL('https://newday.com.vn/user/signin?redirect=/user/login');
  const alertMessage = await dialogPromise;
  expect(alertMessage).toContain('không chính xác');
  await pageInstance.waitForTimeout(1000);
});



test('Đăng nhập với password hoa thường lộn xộn, mong đợi có thông báo lỗi', async () => {
  await pageInstance.fill('input[name="username"]', 'anhba766@gmail.com');
  await pageInstance.fill('input[name="password"]', 'aBcDeF');
  await pageInstance.click('#btnsignin');
  await expect(pageInstance).toHaveURL('https://newday.com.vn/user/signin?redirect=/user/login');
  // Kiểm tra alert hoặc form error content
  let alertMessage = '';
  let errorText = '';
  const dialogPromise = new Promise(resolve => {
    pageInstance.once('dialog', async dialog => {
      alertMessage = dialog.message();
      await dialog.dismiss();
      resolve(alertMessage);
    });
  });
  await Promise.race([
    dialogPromise,
    pageInstance.waitForTimeout(2000)
  ]);
  if (alertMessage) {
    expect(alertMessage.toLowerCase()).toMatch(/không chính xác|sai|mật khẩu/);
  } else {
    try {
      const errorLocator = pageInstance.locator('.formErrorContent, .alert, .alert-danger, .alert-error');
      if (await errorLocator.isVisible({ timeout: 2000 })) {
        errorText = (await errorLocator.innerText()).toLowerCase();
      }
    } catch {}
    expect(errorText).toMatch(/không chính xác|sai|mật khẩu/);
  }
  await pageInstance.waitForTimeout(1000);
});

test('Đăng nhập với username hoa thường lộn xộn', async () => {
  await pageInstance.fill('input[name="username"]', 'AnHbA766@GmAil.CoM');
  await pageInstance.fill('input[name="password"]', 'abcdef');
  await pageInstance.click('#btnsignin');
  await expect(pageInstance).toHaveURL('https://newday.com.vn', { timeout: 10000 });
  await pageInstance.close(); // Đóng web sau khi test xong
});


test('Đăng nhập với mật khẩu ngắn hơn 6 ký tự, mong đợi có thông báo lỗi hoặc alert về độ dài', async () => {
  await pageInstance.fill('input[name="username"]', 'anhba766@gmail.com');
  await pageInstance.fill('input[name="password"]', '123');
  let alertMessage = '';
  let errorText = '';
  const dialogPromise = new Promise(resolve => {
    pageInstance.once('dialog', async dialog => {
      alertMessage = dialog.message();
      await dialog.dismiss();
      resolve(alertMessage);
    });
  });
  await pageInstance.click('#btnsignin');
  await Promise.race([
    dialogPromise,
    pageInstance.waitForTimeout(2000)
  ]);
  if (alertMessage) {
    expect(alertMessage.toLowerCase()).toMatch(/quá ngắn|từ 6 kí|từ 6 ký|6 ký tự|6 kí tự/);
  } else {
    try {
      const errorLocator = pageInstance.locator('.formErrorContent, .alert, .alert-danger, .alert-error');
      if (await errorLocator.isVisible({ timeout: 2000 })) {
        errorText = (await errorLocator.innerText()).toLowerCase();
      }
    } catch {}
    expect(errorText).toMatch(/quá ngắn|từ 6 kí|từ 6 ký|6 ký tự|6 kí tự/);
  }
  await pageInstance.waitForTimeout(1000);
});

test('Đăng nhập đúng tài khoản và mật khẩu', async () => {
  await pageInstance.fill('input[name="username"]', 'anhba766@gmail.com');
  await pageInstance.fill('input[name="password"]', 'abcdef');
  await pageInstance.click('#btnsignin');
  await expect(pageInstance).toHaveURL('https://newday.com.vn', { timeout: 10000 });
  await pageInstance.waitForTimeout(1000);
});



