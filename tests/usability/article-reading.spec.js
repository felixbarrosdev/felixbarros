const { test, expect } = require('@playwright/test');

test.describe('Experiencia de Lectura de Artículos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('debería permitir acceder a un artículo desde la página principal', async ({ page }) => {
    // Buscar el primer enlace de artículo
    const articleLink = page.locator('article a, .post a, .entry-title a, h1 a, h2 a').first();
    
    if (await articleLink.count() > 0) {
      const articleTitle = await articleLink.textContent();
      console.log(`Accediendo al artículo: ${articleTitle}`);
      
      // Click en el enlace del artículo
      await articleLink.click();
      await page.waitForLoadState('networkidle');
      
      // Verificar que estamos en la página del artículo
      await expect(page.locator('article, .post, .single-post')).toBeVisible();
      
      // Verificar que hay contenido del artículo
      const content = page.locator('article .content, .post-content, .entry-content, .post p');
      await expect(content.first()).toBeVisible();
    }
  });

  test('debería mostrar la estructura completa del artículo', async ({ page }) => {
    // Acceder al primer artículo disponible
    const articleLink = page.locator('article a, .post a, .entry-title a, h1 a, h2 a').first();
    
    if (await articleLink.count() > 0) {
      await articleLink.click();
      await page.waitForLoadState('networkidle');
      
      // Verificar elementos esperados en un artículo
      const articleContainer = page.locator('article, .post, .single-post').first();
      await expect(articleContainer).toBeVisible();
      
      // Verificar título del artículo
      const title = page.locator('h1, .entry-title, .post-title').first();
      await expect(title).toBeVisible();
      
      // Verificar contenido del artículo
      const content = page.locator('.content, .post-content, .entry-content, article p').first();
      await expect(content).toBeVisible();
      
      // Verificar fecha si está presente
      const dateElement = page.locator('.date, .post-date, .published, time');
      if (await dateElement.count() > 0) {
        await expect(dateElement.first()).toBeVisible();
      }
    }
  });

  test('debería tener navegación de regreso desde un artículo', async ({ page }) => {
    const articleLink = page.locator('article a, .post a, .entry-title a, h1 a, h2 a').first();
    
    if (await articleLink.count() > 0) {
      await articleLink.click();
      await page.waitForLoadState('networkidle');
      
      // Verificar que el logo/título del sitio funciona como enlace de regreso
      const siteLink = page.locator('header a').first();
      if (await siteLink.count() > 0) {
        await siteLink.click();
        await page.waitForLoadState('networkidle');
        
        // Verificar que regresamos a la página principal
        await expect(page).toHaveURL('/');
      }
    }
  });

  test('debería mostrar imágenes del artículo correctamente', async ({ page }) => {
    const articleLink = page.locator('article a, .post a, .entry-title a, h1 a, h2 a').first();
    
    if (await articleLink.count() > 0) {
      await articleLink.click();
      await page.waitForLoadState('networkidle');
      
      // Verificar imágenes en el artículo
      const images = page.locator('article img, .post img, .content img');
      const imageCount = await images.count();
      
      if (imageCount > 0) {
        console.log(`Encontradas ${imageCount} imágenes en el artículo`);
        
        for (let i = 0; i < Math.min(imageCount, 3); i++) {
          const image = images.nth(i);
          await expect(image).toBeVisible();
          
          // Verificar que la imagen se carga correctamente
          const src = await image.getAttribute('src');
          if (src) {
            const response = await page.request.get(src);
            expect(response.status()).toBe(200);
          }
        }
      }
    }
  });

  test('debería tener contenido legible y bien formateado', async ({ page }) => {
    const articleLink = page.locator('article a, .post a, .entry-title a, h1 a, h2 a').first();
    
    if (await articleLink.count() > 0) {
      await articleLink.click();
      await page.waitForLoadState('networkidle');
      
      // Verificar que hay párrafos con contenido suficiente
      const paragraphs = page.locator('article p, .post p, .content p');
      const paragraphCount = await paragraphs.count();
      
      if (paragraphCount > 0) {
        expect(paragraphCount).toBeGreaterThan(0);
        
        // Verificar que los párrafos tienen contenido
        const firstParagraph = paragraphs.first();
        const text = await firstParagraph.textContent();
        expect(text?.trim().length).toBeGreaterThan(10);
      }
      
      // Verificar estructura de headings si existen
      const headings = page.locator('article h1, article h2, article h3, .content h1, .content h2, .content h3');
      const headingCount = await headings.count();
      
      if (headingCount > 0) {
        console.log(`Encontrados ${headingCount} headings en el artículo`);
        await expect(headings.first()).toBeVisible();
      }
    }
  });

  test('debería mantener el diseño responsive en artículos', async ({ page }) => {
    const articleLink = page.locator('article a, .post a, .entry-title a, h1 a, h2 a').first();
    
    if (await articleLink.count() > 0) {
      await articleLink.click();
      await page.waitForLoadState('networkidle');
      
      // Probar diferentes tamaños de viewport
      const viewports = [
        { width: 375, height: 667, name: 'Mobile' },
        { width: 768, height: 1024, name: 'Tablet' },
        { width: 1200, height: 800, name: 'Desktop' }
      ];
      
      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await page.waitForTimeout(500);
        
        console.log(`Probando responsividad en ${viewport.name}`);
        
        // Verificar que el contenido sigue visible
        await expect(page.locator('article, .post, .content').first()).toBeVisible();
        
        // Verificar que no hay scroll horizontal
        const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
        const windowWidth = await page.evaluate(() => window.innerWidth);
        expect(bodyScrollWidth).toBeLessThanOrEqual(windowWidth + 5); // +5 para tolerancia
      }
    }
  });
});