const { chromium } = require('playwright');
const fs = require('fs');

class UXAnalyzer {
  constructor() {
    this.findings = [];
    this.screenshots = [];
    this.devices = [
      { name: 'Desktop', width: 1920, height: 1080 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Mobile', width: 375, height: 667 }
    ];
  }

  addFinding(category, severity, issue, recommendation) {
    this.findings.push({
      category,
      severity, // 'high', 'medium', 'low'
      issue,
      recommendation,
      timestamp: new Date().toISOString()
    });
  }

  async analyzeAccessibility(page) {
    console.log('🔍 Analizando accesibilidad...');
    
    // Verificar que hay texto alternativo en imágenes
    const imagesWithoutAlt = await page.$$eval('img', imgs => 
      imgs.filter(img => !img.alt || img.alt.trim() === '').length
    );
    
    if (imagesWithoutAlt > 0) {
      this.addFinding(
        'Accesibilidad',
        'high',
        `${imagesWithoutAlt} imágenes sin texto alternativo`,
        'Agregar atributos alt descriptivos a todas las imágenes'
      );
    }

    // Verificar estructura de headings
    const headings = await page.$$eval('h1, h2, h3, h4, h5, h6', headings => 
      headings.map(h => ({ tag: h.tagName, text: h.textContent.trim() }))
    );
    
    const h1Count = headings.filter(h => h.tag === 'H1').length;
    if (h1Count === 0) {
      this.addFinding(
        'Accesibilidad',
        'high',
        'No se encontró elemento H1',
        'Agregar un elemento H1 principal para mejorar la estructura semántica'
      );
    } else if (h1Count > 1) {
      this.addFinding(
        'Accesibilidad',
        'medium',
        `Múltiples elementos H1 encontrados (${h1Count})`,
        'Usar solo un H1 por página y estructura jerárquica de headings'
      );
    }

    // Verificar contraste de colores
    const contrastIssues = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      const issues = [];
      
      elements.forEach(el => {
        const style = window.getComputedStyle(el);
        const color = style.color;
        const bgColor = style.backgroundColor;
        
        // Análisis básico de contraste (simplificado)
        if (color === 'rgb(255, 255, 255)' && bgColor === 'rgb(255, 255, 255)') {
          issues.push('Texto blanco sobre fondo blanco detectado');
        }
      });
      
      return issues;
    });

    contrastIssues.forEach(issue => {
      this.addFinding(
        'Accesibilidad',
        'medium',
        issue,
        'Revisar el contraste de colores para cumplir con WCAG AA (4.5:1)'
      );
    });
  }

  async analyzeUsability(page, deviceName) {
    console.log(`📱 Analizando usabilidad en ${deviceName}...`);
    
    // Verificar si los elementos son clickeables en móvil
    if (deviceName === 'Mobile') {
      const smallClickTargets = await page.$$eval('a, button', elements => {
        return elements.filter(el => {
          const rect = el.getBoundingClientRect();
          return rect.width < 44 || rect.height < 44; // Tamaño mínimo recomendado
        }).length;
      });

      if (smallClickTargets > 0) {
        this.addFinding(
          'Usabilidad',
          'medium',
          `${smallClickTargets} elementos clickeables muy pequeños en móvil`,
          'Aumentar el tamaño de botones y enlaces a mínimo 44x44px'
        );
      }
    }

    // Verificar navegación
    const navElements = await page.$$eval('nav, .menu, [role="navigation"]', navs => navs.length);
    if (navElements === 0) {
      this.addFinding(
        'Usabilidad',
        'high',
        'No se encontró elemento de navegación claramente identificado',
        'Agregar elemento <nav> o role="navigation" para mejorar la navegación'
      );
    }

    // Verificar formularios
    const formsWithoutLabels = await page.$$eval('input:not([type="hidden"])', inputs => {
      return inputs.filter(input => {
        const label = document.querySelector(`label[for="${input.id}"]`);
        const ariaLabel = input.getAttribute('aria-label');
        const placeholder = input.getAttribute('placeholder');
        return !label && !ariaLabel && !placeholder;
      }).length;
    });

    if (formsWithoutLabels > 0) {
      this.addFinding(
        'Usabilidad',
        'medium',
        `${formsWithoutLabels} campos de formulario sin etiquetas`,
        'Agregar labels, aria-label o placeholders descriptivos'
      );
    }
  }

  async analyzePerformance(page) {
    console.log('⚡ Analizando rendimiento...');
    
    // Medir tiempo de carga
    const loadTime = await page.evaluate(() => {
      return performance.timing.loadEventEnd - performance.timing.navigationStart;
    });

    if (loadTime > 3000) {
      this.addFinding(
        'Rendimiento',
        'medium',
        `Tiempo de carga lento: ${loadTime}ms`,
        'Optimizar imágenes, CSS y JavaScript para mejorar velocidad'
      );
    }

    // Verificar tamaño de imágenes
    const largeImages = await page.$$eval('img', images => {
      return images.filter(img => {
        const rect = img.getBoundingClientRect();
        return img.naturalWidth > rect.width * 2; // Imágenes más grandes que su contenedor
      }).length;
    });

    if (largeImages > 0) {
      this.addFinding(
        'Rendimiento',
        'low',
        `${largeImages} imágenes sin optimizar detectadas`,
        'Usar imágenes responsive y formatos modernos como WebP'
      );
    }
  }

  async analyzeDesignConsistency(page) {
    console.log('🎨 Analizando consistencia de diseño...');
    
    // Verificar consistencia de fuentes
    const fonts = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      const fontFamilies = new Set();
      
      elements.forEach(el => {
        const style = window.getComputedStyle(el);
        const fontFamily = style.fontFamily;
        if (fontFamily && fontFamily !== 'inherit') {
          fontFamilies.add(fontFamily);
        }
      });
      
      return Array.from(fontFamilies);
    });

    if (fonts.length > 4) {
      this.addFinding(
        'Consistencia',
        'low',
        `Demasiadas fuentes diferentes (${fonts.length})`,
        'Limitar a 2-3 familias tipográficas para mantener consistencia'
      );
    }

    // Verificar espaciado consistente
    const margins = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      const marginValues = new Set();
      
      elements.forEach(el => {
        const style = window.getComputedStyle(el);
        ['marginTop', 'marginBottom', 'marginLeft', 'marginRight'].forEach(prop => {
          const value = style[prop];
          if (value && value !== '0px' && value !== 'auto') {
            marginValues.add(value);
          }
        });
      });
      
      return Array.from(marginValues);
    });

    if (margins.length > 10) {
      this.addFinding(
        'Consistencia',
        'low',
        'Inconsistencia en espaciados, demasiados valores únicos',
        'Usar un sistema de espaciado basado en múltiplos (8px, 16px, 24px, etc.)'
      );
    }
  }

  async takeScreenshots(page, deviceName) {
    console.log(`📸 Capturando screenshots para ${deviceName}...`);
    
    const screenshotPath = `./ux-analysis-${deviceName.toLowerCase()}.png`;
    await page.screenshot({ 
      path: screenshotPath, 
      fullPage: true 
    });
    
    this.screenshots.push({
      device: deviceName,
      path: screenshotPath,
      timestamp: new Date().toISOString()
    });
  }

  async generateReport() {
    console.log('📊 Generando reporte UX...');
    
    const report = {
      summary: {
        totalFindings: this.findings.length,
        highSeverity: this.findings.filter(f => f.severity === 'high').length,
        mediumSeverity: this.findings.filter(f => f.severity === 'medium').length,
        lowSeverity: this.findings.filter(f => f.severity === 'low').length,
        analyzedAt: new Date().toISOString()
      },
      devices: this.devices.map(d => d.name),
      findings: this.findings,
      screenshots: this.screenshots,
      recommendations: {
        priority: this.findings
          .filter(f => f.severity === 'high')
          .map(f => f.recommendation),
        improvements: this.findings
          .filter(f => f.severity === 'medium')
          .map(f => f.recommendation),
        enhancements: this.findings
          .filter(f => f.severity === 'low')
          .map(f => f.recommendation)
      }
    };

    fs.writeFileSync('./ux-analysis-report.json', JSON.stringify(report, null, 2));
    
    // Generar reporte en markdown
    this.generateMarkdownReport(report);
    
    return report;
  }

  generateMarkdownReport(report) {
    const markdown = `# Análisis UX/UI - Tema Felix Barros

## 📊 Resumen Ejecutivo

- **Total de hallazgos:** ${report.summary.totalFindings}
- **Críticos:** ${report.summary.highSeverity}
- **Importantes:** ${report.summary.mediumSeverity}
- **Menores:** ${report.summary.lowSeverity}
- **Fecha de análisis:** ${new Date(report.summary.analyzedAt).toLocaleString()}

## 🎯 Recomendaciones Prioritarias

${report.recommendations.priority.length > 0 ? 
  report.recommendations.priority.map(rec => `- ${rec}`).join('\n') : 
  '✅ No se encontraron problemas críticos'}

## 📱 Dispositivos Analizados

${report.devices.map(device => `- ${device}`).join('\n')}

## 🔍 Hallazgos Detallados

${report.findings.map(finding => `
### ${finding.category} - ${finding.severity.toUpperCase()}

**Problema:** ${finding.issue}
**Recomendación:** ${finding.recommendation}
`).join('\n')}

## 📸 Capturas de Pantalla

${report.screenshots.map(shot => `- [${shot.device}](${shot.path})`).join('\n')}

---

*Análisis generado con Playwright para evaluación UX/UI*
`;

    fs.writeFileSync('./ux-analysis-report.md', markdown);
  }

  async run() {
    console.log('🚀 Iniciando análisis UX/UI...');
    
    const browser = await chromium.launch({ headless: true });
    const baseUrl = 'http://localhost:8000/';

    try {
      for (const device of this.devices) {
        console.log(`\n🔄 Analizando ${device.name} (${device.width}x${device.height})`);
        
        const context = await browser.newContext({
          viewport: { width: device.width, height: device.height }
        });
        
        const page = await context.newPage();
        
        // Navegar a la página
        await page.goto(baseUrl, { waitUntil: 'networkidle' });
        
        // Ejecutar análisis
        await this.analyzeAccessibility(page);
        await this.analyzeUsability(page, device.name);
        await this.analyzePerformance(page);
        await this.analyzeDesignConsistency(page);
        
        // Tomar screenshots
        await this.takeScreenshots(page, device.name);
        
        await context.close();
      }

      // Generar reporte final
      const report = await this.generateReport();
      
      console.log('\n✅ Análisis UX/UI completado');
      console.log(`📊 ${report.summary.totalFindings} hallazgos encontrados`);
      console.log('📄 Reportes generados:');
      console.log('  - ux-analysis-report.json');
      console.log('  - ux-analysis-report.md');
      console.log('📸 Screenshots:');
      report.screenshots.forEach(shot => {
        console.log(`  - ${shot.path}`);
      });

    } finally {
      await browser.close();
    }
  }
}

// Ejecutar análisis
if (require.main === module) {
  const analyzer = new UXAnalyzer();
  analyzer.run().catch(console.error);
}

module.exports = UXAnalyzer;