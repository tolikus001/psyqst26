const fs = require('fs');
const path = require('path');
const vm = require('vm');

const targetFiles = [
  '09_bonuses.html',
  '10_bonus1.html',
  '11_bonus2.html',
  '12_bonus3.html',
  '13_bonus4.html',
  '14_individual_offer.html'
];

const dirs = ['out/client'];

const CSP_TAG = `  <meta http-equiv="Content-Security-Policy"
    content="
      default-src 'self';
      script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://list.notibot.ru https://telegram.org https://kinescope.io https://*.kinescope.io;
      frame-src 'self' https://kinescope.io https://*.kinescope.io;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
      font-src 'self' https://fonts.gstatic.com;
      img-src 'self' data: https:;
      media-src 'self' https: data: blob:;
      connect-src 'self' https: http://localhost:3000;
    " />`;

const INTER_FONT = `<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">`;

for (const d of dirs) {
  for (const f of targetFiles) {
    const filePath = path.join(d, f);
    if (!fs.existsSync(filePath)) continue;
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Fix the double closing brace in safeHaptic
    content = content.replace(/(\s*\}\s*catch\s*\([^\)]*\)\s*\{\s*\}\s*\n\s*\}\s*)\n\s*\}/g, '$1');
    
    // 2. Remove redundant <link rel="stylesheet" href="theme.css" />
    content = content.replace(/\s*<link rel="stylesheet" href="theme\.css" \/>/g, '');

    // 3. Add CSP if missing
    if (!content.includes('Content-Security-Policy')) {
      content = content.replace(/(<meta name="viewport"[^>]*>)/, '$1\n' + CSP_TAG);
    }

    // 4. Update Font to Inter standard if Plus Jakarta Sans was used
    content = content.replace(/<link href="https:\/\/fonts\.googleapis\.com\/css2\?family=Plus\+Jakarta\+Sans[^"]*" rel="stylesheet" \/>/g, INTER_FONT);

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed:', filePath);
  }
}

// Verification step
console.log('\n--- VERIFICATION ---');
let allValid = true;
for (const d of dirs) {
  for (const f of targetFiles) {
    const filePath = path.join(d, f);
    if (!fs.existsSync(filePath)) continue;
    const c = fs.readFileSync(filePath, 'utf8');
    const scripts = c.match(/<script[\s\S]*?<\/script>/gi) || [];
    scripts.forEach((s, idx) => {
      const code = s.replace(/<script[^>]*>/i, '').replace(/<\/script>/i, '').trim();
      if (!code || s.includes('src=')) return;
      try {
        new vm.Script(code);
      } catch (err) {
        console.error(`❌ JS Syntax Error in ${filePath} (script #${idx}):`, err.message);
        allValid = false;
      }
    });
  }
}

if (allValid) {
  console.log('✅ ALL SCRIPTS IN ALL BONUS FILES ARE 100% VALID JAVASCRIPT!');
}
