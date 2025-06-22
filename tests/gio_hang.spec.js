import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('https://newday.com.vn/user/login');
  await page.fill('input[name="username"]', 'a@gmail.com');
  await page.fill('input[name="password"]', '123456');
  await page.click('#btnsignin');

  await page.waitForTimeout(1000);
// Sản phẩm 1 (psid 4944658): QUẦN SUÔNG DÀI 2 LỚP SODA - TRẮNG - L, Đơn giá 525,000đ, Số lượng 2
    await page.goto('https://newday.com.vn/quan-suong-dai-2-lop-soda-p4944652.html');
    await page.locator('.option2 li a[title="TRẮNG"]').click();
    await page.locator('span.size.req a', { hasText: 'L' }).click({ delay: 500 });
    const addBtn1 = page.locator('#js-add-cart');
    await expect(addBtn1).toBeEnabled();
    await addBtn1.click(); // Thêm 1
    await page.locator('#modalShow #close-modal').click();
    await addBtn1.click(); // Thêm 2
    await page.locator('#modalShow #close-modal').click();

    // Sản phẩm 2 (psid 4944651): ÁO GILE CHIẾT EO SODA - TRẮNG - L, Đơn giá 575,000đ, Số lượng 3
    await page.goto('https://newday.com.vn/ao-gile-chiet-eo-soda-p4944645.html');
    await page.locator('.option2 li a[title="TRẮNG"]').click();
    await page.locator('span.size.req a', { hasText: 'L' }).click({ delay: 500 });
    const addBtn2 = page.locator('#js-add-cart');
    await expect(addBtn2).toBeEnabled();
    await addBtn2.click(); // Thêm 1
    await page.locator('#modalShow #close-modal').click();
    await addBtn2.click(); // Thêm 2
    await page.locator('#modalShow #close-modal').click();
    await addBtn2.click(); // Thêm 3
    await page.locator('#modalShow #close-modal').click();

    // Sản phẩm 3 (psid 4944648): ÁO GILE CHIẾT EO SODA - GHI - L, Đơn giá 575,000đ, Số lượng 1
    await page.goto('https://newday.com.vn/ao-gile-chiet-eo-soda-p4944645.html');
    await page.locator('.option2 li a[title="GHI"]').click();
    await page.locator('span.size.req a', { hasText: 'L' }).click({ delay: 500 });
    const addBtn3 = page.locator('#js-add-cart');
    await expect(addBtn3).toBeEnabled();
    await addBtn3.click(); // Thêm 1
    await page.locator('#modalShow #close-modal').click();

  await page.waitForTimeout(1000);
  await page.goto('https://newday.com.vn/cart');
});

// Hàm tiện ích để chuyển đổi chuỗi tiền tệ sang số nguyên
function parseCurrencyToNumber(currencyString) {
  // Loại bỏ ký tự 'đ', dấu phẩy, và dấu chấm (nếu có cho hàng triệu)
  return parseInt(currencyString.replace(/[đ.,]/g, ''));
}
test('DD_18: Kiểm tra số lượng sản phẩm hiển thị và tính tổng tiền giỏ hàng', async ({ page }) => {
    //await context.storageState({ path: 'state.json' });
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

// test('Kiểm tra thay đổi số lượng sản phẩm trong giỏ hàng', async ({ page }) => {
//     // 1. Lấy sản phẩm đầu tiên để test thay đổi số lượng
//     const firstProductRow = page.locator('table.table-cart tbody tr').first();
    
//     // Lấy thông tin ban đầu của sản phẩm đầu tiên
//     const productNameElement = firstProductRow.locator('.cart-pro-name a');
//     const productName = await productNameElement.textContent();
    
//     const unitPriceElement = firstProductRow.locator('.pri-cart .money');
//     const unitPriceText = await unitPriceElement.textContent();
//     const unitPrice = parseCurrencyToNumber(unitPriceText);
    
//     const quantityInput = firstProductRow.locator('.product-qty input.updateCart');
//     const originalQuantity = parseInt(await quantityInput.inputValue());
    
//     console.log(`Sản phẩm test: "${productName}"`);
//     console.log(`Đơn giá: ${unitPrice.toLocaleString('vi-VN')}đ`);
//     console.log(`Số lượng ban đầu: ${originalQuantity}`);
    
//     // Lấy tổng tiền ban đầu của giỏ hàng
//     const cartTotalElement = page.locator('.cart-calculator .text-red');
//     const originalCartTotalText = await cartTotalElement.textContent();
//     const originalCartTotal = parseCurrencyToNumber(originalCartTotalText);
//     console.log(`Tổng tiền ban đầu: ${originalCartTotal.toLocaleString('vi-VN')}đ`);
    
//     // 2. Tăng số lượng sản phẩm lên 1
//     const newQuantity = originalQuantity + 1;
//     await quantityInput.fill(String(newQuantity));
    
//     // Trigger change event để cập nhật giỏ hàng
//     await quantityInput.dispatchEvent('change');
    
//     // Chờ cập nhật
//     await page.waitForTimeout(2000);
    
//     // 3. Kiểm tra số lượng đã được cập nhật
//     const updatedQuantity = parseInt(await quantityInput.inputValue());
//     expect(updatedQuantity).toBe(newQuantity);
//     console.log(`Số lượng sau khi tăng: ${updatedQuantity}`);
    
//     // 4. Kiểm tra thành tiền của sản phẩm đã được cập nhật
//     const updatedSubtotalElement = firstProductRow.locator('.into-money');
//     const updatedSubtotalText = await updatedSubtotalElement.textContent();
//     const updatedSubtotal = parseCurrencyToNumber(updatedSubtotalText);
//     const expectedSubtotal = unitPrice * newQuantity;
    
//     expect(updatedSubtotal).toBe(expectedSubtotal);
//     console.log(`Thành tiền sau khi tăng: ${updatedSubtotal.toLocaleString('vi-VN')}đ (Mong đợi: ${expectedSubtotal.toLocaleString('vi-VN')}đ)`);
    
//     // 5. Kiểm tra tổng tiền giỏ hàng đã được cập nhật
//     const updatedCartTotalText = await cartTotalElement.textContent();
//     const updatedCartTotal = parseCurrencyToNumber(updatedCartTotalText);
//     const expectedCartTotal = originalCartTotal + unitPrice; // Tăng thêm 1 sản phẩm
    
//     expect(updatedCartTotal).toBe(expectedCartTotal);
//     console.log(`Tổng tiền sau khi tăng: ${updatedCartTotal.toLocaleString('vi-VN')}đ (Mong đợi: ${expectedCartTotal.toLocaleString('vi-VN')}đ)`);
    
//     // 6. Giảm số lượng về như ban đầu
//     await quantityInput.fill(String(originalQuantity));
//     await quantityInput.dispatchEvent('change');
//     await page.waitForTimeout(2000);
    
//     // 7. Kiểm tra đã trở về trạng thái ban đầu
//     const restoredQuantity = parseInt(await quantityInput.inputValue());
//     expect(restoredQuantity).toBe(originalQuantity);
    
//     const restoredSubtotalText = await updatedSubtotalElement.textContent();
//     const restoredSubtotal = parseCurrencyToNumber(restoredSubtotalText);
//     const expectedRestoredSubtotal = unitPrice * originalQuantity;
    
//     expect(restoredSubtotal).toBe(expectedRestoredSubtotal);
    
//     const restoredCartTotalText = await cartTotalElement.textContent();
//     const restoredCartTotal = parseCurrencyToNumber(restoredCartTotalText);
    
//     expect(restoredCartTotal).toBe(originalCartTotal);
//     console.log('Đã khôi phục về trạng thái ban đầu thành công');
// });

// test('Kiểm tra xóa sản phẩm khỏi giỏ hàng', async ({ page }) => {
//     // 1. Đếm số sản phẩm ban đầu
//     const initialProductRows = page.locator('table.table-cart tbody tr');
//     const initialProductCount = await initialProductRows.count();
//     console.log(`Số sản phẩm ban đầu: ${initialProductCount}`);
    
//     // Lấy tổng tiền ban đầu
//     const cartTotalElement = page.locator('.cart-calculator .text-red');
//     const initialCartTotalText = await cartTotalElement.textContent();
//     const initialCartTotal = parseCurrencyToNumber(initialCartTotalText);
//     console.log(`Tổng tiền ban đầu: ${initialCartTotal.toLocaleString('vi-VN')}đ`);
    
//     // 2. Lấy thông tin sản phẩm cuối cùng để xóa
//     const lastProductRow = initialProductRows.last();
    
//     const productNameElement = lastProductRow.locator('.cart-pro-name a');
//     const productName = await productNameElement.textContent();
    
//     const subtotalElement = lastProductRow.locator('.into-money');
//     const subtotalText = await subtotalElement.textContent();
//     const productSubtotal = parseCurrencyToNumber(subtotalText);
    
//     console.log(`Sản phẩm sẽ bị xóa: "${productName}"`);
//     console.log(`Thành tiền của sản phẩm: ${productSubtotal.toLocaleString('vi-VN')}đ`);
    
//     // 3. Click vào nút xóa sản phẩm (icon fa-times)
//     const removeButton = lastProductRow.locator('i.removeCartItem.fa-times');
//     await expect(removeButton).toBeVisible();
//     await removeButton.click();
    
//     // Chờ xử lý xóa
//     await page.waitForTimeout(2000);
    
//     // 4. Kiểm tra số lượng sản phẩm đã giảm
//     const updatedProductRows = page.locator('table.table-cart tbody tr');
//     const updatedProductCount = await updatedProductRows.count();
    
//     expect(updatedProductCount).toBe(initialProductCount - 1);
//     console.log(`Số sản phẩm sau khi xóa: ${updatedProductCount}`);
    
//     // 5. Kiểm tra tổng tiền đã được cập nhật
//     const updatedCartTotalText = await cartTotalElement.textContent();
//     const updatedCartTotal = parseCurrencyToNumber(updatedCartTotalText);
//     const expectedCartTotal = initialCartTotal - productSubtotal;
    
//     expect(updatedCartTotal).toBe(expectedCartTotal);
//     console.log(`Tổng tiền sau khi xóa: ${updatedCartTotal.toLocaleString('vi-VN')}đ`);
//     console.log(`Tổng tiền mong đợi: ${expectedCartTotal.toLocaleString('vi-VN')}đ`);
    
//     // 6. Kiểm tra sản phẩm đã bị xóa không còn xuất hiện trong danh sách
//     const remainingProductNames = await updatedProductRows.locator('.cart-pro-name a').allTextContents();
//     expect(remainingProductNames).not.toContain(productName);
//     console.log(`Sản phẩm "${productName}" đã được xóa khỏi giỏ hàng thành công`);
    
//     // 7. Kiểm tra số lượng item trong header cũng được cập nhật
//     const totalItemCountHeader = page.locator('th.total-cart .totalItem-cart');
//     await expect(totalItemCountHeader).toContainText(String(updatedProductCount));
//     console.log('Số lượng sản phẩm trong header đã được cập nhật');
// });

// test('Kiểm tra xóa tất cả sản phẩm khỏi giỏ hàng', async ({ page }) => {
//     // 1. Lấy số lượng sản phẩm ban đầu
//     const productRows = page.locator('table.table-cart tbody tr');
//     let productCount = await productRows.count();
//     console.log(`Số sản phẩm ban đầu: ${productCount}`);
    
//     // 2. Xóa từng sản phẩm cho đến khi hết
//     while (productCount > 0) {
//         const currentRows = page.locator('table.table-cart tbody tr');
//         const firstRow = currentRows.first();
        
//         // Lấy tên sản phẩm trước khi xóa
//         const productNameElement = firstRow.locator('.cart-pro-name a');
//         const productName = await productNameElement.textContent();
        
//         // Click nút xóa
//         const removeButton = firstRow.locator('i.removeCartItem.fa-times');
//         await removeButton.click();
        
//         // Chờ xử lý xóa
//         await page.waitForTimeout(2000);
        
//         console.log(`Đã xóa sản phẩm: "${productName}"`);
        
//         // Cập nhật số lượng sản phẩm còn lại
//         productCount = await page.locator('table.table-cart tbody tr').count();
//         console.log(`Số sản phẩm còn lại: ${productCount}`);
//     }
    
//     // 3. Kiểm tra giỏ hàng trống
//     expect(productCount).toBe(0);
//     console.log('Đã xóa hết tất cả sản phẩm khỏi giỏ hàng');
    
//     // 4. Kiểm tra thông báo giỏ hàng trống hoặc tổng tiền = 0
//     // (Tùy thuộc vào cách website hiển thị khi giỏ hàng trống)
//     const cartTotalElement = page.locator('.cart-calculator .text-red');
    
//     // Kiểm tra xem có hiển thị tổng tiền = 0 hay thông báo giỏ hàng trống
//     if (await cartTotalElement.isVisible()) {
//         const cartTotalText = await cartTotalElement.textContent();
//         const cartTotal = parseCurrencyToNumber(cartTotalText);
//         expect(cartTotal).toBe(0);
//         console.log('Tổng tiền giỏ hàng = 0đ');
//     } else {
//         // Có thể website hiển thị thông báo "Giỏ hàng trống" thay vì bảng
//         console.log('Giỏ hàng trống - không hiển thị tổng tiền');
//     }
// });
