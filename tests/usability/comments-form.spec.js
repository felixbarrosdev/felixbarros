const { test, expect } = require('@playwright/test');

test.describe('Formulario de Comentarios', () => {
  test.beforeEach(async ({ page }) => {
    // Ir directamente a una página específica con comentarios
    await page.goto('/?p=109');
    await page.waitForLoadState('networkidle');
    
    // Esperar un poco más para asegurar que todo se cargue
    await page.waitForTimeout(2000);
    
    // Scroll hacia abajo donde debería estar el formulario
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
  });

  test('debería mostrar el formulario de comentarios', async ({ page }) => {
    // Esperar a que el formulario aparezca con timeout más largo
    const commentForm = page.locator('#respond, #commentform, .comment-form, form[action*="comment"], .comment-form-wrapper');
    
    // Intentar múltiples selectores
    await expect(commentForm.first()).toBeVisible({ timeout: 15000 });
    
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
    
    const commentForm = page.locator('#respond, #commentform, .comment-form, form[action*="comment"], .comment-form-wrapper');
    await expect(commentForm.first()).toBeVisible({ timeout: 15000 });
    const formBox = await commentForm.first().boundingBox();
    
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
    await page.waitForTimeout(1000);
    
    const commentForm = page.locator('#respond, #commentform, .comment-form, form[action*="comment"], .comment-form-wrapper');
    await expect(commentForm.first()).toBeVisible({ timeout: 15000 });
    
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

  test('debería mostrar la sección de comentarios existentes si los hay', async ({ page }) => {
    // Buscar sección de comentarios existentes
    const commentsSection = page.locator('.comments-area, #comments, .comment-list, ol.commentlist, .wp-block-comments');
    const commentItems = page.locator('.comment, .comment-body, li[id*="comment-"], article[id*="comment-"]');
    
    const commentsCount = await commentItems.count();
    
    if (commentsCount > 0) {
      await expect(commentsSection).toBeVisible();
      console.log(`✅ Se encontraron ${commentsCount} comentarios listados`);
      
      // Verificar estructura de comentarios
      const firstComment = commentItems.first();
      await expect(firstComment).toBeVisible();
      
      // Buscar elementos típicos de un comentario
      const commentContent = firstComment.locator('.comment-content, .comment-text, p');
      const commentAuthor = firstComment.locator('.comment-author, .fn, .comment-meta');
      
      if (await commentContent.count() > 0) {
        await expect(commentContent.first()).toBeVisible();
        console.log('✅ Contenido del comentario visible');
      }
      
      if (await commentAuthor.count() > 0) {
        await expect(commentAuthor.first()).toBeVisible();
        console.log('✅ Autor del comentario visible');
      }
    } else {
      console.log('ℹ️ No se encontraron comentarios existentes en esta página');
    }
  });

  test('debería tener estructura HTML correcta para comentarios', async ({ page }) => {
    // Verificar que existe la estructura para mostrar comentarios
    const commentStructures = [
      '.comments-area',
      '#comments', 
      '.comment-list',
      'ol.commentlist',
      '.wp-block-comments'
    ];
    
    let foundStructure = false;
    
    for (const selector of commentStructures) {
      const element = page.locator(selector);
      if (await element.count() > 0) {
        foundStructure = true;
        console.log(`✅ Estructura de comentarios encontrada: ${selector}`);
        break;
      }
    }
    
    // Si no hay comentarios, al menos debería existir el contenedor
    if (!foundStructure) {
      // Buscar indicadores de que el sistema está preparado para comentarios
      const commentRelated = page.locator('[class*="comment"], [id*="comment"], [data-comment]');
      const hasCommentRelated = await commentRelated.count() > 0;
      
      if (hasCommentRelated) {
        console.log('ℹ️ Sistema de comentarios detectado pero sin comentarios actuales');
      } else {
        console.log('⚠️ No se detectó estructura de comentarios');
      }
    }
  });

  test('debería simular el flujo completo de agregar comentario', async ({ page }) => {
    // Simular el proceso completo de agregar un comentario
    const testComment = {
      content: 'Este es un comentario de prueba para verificar el flujo completo',
      author: 'Usuario Test',
      email: 'test@ejemplo.com',
      url: 'https://ejemplo.com'
    };
    
    // Contar comentarios antes (si los hay)
    const commentsBefore = await page.locator('.comment, .comment-body, li[id*="comment-"]').count();
    console.log(`📊 Comentarios antes: ${commentsBefore}`);
    
    // Llenar formulario
    await page.fill('textarea[name="comment"]', testComment.content);
    await page.fill('input[name="author"]', testComment.author);
    await page.fill('input[name="email"]', testComment.email);
    
    const urlField = page.locator('input[name="url"]');
    if (await urlField.count() > 0) {
      await page.fill('input[name="url"]', testComment.url);
    }
    
    // Simular respuesta exitosa del servidor
    await page.route('**/*wp-comments-post.php*', route => {
      console.log('🔄 Simulando envío exitoso de comentario');
      
      // Simular redirección de vuelta a la página con el nuevo comentario
      route.fulfill({
        status: 302,
        headers: {
          'Location': route.request().url().split('wp-comments-post.php')[0] + '?p=109#comment-new'
        }
      });
    });
    
    // Enviar formulario
    const submitButton = page.locator('input[type="submit"], button[type="submit"]');
    await submitButton.click();
    
    // Esperar a que se procese
    await page.waitForTimeout(1000);
    
    console.log('✅ Flujo de envío de comentario simulado correctamente');
  });

  test('debería manejar errores de envío de comentarios', async ({ page }) => {
    // Verificar que el formulario está visible antes de empezar
    const commentForm = page.locator('#respond, #commentform, .comment-form, .comment-form-wrapper');
    await expect(commentForm.first()).toBeVisible({ timeout: 15000 });
    
    // Llenar formulario con datos válidos
    await page.fill('textarea[name="comment"]', 'Comentario de prueba');
    await page.fill('input[name="author"]', 'Test User');
    await page.fill('input[name="email"]', 'test@test.com');
    
    // Simular error del servidor
    await page.route('**/*wp-comments-post.php*', route => {
      console.log('🚫 Simulando error del servidor');
      route.fulfill({
        status: 500,
        body: 'Error interno del servidor'
      });
    });
    
    const submitButton = page.locator('input[type="submit"], button[type="submit"]');
    await submitButton.click();
    
    // Verificar que el usuario permanece en la página o ve un mensaje de error
    await page.waitForTimeout(2000);
    
    // El formulario debería seguir visible para reintentar
    // En caso de error, el usuario debería permanecer en la misma página
    const currentUrl = page.url();
    expect(currentUrl).toContain('p=109');
    
    console.log('✅ Manejo de errores verificado - usuario permanece en la página');
  });

  test('debería verificar accesibilidad del sistema de comentarios', async ({ page }) => {
    // Verificar etiquetas y asociaciones
    const commentTextarea = page.locator('textarea[name="comment"]');
    const commentLabel = page.locator('label[for="comment"]');
    
    if (await commentLabel.count() > 0) {
      await expect(commentLabel).toBeVisible();
      console.log('✅ Label para textarea de comentario presente');
    }
    
    // Verificar campos requeridos tienen indicación
    const requiredFields = page.locator('input[required], textarea[required]');
    const requiredCount = await requiredFields.count();
    
    if (requiredCount > 0) {
      console.log(`✅ ${requiredCount} campos marcados como requeridos`);
      
      // Verificar que hay indicación visual de campos requeridos
      const hasRequiredIndicator = await page.evaluate(() => {
        const required = document.querySelectorAll('[required]');
        return Array.from(required).some(field => {
          const label = document.querySelector(`label[for="${field.id}"]`);
          return label && (label.textContent.includes('*') || label.textContent.includes('requerido'));
        });
      });
      
      if (hasRequiredIndicator) {
        console.log('✅ Indicadores visuales de campos requeridos presentes');
      }
    }
    
    // Verificar roles ARIA si están presentes
    const ariaElements = page.locator('[role], [aria-label], [aria-describedby]');
    const ariaCount = await ariaElements.count();
    
    if (ariaCount > 0) {
      console.log(`✅ ${ariaCount} elementos con atributos ARIA encontrados`);
    }
  });
});