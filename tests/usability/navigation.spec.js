const { test, expect } = require('@playwright/test');

test.describe('Navegación Principal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('debería cargar la página principal correctamente', async ({ page }) => {
    // Verificar que la página se carga
    await expect(page).toHaveTitle(/Felix Barros/);
    
    // Verificar elementos principales
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('main, .content, article')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
  });

  test('debería mostrar el logo y navegación en el header', async ({ page }) => {
    // Verificar logo/título del sitio
    const siteTitle = page.locator('header').locator(':has-text("Felix Barros")').first();
    await expect(siteTitle).toBeVisible();
    
    // Verificar elementos de navegación
    const navigation = page.locator('nav, .menu, [role="navigation"]');
    if (await navigation.count() > 0) {
      await expect(navigation.first()).toBeVisible();
    }
    
    // Verificar enlaces del header (Inicio, Biografía, etc.)
    const headerLinks = page.locator('header a');
    await expect(headerLinks.first()).toBeVisible();
  });

  test('debería permitir navegación por enlaces del header', async ({ page }) => {
    // Buscar enlaces de navegación en el header
    const navigationLinks = await page.locator('header a').all();
    
    for (const link of navigationLinks) {
      const href = await link.getAttribute('href');
      const text = await link.textContent();
      
      if (href && !href.startsWith('#') && !href.startsWith('mailto:')) {
        console.log(`Probando navegación a: ${text} (${href})`);
        
        // Click en el enlace
        await link.click();
        await page.waitForLoadState('networkidle');
        
        // Verificar que la navegación funcionó
        await expect(page).toHaveURL(new RegExp(href.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
        
        // Regresar a la página principal para el siguiente test
        await page.goto('/');
        await page.waitForLoadState('networkidle');
      }
    }
  });

  test('debería mostrar contenido principal de artículos', async ({ page }) => {
    // Verificar que hay artículos visibles
    const articles = page.locator('article, .post, .entry, .blog-post');
    await expect(articles.first()).toBeVisible();
    
    // Verificar que los artículos tienen títulos
    const articleTitles = page.locator('article h1, article h2, .post h1, .post h2, .entry h1, .entry h2');
    if (await articleTitles.count() > 0) {
      await expect(articleTitles.first()).toBeVisible();
    }
  });

  test('debería tener footer con información del sitio', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    
    // Verificar copyright o información del autor
    const footerText = await footer.textContent();
    expect(footerText).toMatch(/Felix Barros|copyright|©/i);
  });
});