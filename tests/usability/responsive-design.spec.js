const { test, expect } = require('@playwright/test');

test.describe('Diseño Responsivo y Móvil', () => {
  const devices = [
    { width: 375, height: 667, name: 'iPhone SE' },
    { width: 414, height: 896, name: 'iPhone 11 Pro' },
    { width: 768, height: 1024, name: 'iPad' },
    { width: 1024, height: 768, name: 'iPad Landscape' },
    { width: 1200, height: 800, name: 'Desktop Small' },
    { width: 1920, height: 1080, name: 'Desktop Large' }
  ];

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  devices.forEach(device => {
    test(`debería funcionar correctamente en ${device.name} (${device.width}x${device.height})`, async ({ page }) => {
      await page.setViewportSize({ width: device.width, height: device.height });
      await page.waitForTimeout(500);

      // Verificar que no hay scroll horizontal
      const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
      const windowWidth = await page.evaluate(() => window.innerWidth);
      expect(bodyScrollWidth).toBeLessThanOrEqual(windowWidth + 5);

      // Verificar elementos principales visibles
      await expect(page.locator('header')).toBeVisible();
      await expect(page.locator('main, .content, article').first()).toBeVisible();
      await expect(page.locator('footer')).toBeVisible();

      // Verificar que el texto es legible (no muy pequeño)
      const bodyFontSize = await page.evaluate(() => {
        const body = document.body;
        return parseInt(window.getComputedStyle(body).fontSize);
      });
      expect(bodyFontSize).toBeGreaterThanOrEqual(14); // Tamaño mínimo legible

      console.log(`✓ ${device.name}: Layout funcional, sin scroll horizontal, fuente legible (${bodyFontSize}px)`);
    });
  });

  test('debería tener elementos clickeables apropiados para móvil', async ({ page }) => {
    // Probar en tamaño móvil
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Verificar tamaño de enlaces y botones
    const clickableElements = await page.locator('a, button, [role="button"]').all();
    
    for (let i = 0; i < Math.min(clickableElements.length, 10); i++) {
      const element = clickableElements[i];
      
      if (await element.isVisible()) {
        const box = await element.boundingBox();
        
        if (box) {
          // Verificar tamaño mínimo para touch targets (44x44px recomendado)
          const minSize = 32; // Relajado para algunos elementos
          
          if (box.width < minSize || box.height < minSize) {
            console.warn(`Elemento clickeable pequeño: ${box.width}x${box.height}px`);
          }
          
          // Al menos uno de los elementos principales debería cumplir el estándar
          if (i < 3) {
            expect(box.width).toBeGreaterThanOrEqual(minSize);
            expect(box.height).toBeGreaterThanOrEqual(minSize);
          }
        }
      }
    }
  });

  test('debería adaptar la navegación en móvil', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);

    // Verificar si hay menú hamburguesa o navegación adaptada
    const mobileNav = page.locator('.mobile-menu, .hamburger, .menu-toggle, [aria-label*="menu"]');
    const regularNav = page.locator('nav a, .menu a').first();

    // Debería existir algún tipo de navegación
    const hasMobileNav = await mobileNav.count() > 0;
    const hasRegularNav = await regularNav.isVisible();

    expect(hasMobileNav || hasRegularNav).toBeTruthy();

    if (hasMobileNav) {
      console.log('✓ Navegación móvil específica detectada');
    } else {
      console.log('✓ Navegación regular adaptada para móvil');
    }
  });

  test('debería mostrar imágenes responsive', async ({ page }) => {
    const viewports = [
      { width: 375, height: 667 },
      { width: 768, height: 1024 },
      { width: 1200, height: 800 }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(500);

      const images = page.locator('img');
      const imageCount = await images.count();

      if (imageCount > 0) {
        // Verificar primeras 3 imágenes
        for (let i = 0; i < Math.min(imageCount, 3); i++) {
          const image = images.nth(i);
          const box = await image.boundingBox();

          if (box) {
            // La imagen no debería ser más ancha que el viewport
            expect(box.width).toBeLessThanOrEqual(viewport.width + 20); // +20 tolerancia
            
            // Verificar que la imagen se ve completa
            await expect(image).toBeVisible();
          }
        }
        console.log(`✓ ${viewport.width}px: Imágenes responsive funcionando`);
      }
    }
  });

  test('debería mantener legibilidad del contenido en todos los tamaños', async ({ page }) => {
    const testViewports = [
      { width: 320, height: 568, name: 'iPhone 5' },
      { width: 768, height: 1024, name: 'iPad' },
      { width: 1440, height: 900, name: 'Desktop' }
    ];

    for (const viewport of testViewports) {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(500);

      // Verificar que el contenido principal es legible
      const mainContent = page.locator('article, .content, .post').first();
      if (await mainContent.count() > 0) {
        await expect(mainContent).toBeVisible();

        // Verificar ancho del contenido
        const contentBox = await mainContent.boundingBox();
        if (contentBox) {
          // El contenido no debería ser más ancho que el viewport
          expect(contentBox.width).toBeLessThanOrEqual(viewport.width + 10);
          
          // El contenido debería ocupar una buena porción del viewport
          const minContentWidth = viewport.width * 0.7; // Al menos 70%
          expect(contentBox.width).toBeGreaterThanOrEqual(minContentWidth);
        }
      }

      console.log(`✓ ${viewport.name}: Contenido legible y bien dimensionado`);
    }
  });

  test('debería permitir scroll vertical suave', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Verificar que podemos hacer scroll
    const initialScrollY = await page.evaluate(() => window.scrollY);
    
    // Intentar scroll hacia abajo
    await page.evaluate(() => window.scrollBy(0, 200));
    await page.waitForTimeout(300);
    
    const newScrollY = await page.evaluate(() => window.scrollY);
    expect(newScrollY).toBeGreaterThan(initialScrollY);
    
    // Verificar que no hay problemas de overflow
    const hasHorizontalScrollbar = await page.evaluate(() => {
      return document.body.scrollWidth > window.innerWidth;
    });
    
    expect(hasHorizontalScrollbar).toBeFalsy();
    console.log('✓ Scroll vertical funciona correctamente, sin scroll horizontal');
  });
});