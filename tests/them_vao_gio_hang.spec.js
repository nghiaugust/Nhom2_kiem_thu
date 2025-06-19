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

  // 4. Kiểm tra URL sau khi nhấp để đảm bảo đã chuyển đến trang chi tiết sản phẩm
  await expect(page).toHaveURL(fullExpectedUrl, { timeout: 10000 });
});


test('Chọn màu sắc và kích cỡ sản phẩm', async ({ page }) => {

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
  
  await context.storageState({ path: 'state.json' });
});

test('Khi click vào màu đầu tiên, màu đó sẽ được chọn', async ({ page }) => {

  const firstColorOption = page.locator('ul.option.option2 li a').first();

  // Kiểm tra xem tùy chọn màu đầu tiên có hiển thị và có thể nhấp được không
  await expect(firstColorOption).toBeVisible();
  await expect(firstColorOption).toBeEnabled();

  const firstColorName = await firstColorOption.getAttribute('title');
  console.log(`Đang kiểm tra màu đầu tiên: ${firstColorName || 'Không rõ tên'}`);

  // Nhấp vào tùy chọn màu đầu tiên
  await firstColorOption.click();

  await expect(firstColorOption).toHaveClass(/active/, { timeout: 5000 }); 
  console.log(`Màu "${firstColorName || 'Không rõ tên'}" đã được chọn thành công và có class 'active'.`);

});

test('Khi click vào kích cỡ đầu tiên mà không chọn màu, kích cỡ đó sẽ được chọn', async ({ page }) => {
  const firstSizeOption = page.locator('span.size.req a').first();

  // Kiểm tra xem tùy chọn kích cỡ đầu tiên có hiển thị và có thể nhấp được không
  await expect(firstSizeOption).toBeVisible();
  await expect(firstSizeOption).toBeEnabled();

  const firstSizeName = await firstSizeOption.textContent();
  console.log(`Đang kiểm tra kích cỡ đầu tiên: ${firstSizeName || 'Không rõ tên'}`);

  // Nhấp vào tùy chọn kích cỡ đầu tiên
  await firstSizeOption.click({ delay: 500 });

  await expect(firstSizeOption).toHaveClass(/active/, { timeout: 5000 });
  console.log(`Kích cỡ "${firstSizeName || 'Không rõ tên'}" đã được chọn thành công và có class 'active'.`);
});

test('Khi click vào kích cỡ đầu tiên mà có chọn màu trước, kích cỡ đó sẽ được chọn', async ({ page }) => {
  const firstSizeOption = page.locator('span.size.req a').first();
  const firstColorOption = page.locator('ul.option.option2 li a').first();

  // Kiểm tra xem tùy chọn màu đầu tiên có hiển thị và có thể nhấp được không
  await expect(firstColorOption).toBeVisible();
  await expect(firstColorOption).toBeEnabled();

  const firstColorName = await firstColorOption.getAttribute('title');
  console.log(`Đang kiểm tra màu đầu tiên: ${firstColorName || 'Không rõ tên'}`);

  // Nhấp vào tùy chọn màu đầu tiên
  await firstColorOption.click();

  await expect(firstColorOption).toHaveClass(/active/, { timeout: 5000 }); 
  console.log(`Màu "${firstColorName || 'Không rõ tên'}" đã được chọn thành công và có class 'active'.`);

  // Kiểm tra xem tùy chọn kích cỡ đầu tiên có hiển thị và có thể nhấp được không
  await expect(firstSizeOption).toBeVisible();
  await expect(firstSizeOption).toBeEnabled();

  const firstSizeName = await firstSizeOption.textContent();
  console.log(`Đang kiểm tra kích cỡ đầu tiên: ${firstSizeName || 'Không rõ tên'}`);

  // Nhấp vào tùy chọn kích cỡ đầu tiên
  await firstSizeOption.click({ delay: 500 });

  await expect(firstSizeOption).toHaveClass(/active/, { timeout: 5000 });
  console.log(`Kích cỡ "${firstSizeName || 'Không rõ tên'}" đã được chọn thành công và có class 'active'.`);
});

test('Tăng số lượng sản phẩm', async ({ page }) => {
    const quantityInput = page.locator('input#psQtt'); // Ô nhập số lượng 
    const incrementButton = page.locator('a#QtyUp'); // Nút '+' 

    await test.step('Lấy số lượng ban đầu và tăng lên 1', async () => {
      await expect(quantityInput).toHaveValue('1'); // Giá trị mặc định 
      await incrementButton.click();
      await expect(quantityInput).toHaveValue('2');
    });

    await test.step('Tiếp tục tăng số lượng lên 4', async () => {
      await incrementButton.click(); // -> 3
      await incrementButton.click(); // -> 4
      await expect(quantityInput).toHaveValue('4');
    });

    console.log('Test Case Tăng số lượng sản phẩm thành công.');
  });

  test('Giảm số lượng sản phẩm', async ({ page }) => {
    
    const quantityInput = page.locator('input#psQtt'); // Ô nhập số lượng 
    const decrementButton = page.locator('a#QtyDown'); // Nút '-' 
    const incrementButton = page.locator('a#QtyUp'); // Nút '+' 

    await test.step('Tăng số lượng lên để có thể giảm', async () => {
      await incrementButton.click(); // 2
      await incrementButton.click(); // 3
      await expect(quantityInput).toHaveValue('3');
    });

    await test.step('Giảm số lượng một lần', async () => {
      await decrementButton.click();
      await expect(quantityInput).toHaveValue('2');
    });

    await test.step('Giảm số lượng thêm một lần nữa', async () => {
      await decrementButton.click();
      await expect(quantityInput).toHaveValue('1');
    });

    console.log('Test Case Giảm số lượng sản phẩm thành công.');
  });

  test('Giảm số lượng sản phẩm khi đang ở 1', async ({ page }) => {
    const quantityInput = page.locator('input#psQtt'); // Ô nhập số lượng 
    const decrementButton = page.locator('a#QtyDown'); // Nút '-' 
    const incrementButton = page.locator('a#QtyUp'); // Nút '+' 

    await test.step('Tăng số lượng lên cao hơn 1', async () => {
      await incrementButton.click(); // 2
      await incrementButton.click(); // 3
      await expect(quantityInput).toHaveValue('3');
    });

    await test.step('Giảm số lượng về 1', async () => {
      await decrementButton.click(); // -> 2
      await decrementButton.click(); // -> 1
      await expect(quantityInput).toHaveValue('1');
    });

    await test.step('Thử giảm số lượng khi đang là 1', async () => {
      await decrementButton.click(); // Thử giảm tiếp
      await expect(quantityInput).toHaveValue('1'); 
    });    console.log('Test Case Giảm số lượng sản phẩm khi đang ở 1 thành công.');
  });

  test('Nhập số lượng là 0', async ({ page }) => {
    const quantityInput = page.locator('input#psQtt'); // Ô nhập số lượng 

    await quantityInput.fill('0');
    // tự động điều chỉnh về giá trị min (1)
    await expect(quantityInput).toHaveValue('1'); //điều chỉnh về 1 

    console.log('Test Case Nhập số lượng là 0 - xử lý đúng.');
  });

  // Test Case Nhập số lượng âm
  test('Nhập số lượng âm', async ({ page }) => {
    const quantityInput = page.locator('input#psQtt'); // Ô nhập số lượng 

    await quantityInput.fill('-5');
    await expect(quantityInput).toHaveValue('1'); // tự động về giá trị  (1) 

    console.log('Test Case Nhập số lượng âm - xử lý đúng.');
  });

  test('Nhập ký tự chữ', async ({ page }) => {
    const quantityInput = page.locator('input#psQtt'); // Ô nhập số lượng 

    await quantityInput.fill('abc');
    // Thường sẽ bị xóa hoặc điều chỉnh về giá trị số hợp lệ cuối cùng.
    await expect(quantityInput).toHaveValue('1'); // 

    console.log('Test Case Nhập ký tự chữ - xử lý đúng.');
  });

  test(' Nhập số lượng vượt quá tồn kho', async ({ page }) => {
    const quantityInput = page.locator('input#psQtt'); // Ô nhập số lượng 

    await quantityInput.fill('100'); // max="57" 
    await expect(quantityInput).toHaveValue('57'); // Giả định tự động điều chỉnh về max 

    console.log('Test Case Nhập số lượng vượt quá tồn kho - xử lý đúng.');
  });