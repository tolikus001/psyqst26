const fs = require('fs');
const path = require('path');

const clientDir = path.join(__dirname, '..', 'out', 'client');
const files = [
  '03_lesson1.html',
  '04_lesson2.html',
  '05_lesson3.html',
  '06_lesson4.html',
  '07_lesson5.html',
  '09_bonuses.html',
  '10_bonus1.html',
  '11_bonus2.html',
  '12_bonus3.html',
  '13_bonus4.html',
  '14_individual_offer.html'
];

const newHeaderCss = `
    .header-bar-nav {
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      gap: 10px !important;
      width: 100% !important;
      padding: 4px 0 2px !important;
      box-sizing: border-box !important;
    }

    .header-actions-row {
      display: flex !important;
      justify-content: center !important;
      align-items: center !important;
      gap: 8px !important;
      width: 100% !important;
      max-width: 100% !important;
      box-sizing: border-box !important;
    }

    .nav-glass-tinted-btn {
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 5px !important;
      font-weight: 700 !important;
      font-size: 12.5px !important;
      letter-spacing: -0.2px !important;
      color: #A85532 !important;
      background: rgba(196, 115, 79, 0.12) !important;
      backdrop-filter: blur(18px) !important;
      -webkit-backdrop-filter: blur(18px) !important;
      padding: 7px 11px !important;
      border-radius: 9999px !important;
      border: 1px solid rgba(196, 115, 79, 0.32) !important;
      box-shadow: 0 4px 14px rgba(196, 115, 79, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.7) !important;
      cursor: pointer !important;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
      white-space: nowrap !important;
      flex: 0 1 auto !important;
      max-width: fit-content !important;
      text-decoration: none !important;
      outline: none !important;
    }

    .nav-glass-tinted-btn:hover {
      background: rgba(196, 115, 79, 0.18) !important;
      border-color: rgba(196, 115, 79, 0.45) !important;
      transform: translateY(-1px) !important;
    }

    .nav-glass-tinted-btn:active {
      transform: scale(0.96) translateY(0) !important;
      background: rgba(196, 115, 79, 0.22) !important;
    }

    .next-lesson-btn {
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 5px !important;
      font-weight: 700 !important;
      font-size: 12.5px !important;
      letter-spacing: -0.2px !important;
      color: #FFFFFF !important;
      background: linear-gradient(135deg, rgba(204, 122, 85, 0.96) 0%, rgba(168, 85, 50, 0.98) 100%) !important;
      padding: 7px 12px !important;
      border-radius: 9999px !important;
      border: 1px solid rgba(255, 255, 255, 0.4) !important;
      box-shadow: 0 6px 20px rgba(196, 115, 79, 0.32), inset 0 1px 1.5px rgba(255, 255, 255, 0.55) !important;
      cursor: pointer !important;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
      white-space: nowrap !important;
      flex: 0 1 auto !important;
      max-width: fit-content !important;
      text-decoration: none !important;
      outline: none !important;
    }

    .next-lesson-btn:hover {
      background: linear-gradient(135deg, rgba(214, 132, 95, 1) 0%, rgba(178, 95, 60, 1) 100%) !important;
      box-shadow: 0 8px 24px rgba(196, 115, 79, 0.45), inset 0 1px 1.5px rgba(255, 255, 255, 0.7) !important;
      transform: translateY(-1px) !important;
    }

    .next-lesson-btn:active {
      transform: scale(0.96) translateY(0) !important;
    }`;

// 1. Update theme.css
const themePath = path.join(clientDir, 'theme.css');
let themeContent = fs.readFileSync(themePath, 'utf8');
if (!themeContent.includes('.header-actions-row')) {
  themeContent += '\n' + newHeaderCss;
  fs.writeFileSync(themePath, themeContent, 'utf8');
  console.log('Updated theme.css');
}

// 2. Update all 11 HTML files
files.forEach(f => {
  const filePath = path.join(clientDir, f);
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace CSS block for header actions
  const cssRegex = /\.header-bar-nav\s*\{[\s\S]*?\.next-lesson-btn:active\s*\{[\s\S]*?\}/m;
  if (cssRegex.test(content)) {
    content = content.replace(cssRegex, newHeaderCss.trim());
  } else {
    const actionsRowRegex = /\.header-actions-row\s*\{[\s\S]*?\.next-lesson-btn:active\s*\{[\s\S]*?\}/m;
    if (actionsRowRegex.test(content)) {
      content = content.replace(actionsRowRegex, newHeaderCss.trim());
    }
  }

  // Update button text in bonus pages: "К остальным бонусам →" -> "Все бонусы →"
  content = content.replace(/<span>К остальным бонусам →<\/span>/g, '<span>Все бонусы →</span>');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Updated header & buttons in:', f);
});

console.log('Centering and button visibility fix complete!');
