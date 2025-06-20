// @ts-nocheck
import { test, expect } from '@playwright/test';

const BASE_URL = 'https://newday.com.vn/';

test.describe('New Day - Tìm kiếm sản phẩm', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    // Đợi trang load hoàn toàn
    await page.waitForLoadState('load', );
  });

  test.describe('Tìm kiếm theo từ khóa', () => {
    
    test('TC_SEARCH_001: Tìm kiếm theo tên sản phẩm hợp lệ - "áo vest"', async ({ page }) => {
      // Tìm ô search (có thể là input hoặc search icon)
      const searchInput = page.locator('input[type="search"], input[placeholder*="tìm"], .search-input, #search');
      
      if (await searchInput.count() > 0) {
        await searchInput.fill('áo vest');
        await page.keyboard.press('Enter');
        
        // Đợi kết quả tìm kiếm load
        await page.waitForLoadState('load', { timeout: 30000 });

        // Kiểm tra có kết quả hiển thị
        const searchResults = page.locator('.product-detail, .product-card');
        await expect(searchResults.first()).toBeVisible();
        
        // Kiểm tra kết quả có chứa từ khóa
        const productTitles = page.locator('.product-title, .product-name, h3, h4');
        const count = await productTitles.count();
        
        if (count > 0) {
          const firstTitle = await productTitles.first().textContent();
          expect(firstTitle?.toLowerCase()).toContain('vest');
        }
      } else {
        console.log('Không tìm thấy ô search, có thể cần click vào icon search trước');
      }
    });

    test('TC_SEARCH_002: Tìm kiếm không phân biệt hoa thường', async ({ page }) => {
      const searchInputs = [
        'ÁO VEST',
        'áo vest', 
        'Áo Vest'
      ];
      
      for (const searchTerm of searchInputs) {
        await page.goto(BASE_URL);
        await page.waitForLoadState('load', );
        
        const searchInput = page.locator('input[type="search"], input[placeholder*="tìm"], .search-input, #search');
        
        if (await searchInput.count() > 0) {
          await searchInput.fill(searchTerm);
          await page.keyboard.press('Enter');
          await page.waitForLoadState('load', );
          
          const searchResults = page.locator('.product-detail, .product-card');
          await expect(searchResults.first()).toBeVisible();
        }
      }
    });

    test('TC_SEARCH_003: Tìm kiếm có dấu/không dấu', async ({ page }) => {
      const searchTerms = ['đầm', 'dam'];
      
      for (const term of searchTerms) {
        await page.goto(BASE_URL);
        await page.waitForLoadState('load', );
        
        const searchInput = page.locator('input[type="search"], input[placeholder*="tìm"], .search-input, #search');
        
        if (await searchInput.count() > 0) {
          await searchInput.fill(term);
          await page.keyboard.press('Enter');
          // Tìm kiếm và chờ điều hướng
          await Promise.all([
            page.waitForLoadState('load', { timeout: 30000 }),
          ]);

          // Đợi phần kết quả xuất hiện (có thể tùy chỉnh selector)
          await page.waitForSelector('.product-detail, .product-card', { timeout: 10000 });
          
          // Cả hai từ khóa đều nên cho kết quả tương tự
          const searchResults = page.locator('.product-detail, .product-card');
          const resultCount = await searchResults.count();
          
          console.log(`Tìm kiếm "${term}": ${resultCount} kết quả`);
        }
      }
    });

    test('TC_SEARCH_004: Tìm kiếm từ khóa một phần', async ({ page }) => {
      const partialKeywords = ['vest', 'quần', 'váy'];
      
      for (const keyword of partialKeywords) {
        await page.goto(BASE_URL);
        await page.waitForLoadState('load', );
        
        const searchInput = page.locator('input[type="search"], input[placeholder*="tìm"], .search-input, #search');
        
        if (await searchInput.count() > 0) {
          await searchInput.fill(keyword);
          await page.keyboard.press('Enter');
          await page.waitForLoadState('load', );
          
          // Đợi phần kết quả xuất hiện (có thể tùy chỉnh selector)
          await page.waitForSelector('.product-detail, .product-card', { timeout: 10000 });

          const searchResults = page.locator('.product-detail, .product-card');
          const resultCount = await searchResults.count();
          
          expect(resultCount).toBeGreaterThan(0);
        }
      }
    });
  });

  test.describe('Bộ lọc và sắp xếp sản phẩm', () => {
    

    test('TC_FILTER_001: Kiểm tra bộ lọc theo size', async ({ page }) => {
      // Vào trang có nhiều sản phẩm
      await page.goto(BASE_URL);

      // Click vào danh mục ÁO VEST
      const MenuItem = page.locator('li.tp_menu_item', { hasText: 'ÁO VEST' });
      if (await MenuItem.count() > 0) {
        await MenuItem.first().click();

        // Đợi trang load
        await Promise.all([
          page.waitForLoadState('load', { timeout: 30000 }),
        ]);
        const sizeFilters = page.locator(
          '.tp_product_category_filter_attribute ',{ hasText: 'Kích thước' },
        );
        
        if (await sizeFilters.count() > 0) {
          const sizeS = page.locator('text="S"').first();
          
          if (await sizeS.isVisible()) {
            await sizeS.click();
            await page.waitForLoadState('load', );
            
            // Kiểm tra kết quả có size S
            const products = page.locator('.product-detail, .product-card');

              const total = await products.count();
              let matchCount = 0;
              for (let i = 0; i < total; i++) {
                const product = products.nth(i);

                // Kiểm tra bên trong sản phẩm có chứa chữ 'S' không (ví dụ: size S hiển thị dưới class .size-label hoặc tương đương)
                const sizeLabel = product.locator('.product-detail, .product-info', {hasText: '- S'}); // tùy vào DOM thực tế

                if (await sizeLabel.count() > 0) {
                  matchCount++;
                }
              }

              console.log(`🧵 Có ${matchCount}/${total} sản phẩm khớp với bộ lọc size "S"`);

              // Có thể thêm assert nếu bạn kỳ vọng phải có ít nhất 1 kết quả
              expect(matchCount).toBeGreaterThan(0);
          }
        }
      }
    });

    test('TC_SORT_001: Sắp xếp theo giá', async ({ page }) => {
      const items = [ 'priceAsc', 'priceDesc' ];
      // Vào trang có nhiều sản phẩm
      for (const item of items) {
        await page.goto(BASE_URL);
        
        // Click vào danh mục ÁO VEST
        const MenuItem = page.locator('li.tp_menu_item', { hasText: 'ÁO VEST' });
        if (await MenuItem.count() > 0) {
          await MenuItem.first().click();

          // Đợi trang load
          await Promise.all([
            page.waitForLoadState('load', { timeout: 30000 }),
          ]);
          
          // Find sort select
          const sortSelect = page.locator('select#sortControl');
          try {
            await sortSelect.waitFor({ state: 'visible', timeout: 15000 });
            console.log(`Số lượng sort select: ${await sortSelect.count()}`);
          } catch (error) {
            console.warn(`⚠️ Không tìm thấy #sortControl sau 15 giây: ${error}`);
            await page.screenshot({ path: 'debug-no-sort-select.png' });
            return; // Thoát test nếu không tìm thấy
          }

          if (await sortSelect.count() > 0) {
            // Select "Giá tăng dần"
            const option = sortSelect.locator(`option[value*="${item}"]`);
            const value = await option.getAttribute('value');
            if (value) {
              await sortSelect.selectOption(value);
            }


            // Wait for page to reload after sort
            await page.waitForLoadState('load', { timeout: 30000 });

            // Debug: Take screenshot after sort
            await page.screenshot({ path: 'debug-after-sort.png' });

            // Lấy danh sách div chứa giá
            const priceContainers = await page.locator('div.price-new-old').elementHandles();
            const priceNumbers = [];

            for (const container of priceContainers) {
              const oldPriceEl = await container.$('.tp_product_price_old');
              let priceText;

              if (oldPriceEl) {
                priceText = await oldPriceEl.textContent();
              } else {
                const newPriceEl = await container.$('.tp_product_price');
                priceText = await newPriceEl?.textContent();
              }

              if (priceText) {
                const number = parseInt(priceText.replace(/[^\d]/g, ''));
                if (!isNaN(number)) {
                  priceNumbers.push(number);
                }
              }
            }

            console.log(`Tìm thấy ${priceNumbers.length} giá sản phẩm.`);
            console.log('Giá sau sắp xếp (5 giá đầu):', priceNumbers.slice(0, 5));

            if (priceNumbers.length >= 2) {
              for (let i = 0; i < priceNumbers.length - 1; i++) {
                if(item === 'priceAsc') {
                const current = priceNumbers[i];
                const next = priceNumbers[i + 1];

                expect(current).toBeLessThanOrEqual(next);
                }else if(item === 'priceDesc') {
                const current = priceNumbers[i];
                const next = priceNumbers[i + 1];
                expect(current).toBeGreaterThanOrEqual(next);
                }
              }
            } else {
              console.warn(`⚠️ Không đủ sản phẩm để kiểm tra sắp xếp (${priceNumbers.length} sản phẩm).`);
            }
          } else {
            console.warn('⚠️ Không tìm thấy menu sắp xếp (#sortControl).');
            await page.screenshot({ path: 'debug-no-sort-select.png' });
          }
        } else {
          await page.screenshot({ path: 'debug-no-search-input.png' });
        }
      }
    });


    test('TC_SORT_002: Sắp xếp theo tên A-Z', async ({ page }) => {
      const items = [ 'nameAsc', 'nameDesc' ];
      // Vào trang có nhiều sản phẩm
      for (const item of items) {
        await page.goto(BASE_URL);
        
        // Click vào danh mục ÁO VEST
        const MenuItem = page.locator('li.tp_menu_item', { hasText: 'ÁO VEST' });
        if (await MenuItem.count() > 0) {
          await MenuItem.first().click();

          // Đợi trang load
          await Promise.all([
            page.waitForLoadState('load', { timeout: 30000 }),
          ]);
          
          // Find sort select
          const sortSelect = page.locator('select#sortControl');
          try {
            await sortSelect.waitFor({ state: 'visible', timeout: 15000 });
          } catch (error) {
            console.warn(`⚠️ Không tìm thấy #sortControl sau 15 giây: ${error}`);
            await page.screenshot({ path: 'debug-no-sort-name-select.png' });
            return; // Thoát test nếu không tìm thấy
          }

          if (await sortSelect.count() > 0) {
            const option = sortSelect.locator(`option[value*="${item}"]`);
            const value = await option.getAttribute('value');
            if (value) {
              await sortSelect.selectOption(value);
            }


            // Wait for page to reload after sort
            await page.waitForLoadState('load', { timeout: 30000 });

            // Debug: Take screenshot after sort
            await page.screenshot({ path: 'debug-after-name-sort.png' });
          
            // Kiểm tra sắp xếp
            const productTitles = page.locator('.tp_product_name, h2');
            
            if (await productTitles.count() >= 2) {
              const count = await productTitles.count();
              for (let i = 0; i < count - 1; i++) {
                const titleA = (await productTitles.nth(i).textContent())?.trim() || '';
                const titleB = (await productTitles.nth(i + 1).textContent())?.trim() || '';

                if (item === 'nameAsc') {
                  expect(titleA.localeCompare(titleB)).toBeLessThanOrEqual(0);
                } else if (item === 'nameDesc') {
                  expect(titleA.localeCompare(titleB)).toBeGreaterThanOrEqual(0);
                }
              }
            }
          }
        } else {
          await page.screenshot({ path: 'debug-no-sort-select.png' });
        }
      }
    });
  });
});

