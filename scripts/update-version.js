const fs = require('fs');
const { execSync } = require('child_process');

try {
  let version;
  let source;

  // Priorizar variable de entorno de semantic-release
  if (process.env.SEMANTIC_RELEASE_VERSION) {
    version = process.env.SEMANTIC_RELEASE_VERSION;
    source = 'semantic-release env var';
  } else {
    // Fallback: obtener el último tag de Git
    const latestTag = execSync('git tag --sort=-version:refname | head -1', { encoding: 'utf-8' }).trim();
    
    if (!latestTag) {
      console.error('No se encontraron tags en el repositorio');
      process.exit(1);
    }

    // Remover la 'v' del inicio del tag si existe (v1.5.0 -> 1.5.0)
    version = latestTag.replace(/^v/, '');
    source = `tag: ${latestTag}`;
  }
  
  console.log(`Actualizando versión a: ${version} (desde ${source})`);

  // Leer el archivo style.css
  const stylePath = './style.css';
  let styleContent = fs.readFileSync(stylePath, 'utf-8');

  // Actualizar la línea de versión
  const versionRegex = /^Version:\s*.+$/m;
  if (versionRegex.test(styleContent)) {
    styleContent = styleContent.replace(versionRegex, `Version: ${version}`);
  } else {
    console.error('No se encontró la línea Version: en style.css');
    process.exit(1);
  }

  // Escribir el archivo actualizado
  fs.writeFileSync(stylePath, styleContent);
  
  console.log('✅ Versión actualizada exitosamente en style.css');

} catch (error) {
  console.error('Error al actualizar la versión:', error.message);
  process.exit(1);
}