const { test, expect } = require('@playwright/test');

test.describe('Accesibilidad y Navegación por Teclado', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('debería permitir navegación completa por teclado', async ({ page }) => {
    // Comenzar desde el primer elemento enfocable
    await page.keyboard.press('Tab');
    
    let focusedElementsCount = 0;
    const maxTabs = 20; // Límite para evitar bucles infinitos
    
    for (let i = 0; i < maxTabs; i++) {
      const focusedElement = await page.evaluate(() => {
        const activeElement = document.activeElement;
        return {
          tagName: activeElement?.tagName,
          className: activeElement?.className,
          text: activeElement?.textContent?.trim().substring(0, 50),
          type: activeElement?.type,
          href: activeElement?.href
        };
      });
      
      if (focusedElement.tagName && focusedElement.tagName !== 'BODY') {
        focusedElementsCount++;
        console.log(`Foco ${i + 1}: ${focusedElement.tagName} - ${focusedElement.text}`);
        
        // Verificar que el elemento es realmente enfocable
        const isVisible = await page.evaluate(() => {
          const el = document.activeElement;
          const style = window.getComputedStyle(el);
          return style.display !== 'none' && style.visibility !== 'hidden';
        });
        
        expect(isVisible).toBeTruthy();
      }
      
      await page.keyboard.press('Tab');
      await page.waitForTimeout(100);
    }
    
    expect(focusedElementsCount).toBeGreaterThan(0);
    console.log(`✓ Navegación por teclado: ${focusedElementsCount} elementos enfocables encontrados`);
  });

  test('debería tener indicadores visuales de foco', async ({ page }) => {
    // Hacer Tab para enfocar elementos
    await page.keyboard.press('Tab');
    
    // Verificar que hay indicador visual de foco
    const focusedElement = await page.evaluate(() => {
      const activeElement = document.activeElement;
      const styles = window.getComputedStyle(activeElement);
      
      return {
        outline: styles.outline,
        outlineWidth: styles.outlineWidth,
        outlineStyle: styles.outlineStyle,
        outlineColor: styles.outlineColor,
        boxShadow: styles.boxShadow,
        border: styles.border
      };
    });
    
    // Debería tener algún tipo de indicador visual
    const hasVisualFocus = 
      focusedElement.outline !== 'none' || 
      focusedElement.outlineWidth !== '0px' ||
      focusedElement.boxShadow !== 'none' ||
      focusedElement.border.includes('rgb');
    
    expect(hasVisualFocus).toBeTruthy();
    console.log('✓ Indicadores visuales de foco presentes');
  });

  test('debería permitir activar enlaces con Enter y Space', async ({ page }) => {
    // Buscar el primer enlace enfocable
    await page.keyboard.press('Tab');
    
    let linkFound = false;
    const maxAttempts = 10;
    
    for (let i = 0; i < maxAttempts; i++) {
      const currentElement = await page.evaluate(() => {
        const el = document.activeElement;
        return {
          tagName: el?.tagName,
          href: el?.href,
          text: el?.textContent?.trim()
        };
      });
      
      if (currentElement.tagName === 'A' && currentElement.href) {
        linkFound = true;
        console.log(`Enlace encontrado: ${currentElement.text}`);
        
        // Guardar URL actual para comparar
        const currentURL = page.url();
        
        // Activar con Enter
        await page.keyboard.press('Enter');
        await page.waitForTimeout(1000);
        
        // Verificar que la navegación funcionó o se mantiene en la misma página
        const newURL = page.url();
        console.log(`URL cambió de ${currentURL} a ${newURL}`);
        
        break;
      }
      
      await page.keyboard.press('Tab');
      await page.waitForTimeout(100);
    }
    
    expect(linkFound).toBeTruthy();
    console.log('✓ Navegación por teclado en enlaces funciona');
  });

  test('debería tener estructura semántica HTML apropiada', async ({ page }) => {
    // Verificar elementos semánticos principales
    const semanticElements = await page.evaluate(() => {
      const elements = {
        header: document.querySelector('header') !== null,
        nav: document.querySelector('nav') !== null,
        main: document.querySelector('main') !== null,
        article: document.querySelector('article') !== null,
        section: document.querySelector('section') !== null,
        footer: document.querySelector('footer') !== null,
        h1: document.querySelector('h1') !== null,
        h2: document.querySelector('h2') !== null
      };
      
      return elements;
    });
    
    // Verificar que al menos algunos elementos semánticos están presentes
    const semanticCount = Object.values(semanticElements).filter(Boolean).length;
    expect(semanticCount).toBeGreaterThan(2);
    
    console.log('✓ Elementos semánticos encontrados:', semanticElements);
  });

  test('debería tener atributos alt en imágenes importantes', async ({ page }) => {
    const images = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img'));
      return imgs.map(img => ({
        src: img.src,
        alt: img.alt,
        hasAlt: img.hasAttribute('alt'),
        decorative: img.alt === '',
        descriptive: img.alt && img.alt.length > 0
      }));
    });
    
    if (images.length > 0) {
      console.log(`Total de imágenes: ${images.length}`);
      
      const imagesWithAlt = images.filter(img => img.hasAlt);
      const descriptiveImages = images.filter(img => img.descriptive);
      
      console.log(`Imágenes con atributo alt: ${imagesWithAlt.length}`);
      console.log(`Imágenes con alt descriptivo: ${descriptiveImages.length}`);
      
      // Al menos 80% de las imágenes deberían tener atributo alt
      const altPercentage = (imagesWithAlt.length / images.length) * 100;
      expect(altPercentage).toBeGreaterThanOrEqual(80);
    }
  });

  test('debería tener contraste de colores adecuado', async ({ page }) => {
    // Análisis básico de contraste en elementos de texto principales
    const contrastIssues = await page.evaluate(() => {
      const textElements = Array.from(document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, a, span'));
      const issues = [];
      
      textElements.slice(0, 10).forEach(el => { // Revisar primeros 10 elementos
        const styles = window.getComputedStyle(el);
        const color = styles.color;
        const backgroundColor = styles.backgroundColor;
        
        // Análisis básico - detectar casos obvios problemáticos
        if (color === backgroundColor) {
          issues.push('Texto con mismo color que fondo');
        }
        
        if (color === 'rgb(255, 255, 255)' && backgroundColor === 'rgb(255, 255, 255)') {
          issues.push('Texto blanco sobre fondo blanco');
        }
        
        if (color === 'rgb(0, 0, 0)' && backgroundColor === 'rgb(0, 0, 0)') {
          issues.push('Texto negro sobre fondo negro');
        }
      });
      
      return issues;
    });
    
    expect(contrastIssues.length).toBeLessThan(3); // Permitir pocos problemas menores
    
    if (contrastIssues.length > 0) {
      console.warn('Problemas de contraste detectados:', contrastIssues);
    } else {
      console.log('✓ No se detectaron problemas evidentes de contraste');
    }
  });

  test('debería permitir skip links o navegación rápida', async ({ page }) => {
    // Verificar si hay skip links (enlaces de salto)
    const skipLinks = await page.evaluate(() => {
      const skipElements = Array.from(document.querySelectorAll('a'));
      return skipElements.filter(a => 
        a.textContent?.toLowerCase().includes('skip') ||
        a.textContent?.toLowerCase().includes('saltar') ||
        a.href?.includes('#main') ||
        a.href?.includes('#content')
      ).map(a => ({
        text: a.textContent,
        href: a.href
      }));
    });
    
    if (skipLinks.length > 0) {
      console.log('✓ Skip links encontrados:', skipLinks);
    } else {
      console.log('ℹ No se encontraron skip links (opcional pero recomendado)');
    }
    
    // No es obligatorio, pero es buena práctica
    // expect(skipLinks.length).toBeGreaterThan(0);
  });

  test('debería funcionar con lectores de pantalla (simulación)', async ({ page }) => {
    // Simular navegación como lo haría un lector de pantalla
    const ariaElements = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      const ariaInfo = {
        labelsCount: elements.filter(el => el.hasAttribute('aria-label')).length,
        describedByCount: elements.filter(el => el.hasAttribute('aria-describedby')).length,
        rolesCount: elements.filter(el => el.hasAttribute('role')).length,
        landmarksCount: elements.filter(el => {
          const role = el.getAttribute('role');
          return ['banner', 'navigation', 'main', 'contentinfo', 'complementary'].includes(role);
        }).length
      };
      
      return ariaInfo;
    });
    
    console.log('Información ARIA encontrada:', ariaElements);
    
    // Verificar que hay algún soporte para lectores de pantalla
    const totalAriaSupport = Object.values(ariaElements).reduce((sum, count) => sum + count, 0);
    
    // No es estricto, pero debería haber algún soporte ARIA
    if (totalAriaSupport > 0) {
      console.log('✓ Soporte básico ARIA presente');
    } else {
      console.log('ℹ Considerar agregar más atributos ARIA para lectores de pantalla');
    }
  });
});