import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('https://newday.com.vn/user/login');
  await page.fill('input[name="username"]', 'a@gmail.com');
  await page.fill('input[name="password"]', '123456');
  await page.click('#btnsignin');

  const cartIconLink = page.locator('#header-cart');
  await expect(cartIconLink).toBeVisible();
  await expect(cartIconLink).toBeEnabled();
  console.log('Biểu tượng giỏ hàng đã tìm thấy và có thể bấm được.');

  const expectedRelativeUrl = await cartIconLink.getAttribute('href');
  const fullExpectedUrl = `https://newday.com.vn${expectedRelativeUrl}`;
  console.log(`Mong đợi chuyển hướng đến: ${fullExpectedUrl}`);
  await cartIconLink.click();
});

test('Kiểm tra số lượng sản phẩm hiển thị và tính tổng tiền giỏ hàng', async ({ page }) => {
    await context.storageState({ path: 'state.json' });
    // 1. Lấy tất cả các dòng sản phẩm trong tbody
    const productRows = page.locator('table.table-cart tbody tr');

    // 2. Đếm số lượng sản phẩm (số dòng tr)
    const numberOfProducts = await productRows.count();
    console.log(`Số lượng sản phẩm thực tế trong giỏ hàng: ${numberOfProducts}`);

    // Kiểm tra số lượng item hiển thị ở tiêu đề
    const totalItemCountHeader = page.locator('th.total-cart .totalItem-cart');
    await expect(totalItemCountHeader).toBeVisible();
    await expect(totalItemCountHeader).toContainText(String(numberOfProducts));
    console.log('Số lượng sản phẩm trong header khớp với số dòng.');

    // Khai báo một mảng để lưu thông tin sản phẩm và tính tổng
    const productsData = [];
    let calculatedGrandTotal = 0;

    // 3. Lặp qua từng sản phẩm để lấy thông tin và kiểm tra tính toán
    for (let i = 0; i < numberOfProducts; i++) {
      console.log(`--- Kiểm tra sản phẩm thứ ${i + 1} ---`);
      const currentRow = productRows.nth(i); // Lấy dòng sản phẩm thứ i (index bắt đầu từ 0)

      // Lấy tên sản phẩm
      const productNameElement = currentRow.locator('.cart-pro-name a');
      await expect(productNameElement).toBeVisible();
      const productName = await productNameElement.textContent();

      // Lấy đơn giá
      const unitPriceElement = currentRow.locator('.pri-cart .money');
      await expect(unitPriceElement).toBeVisible();
      const unitPriceText = await unitPriceElement.textContent();
      const unitPrice = parseCurrencyToNumber(unitPriceText);

      // Lấy số lượng
      const quantityInputElement = currentRow.locator('.product-qty input');
      await expect(quantityInputElement).toBeVisible();
      const quantity = parseInt(await quantityInputElement.inputValue());

      // Lấy thành tiền (của từng sản phẩm)
      const subtotalElement = currentRow.locator('.into-money');
      await expect(subtotalElement).toBeVisible();
      const subtotalText = await subtotalElement.textContent();
      const actualSubtotal = parseCurrencyToNumber(subtotalText);

      // Kiểm tra tính toán thành tiền cho từng sản phẩm
      const expectedSubtotal = unitPrice * quantity;
      expect(actualSubtotal).toBe(expectedSubtotal);
      console.log(`Sản phẩm: "${productName}" - Đơn giá: ${unitPrice}, Số lượng: ${quantity}, Thành tiền trên UI: ${actualSubtotal}, Thành tiền tính toán: ${expectedSubtotal} (Đúng)`);

      // Thêm vào tổng tiền chung
      calculatedGrandTotal += expectedSubtotal;
      productsData.push({ productName, unitPrice, quantity, actualSubtotal, expectedSubtotal });
    }

    // 4. Kiểm tra tổng tiền của toàn bộ giỏ hàng
    console.log('\n--- Kiểm tra tổng tiền toàn giỏ hàng ---');
    const cartTotalElement = page.locator('.cart-calculator .text-red');
    await expect(cartTotalElement).toBeVisible();
    const actualCartTotalText = await cartTotalElement.textContent();
    const actualCartTotal = parseCurrencyToNumber(actualCartTotalText);

    console.log(`Tổng tiền giỏ hàng (tính toán từ các sản phẩm): ${calculatedGrandTotal.toLocaleString('vi-VN')}đ`);
    console.log(`Tổng tiền giỏ hàng (trên UI): ${actualCartTotal.toLocaleString('vi-VN')}đ`);
    expect(actualCartTotal).toBe(calculatedGrandTotal);
    console.log('Tổng tiền giỏ hàng khớp với tổng của từng sản phẩm.');
});
