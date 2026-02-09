const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

// Configura i percorsi (MODIFICA SE NECESSARIO)
const DASHBOARD_PATH = path.resolve(__dirname, '..');
const BUILD_OUTPUT = path.join(DASHBOARD_PATH, 'build');
const SITOHUB_PATH = path.resolve(__dirname, '../../SitoHub');
const SITOHUB_PUBLIC = path.join(SITOHUB_PATH, 'public/wealth-dashboard');
const PACKAGE_JSON_PATH = path.join(DASHBOARD_PATH, 'package.json');

// Funzione per aggiornare homepage nel package.json
function updateHomepage(newHomepage) {
  const packageJson = require(PACKAGE_JSON_PATH);
  const originalHomepage = packageJson.homepage;
  packageJson.homepage = newHomepage;
  fs.writeFileSync(PACKAGE_JSON_PATH, JSON.stringify(packageJson, null, 2) + '\n');
  return originalHomepage;
}

console.log('🏗️  Building DashBoard...');
console.log('📝 Configuring build for SitoHub paths...');

let originalHomepage;
try {
  // Temporaneamente cambia homepage per il build corretto
  originalHomepage = updateHomepage('/wealth-dashboard');
  console.log(`   ├── Homepage set to: /wealth-dashboard`);
  
  execSync('npm run build', { stdio: 'inherit', cwd: DASHBOARD_PATH });
} catch (error) {
  console.error('❌ Build failed!', error.message);
  process.exit(1);
} finally {
  // Ripristina homepage originale
  if (originalHomepage) {
    updateHomepage(originalHomepage);
    console.log(`   └── Homepage restored to: ${originalHomepage}`);
  }
}

console.log('\n📦 Copying build to SitoHub...');
try {
  fs.emptyDirSync(SITOHUB_PUBLIC);
  fs.copySync(BUILD_OUTPUT, SITOHUB_PUBLIC);
  console.log(`✅ Success! Copied to: ${SITOHUB_PUBLIC}`);
} catch (error) {
  console.error('❌ Copy failed!', error.message);
  process.exit(1);
}

console.log('\n📂 Build output structure:');
console.log(`   ├── index.html`);
console.log(`   ├── static/css/`);
console.log(`   └── static/js/`);
console.log('\n✨ DashBoard integration complete!');
