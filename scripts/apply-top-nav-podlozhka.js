const fs = require('fs');
const path = require('path');

const clientDir = path.join(__dirname, '..', 'out', 'client');
const files = fs.readdirSync(clientDir).filter(f => f.endsWith('.html'));

const podlozhkaStyle = 'display:inline-flex; align-items:center; gap:6px; font-weight:700; font-size:13px; color:var(--nb-deep); background:rgba(255,255,255,0.75); backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px); padding:6px 14px; border-radius:9999px; border:1px solid rgba(255,255,255,0.85); box-shadow:0 2px 8px rgba(0,0,0,0.04); text-decoration:none; cursor:pointer;';

let modifiedFiles = [];

files.forEach(file => {
  const filePath = path.join(clientDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // 1. Target top-level back links in header or top navigation with "←"
  // Patterns like:
  // <a href="javascript:void(0);" onclick="safeHaptic('selection'); openScreen('...'); return false;" class="..." style="...">\s*← ...\s*</a>
  
  // Specific regex to match top navigation links starting with ←
  content = content.replace(
    /<a\s+href="javascript:void\(0\);"\s+onclick="safeHaptic\('selection'\);\s*openScreen\('([^']+)'\);\s*return false;"\s+class="(?:ghost-btn|subtle|top-nav-btn)"[^>]*>(\s*←[^<]+)<\/a>/g,
    `<a href="javascript:void(0);" onclick="safeHaptic('selection'); openScreen('$1'); return false;" class="top-nav-btn" style="${podlozhkaStyle}">$2</a>`
  );

  // 2. Also match button with goToVideo() or goToStep1() that have "← Назад к видеоуроку" or "← Назад к уроку"
  content = content.replace(
    /<button\s+onclick="(?:goToVideo|goToStep1)\(\)"\s+class="(?:ghost-btn|subtle|top-nav-btn)"[^>]*>(\s*←\s*Назад к видеоуроку\s*)<\/button>/g,
    `<button onclick="goToVideo()" class="top-nav-btn" style="${podlozhkaStyle}">$1</button>`
  );

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    modifiedFiles.push(file);
    console.log(`Updated top nav podlozhka in: ${file}`);
  }
});

console.log(`\nTotal updated files: ${modifiedFiles.length}`);
