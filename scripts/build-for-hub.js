const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

// Configura i percorsi (MODIFICA SE NECESSARIO)
const DASHBOARD_PATH = path.resolve(__dirname, '..');
const BUILD_OUTPUT = path.join(DASHBOARD_PATH, 'build');
const SITOHUB_PATH = path.resolve(__dirname, '../../SitoHub');
const SITOHUB_PUBLIC = path.join(SITOHUB_PATH, 'public/wealth-dashboard');

console.log('🏗️  Building DashBoard...');
try {
  execSync('npm run build', { stdio: 'inherit', cwd: DASHBOARD_PATH });
} catch (error) {
  console.error('❌ Build failed!', error.message);
  process.exit(1);
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
