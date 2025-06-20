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


test('Chọn đủ màu sắc và kích cỡ sản phẩm', async ({ page }) => {

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

  //await context.storageState({ path: 'state.json' });
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

    //Sử dụng type() với delay để mô phỏng gõ từng ký tự
    await quantityInput.clear(); // Xóa giá trị hiện tại trước
    await quantityInput.type('100', { delay: 200 }); // Delay 200ms giữa mỗi ký tự
    
    await expect(quantityInput).toHaveValue('60'); // Giả định tự động điều chỉnh về max 

    console.log('Test Case Nhập số lượng vượt quá tồn kho - xử lý đúng.');
  });

  // Test case validation khi không chọn màu và size
  test('Không chọn màu và size - bấm Thêm vào giỏ hàng', async ({ page }) => {
    // Đảm bảo không có màu và size nào được chọn (reset về trạng thái ban đầu)
    await page.reload();
      // Kiểm tra nút "Thêm vào giỏ hàng" có tooltip warning
    const addToCartBtn = page.locator('#js-add-cart');    await expect(addToCartBtn).toBeVisible();
    
    // Kiểm tra nút có trạng thái không thể chọn (ck="0")
    await expect(addToCartBtn).toHaveAttribute('ck', '0');
    
    // Kiểm tra có tooltip warning
    await expect(addToCartBtn).toHaveAttribute('data-original-title', 'Vui lòng chọn màu sắc hoặc kích cỡ');
    
    // Kiểm tra title attribute có thể rỗng hoặc không có
    const titleAttr = await addToCartBtn.getAttribute('title');
    console.log(`Title attribute: "${titleAttr}"`);
    
    // Kiểm tra nút không được enable để thêm vào giỏ hàng
    const ckValue = await addToCartBtn.getAttribute('ck');
    expect(ckValue).toBe('0');
    
    // Click vào nút và kiểm tra không có hành động gì xảy ra (nút bị disabled)
    await addToCartBtn.click();
    
    // Kiểm tra tooltip vẫn hiển thị thông báo lỗi
    await expect(addToCartBtn).toHaveAttribute('data-original-title', 'Vui lòng chọn màu sắc hoặc kích cỡ');
    
    console.log('Test Case: Không chọn màu và size - bấm Thêm vào giỏ hàng - Hiển thị cảnh báo đúng');
  });

  test('Không chọn màu và size - bấm Mua ngay', async ({ page }) => {    // Đảm bảo không có màu và size nào được chọn (reset về trạng thái ban đầu)
    await page.reload();
    
    // Kiểm tra nút "Mua ngay"
    const buyNowBtn = page.locator('#addToCart');
    await expect(buyNowBtn).toBeVisible();
    
    // Kiểm tra nút có trạng thái không thể chọn (ck="0")
    await expect(buyNowBtn).toHaveAttribute('ck', '0');
    
    // Kiểm tra có tooltip warning
    await expect(buyNowBtn).toHaveAttribute('data-original-title', 'Vui lòng chọn màu sắc hoặc kích cỡ');
    
    // Kiểm tra nút không được enable để mua ngay
    const ckValue = await buyNowBtn.getAttribute('ck');
    expect(ckValue).toBe('0');
    
    // Click vào nút và kiểm tra không có hành động gì xảy ra (nút bị disabled)
    await buyNowBtn.click();
    
    // Kiểm tra tooltip vẫn hiển thị thông báo lỗi
    await expect(buyNowBtn).toHaveAttribute('data-original-title', 'Vui lòng chọn màu sắc hoặc kích cỡ');
    
    console.log('Test Case: Không chọn màu và size - bấm Mua ngay - Hiển thị cảnh báo đúng');
  });

  test('Chọn màu nhưng không chọn size - bấm Thêm vào giỏ hàng', async ({ page }) => {
    // Reset về trạng thái ban đầu
    await page.reload();
    
    // Chọn màu sắc (ví dụ: chọn màu TRẮNG)
    const colorOption = page.locator('.option2 li a[title="TRẮNG"]');
    await expect(colorOption).toBeVisible();
    await colorOption.click();
    
    // Đảm bảo không chọn size nào
    // Kiểm tra không có size nào có class "active"
    const activeSizes = page.locator('span.size.req a.active');
    await expect(activeSizes).toHaveCount(0);
      // Kiểm tra nút "Thêm vào giỏ hàng" vẫn hiển thị cảnh báo
    const addToCartBtn = page.locator('#js-add-cart');    await expect(addToCartBtn).toBeVisible();
    
    // Kiểm tra nút vẫn có trạng thái không thể chọn (ck="0") vì chưa chọn size
    await expect(addToCartBtn).toHaveAttribute('ck', '0');
    
    // Kiểm tra vẫn có tooltip warning
    await expect(addToCartBtn).toHaveAttribute('data-original-title', /Vui lòng chọn màu sắc hoặc kích cỡ/);
    
    // Click vào nút và kiểm tra không có hành động gì xảy ra
    await addToCartBtn.click();
    
    // Sau khi click, kiểm tra lại ck vẫn là "0"
    const ckValueAfterClick = await addToCartBtn.getAttribute('ck');
    expect(ckValueAfterClick).toBe('0');
    
    console.log('Test Case: Chọn màu nhưng không chọn size - bấm Thêm vào giỏ hàng - Hiển thị cảnh báo đúng');
  });

  test('Chọn màu nhưng không chọn size - bấm Mua ngay', async ({ page }) => {
    // Reset về trạng thái ban đầu
    await page.reload();
    
    // Chọn màu sắc (ví dụ: chọn màu TRẮNG)
    const colorOption = page.locator('.option2 li a[title="TRẮNG"]');
    await expect(colorOption).toBeVisible();
    await colorOption.click();
    
    // Đảm bảo không chọn size nào
    // Kiểm tra không có size nào có class "active"
    const activeSizes = page.locator('span.size.req a.active');
    await expect(activeSizes).toHaveCount(0);    // Kiểm tra nút "Mua ngay" vẫn hiển thị cảnh báo
    const buyNowBtn = page.locator('#addToCart');
    await expect(buyNowBtn).toBeVisible();
    
    // Kiểm tra nút vẫn có trạng thái không thể chọn (ck="0") vì chưa chọn size
    await expect(buyNowBtn).toHaveAttribute('ck', '0');
    
    // Kiểm tra vẫn có tooltip warning
    await expect(buyNowBtn).toHaveAttribute('data-original-title', /Vui lòng chọn màu sắc hoặc kích cỡ/);
    
    // Click vào nút và kiểm tra không có hành động gì xảy ra
    await buyNowBtn.click();
    
    // Sau khi click, kiểm tra lại ck vẫn là "0"
    const ckValueAfterClick = await buyNowBtn.getAttribute('ck');
    expect(ckValueAfterClick).toBe('0');
    
    console.log('Test Case: Chọn màu nhưng không chọn size - bấm Mua ngay - Hiển thị cảnh báo đúng');
  });

  test('Kiểm tra trạng thái nút khi đã chọn đủ màu và size', async ({ page }) => {
    // Reset về trạng thái ban đầu
    await page.reload();
    
    // Chọn màu sắc (ví dụ: chọn màu TRẮNG)
    const colorOption = page.locator('.option2 li a[title="TRẮNG"]');
    await expect(colorOption).toBeVisible();
    await colorOption.click();
    
    // Chọn kích cỡ (ví dụ: chọn size M)
    const sizeOption = page.locator('span.size.req a', { hasText: 'M' });
    await expect(sizeOption).toBeVisible();
    await sizeOption.click({ delay: 500 });
    
    // Chờ một chút để UI cập nhật
    await page.waitForTimeout(1000);
    
    // Kiểm tra nút "Thêm vào giỏ hàng" đã được kích hoạt
    const addToCartBtn = page.locator('#js-add-cart');
    await expect(addToCartBtn).toBeVisible();
    
    // Kiểm tra nút có trạng thái có thể chọn (ck="1")
    await expect(addToCartBtn).toHaveAttribute('ck', '1');
    
    // Kiểm tra không còn tooltip warning (không có data-original-title với nội dung cảnh báo)
    const originalTitleAttr = await addToCartBtn.getAttribute('data-original-title');
    // Có thể là null hoặc không chứa thông báo cảnh báo
    if (originalTitleAttr) {
      expect(originalTitleAttr).not.toContain(/Vui lòng chọn/);
    }
    
    // Kiểm tra nút "Mua ngay" cũng được kích hoạt
    const buyNowBtn = page.locator('#addToCart');
    await expect(buyNowBtn).toBeVisible();
    await expect(buyNowBtn).toHaveAttribute('ck', '1');
    
    console.log('Test Case: Đã chọn đủ màu và size - Nút được kích hoạt (ck="1")');
  });

  test('Kiểm tra modal hiển thị sau khi thêm vào giỏ hàng - Bấm "Tiếp tục mua hàng"', async ({ page }) => {
    
    // Chọn màu sắc (ví dụ: chọn màu TRẮNG)
    const colorOption = page.locator('.option2 li a[title="TRẮNG"]');
    await expect(colorOption).toBeVisible();
    await colorOption.click();
    
    // Chọn kích cỡ (ví dụ: chọn size M)
    const sizeOption = page.locator('span.size.req a', { hasText: 'M' });
    await expect(sizeOption).toBeVisible();
    await sizeOption.click({ delay: 500 });
    
    // Chờ nút được kích hoạt
    await page.waitForTimeout(1000);
    
    // Kiểm tra modal backdrop không có trước khi thêm vào giỏ hàng
    const modalBackdropBefore = page.locator('.modal-backdrop.fade.in');
    await expect(modalBackdropBefore).toHaveCount(0);
    
    // Click nút "Thêm vào giỏ hàng"
    const addToCartBtn = page.locator('#js-add-cart');
    await expect(addToCartBtn).toHaveAttribute('ck', '1');
    await addToCartBtn.click();
    
    // Chờ modal hiển thị
    await page.waitForTimeout(1000);
      // Kiểm tra modal backdrop đã xuất hiện
    const modalBackdropAfter = page.locator('.modal-backdrop.fade.in');
    await expect(modalBackdropAfter).toBeVisible();
    console.log('Modal đã hiển thị với backdrop');
    
    // Kiểm tra 2 nút trong modal hiển thị
    const continueShopping = page.locator('#close-modal');
    const checkoutNow = page.locator('a[href="/cart/checkout"].btn.btn-success');
    
    await expect(continueShopping).toBeVisible();
    await expect(continueShopping).toContainText('Tiếp tục mua hàng');
    
    await expect(checkoutNow).toBeVisible();
    await expect(checkoutNow).toContainText('Thanh toán ngay');
    
    console.log('Cả 2 nút trong modal đều hiển thị đúng');
    
    // Click "Tiếp tục mua hàng"
    await continueShopping.click();
    
    // Chờ modal đóng
    await page.waitForTimeout(1000);
    
    // Kiểm tra modal backdrop đã biến mất
    const modalBackdropClosed = page.locator('.modal-backdrop.fade.in');
    await expect(modalBackdropClosed).toHaveCount(0);
    console.log('Modal đã đóng - backdrop không còn hiển thị');
    
    // Kiểm tra vẫn ở trang hiện tại (không chuyển trang)
    await expect(page).toHaveURL(/quan-suong-dai-2-lop-soda/);
    console.log('Test Case: Bấm "Tiếp tục mua hàng" - Modal đóng và không chuyển trang');
  });

  test('Kiểm tra modal hiển thị sau khi thêm vào giỏ hàng - Bấm "Thanh toán ngay"', async ({ page }) => {
    // Reset và chọn đủ màu, size
    await page.reload();
    
    // Chọn màu sắc (ví dụ: chọn màu TRẮNG)
    const colorOption = page.locator('.option2 li a[title="TRẮNG"]');
    await expect(colorOption).toBeVisible();
    await colorOption.click();
    
    // Chọn kích cỡ (ví dụ: chọn size M)
    const sizeOption = page.locator('span.size.req a', { hasText: 'M' });
    await expect(sizeOption).toBeVisible();
    await sizeOption.click({ delay: 500 });
    
    // Chờ nút được kích hoạt
    await page.waitForTimeout(1000);
    
    // Kiểm tra modal backdrop không có trước khi thêm vào giỏ hàng
    const modalBackdropBefore = page.locator('.modal-backdrop.fade.in');
    await expect(modalBackdropBefore).toHaveCount(0);
    
    // Click nút "Thêm vào giỏ hàng"
    const addToCartBtn = page.locator('#js-add-cart');
    await expect(addToCartBtn).toHaveAttribute('ck', '1');
    await addToCartBtn.click();
    
    // Chờ modal hiển thị
    await page.waitForTimeout(2000);
    
    // Kiểm tra modal backdrop đã xuất hiện
    const modalBackdropAfter = page.locator('.modal-backdrop.fade.in');
    await expect(modalBackdropAfter).toBeVisible();
    console.log('Modal đã hiển thị với backdrop');    
    // Kiểm tra 2 nút trong modal hiển thị
    const continueShopping = page.locator('#close-modal');
    const checkoutNow = page.locator('a[href="/cart/checkout"].btn.btn-success');
    
    await expect(continueShopping).toBeVisible();
    await expect(continueShopping).toContainText('Tiếp tục mua hàng');
    
    await expect(checkoutNow).toBeVisible();
    await expect(checkoutNow).toContainText('Thanh toán ngay');
    
    console.log('Cả 2 nút trong modal đều hiển thị đúng');
    
    // Click "Thanh toán ngay"
    await checkoutNow.click();
    
    // Chờ chuyển trang
    await page.waitForTimeout(2000);
    
    // Kiểm tra đã chuyển đến trang checkout
    await expect(page).toHaveURL('https://newday.com.vn/cart/checkout');
    console.log('Đã chuyển đến trang thanh toán thành công');
    
    // Kiểm tra modal backdrop không còn (vì đã chuyển trang)
    const modalBackdropAfterCheckout = page.locator('.modal-backdrop.fade.in');
    await expect(modalBackdropAfterCheckout).toHaveCount(0);
    
    console.log('Test Case: Bấm "Thanh toán ngay" - Chuyển đến trang checkout thành công');
  });