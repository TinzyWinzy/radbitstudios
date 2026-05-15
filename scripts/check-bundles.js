// Performance budget enforcement — CI script
// Run with: node scripts/check-bundles.js

const fs = require('fs');
const path = require('path');

const BUDGETS = {
  initialJsPerRoute: 180 * 1024,  // 180KB gzipped
  heroImageMobile: 50 * 1024,     // 50KB
  thumbnailImage: 20 * 1024,      // 20KB
};

const buildDir = path.join(__dirname, '..', '.next');

function getGzippedSize(filePath) {
  if (!fs.existsSync(filePath)) return 0;
  const { gzipSync } = require('zlib');
  const content = fs.readFileSync(filePath);
  return gzipSync(content).length;
}

function checkRouteBundles() {
  const pagesDir = path.join(buildDir, 'static', 'chunks');
  if (!fs.existsSync(pagesDir)) {
    console.log('⚠ No build artifacts found. Run `npm run build` first.');
    return;
  }

  const pageBundles = {};
  const files = fs.readdirSync(pagesDir);

  for (const file of files) {
    if (file.includes('page-') && file.endsWith('.js')) {
      const size = getGzippedSize(path.join(pagesDir, file));
      const routeName = file.replace('page-', '').replace('.js', '');
      pageBundles[routeName] = size;
    }
  }

  let failed = false;
  for (const [route, size] of Object.entries(pageBundles)) {
    const sizeKB = (size / 1024).toFixed(1);
    const status = size <= BUDGETS.initialJsPerRoute ? '✓' : '✗';
    if (size > BUDGETS.initialJsPerRoute) {
      console.log(`✗ ${route}: ${sizeKB}KB (budget: ${BUDGETS.initialJsPerRoute / 1024}KB) — EXCEEDED`);
      failed = true;
    } else {
      console.log(`✓ ${route}: ${sizeKB}KB`);
    }
  }

  if (failed) {
    console.error('\n❌ Some routes exceed the JS budget. Optimize before deployment.');
    process.exit(1);
  } else {
    console.log('\n✅ All routes within JS budget.');
  }
}

checkRouteBundles();
