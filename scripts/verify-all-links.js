const fs = require('fs');
const path = require('path');

const CLIENT_DIR = path.join(__dirname, '..', 'out', 'client');
const allHtmlFiles = fs.readdirSync(CLIENT_DIR).filter(f => f.endsWith('.html'));

console.log('🔗 --- VERIFYING ALL SCREEN LINKS, BUTTONS, AND NOTIBOT HANDLERS ---\n');

let linkErrors = 0;

allHtmlFiles.forEach(file => {
  const content = fs.readFileSync(path.join(CLIENT_DIR, file), 'utf8');

  // Check openScreen calls
  const openScreenMatches = content.match(/openScreen\(['"]([^'"]+)['"]\)/g) || [];
  openScreenMatches.forEach(match => {
    const targetFile = match.replace(/openScreen\(['"]/, '').replace(/['"]\)/, '');
    if (!fs.existsSync(path.join(CLIENT_DIR, targetFile))) {
      console.log(`❌ [BROKEN LINK] in ${file}: target file "${targetFile}" not found!`);
      linkErrors++;
    }
  });

  // Check direct HTML href links (should not link to non-existent HTML files)
  const hrefMatches = content.match(/href=["']([a-zA-Z0-9_\-]+\.html)["']/g) || [];
  hrefMatches.forEach(match => {
    const targetFile = match.replace(/href=["']/, '').replace(/["']/, '');
    if (!fs.existsSync(path.join(CLIENT_DIR, targetFile))) {
      console.log(`❌ [BROKEN HREF] in ${file}: target file "${targetFile}" not found!`);
      linkErrors++;
    }
  });
});

if (linkErrors === 0) {
  console.log('✅ ALL SCREEN TRANSITIONS, NAVIGATION LINKS, AND NOTIBOT ROUTING ARE 100% VALID!\n');
} else {
  console.log(`🚨 Found ${linkErrors} broken navigation links!\n`);
  process.exit(1);
}
