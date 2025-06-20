import { test, expect } from '@playwright/test';

const BASE_URL = 'https://newday.com.vn/user/getpassword';
const LOGIN_URL = 'https://newday.com.vn/user/login';

// Đăng nhập 1 lần trước tất cả các test
let page;
test.beforeAll(async ({ browser }) => {
  page = await browser.newPage();
  await page.goto(LOGIN_URL);
  await page.fill('input[name="username"]', 'anhba766@gmail.com');
  await page.fill('input[name="password"]', 'abcdef');
  await page.click('#btnsignin');
  await expect(page).toHaveURL('https://newday.com.vn');
  await page.waitForTimeout(1000);
});

test.afterAll(async () => {
  await page.close();
});

// TC_1: Để trống ô nhập
// Mong đợi: Báo lỗi yêu cầu nhập

test('TC_1: Để trống ô nhập (đã đăng nhập)', async () => {
  await page.goto(BASE_URL);
  await page.click('#btnSubmit');
  await page.waitForTimeout(500);
  const errorLocator = page.locator('.formErrorContent');
  await expect(errorLocator).toBeVisible({ timeout: 5000 });
  await expect(errorLocator).toContainText(/trường này bắt buộc|tối thiểu 4 số ký tự/i);
});

// TC_2: Nhập email không hợp lệ (không đúng định dạng)
// Mong đợi: Báo lỗi định dạng email

test('TC_2: Email không hợp lệ (đã đăng nhập)', async () => {
  await page.goto(BASE_URL);
  await page.type('input#newpassword', 'abc123', { delay: 100 });
  await page.locator('input#newpassword').blur();
  await page.waitForTimeout(500);
  await page.click('#btnSubmit');
  try {
    await expect(page.locator('.title-modal')).toBeVisible({ timeout: 10000 });
  } catch (e) {
    // Đã xoá chụp ảnh khi lỗi
    throw e;
  }
  await expect(page.locator('.title-modal')).toContainText(/email|định dạng|hợp lệ/i);
});

// TC_3: Email hợp lệ nhưng không tồn tại trong hệ thống
// Mong đợi: Báo lỗi không tìm thấy tài khoản

test('TC_3: Email hợp lệ nhưng không tồn tại (đã đăng nhập)', async () => {
  await page.goto(BASE_URL);
  await page.type('input#newpassword', 'notfound9999@example.com', { delay: 100 });
  await page.locator('input#newpassword').blur();
  await page.waitForTimeout(500);
  await page.click('#btnSubmit');
  try {
    await expect(page.locator('.title-modal')).toBeVisible({ timeout: 10000 });
  } catch (e) {
    // Đã xoá chụp ảnh khi lỗi
    throw e;
  }
  await expect(page.locator('.title-modal')).toContainText(/không tồn tại|không tìm thấy|email|tên đăng nhập/i);
});

// TC_4: Email hợp lệ và tồn tại trong hệ thống
// Mong đợi: Hiển thị modal "Đang xử lý" trước, sau đó thông báo gửi email thành công

test('TC_4: Email hợp lệ và tồn tại (đã đăng nhập) - kiểm tra modal Đang xử lý', async () => {
  await page.goto(BASE_URL);
  await page.type('input#newpassword', 'anhba766@gmail.com', { delay: 100 });
  await page.locator('input#newpassword').blur();
  await page.waitForTimeout(500);
  await page.click('#btnSubmit');
  await expect(page.locator('.title-modal')).toBeVisible({ timeout: 10000 });
  await expect(page.locator('.title-modal')).toContainText(/đang xử lý/i);
});

// TC_5: Email hợp lệ, chữ hoa chữ thường lộn xộn
// Mong đợi: Hiển thị modal "Đang xử lý" trước, sau đó thông báo gửi email thành công

test('TC_5: Email hợp lệ, chữ hoa chữ thường lộn xộn (đã đăng nhập) - kiểm tra modal Đang xử lý', async () => {
  await page.goto(BASE_URL);
  await page.type('input#newpassword', 'AnHbA766@GmAil.CoM', { delay: 100 });
  await page.locator('input#newpassword').blur();
  await page.waitForTimeout(500);
  await page.click('#btnSubmit');
  await expect(page.locator('.title-modal')).toBeVisible({ timeout: 10000 });
  await expect(page.locator('.title-modal')).toContainText(/đang xử lý/i);
});


