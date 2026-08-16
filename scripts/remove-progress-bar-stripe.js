const fs = require('fs');
const path = require('path');

const CLIENT_DIR = path.join(__dirname, '..', 'out', 'client');

const lessonFiles = [
  '03_lesson1.html',
  '04_lesson2.html',
  '05_lesson3.html',
  '06_lesson4.html',
  '07_lesson5.html'
];

lessonFiles.forEach(file => {
  const filePath = path.join(CLIENT_DIR, file);
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  // Remove the header-progress-row and progress-track from the top navigation header
  // Also simplify <header class="header-bar-nav"> to <div class="header-actions-row">
  content = content.replace(/<header class="header-bar-nav">[\s\S]*?<\/header>/, function(match) {
    const actionsMatch = match.match(/<div class="header-actions-row">[\s\S]*?<\/div>\s*<\/div>/);
    if (actionsMatch) {
      return `<!-- Navigation Header -->\n      <div class="header-actions-row" style="margin-bottom: 6px;">\n${actionsMatch[0].replace(/<div class="header-actions-row">/, '').trim()}`;
    }
    // Alternative match pattern
    const btnMatches = match.match(/<button[\s\S]*?<\/button>[\s\S]*?<button[\s\S]*?<\/button>/);
    if (btnMatches) {
      return `<!-- Navigation Header -->\n      <div class="header-actions-row" style="margin-bottom: 6px;">\n        ${btnMatches[0]}\n      </div>`;
    }
    return match;
  });

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Removed progress stripe from ${file}`);
});

console.log('All lesson headers cleaned up!');
