<p align="center">
  <img src="https://github.com/felixbarrosdev/felixbarros/blob/main/assets/images/logo.png?raw=true" alt="Felix Barros Logo" width="120">
</p>

# Felix Barros — Tema WordPress personalizado

Este es el tema oficial del blog personal [felixbarros.dev](https://felixbarros.dev), desarrollado a medida con foco en **minimalismo, rendimiento y accesibilidad**, usando:

- 🌀 [Tailwind CSS](https://tailwindcss.com/) 3.4
- 🎨 Diseño responsivo y tipografías personalizadas
- 🧠 Paleta de colores personalizada basada en branding personal
- 🖋️ Soporte para Gutenberg y tipografía con `@tailwindcss/typography`
- 🖍️ Resaltado de código con [Highlight.js](https://highlightjs.org/)

---

## 🚀 Estructura del proyecto

```
felixbarros/
├── assets/
│   ├── css/input.css          # Entrada para Tailwind
│   └── build/style.css        # Generado automáticamente
├── parts/                     # Vistas parciales
├── functions.php              # Configuración del tema
├── header.php / footer.php    # Estructura principal
├── index.php / page.php       # Plantillas básicas
├── tailwind.config.js         # Paleta y fuentes
├── package.json               # Dependencias npm
└── style.css                  # Metadata del tema
```

---

## 📦 Instalación (desarrolladores)

1. Clonar este repositorio en `wp-content/themes/`
2. Instalar dependencias:

```bash
npm install
```

3. Compilar Tailwind:

```bash
npm run dev
npm run build
```

4. Activar el tema desde el panel de WordPress

---

## 📸 Screenshot del tema

El tema incluye funcionalidad para generar screenshots usando Playwright de manera manual.

### Captura manual

**Requisitos previos:**
- WordPress corriendo en `http://localhost:8000/`
- Dependencias instaladas: `npm install`
- Browsers de Playwright: `npx playwright install chromium`

**Ejecutar captura:**

```bash
# Opción 1: usando npm script
npm run screenshot

# Opción 2: directamente con Node
node scripts/capture-screenshot.js
```

El screenshot se guarda automáticamente como `screenshot.png` en la raíz del tema con las dimensiones exactas requeridas por WordPress (880x660px).

---

## 🔄 Gestión de versiones

El tema mantiene automáticamente sincronizada la versión en `style.css` con los tags de Git.

### Sincronización automática

- Cada push a `main` ejecuta el workflow de release que genera un nuevo tag usando semantic-release
- Automáticamente actualiza la versión en `style.css` para que coincida con el tag generado
- El cambio se commitea y pushea automáticamente al repositorio

### Actualización manual

Si necesitas sincronizar manualmente la versión:

```bash
npm run update-version
```

Este comando:
- Obtiene el último tag de Git
- Actualiza la línea `Version:` en `style.css`
- Mantiene la coherencia entre el repositorio y la metadata de WordPress

---

## 🎨 Personalización

- Fuentes: [Montserrat](https://fonts.google.com/specimen/Montserrat), [Nunito Sans](https://fonts.google.com/specimen/Nunito+Sans)
- Colores definidos en `tailwind.config.js`
- Clases utilitarias Tailwind aplicadas directamente a las plantillas

---

## 🛡️ Licencia

MIT © [Felix Barros](https://felixbarros.dev)
