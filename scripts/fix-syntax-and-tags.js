const fs = require('fs');
const path = require('path');

const clientDir = path.join(__dirname, '..', 'out', 'client');
const files = fs.readdirSync(clientDir).filter(f => f.endsWith('.html') || f === 'api-config.js');

// 1. Fix regex in openScreen across all files
files.forEach(f => {
  const filePath = path.join(clientDir, f);
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix broken regex /^(./|/)/ or similar in openScreen
  content = content.replace(/replace\(\/\^\(\.\/\|\\\/.*?, ''\)/g, "replace(/^\\.?\\//, '')");
  content = content.replace(/replace\(\/\^\(\.\/\|\/.*?, ''\)/g, "replace(/^\\.?\\//, '')");
  content = content.replace(/replace\(\/\^\(\.\\\/\|\\\/.*?, ''\)/g, "replace(/^\\.?\\//, '')");
  content = content.replace(/const clean = raw\.split\('\?'\)\[0\]\.split\('#'\)\[0\]\.replace\([^)]+\);/g, "const clean = raw.split('?')[0].split('#')[0].replace(/^\\.?\\//, '');");

  fs.writeFileSync(filePath, content, 'utf8');
});

// 2. Fix 14_individual_offer.html div closing tag
const file14Path = path.join(clientDir, '14_individual_offer.html');
let content14 = fs.readFileSync(file14Path, 'utf8');

// Ensure matching </div> for app and inner container before </main>
if (content14.includes('    </div>\n  </main>')) {
  content14 = content14.replace('    </div>\n  </main>', '    </div>\n    </div>\n  </main>');
  fs.writeFileSync(file14Path, content14, 'utf8');
  console.log('Fixed div tags in 14_individual_offer.html');
}

console.log('Regex and tags fix applied across all client files.');
