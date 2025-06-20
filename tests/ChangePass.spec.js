import { test, expect } from '@playwright/test';

let page;
test.beforeAll(async ({ browser }) => {
  page = await browser.newPage();
  await page.goto('https://newday.com.vn/user/login');
  await page.fill('input[name="username"]', 'anhba766@gmail.com');
  await page.fill('input[name="password"]', 'abcdef');
  await page.click('#btnsignin');
  await expect(page).toHaveURL('https://newday.com.vn');
   await page.context().storageState({ path: 'auth.json' });
  await page.goto('https://newday.com.vn/profile/changepassword');
});

test.afterAll(async () => {
  await page.close();
});

test('CP_1. Hiển thị đúng các trường đổi mật khẩu', async () => {
  await expect(page.locator('input[placeholder="Mật khẩu cũ"]')).toBeVisible();
  await expect(page.locator('input[placeholder="Mật khẩu mới"]')).toBeVisible();
  await expect(page.locator('input[placeholder="Xác Mật khẩu"]')).toBeVisible();
  await expect(page.locator('button', { hasText: 'Xác nhận' })).toBeVisible();
});

test('CP_2. Báo lỗi khi để trống tất cả các trường', async () => {
  await page.goto('https://newday.com.vn/profile/changepassword');
  await page.click('button:has-text("Xác nhận")');
  const errorDiv = page.locator('div.formErrorContent').first();
  await expect(errorDiv).toBeVisible();
  await expect(errorDiv).toContainText('* Trường này bắt buộc');
  await expect(errorDiv).toContainText('* Tối thiểu 6 số ký tự được cho phép');
});

test('CP_3. Báo lỗi khi để trống mật khẩu cũ', async () => {
  await page.goto('https://newday.com.vn/profile/changepassword');
  await page.fill('input[placeholder="Mật khẩu mới"]', 'newpassword123');
  await page.fill('input[placeholder="Xác Mật khẩu"]', 'newpassword123');
  await page.click('button:has-text("Xác nhận")');
  const errorDiv = page.locator('div.formErrorContent').first();
  await expect(errorDiv).toBeVisible();
  await expect(errorDiv).toContainText('* Trường này bắt buộc');
});

test('CP_4. Báo lỗi khi để trống mật khẩu mới', async () => {
  await page.goto('https://newday.com.vn/profile/changepassword');
  await page.fill('input[placeholder="Mật khẩu cũ"]', 'abcdef');
  await page.fill('input[placeholder="Xác Mật khẩu"]', 'newpassword123');
  await page.click('button:has-text("Xác nhận")');
  const errorDiv = page.locator('div.formErrorContent').first();
  await expect(errorDiv).toBeVisible();
  await expect(errorDiv).toContainText('* Trường này bắt buộc');
});

test('CP_5. Báo lỗi khi để trống mật khẩu xác nhận', async () => {
  await page.goto('https://newday.com.vn/profile/changepassword');
  await page.fill('input[placeholder="Mật khẩu cũ"]', 'abcdef');
  await page.fill('input[placeholder="Mật khẩu mới"]', 'newpassword123');
  await page.click('button:has-text("Xác nhận")');
  const errorDiv = page.locator('div.formErrorContent').first();
  await expect(errorDiv).toBeVisible();
  await expect(errorDiv).toContainText('* Trường này bắt buộc');
});

test('CP_6. Báo lỗi khi nhập sai mật khẩu cũ', async () => {
  await page.goto('https://newday.com.vn/profile/changepassword');
  await page.fill('input[placeholder="Mật khẩu cũ"]', 'saimatkhau');
  await page.fill('input[placeholder="Mật khẩu mới"]', 'newpassword123');
  await page.fill('input[placeholder="Xác Mật khẩu"]', 'newpassword123');
  await page.click('button:has-text("Xác nhận")');
  await expect(page.locator('.formErrorContent, .alert, .alert-danger, .alert-error')).toBeVisible();
});

test('CP_7. Báo lỗi khi mật khẩu mới và xác nhận không khớp', async () => {
  await page.goto('https://newday.com.vn/profile/changepassword');
  await page.fill('input[placeholder="Mật khẩu cũ"]', 'abcdef');
  await page.fill('input[placeholder="Mật khẩu mới"]', 'newpassword123');
  await page.fill('input[placeholder="Xác Mật khẩu"]', 'newpassword456');
  await page.click('button:has-text("Xác nhận")');
  await expect(page.locator('.formErrorContent, .alert, .alert-danger, .alert-error')).toBeVisible();
});

test('CP_8. Báo lỗi khi mật khẩu mới ngắn hơn 6 ký tự', async () => {
  await page.goto('https://newday.com.vn/profile/changepassword');
  await page.fill('input[placeholder="Mật khẩu cũ"]', 'abcdef');
  await page.fill('input[placeholder="Mật khẩu mới"]', '123');
  await page.fill('input[placeholder="Xác Mật khẩu"]', '123');
  await page.click('button:has-text("Xác nhận")');
  const errorDiv = page.locator('div.formErrorContent').first();
  await expect(errorDiv).toBeVisible();
  await expect(errorDiv).toContainText('Tối thiểu 6 số ký tự được cho phép');
});

test('CP_9. Báo lỗi khi mật khẩu mới giống mật khẩu cũ', async () => {
  await page.goto('https://newday.com.vn/profile/changepassword');
  await page.fill('input[placeholder="Mật khẩu cũ"]', 'abcdef');
  await page.fill('input[placeholder="Mật khẩu mới"]', 'abcdef');
  await page.fill('input[placeholder="Xác Mật khẩu"]', 'abcdef');
  await page.click('button:has-text("Xác nhận")');
  const errorDiv = page.locator('div.formErrorContent').first();
  await expect(errorDiv).toBeVisible();
  await expect(errorDiv).toContainText('không được trùng với mật khẩu cũ');
});

test('CP_10. Chấp nhận mật khẩu mới có ký tự đặc biệt', async () => {
  await page.goto('https://newday.com.vn/profile/changepassword');
  await page.fill('input[placeholder="Mật khẩu cũ"]', 'abcdef');
  await page.fill('input[placeholder="Mật khẩu mới"]', 'new@pass!123');
  await page.fill('input[placeholder="Xác Mật khẩu"]', 'new@pass!123');
  await page.click('button:has-text("Xác nhận")');
  const successAlert = page.locator('.alert-success, .alert, .alert-info')
  await expect(successAlert).toContainText('thành công');
  // Đổi lại về mật khẩu cũ để không ảnh hưởng test khác
  await page.fill('input[placeholder="Mật khẩu cũ"]', 'new@pass!123');
  await page.fill('input[placeholder="Mật khẩu mới"]', 'abcdef');
  await page.fill('input[placeholder="Xác Mật khẩu"]', 'abcdef');
  await page.click('button:has-text("Xác nhận")');
});

test('CP_11. Đổi mật khẩu thành công với thông tin hợp lệ', async () => {
  await page.goto('https://newday.com.vn/profile/changepassword');
  await page.fill('input[placeholder="Mật khẩu cũ"]', 'abcdef');
  await page.fill('input[placeholder="Mật khẩu mới"]', 'newpassword123');
  await page.fill('input[placeholder="Xác Mật khẩu"]', 'newpassword123');
  await page.click('button:has-text("Xác nhận")');
  await expect(page.locator('.alert-success, .alert, .alert-info')).toContainText('thành công');
  // Đổi lại về mật khẩu cũ để không ảnh hưởng test khác
  await page.fill('input[placeholder="Mật khẩu cũ"]', 'newpassword123');
  await page.fill('input[placeholder="Mật khẩu mới"]', 'abcdef');
  await page.fill('input[placeholder="Xác Mật khẩu"]', 'abcdef');
  await page.click('button:has-text("Xác nhận")');
  await expect(page.locator('.alert-success, .alert, .alert-info')).toContainText('thành công');
});
