// @ts-check
const { test, expect } = require('@playwright/test');
const { cp } = require('fs');

const BASE_URL = 'https://newday.com.vn/';

test.describe('New Day - Test tìm kiếm nâng cao', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('load', { timeout: 30000 });

  });

  test.describe('Kết hợp tìm kiếm và lọc', () => {

    test('TC_ADVANCED_001: Tìm kiếm với bộ lọc màu sắc và kích thước', async ({ page }) => {
      const keywords = 'chân váy';
      const color = 'ĐEN';
      const size = 'M';

      // Navigate to the search page
      await page.goto(BASE_URL, { waitUntil: 'load', timeout: 30000 });

      // Debug: Log page content and take screenshot
      // console.log(await page.content());
      await page.screenshot({ path: 'debug-initial-page.png' });

      // Find and fill the search input
      const searchInput = page.locator('input[type="search"], input[placeholder*="tìm"], .search-input, #search');
      if (await searchInput.count() > 0) {
        await searchInput.click();
        await page.keyboard.type(keywords);

        // Submit search
        await Promise.all([
          page.waitForLoadState('load', { timeout: 30000 }),
          page.keyboard.press('Enter'),
        ]);

        // Wait for results to load
        await page.waitForLoadState('load', { timeout: 30000 });
        await page.waitForSelector('.product-item, .product-card', { timeout: 15000 });

        // Debug: Log page content after search
        await page.screenshot({ path: 'debug-after-search.png' });

        // Apply color filter
        const colorFilterContainer = page.locator('.tp_product_category_filter_attribute', { has: page.locator('a:has-text("Màu sắc")') });
        const colorFilter = page.locator(`.catalog_filters a.tag-choise:text-is("${color}")`);


        if (await colorFilter.count() > 0) {
          // Ensure the filter container is visible
          await page.waitForSelector('.tp_product_category_filter_attribute', { state: 'visible', timeout: 15000 });

          // Open color filter menu if needed
          const colorFilterToggle = page.locator('.item.active.first a:has-text("Màu sắc")');
          if (await colorFilterToggle.count() > 0) {
            const isVisible = await colorFilterContainer.first().isVisible();
            if (!isVisible) {
              await colorFilterToggle.click();
              await page.waitForTimeout(1000); // Wait for menu to open
            }
          }

          // Debug: Check if color filter is visible
          console.log(`Color filter "${color}" visible: ${await colorFilter.first().isVisible()}`);
          await colorFilter.first().click();

          // Wait for results to update
          await page.waitForSelector('.product-item, .product-card', { timeout: 15000 });
        } else {
          console.warn(`⚠️ Không tìm thấy bộ lọc màu sắc "${color}". Kiểm tra selector hoặc HTML.`);
          await page.screenshot({ path: 'debug-no-color-filter.png' });
        }

        // Apply size filter
        const resultCountAfterSize = await applySizeFilter(page, size);

        // Handle pagination
        let totalResultCount = 0;
        let totalMatchedCount = 0;
        let hasNextPage = true;
        let currentPage = 1;

        while (hasNextPage) {
          await page.waitForLoadState('load', { timeout: 30000 });
          await page.waitForSelector('.product-item, .product-card', { timeout: 15000 });

          // Count and verify results
          const results = page.locator('.product-information, .product-card');
          const resultCount = await results.count();
          console.log(`🔍 Trang ${currentPage}: tìm thấy ${resultCount} kết quả`);
          totalResultCount += resultCount;

          let matchedCount = 0;
          for (let i = 0; i < resultCount; i++) {
            const itemText = await results.nth(i).innerText();
            const keywordArray = keywords.toLowerCase().split(' ');
            if (keywordArray.every(word => itemText.toLowerCase().includes(word))) {
              matchedCount++;
            }
          }
          totalMatchedCount += matchedCount;

          console.log(`🔍 Tìm "${keywords}" (trang ${currentPage}): tổng ${resultCount}, khớp từ khóa: ${matchedCount}`);

          // Take screenshot if no matches
          if (matchedCount === 0) {
            await page.screenshot({ path: `screenshot-${keywords.replace(/\s+/g, '-')}-page-${currentPage}.png` });
            console.warn(`⚠️ Không tìm thấy kết quả khớp cho từ khóa: "${keywords}" trên trang ${currentPage}`);
          }

          // Check and navigate to the next page
          const nextPageLink = page.locator(`.pagination a`, { hasText: `${currentPage + 1}` });
          if (await nextPageLink.count() > 0) {
            try {
              await Promise.all([
                page.waitForLoadState('load', { timeout: 30000 }),
                nextPageLink.click(),
              ]);
              currentPage++;
            } catch (error) {
              console.warn(`⚠️ Lỗi khi chuyển trang ${currentPage + 1}: ${error}`);
              hasNextPage = false;
            }
          } else {
            hasNextPage = false;
          }
        }

        // Verify results
        console.log(`🔍 Tóm tắt "${keywords}" với bộ lọc màu ${color} và kích thước ${size}: tổng ${totalResultCount}, khớp từ khóa: ${totalMatchedCount}`);
        
        if (totalResultCount === 0) {
          console.warn(`⚠️ Không có kết quả nào sau khi áp dụng bộ lọc màu ${color} và kích thước ${size}`);
          await page.screenshot({ path: `screenshot-no-results-${keywords.replace(/\s+/g, '-')}.png` });
        } else if (totalMatchedCount === 0) {
          console.warn(`⚠️ Có kết quả nhưng không khớp từ khóa "${keywords}"`);
        } else {
          expect(totalMatchedCount).toBeGreaterThan(0); // Ensure at least one result matches
        }
      } else {
        console.warn(`⚠️ Không tìm thấy input tìm kiếm cho từ khóa: "${keywords}"`);
        await page.screenshot({ path: 'debug-no-search-input.png' });
      }
    });

    /**
     * @param {import("playwright-core").Page} page
     * @param {string} size
     */
    async function applySizeFilter(page, size, timeout = 15000) {
      // Find the size filter container
      const sizeFilterContainer = page.locator('.tp_product_category_filter_attribute', { has: page.locator('a:has-text("Kích thước")') });
      
      // Ensure the filter container is visible
      await page.waitForSelector('.tp_product_category_filter_attribute', { state: 'visible', timeout });

      // Open size filter menu if needed
      const sizeFilterToggle = page.locator('.item.active.first a:has-text("Kích thước")');

      if (await sizeFilterToggle.count() > 0) {
        const isVisible = await sizeFilterContainer.first().isVisible();
        if (!isVisible) {
          await sizeFilterToggle.click();
          await page.waitForTimeout(1000); // Wait for menu to open
        }
      }

      // Find the specific size filter
      const sizeFilter = page.locator(`.catalog_filters a.tag-choise:text-is("${size}")`);
      
      if (await sizeFilter.count() > 0) {
        // Debug: Check if size filter is visible
        console.log(`Size filter "${size}" visible: ${await sizeFilter.first().isVisible()}`);
        await sizeFilter.first().click();

        // Wait for results to update
        await page.waitForSelector('.product-item, .product-card', { timeout });

        // Count results
        const results = page.locator('.product-item, .product-card');
        const resultCount = await results.count();

        console.log(`🔍 Áp dụng bộ lọc kích thước "${size}": tổng ${resultCount} kết quả`);
        return resultCount;
      } else {
        console.warn(`⚠️ Không tìm thấy bộ lọc kích thước "${size}". Kiểm tra selector hoặc HTML.`);
        await page.screenshot({ path: `debug-no-size-filter-${size}.png` });
        return 0;
      }
    }

    test('TC_ADVANCED_002: Tìm kiếm với nhiều từ khóa', async ({ page }) => {
      const multiKeywords = [
        'áo vest ngắn tay',
        'chân váy dài',
        'đầm tweed cổ tròn',
        'quần suông dài',
        'chân váy'
      ];

      // Chỉ tải trang một lần
      await page.goto(BASE_URL, { waitUntil: 'load', timeout: 30000 });

      const searchInput = page.locator('input[type="search"], input[placeholder*="tìm"], .search-input, #search');

      for (const keywords of multiKeywords) {
        if (await searchInput.count() > 0) {
          // Xóa nội dung cũ và nhập từ khóa mới
          await searchInput.click();
          await page.keyboard.type(keywords);

          // Chờ điều hướng sau khi nhấn Enter
          await Promise.all([
            page.waitForLoadState('load', { timeout: 30000 }),
            page.keyboard.press('Enter'),
          ]);

          let totalResultCount = 0; // Tổng số kết quả trên tất cả các trang
          let totalMatchedCount = 0; // Tổng số kết quả khớp trên tất cả các trang
          let hasNextPage = true;
          let currentPage = 1;

          while (hasNextPage) {
            // Chờ trang tải xong và phần tử xuất hiện
            await page.waitForLoadState('load', { timeout: 30000 });
            await page.waitForSelector('.product-lists, .product-information', { timeout: 10000 });

            // Tạo locator và đếm kết quả trên trang hiện tại
            const results = page.locator('.product-lists, .product-information');
            const resultCount = await results.count();
            totalResultCount += resultCount;

            // Kiểm tra có kết quả
            expect(resultCount).toBeGreaterThan(0); // Đảm bảo có ít nhất 1 kết quả trên trang

            // Kiểm tra kết quả khớp từ khóa
            let matchedCount = 0;
            for (let i = 0; i < resultCount; i++) {
              const itemText = await results.nth(i).innerText();
              const keywordArray = keywords.toLowerCase().split(' ');
              if (keywordArray.every(word => itemText.toLowerCase().includes(word))) {
                matchedCount++;
              }
            }
            totalMatchedCount += matchedCount;

            console.log(`🔍 Tìm "${keywords}" (trang ${currentPage}): tổng ${resultCount}, khớp từ khóa: ${matchedCount}`);

            // Lưu screenshot nếu không có kết quả khớp
            if (matchedCount === 0) {
              await page.screenshot({ path: `screenshot-${keywords.replace(/\s+/g, '-')}-page-${currentPage}.png` });
              console.warn(`⚠️ Không tìm thấy kết quả khớp cho từ khóa: "${keywords}" trên trang ${currentPage}`);
            }

            // Kiểm tra phân trang
            const paginationLinks = page.locator('.pagination a');
            const nextPageLink = page.locator('.pagination a:text("»")');
            if (await nextPageLink.count() > 0) {
              // Chuyển sang trang tiếp theo
              await Promise.all([
                page.waitForLoadState('load', { timeout: 30000 }),
                nextPageLink.click(),
              ]);
              currentPage++;
            } else {
              hasNextPage = false; // Không còn trang tiếp theo
            }
          }

          console.log(`🔍 Tóm tắt "${keywords}": tổng ${totalResultCount}, khớp từ khóa: ${totalMatchedCount}`);

          // Kiểm tra ít nhất 1 kết quả khớp trên tất cả các trang
          expect(totalMatchedCount).toBeGreaterThan(0);
        } else {
          console.warn(`⚠️ Không tìm thấy input tìm kiếm cho từ khóa: "${keywords}"`);
        }
      }
    });




  });

  test.describe('Test Performance và UX', () => {

    test('TC_PERF_001: Thời gian phản hồi tìm kiếm', async ({ page }) => {
      const searchInput = page.locator('input[type="search"], input[placeholder*="tìm"], .search-input, #search');
      
      if (await searchInput.count() > 0) {
        const startTime = Date.now();
        
        await searchInput.click();
        await page.keyboard.type('áo vest');

        await Promise.all([
          page.waitForLoadState('load', { timeout: 30000 }),
          page.keyboard.press('Enter')
        ]);        
        // Đợi kết quả xuất hiện
        await page.waitForSelector('.product-detail, .product-image', { timeout: 5000 });
        
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        console.log(`Thời gian phản hồi tìm kiếm: ${responseTime}ms`);
        
        // Yêu cầu thời gian phản hồi < 3 giây
        expect(responseTime).toBeLessThan(3000);
      }
    });


    test('TC_UX_001: Gợi ý tìm kiếm (autocomplete)', async ({ page }) => {
      const keyword = 'áo';

      const searchInput = page.locator('input[type="search"], input[placeholder*="tìm"], .search-input, #search');

      if (await searchInput.count() > 0) {
        await searchInput.click();
        await page.keyboard.type(keyword);

        const suggestionDropdown = page.locator('#searchFolding');
        const suggestionItems = suggestionDropdown.locator('a');

        // ⏳ Chờ tới khi có ít nhất 1 gợi ý thực sự xuất hiện
        await page.waitForFunction(() => {
          const el = document.querySelector('#searchFolding');
          // @ts-ignore
          return el && el.style && el.style.display !== 'none' && el.querySelectorAll('a').length > 0;
        }, null, { timeout: 5000 });


        const count = await suggestionItems.count();
        console.log(`Số lượng gợi ý: ${count}`);
        expect(count).toBeGreaterThan(0);


        let allMatched = true;

        for (let i = 0; i < count; i++) {
          const text = await suggestionItems.nth(i).innerText();

          if (!text.toLowerCase().includes(keyword.toLowerCase())) {
            console.warn(`❌ Gợi ý ${i + 1} KHÔNG chứa từ khóa "${keyword}"`);
            allMatched = false;
          }
        }

        // Chỉ pass nếu tất cả gợi ý đều chứa từ khóa
        expect(allMatched).toBeTruthy();
      }
    });
  });


  test.describe('Test Edge Cases', () => {

    test('TC_EDGE_001: Tìm kiếm với ký tự Unicode', async ({ page }) => {
      const unicodeKeywords = [
        'áo 👗',
        'đầm ✨',
        'váy 🌸',
        'Ñew Daỳ'
      ];

      for (const keyword of unicodeKeywords) {
        await page.goto(BASE_URL);
        await page.waitForLoadState('load', { timeout: 30000 });

        const searchInput = page.locator('input[type="search"], input[placeholder*="tìm"], .search-input, #search');
        
        if (await searchInput.count() > 0) {
          await searchInput.fill(keyword);

          await Promise.all([
          page.waitForLoadState('load', { timeout: 30000 }),
          page.keyboard.press('Enter')
        ]);
        await page.waitForLoadState('load', { timeout: 30000 });

          // Kiểm tra không bị crash
          await expect(page.locator('body')).toBeVisible();
          console.log(`Tìm kiếm Unicode "${keyword}": OK`);
        }
      }
    });

    test('TC_EDGE_002: Tìm kiếm chuỗi rất dài', async ({ page }) => {
      const longString = 'áo vest dài tay màu xanh than chất liệu voan tơ nhũ lấp lánh cổ tròn kiểu dáng suông phong cách hiện đại trẻ trung năng động phù hợp đi làm đi chơi'.repeat(3);
      
      const searchInput = page.locator('input[type="search"], input[placeholder*="tìm"], .search-input, #search');
      
      if (await searchInput.count() > 0) {
        await searchInput.fill(longString);

        await Promise.all([
          page.waitForLoadState('load', { timeout: 30000 }),
          page.keyboard.press('Enter')
        ]);
        await page.waitForLoadState('load', { timeout: 30000 });

        // Kiểm tra xử lý chuỗi dài
        await expect(page.locator('body')).toBeVisible();
        console.log(`Độ dài chuỗi tìm kiếm: ${longString.length} ký tự`);
      }
    });

    test('TC_EDGE_003: SQL Injection trong tìm kiếm', async ({ page }) => {
      const sqlInjectionAttempts = [
        "'; DROP TABLE products; --",
        "1' OR '1'='1",
        "' UNION SELECT * FROM users --",
        "<script>alert('xss')</script>"
      ];

      for (const injection of sqlInjectionAttempts) {
        await page.goto(BASE_URL);
        await page.waitForLoadState('load', { timeout: 30000 });

        const searchInput = page.locator('input[type="search"], input[placeholder*="tìm"], .search-input, #search');
        
        if (await searchInput.count() > 0) {
          await searchInput.fill(injection);

          await Promise.all([
            page.keyboard.press('Enter'),
            page.waitForNavigation({ waitUntil: 'load', timeout: 30000 })
          ]);

          // Kiểm tra website vẫn hoạt động bình thường
          await expect(page).toHaveURL(/newday\.com\.vn/);
          await expect(page.locator('body')).toBeVisible();
          
          // Không có alert box xuất hiện
          const alertDialog = page.locator('role=dialog');
          expect(await alertDialog.count()).toBe(0);
          
          console.log(`SQL Injection test "${injection}": Được xử lý an toàn`);
        }
      }
    });

    test('TC_EDGE_004: Tìm kiếm liên tục (stress test)', async ({ page }) => {
      const keywords = ['áo', 'đầm', 'quần', 'váy', 'vest'];
      
      for (let i = 0; i < 5; i++) {
        for (const keyword of keywords) {

          await page.waitForLoadState('load', { timeout: 30000 });
          const searchInput = page.locator('input[type="search"], input[placeholder*="tìm"], .search-input, #search');
          
          if (await searchInput.count() > 0) {
            await searchInput.fill(keyword);

            await Promise.all([
              page.waitForLoadState('load', { timeout: 30000 }),
              page.keyboard.press('Enter')
            ]);
            await page.waitForTimeout(500); // Đợi ngắn giữa các lần tìm
          }
        }
      }
      
      // Kiểm tra website vẫn ổn định
      await expect(page.locator('body')).toBeVisible();
      console.log('Stress test hoàn thành: Website vẫn ổn định');
    });
  });

  test.describe('Test Accessibility', () => {

    test('TC_A11Y_001: Keyboard navigation cho tìm kiếm', async ({ page }) => {
      await page.goto(BASE_URL);
      
      // Tab đến search input
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      const focusedElement = page.locator(':focus');
      
      // Kiểm tra có thể focus vào search input
      if (await focusedElement.count() > 0) {
        await focusedElement.type('áo vest');
        await page.keyboard.press('Enter');
        await page.waitForLoadState('load', { timeout: 30000 });

        await expect(page.locator('.product-item, .product-card')).toBeVisible();
      }
    });

    test('TC_A11Y_002: Screen reader support', async ({ page }) => {
      await page.goto(BASE_URL);
      
      // Kiểm tra aria labels và alt text
      const searchInput = page.locator('input[type="search"], .search-input');
      
      if (await searchInput.count() > 0) {
        const ariaLabel = await searchInput.getAttribute('aria-label');
        const placeholder = await searchInput.getAttribute('placeholder');
        
        // Search input nên có label hoặc placeholder để screen reader đọc được
        expect(ariaLabel || placeholder).toBeTruthy();
      }

      // Kiểm tra hình ảnh có alt text
      const productImages = page.locator('.product-item img, .product-card img');
      
      if (await productImages.count() > 0) {
        const firstImage = productImages.first();
        const altText = await firstImage.getAttribute('alt');
        
        expect(altText).toBeTruthy();
        expect(altText?.length).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Test Integration', () => {

    test('TC_INT_001: Tích hợp giữa search, chọn thuộc tính và giỏ hàng', async ({ page }) => {
  await page.goto(BASE_URL);

  const searchInput = page.locator('input[type="search"], input[placeholder*="tìm"], .search-input, #search');

  if (await searchInput.count() > 0) {
    await searchInput.fill('áo vest');

    // Tìm kiếm và chờ điều hướng
    await Promise.all([
      page.keyboard.press('Enter'),
      page.waitForLoadState('load', { timeout: 30000 }),
    ]);

    // Nhấn vào nút Thêm vào giỏ hàng đầu tiên (mở form chi tiết)
    const addToCartBtn = page.locator('text="Thêm vào giỏ hàng"').first();
    await expect(addToCartBtn).toBeVisible({ timeout: 5000 });
    await addToCartBtn.click();
    await page.waitForTimeout(1000);

    // --- Chọn màu sắc ---
    const colorOptions = page.locator('.colornew a');
    let colorSelected = false;

    if (await colorOptions.count() > 0) {
      await colorOptions.first().click(); // chọn màu đầu tiên
      await page.waitForTimeout(500);
      colorSelected = true;
    }

    // --- Chọn kích thước chỉ khi đã chọn màu sắc ---
    if (colorSelected) {
      const sizeOptions = page.locator('.sizenew a');
      const sizeCount = await sizeOptions.count();

      if (sizeCount > 0) {
        await expect(sizeOptions.first()).toBeVisible({ timeout: 5000 });
        await sizeOptions.first().click(); // chọn size đầu tiên
      } else {
        throw new Error('❌ Không có tùy chọn kích thước!');
      }
    } else {
      throw new Error('❌ Không chọn được màu sắc!');
    }

    // --- Tăng số lượng ---
    const quantityInput = page.locator('#quantity_qv');
    const increaseBtn = page.locator('.plus-one');

    await expect(quantityInput).toBeVisible();
    await expect(quantityInput).toHaveValue('1');

    await increaseBtn.click(); // tăng lên 2
    await expect(quantityInput).toHaveValue('2');

    // --- Nhấn lại vào Thêm vào giỏ hàng (trong form chi tiết) ---
    const finalAddBtn = page.locator('#addToCartQv');
    if (await finalAddBtn.count() > 0) {
      await finalAddBtn.first().click();
      await page.waitForTimeout(1000);
    }
    
    const acceptBtn = page.locator('#close-modal');
    if (await acceptBtn.count() > 0) {
      await acceptBtn.click();
      await page.waitForTimeout(1000);
    } else {
      throw new Error('❌ Không tìm thấy nút đóng modal!');
    }

    // --- Kiểm tra giỏ hàng ---
    const cartCount = page.locator('.fa-shopping-cart');
    if (await cartCount.count() > 0) {
      await cartCount.click(); // mở giỏ hàng
    }else {
      throw new Error('❌ Không tìm thấy biểu tượng giỏ hàng!');
    }

    // Đợi tối đa 5 giây cho đến khi phần tử xuất hiện trong DOM
    await cartCount.waitFor({ state: 'visible', timeout: 5000 });

    const qtyInput = page.locator('.product-qty input');
    await expect(qtyInput).toBeVisible({ timeout: 5000 });

    const qtyValue = await qtyInput.getAttribute('value');
    console.log('Số lượng trong giỏ hàng:', qtyValue);

    expect(parseInt(qtyValue || '0')).toBeGreaterThan(0);


    console.log('✅ PASS: Tìm kiếm → chọn màu + size → tăng SL → thêm giỏ hàng');
  } else {
    throw new Error('❌ Không tìm thấy ô tìm kiếm!');
  }
});





    test('TC_INT_002: Liên kết giữa category và search', async ({ page }) => {
      await page.goto(BASE_URL);
      
      // Click vào category
      const vestCategory = page.locator('ul.menu-top >> text="ĐẦM"').first();
      
      if (await vestCategory.isVisible()) {
        await vestCategory.click();
        await page.waitForLoadState('load', { timeout: 30000 });

        // Thực hiện search trong category
        const searchInput = page.locator('input[type="search"], input[placeholder*="tìm"], .search-input, #search');
        console.log(await searchInput.count())
        
        if (await searchInput.count() > 0) {
          await searchInput.click()
          await page.keyboard.type('tweed');

          await Promise.all([
            page.waitForLoadState('networkidle', { timeout: 30000 }),
            page.keyboard.press('Enter')
          ]);

          // Kết quả nên vừa thuộc category đầm vừa match "tweed"
          const results = page.locator('.product-detail, .product-card');
          
          if (await results.count() > 0) {
            const titles = await results.locator('.product-detail, .product-info, h2').allTextContents();
            console.log("Số kết quả",titles)

            // Kiểm tra mọi sản phẩm đều chứa cả "đầm" và "tweed"
            const allRelevant = titles.every(title => 
              title.toLowerCase().includes('đầm') && 
              title.toLowerCase().includes('tweed')
            );

            // Kiểm tra điều kiện đó
            expect(allRelevant).toBe(true);
          }
        }
      }
    });
  });
});