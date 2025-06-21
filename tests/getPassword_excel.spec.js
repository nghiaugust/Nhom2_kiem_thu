const { test, expect } = require('@playwright/test');
const testcases = require('./getPassword_testcases.json');

const BASE_URL = 'https://newday.com.vn/user/getpassword';

test.use({ storageState: 'auth.json' });

test.describe('Quên mật khẩu từ file JSON', () => {
  for (const tc of testcases) {
    test(`${tc.id}: ${tc.name}`, async ({ page }) => {
      await page.goto(BASE_URL);
      if (tc.input && tc.input !== '(Trống)') {
        await page.fill('input#newpassword', tc.input);
      }
      await page.click('#btnSubmit');
      // Kiểm tra kết quả mong đợi
      if (tc.expected.includes('.formErrorContent')) {
        const errorLocator = page.locator('.formErrorContent');
        await expect(errorLocator).toBeVisible();
      } else if (tc.expected.includes('định dạng email')) {
        await expect(page.locator('.title-modal')).toContainText(/định dạng|email/i);
      } else if (tc.expected.includes('không tìm thấy tài khoản')) {
        await expect(page.locator('.title-modal')).toContainText(/không tìm thấy|không tồn tại|email/i);
      } else if (tc.expected.includes('Đang xử lý')) {
        await expect(page.locator('.title-modal')).toContainText(/đang xử lý/i);
      }
    });
  }
});
