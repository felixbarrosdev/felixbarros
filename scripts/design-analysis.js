const { chromium } = require('playwright');
const fs = require('fs');

class DesignAnalyzer {
  constructor() {
    this.colorAnalysis = {
      palette: new Map(),
      usage: new Map(),
      accessibility: [],
      recommendations: []
    };
    this.typographyAnalysis = {
      fonts: new Map(),
      sizes: new Map(),
      hierarchy: [],
      readability: [],
      recommendations: []
    };
    this.designSystem = {
      consistency: [],
      patterns: [],
      issues: [],
      improvements: []
    };
  }

  // Análisis de contraste según WCAG
  calculateContrast(color1, color2) {
    const rgb1 = this.hexToRgb(color1);
    const rgb2 = this.hexToRgb(color2);
    
    if (!rgb1 || !rgb2) return 0;
    
    const luminance1 = this.getLuminance(rgb1);
    const luminance2 = this.getLuminance(rgb2);
    
    const brightest = Math.max(luminance1, luminance2);
    const darkest = Math.min(luminance1, luminance2);
    
    return (brightest + 0.05) / (darkest + 0.05);
  }

  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  getLuminance(rgb) {
    const rsRGB = rgb.r / 255;
    const gsRGB = rgb.g / 255;
    const bsRGB = rgb.b / 255;

    const r = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
    const g = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
    const b = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  rgbToHex(rgb) {
    const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (!match) return rgb;
    
    const r = parseInt(match[1]);
    const g = parseInt(match[2]);
    const b = parseInt(match[3]);
    
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }

  async analyzeColors(page) {
    console.log('🎨 Analizando paleta de colores...');
    
    const colorData = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      const colors = {
        backgrounds: new Map(),
        texts: new Map(),
        borders: new Map(),
        combinations: []
      };
      
      elements.forEach(el => {
        const styles = window.getComputedStyle(el);
        const bgColor = styles.backgroundColor;
        const textColor = styles.color;
        const borderColor = styles.borderColor;
        
        // Recopilar colores de fondo
        if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
          colors.backgrounds.set(bgColor, (colors.backgrounds.get(bgColor) || 0) + 1);
        }
        
        // Recopilar colores de texto
        if (textColor && textColor !== 'rgba(0, 0, 0, 0)') {
          colors.texts.set(textColor, (colors.texts.get(textColor) || 0) + 1);
        }
        
        // Recopilar combinaciones texto/fondo para análisis de contraste
        if (textColor && bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
          colors.combinations.push({
            text: textColor,
            background: bgColor,
            element: el.tagName.toLowerCase(),
            content: el.textContent?.trim().substring(0, 50) || ''
          });
        }
      });
      
      // Convertir Maps a Arrays para serialización
      return {
        backgrounds: Array.from(colors.backgrounds.entries()),
        texts: Array.from(colors.texts.entries()),
        borders: Array.from(colors.borders.entries()),
        combinations: colors.combinations.slice(0, 50) // Limitar para rendimiento
      };
    });

    // Analizar contraste
    colorData.combinations.forEach(combo => {
      const textHex = this.rgbToHex(combo.text);
      const bgHex = this.rgbToHex(combo.background);
      const contrast = this.calculateContrast(textHex, bgHex);
      
      this.colorAnalysis.accessibility.push({
        element: combo.element,
        textColor: combo.text,
        backgroundColor: combo.background,
        contrast: contrast.toFixed(2),
        wcagAA: contrast >= 4.5,
        wcagAAA: contrast >= 7,
        content: combo.content
      });
    });

    // Procesar paleta
    colorData.backgrounds.forEach(([color, count]) => {
      this.colorAnalysis.palette.set(color, {
        type: 'background',
        usage: count,
        hex: this.rgbToHex(color)
      });
    });

    colorData.texts.forEach(([color, count]) => {
      if (this.colorAnalysis.palette.has(color)) {
        this.colorAnalysis.palette.get(color).usage += count;
      } else {
        this.colorAnalysis.palette.set(color, {
          type: 'text',
          usage: count,
          hex: this.rgbToHex(color)
        });
      }
    });
  }

  async analyzeTypography(page) {
    console.log('📝 Analizando tipografía...');
    
    const typographyData = await page.evaluate(() => {
      const textElements = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, a, span, div, li'));
      const fonts = new Map();
      const sizes = new Map();
      const hierarchy = [];
      
      textElements.forEach(el => {
        const styles = window.getComputedStyle(el);
        const fontFamily = styles.fontFamily;
        const fontSize = styles.fontSize;
        const fontWeight = styles.fontWeight;
        const lineHeight = styles.lineHeight;
        const letterSpacing = styles.letterSpacing;
        
        // Recopilar familias de fuentes
        if (fontFamily) {
          fonts.set(fontFamily, (fonts.get(fontFamily) || 0) + 1);
        }
        
        // Recopilar tamaños
        if (fontSize) {
          sizes.set(fontSize, (sizes.get(fontSize) || 0) + 1);
        }
        
        // Analizar jerarquía (solo headings)
        if (el.tagName.match(/^H[1-6]$/)) {
          hierarchy.push({
            tag: el.tagName,
            fontSize: fontSize,
            fontWeight: fontWeight,
            fontFamily: fontFamily,
            text: el.textContent?.trim().substring(0, 100) || ''
          });
        }
      });
      
      return {
        fonts: Array.from(fonts.entries()),
        sizes: Array.from(sizes.entries()),
        hierarchy: hierarchy
      };
    });

    // Procesar datos de tipografía
    typographyData.fonts.forEach(([font, count]) => {
      this.typographyAnalysis.fonts.set(font, count);
    });

    typographyData.sizes.forEach(([size, count]) => {
      this.typographyAnalysis.sizes.set(size, count);
    });

    this.typographyAnalysis.hierarchy = typographyData.hierarchy;
  }

  async analyzeDesignSystem(page) {
    console.log('🎯 Analizando sistema de diseño...');
    
    const systemData = await page.evaluate(() => {
      const analysis = {
        spacing: new Map(),
        borderRadius: new Map(),
        shadows: new Map(),
        consistency: []
      };
      
      const elements = Array.from(document.querySelectorAll('*'));
      
      elements.forEach(el => {
        const styles = window.getComputedStyle(el);
        
        // Analizar espaciado
        ['marginTop', 'marginBottom', 'paddingTop', 'paddingBottom'].forEach(prop => {
          const value = styles[prop];
          if (value && value !== '0px' && value !== 'auto') {
            analysis.spacing.set(value, (analysis.spacing.get(value) || 0) + 1);
          }
        });
        
        // Analizar border radius
        const borderRadius = styles.borderRadius;
        if (borderRadius && borderRadius !== '0px') {
          analysis.borderRadius.set(borderRadius, (analysis.borderRadius.get(borderRadius) || 0) + 1);
        }
        
        // Analizar sombras
        const boxShadow = styles.boxShadow;
        if (boxShadow && boxShadow !== 'none') {
          analysis.shadows.set(boxShadow, (analysis.shadows.get(boxShadow) || 0) + 1);
        }
      });
      
      return {
        spacing: Array.from(analysis.spacing.entries()),
        borderRadius: Array.from(analysis.borderRadius.entries()),
        shadows: Array.from(analysis.shadows.entries())
      };
    });

    this.designSystem.patterns = systemData;
  }

  generateRecommendations() {
    console.log('💡 Generando recomendaciones...');
    
    // Recomendaciones de colores
    const lowContrastCombos = this.colorAnalysis.accessibility.filter(combo => parseFloat(combo.contrast) < 4.5);
    if (lowContrastCombos.length > 0) {
      this.colorAnalysis.recommendations.push({
        type: 'critical',
        category: 'accesibilidad',
        issue: `${lowContrastCombos.length} combinaciones de color no cumplen WCAG AA`,
        solution: 'Aumentar el contraste a mínimo 4.5:1, usar colores más oscuros para texto o fondos más claros',
        examples: lowContrastCombos.slice(0, 3)
      });
    }

    // Análisis de paleta
    const colorCount = this.colorAnalysis.palette.size;
    if (colorCount > 15) {
      this.colorAnalysis.recommendations.push({
        type: 'medium',
        category: 'consistencia',
        issue: `Demasiados colores únicos (${colorCount})`,
        solution: 'Crear una paleta más limitada con colores primarios, secundarios y neutros definidos',
        impact: 'Mejora la consistencia visual y facilita el mantenimiento'
      });
    }

    // Recomendaciones de tipografía
    const fontCount = this.typographyAnalysis.fonts.size;
    if (fontCount > 3) {
      this.typographyAnalysis.recommendations.push({
        type: 'medium',
        category: 'tipografía',
        issue: `Demasiadas fuentes diferentes (${fontCount})`,
        solution: 'Limitar a 2-3 familias tipográficas máximo: una para títulos, una para cuerpo',
        impact: 'Mejor rendimiento y consistencia visual'
      });
    }

    // Análisis de jerarquía tipográfica
    const hierarchy = this.typographyAnalysis.hierarchy;
    const headingSizes = hierarchy.map(h => parseFloat(h.fontSize));
    const isProperHierarchy = headingSizes.every((size, index) => 
      index === 0 || size <= headingSizes[index - 1]
    );

    if (!isProperHierarchy) {
      this.typographyAnalysis.recommendations.push({
        type: 'medium',
        category: 'jerarquía',
        issue: 'Jerarquía tipográfica inconsistente',
        solution: 'H1 debe ser el más grande, H2 menor que H1, etc. Usar escala tipográfica consistente',
        impact: 'Mejor escaneo visual y comprensión del contenido'
      });
    }

    // Recomendaciones de sistema de diseño
    const spacingValues = this.designSystem.patterns.spacing?.length || 0;
    if (spacingValues > 20) {
      this.designSystem.improvements.push({
        type: 'low',
        category: 'espaciado',
        issue: `Demasiados valores de espaciado únicos (${spacingValues})`,
        solution: 'Usar sistema de espaciado basado en múltiplos (8px, 16px, 24px, 32px)',
        impact: 'Mayor consistencia visual y facilidad de desarrollo'
      });
    }
  }

  async generateVisualReport(page) {
    console.log('📊 Generando reporte visual...');
    
    // Tomar screenshot de la paleta de colores
    await page.addStyleTag({
      content: `
        .color-analysis-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: white;
          z-index: 10000;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, sans-serif;
          overflow-y: auto;
        }
        .color-palette {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 16px;
          margin: 20px 0;
        }
        .color-swatch {
          height: 80px;
          border-radius: 8px;
          display: flex;
          align-items: end;
          justify-content: center;
          color: white;
          font-size: 12px;
          text-shadow: 1px 1px 1px rgba(0,0,0,0.5);
          border: 1px solid #ccc;
        }
      `
    });

    const topColors = Array.from(this.colorAnalysis.palette.entries())
      .sort(([,a], [,b]) => b.usage - a.usage)
      .slice(0, 12);

    await page.evaluate((colors) => {
      const overlay = document.createElement('div');
      overlay.className = 'color-analysis-overlay';
      
      const title = document.createElement('h1');
      title.textContent = 'Análisis de Paleta de Colores';
      overlay.appendChild(title);
      
      const palette = document.createElement('div');
      palette.className = 'color-palette';
      
      colors.forEach(([color, data]) => {
        const swatch = document.createElement('div');
        swatch.className = 'color-swatch';
        swatch.style.backgroundColor = color;
        swatch.textContent = data.hex;
        palette.appendChild(swatch);
      });
      
      overlay.appendChild(palette);
      document.body.appendChild(overlay);
    }, topColors);

    await page.screenshot({
      path: './design-analysis-colors.png',
      fullPage: true
    });
  }

  generateMarkdownReport() {
    const report = `# 🎨 Análisis de Diseño Frontend - Tema Felix Barros

## 📊 Resumen Ejecutivo

### Métricas Clave
- **Colores únicos detectados:** ${this.colorAnalysis.palette.size}
- **Familias tipográficas:** ${this.typographyAnalysis.fonts.size}
- **Tamaños de fuente únicos:** ${this.typographyAnalysis.sizes.size}
- **Problemas de contraste:** ${this.colorAnalysis.accessibility.filter(c => !c.wcagAA).length}

---

## 🎨 Análisis de Colores

### Paleta Principal
${Array.from(this.colorAnalysis.palette.entries())
  .sort(([,a], [,b]) => b.usage - a.usage)
  .slice(0, 8)
  .map(([color, data]) => `- **${data.hex}** (${color}) - Usado ${data.usage} veces`)
  .join('\n')}

### Problemas de Accesibilidad
${this.colorAnalysis.accessibility
  .filter(combo => !combo.wcagAA)
  .slice(0, 5)
  .map(combo => `- **${combo.element}**: Contraste ${combo.contrast}:1 (Necesita ≥4.5:1)`)
  .join('\n') || '✅ No se detectaron problemas críticos de contraste'}

### Recomendaciones de Color
${this.colorAnalysis.recommendations
  .map(rec => `#### ${rec.category.toUpperCase()} - ${rec.type.toUpperCase()}
**Problema:** ${rec.issue}
**Solución:** ${rec.solution}
${rec.impact ? `**Impacto:** ${rec.impact}` : ''}`)
  .join('\n\n') || '✅ Sin recomendaciones críticas'}

---

## 📝 Análisis Tipográfico

### Familias de Fuentes
${Array.from(this.typographyAnalysis.fonts.entries())
  .sort(([,a], [,b]) => b - a)
  .map(([font, count]) => `- **${font.split(',')[0]}** - ${count} elementos`)
  .join('\n')}

### Jerarquía de Headings
${this.typographyAnalysis.hierarchy
  .slice(0, 6)
  .map(h => `- **${h.tag}**: ${h.fontSize} / ${h.fontWeight} - "${h.text}"`)
  .join('\n')}

### Recomendaciones Tipográficas
${this.typographyAnalysis.recommendations
  .map(rec => `#### ${rec.category.toUpperCase()} - ${rec.type.toUpperCase()}
**Problema:** ${rec.issue}
**Solución:** ${rec.solution}
**Impacto:** ${rec.impact}`)
  .join('\n\n') || '✅ Tipografía bien estructurada'}

---

## 🎯 Sistema de Diseño

### Espaciado
Valores más usados:
${this.designSystem.patterns.spacing
  ?.sort(([,a], [,b]) => b - a)
  .slice(0, 8)
  .map(([space, count]) => `- **${space}** - ${count} usos`)
  .join('\n') || 'No se detectaron patrones de espaciado'}

### Recomendaciones del Sistema
${this.designSystem.improvements
  .map(rec => `#### ${rec.category.toUpperCase()} - ${rec.type.toUpperCase()}
**Problema:** ${rec.issue}
**Solución:** ${rec.solution}
**Impacto:** ${rec.impact}`)
  .join('\n\n') || '✅ Sistema de diseño consistente'}

---

## 💡 Recomendaciones Prioritarias

### 🚨 Críticas (Implementar Inmediatamente)
${[...this.colorAnalysis.recommendations, ...this.typographyAnalysis.recommendations, ...this.designSystem.improvements]
  .filter(rec => rec.type === 'critical')
  .map(rec => `- **${rec.category}**: ${rec.solution}`)
  .join('\n') || '✅ No hay problemas críticos'}

### ⚠️ Importantes (Implementar Pronto)
${[...this.colorAnalysis.recommendations, ...this.typographyAnalysis.recommendations, ...this.designSystem.improvements]
  .filter(rec => rec.type === 'medium')
  .map(rec => `- **${rec.category}**: ${rec.solution}`)
  .join('\n') || '✅ No hay problemas importantes'}

### 💄 Mejoras (Considerar)
${[...this.colorAnalysis.recommendations, ...this.typographyAnalysis.recommendations, ...this.designSystem.improvements]
  .filter(rec => rec.type === 'low')
  .map(rec => `- **${rec.category}**: ${rec.solution}`)
  .join('\n') || '✅ No hay mejoras sugeridas'}

---

## 🎨 Propuesta de Mejora de Paleta

### Paleta Recomendada
\`\`\`css
/* Colores Primarios */
--primary: #4A828C;     /* Verde azulado principal */
--primary-light: #6B9BA4;
--primary-dark: #3A6B73;

/* Colores Secundarios */
--accent: #D2A384;      /* Beige cálido */
--accent-light: #E1B89C;
--accent-dark: #C4956B;

/* Neutros */
--dark: #1E2A38;        /* Azul muy oscuro */
--gray-900: #2D3748;
--gray-700: #4A5568;
--gray-500: #718096;
--gray-300: #CBD5E0;
--gray-100: #F7FAFC;
--white: #FFFFFF;

/* Estados */
--success: #48BB78;
--warning: #ED8936;
--error: #F56565;
--info: #4299E1;
\`\`\`

### Sistema Tipográfico Recomendado
\`\`\`css
/* Escala Tipográfica (1.25 ratio) */
--text-xs: 0.75rem;     /* 12px */
--text-sm: 0.875rem;    /* 14px */
--text-base: 1rem;      /* 16px */
--text-lg: 1.125rem;    /* 18px */
--text-xl: 1.25rem;     /* 20px */
--text-2xl: 1.5rem;     /* 24px */
--text-3xl: 1.875rem;   /* 30px */
--text-4xl: 2.25rem;    /* 36px */
--text-5xl: 3rem;       /* 48px */

/* Familias Tipográficas */
--font-heading: 'Montserrat', sans-serif;  /* Solo para títulos */
--font-body: 'Nunito Sans', sans-serif;    /* Para cuerpo y UI */
--font-mono: 'JetBrains Mono', monospace;  /* Para código */
\`\`\`

---

*Análisis generado con Playwright - ${new Date().toLocaleString()}*
`;

    return report;
  }

  async run() {
    console.log('🚀 Iniciando análisis de diseño...');
    
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    try {
      await page.goto('http://localhost:8000/', { waitUntil: 'networkidle' });
      
      // Ejecutar análisis
      await this.analyzeColors(page);
      await this.analyzeTypography(page);
      await this.analyzeDesignSystem(page);
      
      // Generar recomendaciones
      this.generateRecommendations();
      
      // Generar reporte visual
      await this.generateVisualReport(page);
      
      // Generar reporte en markdown
      const markdownReport = this.generateMarkdownReport();
      fs.writeFileSync('./design-analysis-report.md', markdownReport);
      
      // Generar datos JSON para uso programático
      const jsonReport = {
        colors: {
          palette: Array.from(this.colorAnalysis.palette.entries()),
          accessibility: this.colorAnalysis.accessibility,
          recommendations: this.colorAnalysis.recommendations
        },
        typography: {
          fonts: Array.from(this.typographyAnalysis.fonts.entries()),
          sizes: Array.from(this.typographyAnalysis.sizes.entries()),
          hierarchy: this.typographyAnalysis.hierarchy,
          recommendations: this.typographyAnalysis.recommendations
        },
        designSystem: this.designSystem,
        summary: {
          totalColors: this.colorAnalysis.palette.size,
          totalFonts: this.typographyAnalysis.fonts.size,
          contrastIssues: this.colorAnalysis.accessibility.filter(c => !c.wcagAA).length,
          criticalIssues: [...this.colorAnalysis.recommendations, ...this.typographyAnalysis.recommendations, ...this.designSystem.improvements]
            .filter(rec => rec.type === 'critical').length
        }
      };
      
      fs.writeFileSync('./design-analysis-data.json', JSON.stringify(jsonReport, null, 2));
      
      console.log('\n✅ Análisis de diseño completado');
      console.log(`🎨 Colores únicos: ${this.colorAnalysis.palette.size}`);
      console.log(`📝 Fuentes únicas: ${this.typographyAnalysis.fonts.size}`);
      console.log(`⚠️ Problemas de contraste: ${this.colorAnalysis.accessibility.filter(c => !c.wcagAA).length}`);
      console.log('📄 Reportes generados:');
      console.log('  - design-analysis-report.md');
      console.log('  - design-analysis-data.json');
      console.log('  - design-analysis-colors.png');
      
    } finally {
      await browser.close();
    }
  }
}

if (require.main === module) {
  const analyzer = new DesignAnalyzer();
  analyzer.run().catch(console.error);
}

module.exports = DesignAnalyzer;