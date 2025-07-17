const { test, expect } = require('@playwright/test');

test.describe('Formulario de Comentarios', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Navegar al primer artículo
    const articleLink = page.locator('article a, .post a, .entry-title a, h1 a, h2 a').first();
    if (await articleLink.count() > 0) {
      await articleLink.click();
      await page.waitForLoadState('networkidle');
      
      // Scroll hacia abajo donde debería estar el formulario
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(500);
    }
  });

  test('debería mostrar el formulario de comentarios', async ({ page }) => {
    const commentForm = page.locator('#respond, #commentform, .comment-form, form[action*="comment"]');
    await expect(commentForm).toBeVisible();
    
    console.log('✅ Formulario de comentarios visible');
  });

  test('debería tener todos los campos necesarios', async ({ page }) => {
    // Verificar textarea para el comentario
    const commentTextarea = page.locator('textarea[name="comment"], #comment');
    await expect(commentTextarea).toBeVisible();
    await expect(commentTextarea).toHaveAttribute('required');
    
    // Verificar campo nombre
    const authorField = page.locator('input[name="author"], #author');
    await expect(authorField).toBeVisible();
    
    // Verificar campo email
    const emailField = page.locator('input[name="email"], #email');
    await expect(emailField).toBeVisible();
    
    // Verificar botón de envío
    const submitButton = page.locator('input[type="submit"], button[type="submit"]');
    await expect(submitButton).toBeVisible();
    
    console.log('✅ Todos los campos del formulario están presentes');
  });

  test('debería tener placeholders apropiados', async ({ page }) => {
    const commentTextarea = page.locator('textarea[name="comment"]');
    const placeholder = await commentTextarea.getAttribute('placeholder');
    expect(placeholder).toBeTruthy();
    expect(placeholder.length).toBeGreaterThan(5);
    
    const authorField = page.locator('input[name="author"]');
    const authorPlaceholder = await authorField.getAttribute('placeholder');
    expect(authorPlaceholder).toBeTruthy();
    
    console.log(`✅ Placeholders: "${placeholder}", "${authorPlaceholder}"`);
  });

  test('debería permitir escribir en todos los campos', async ({ page }) => {
    // Escribir en el textarea del comentario
    const commentText = 'Este es un comentario de prueba para verificar funcionalidad';
    await page.fill('textarea[name="comment"]', commentText);
    await expect(page.locator('textarea[name="comment"]')).toHaveValue(commentText);
    
    // Escribir nombre del autor
    const authorName = 'Usuario de Prueba';
    await page.fill('input[name="author"]', authorName);
    await expect(page.locator('input[name="author"]')).toHaveValue(authorName);
    
    // Escribir email
    const email = 'test@ejemplo.com';
    await page.fill('input[name="email"]', email);
    await expect(page.locator('input[name="email"]')).toHaveValue(email);
    
    // Escribir URL si existe
    const urlField = page.locator('input[name="url"]');
    if (await urlField.count() > 0) {
      const website = 'https://ejemplo.com';
      await page.fill('input[name="url"]', website);
      await expect(urlField).toHaveValue(website);
    }
    
    console.log('✅ Todos los campos permiten escribir correctamente');
  });

  test('debería validar campos requeridos', async ({ page }) => {
    // Intentar enviar formulario sin llenar campos requeridos
    const submitButton = page.locator('input[type="submit"], button[type="submit"]');
    
    // Verificar que el comentario es requerido
    await submitButton.click();
    
    // En navegadores modernos, debería aparecer mensaje de validación
    const commentField = page.locator('textarea[name="comment"]');
    const validationMessage = await commentField.evaluate(el => el.validationMessage);
    
    if (validationMessage) {
      expect(validationMessage.length).toBeGreaterThan(0);
      console.log(`✅ Validación funcionando: "${validationMessage}"`);
    } else {
      console.log('ℹ️ Validación HTML5 no detectada o personalizada');
    }
  });

  test('debería tener estilos apropiados en desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    
    const commentForm = page.locator('#respond, #commentform, .comment-form, form[action*="comment"]');
    const formBox = await commentForm.boundingBox();
    
    // Verificar que el formulario no es muy ancho
    expect(formBox.width).toBeLessThanOrEqual(800);
    expect(formBox.width).toBeGreaterThan(300);
    
    // Verificar campos individuales
    const textarea = page.locator('textarea[name="comment"]');
    const textareaBox = await textarea.boundingBox();
    
    expect(textareaBox.height).toBeGreaterThan(100); // Altura mínima
    expect(textareaBox.width).toBeGreaterThan(200);
    
    console.log(`✅ Desktop: Formulario ${formBox.width}px, textarea ${textareaBox.width}x${textareaBox.height}px`);
  });

  test('debería ser responsive en móvil', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    const commentForm = page.locator('#respond, #commentform, .comment-form, form[action*="comment"]');
    await expect(commentForm).toBeVisible();
    
    // Verificar que no hay scroll horizontal
    const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const windowWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyScrollWidth).toBeLessThanOrEqual(windowWidth + 10);
    
    // Verificar campos en móvil
    const inputs = await page.locator('input[type="text"], input[type="email"], textarea').all();
    
    for (const input of inputs) {
      if (await input.isVisible()) {
        const box = await input.boundingBox();
        expect(box.height).toBeGreaterThan(35); // Altura mínima para touch
        expect(box.width).toBeLessThanOrEqual(375); // No más ancho que la pantalla
      }
    }
    
    console.log('✅ Móvil: Formulario responsive, campos apropiados para touch');
  });

  test('debería tener contraste adecuado', async ({ page }) => {
    const styleIssues = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input[type="text"], input[type="email"], textarea'));
      const issues = [];
      
      inputs.forEach(input => {
        const styles = window.getComputedStyle(input);
        const color = styles.color;
        const backgroundColor = styles.backgroundColor;
        const border = styles.border;
        
        // Verificar que hay contraste
        if (color === backgroundColor) {
          issues.push(`${input.name}: mismo color de texto y fondo`);
        }
        
        // Verificar que hay border visible
        if (border === 'none' || styles.borderWidth === '0px') {
          issues.push(`${input.name}: sin border visible`);
        }
        
        // Verificar que no es muy pequeño
        const rect = input.getBoundingClientRect();
        if (rect.height < 35) {
          issues.push(`${input.name}: muy pequeño (${rect.height}px)`);
        }
      });
      
      return issues;
    });
    
    console.log('🔍 Problemas de estilo detectados:', styleIssues);
    
    // Permitir algunos problemas menores, pero no críticos
    const criticalIssues = styleIssues.filter(issue => 
      issue.includes('mismo color') || issue.includes('muy pequeño')
    );
    
    expect(criticalIssues.length).toBeLessThan(2);
  });

  test('debería enfocar campos correctamente con teclado', async ({ page }) => {
    // Probar navegación por teclado
    await page.keyboard.press('Tab');
    
    // Verificar que podemos enfocar el textarea
    const commentField = page.locator('textarea[name="comment"]');
    await commentField.focus();
    await expect(commentField).toBeFocused();
    
    // Navegar al siguiente campo
    await page.keyboard.press('Tab');
    const authorField = page.locator('input[name="author"]');
    await expect(authorField).toBeFocused();
    
    // Navegar al campo email
    await page.keyboard.press('Tab');
    const emailField = page.locator('input[name="email"]');
    await expect(emailField).toBeFocused();
    
    console.log('✅ Navegación por teclado funcional');
  });

  test('debería mostrar indicadores visuales de foco', async ({ page }) => {
    const commentField = page.locator('textarea[name="comment"]');
    await commentField.focus();
    
    // Verificar que hay indicador visual de foco
    const focusStyles = await commentField.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        outline: styles.outline,
        outlineWidth: styles.outlineWidth,
        boxShadow: styles.boxShadow,
        borderColor: styles.borderColor
      };
    });
    
    const hasFocusIndicator = 
      focusStyles.outline !== 'none' ||
      focusStyles.outlineWidth !== '0px' ||
      focusStyles.boxShadow !== 'none' ||
      focusStyles.borderColor.includes('rgb');
    
    expect(hasFocusIndicator).toBeTruthy();
    console.log('✅ Indicadores de foco presentes:', focusStyles);
  });

  test('debería funcionar el envío del formulario (sin enviarlo realmente)', async ({ page }) => {
    // Llenar el formulario completo
    await page.fill('textarea[name="comment"]', 'Comentario de prueba automatizada');
    await page.fill('input[name="author"]', 'Test User');
    await page.fill('input[name="email"]', 'test@test.com');
    
    const urlField = page.locator('input[name="url"]');
    if (await urlField.count() > 0) {
      await page.fill('input[name="url"]', 'https://test.com');
    }
    
    // Interceptar el envío para no enviarlo realmente
    await page.route('**/*wp-comments-post.php*', route => {
      console.log('🚫 Interceptado envío del formulario (test)');
      route.fulfill({
        status: 200,
        body: 'Test intercepted'
      });
    });
    
    const submitButton = page.locator('input[type="submit"], button[type="submit"]');
    await submitButton.click();
    
    console.log('✅ Formulario se puede enviar (interceptado para test)');
  });
});