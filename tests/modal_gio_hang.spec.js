import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('https://newday.com.vn/user/login');
  await page.fill('input[name="username"]', 'a@gmail.com');
  await page.fill('input[name="password"]', '123456');
  await page.click('#btnsignin');

  // Đảm bảo đang ở trang chủ sau beforeEach
  await expect(page).toHaveURL('https://newday.com.vn/');

  // 1. Tìm liên kết ảnh của sản phẩm đầu tiên
  const firstProductImageLink = page.locator('.product-information .product-detail a').first();

  // Kiểm tra xem liên kết ảnh có hiển thị và có thể nhấp vào không
  await expect(firstProductImageLink).toBeVisible();
  await expect(firstProductImageLink).toBeEnabled();

  // 2. Lấy URL đích từ thuộc tính href của liên kết ảnh
  const expectedRelativeUrl = await firstProductImageLink.getAttribute('href');
  // Chuyển đổi thành URL tuyệt đối để so sánh với page.toHaveURL()
  const fullExpectedUrl = `https://newday.com.vn${expectedRelativeUrl}`;
  console.log(`Expecting to navigate to: ${fullExpectedUrl}`);

  // 3. Nhấp vào liên kết ảnh sản phẩm
  await firstProductImageLink.click();
  console.log('Clicked on the first product image link.');

  // 4. Kiểm tra URL sau khi nhấp để đảm bảo đã chuyển đến trang chi tiết sản phẩm
  await expect(page).toHaveURL(fullExpectedUrl, { timeout: 10000 });
});

test('Xoá sản phẩm khỏi giỏ hàng', async ({ page }) => {
    // Chọn màu sắc (ví dụ: chọn màu TRẮNG)
    const colorOption = page.locator('.option2 li a[title="TRẮNG"]');
    await expect(colorOption).toBeVisible();
    await colorOption.click();
    
    // Chọn kích cỡ (ví dụ: chọn size M)
    const sizeOption = page.locator('span.size.req a', { hasText: 'M' });
    await expect(sizeOption).toBeVisible();
    await sizeOption.click({ delay: 500 });
    await expect(sizeOption).toHaveClass(/active/); // Kiểm tra xem class 'active' có được thêm vào không
    
    // Kiểm tra nút Thêm vào giỏ hàng đã sẵn sàng
    const addToCartBtn = page.locator('#js-add-cart');
    await expect(addToCartBtn).toBeVisible();
    await expect(addToCartBtn).toBeEnabled();
    
    // Nhấp vào nút Thêm vào giỏ hàng
    await addToCartBtn.click();
    
    const cartModal = page.locator('.modal-dialog.modal-lg.cart-modal');
    await expect(cartModal).toBeVisible();
    
    // Nhấp vào nút Xoá sản phẩm khỏi giỏ hàng
    const removeProductBtn = cartModal.locator('.removeCartItem');
    await expect(removeProductBtn).toBeVisible();
    await expect(removeProductBtn).toBeEnabled();
    await removeProductBtn.click();
    
    });
