const { chromium } = require('playwright');

async function inspectCommentsForm() {
  console.log('🔍 Inspeccionando formulario de comentarios...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Ir a la página principal
    await page.goto('http://localhost:8000/', { waitUntil: 'networkidle' });
    
    // Buscar el primer artículo y hacer click
    const articleLink = page.locator('article a, .post a, .entry-title a, h1 a, h2 a').first();
    
    if (await articleLink.count() > 0) {
      console.log('📰 Accediendo al primer artículo...');
      await articleLink.click();
      await page.waitForLoadState('networkidle');
      
      // Scroll hacia abajo para encontrar el formulario de comentarios
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
      await page.waitForTimeout(1000);
      
      // Buscar formulario de comentarios
      const commentForm = page.locator('#respond, #commentform, .comment-form, form[action*="comment"]');
      const commentFormExists = await commentForm.count() > 0;
      
      console.log(`💬 Formulario de comentarios encontrado: ${commentFormExists}`);
      
      if (commentFormExists) {
        // Analizar estructura del formulario
        const formAnalysis = await page.evaluate(() => {
          const form = document.querySelector('#respond, #commentform, .comment-form, form[action*="comment"]');
          
          if (!form) return null;
          
          const inputs = Array.from(form.querySelectorAll('input, textarea, select'));
          const labels = Array.from(form.querySelectorAll('label'));
          const submitButton = form.querySelector('input[type="submit"], button[type="submit"]');
          
          return {
            formExists: true,
            formClasses: form.className,
            formId: form.id,
            inputCount: inputs.length,
            textareaCount: form.querySelectorAll('textarea').length,
            labelCount: labels.length,
            hasSubmitButton: !!submitButton,
            submitButtonText: submitButton?.value || submitButton?.textContent,
            formAction: form.action,
            inputDetails: inputs.map(input => ({
              type: input.type || input.tagName.toLowerCase(),
              name: input.name,
              id: input.id,
              placeholder: input.placeholder,
              required: input.required,
              classes: input.className
            }))
          };
        });
        
        console.log('📋 Análisis del formulario:', JSON.stringify(formAnalysis, null, 2));
        
        // Verificar estilos CSS del formulario
        const stylesAnalysis = await page.evaluate(() => {
          const form = document.querySelector('#respond, #commentform, .comment-form, form[action*="comment"]');
          if (!form) return null;
          
          const formStyles = window.getComputedStyle(form);
          const inputs = Array.from(form.querySelectorAll('input, textarea'));
          
          const inputStyles = inputs.map(input => {
            const styles = window.getComputedStyle(input);
            return {
              element: input.tagName + (input.type ? `[${input.type}]` : ''),
              name: input.name,
              width: styles.width,
              height: styles.height,
              padding: styles.padding,
              margin: styles.margin,
              border: styles.border,
              borderRadius: styles.borderRadius,
              fontSize: styles.fontSize,
              backgroundColor: styles.backgroundColor,
              color: styles.color,
              display: styles.display
            };
          });
          
          return {
            formStyles: {
              width: formStyles.width,
              maxWidth: formStyles.maxWidth,
              padding: formStyles.padding,
              margin: formStyles.margin,
              backgroundColor: formStyles.backgroundColor,
              border: formStyles.border,
              borderRadius: formStyles.borderRadius
            },
            inputStyles
          };
        });
        
        console.log('🎨 Análisis de estilos:', JSON.stringify(stylesAnalysis, null, 2));
        
        // Tomar screenshot del formulario
        await page.locator('#respond, #commentform, .comment-form, form[action*="comment"]').first().screenshot({
          path: './comment-form-screenshot.png'
        });
        
        console.log('📸 Screenshot del formulario guardado como: comment-form-screenshot.png');
        
        // Verificar problemas comunes de estilos
        const styleIssues = await page.evaluate(() => {
          const form = document.querySelector('#respond, #commentform, .comment-form, form[action*="comment"]');
          if (!form) return [];
          
          const issues = [];
          const inputs = Array.from(form.querySelectorAll('input, textarea'));
          
          inputs.forEach(input => {
            const styles = window.getComputedStyle(input);
            const rect = input.getBoundingClientRect();
            
            // Verificar si el input es muy pequeño
            if (rect.height < 35) {
              issues.push(`Input ${input.name || input.type} muy pequeño: ${rect.height}px altura`);
            }
            
            // Verificar si no tiene padding
            if (styles.padding === '0px') {
              issues.push(`Input ${input.name || input.type} sin padding`);
            }
            
            // Verificar si no tiene border
            if (styles.border === 'none' || styles.borderWidth === '0px') {
              issues.push(`Input ${input.name || input.type} sin border visible`);
            }
            
            // Verificar contraste
            if (styles.color === styles.backgroundColor) {
              issues.push(`Input ${input.name || input.type} problema de contraste`);
            }
          });
          
          return issues;
        });
        
        if (styleIssues.length > 0) {
          console.log('⚠️ Problemas de estilos detectados:');
          styleIssues.forEach(issue => console.log(`  - ${issue}`));
        } else {
          console.log('✅ No se detectaron problemas evidentes de estilos');
        }
        
      } else {
        console.log('❌ No se encontró formulario de comentarios');
        
        // Buscar indicios de por qué no hay formulario
        const commentsSection = page.locator('#comments, .comments, .comment-section');
        const commentsExists = await commentsSection.count() > 0;
        
        console.log(`💭 Sección de comentarios encontrada: ${commentsExists}`);
        
        if (commentsExists) {
          const commentsInfo = await page.evaluate(() => {
            const section = document.querySelector('#comments, .comments, .comment-section');
            return {
              innerHTML: section?.innerHTML?.substring(0, 500) + '...',
              textContent: section?.textContent?.trim().substring(0, 200) + '...'
            };
          });
          console.log('🔍 Contenido de sección de comentarios:', commentsInfo);
        }
      }
      
    } else {
      console.log('❌ No se encontraron artículos para acceder');
    }
    
  } catch (error) {
    console.error('Error inspeccionando formulario:', error);
  } finally {
    console.log('🔄 Presiona cualquier tecla para cerrar el navegador...');
    // Mantener el navegador abierto para inspección manual
    await page.waitForTimeout(30000); // 30 segundos
    await browser.close();
  }
}

if (require.main === module) {
  inspectCommentsForm().catch(console.error);
}

module.exports = { inspectCommentsForm };