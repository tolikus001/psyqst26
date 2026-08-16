const fs = require('fs');
const path = require('path');

const CLIENT_DIR = path.join(__dirname, '..', 'out', 'client');

const headers = {
  '03_lesson1.html': `      <!-- Navigation Header -->
      <div class="header-actions-row" style="margin-bottom: 6px;">
        <button type="button" onclick="openNavDrawer();" class="nav-glass-tinted-btn">
          <span>🧭</span>
          <span>Навигация по курсу</span>
        </button>
        <button type="button" onclick="safeHaptic('selection'); openScreen('04_lesson2.html');" class="next-lesson-btn">
          <span>Следующий урок →</span>
        </button>
      </div>`,

  '04_lesson2.html': `      <!-- Navigation Header -->
      <div class="header-actions-row" style="margin-bottom: 6px;">
        <button type="button" onclick="openNavDrawer();" class="nav-glass-tinted-btn">
          <span>🧭</span>
          <span>Навигация по курсу</span>
        </button>
        <button type="button" onclick="safeHaptic('selection'); openScreen('05_lesson3.html');" class="next-lesson-btn">
          <span>Следующий урок →</span>
        </button>
      </div>`,

  '05_lesson3.html': `      <!-- Navigation Header -->
      <div class="header-actions-row" style="margin-bottom: 6px;">
        <button type="button" onclick="openNavDrawer();" class="nav-glass-tinted-btn">
          <span>🧭</span>
          <span>Навигация по курсу</span>
        </button>
        <button type="button" onclick="safeHaptic('selection'); openScreen('06_lesson4.html');" class="next-lesson-btn">
          <span>Следующий урок →</span>
        </button>
      </div>`,

  '06_lesson4.html': `      <!-- Navigation Header -->
      <div class="header-actions-row" style="margin-bottom: 6px;">
        <button type="button" onclick="openNavDrawer();" class="nav-glass-tinted-btn">
          <span>🧭</span>
          <span>Навигация по курсу</span>
        </button>
        <button type="button" onclick="safeHaptic('selection'); openScreen('07_lesson5.html');" class="next-lesson-btn">
          <span>Следующий урок →</span>
        </button>
      </div>`,

  '07_lesson5.html': `      <!-- Navigation Header -->
      <div class="header-actions-row" style="margin-bottom: 6px;">
        <button type="button" onclick="openNavDrawer();" class="nav-glass-tinted-btn">
          <span>🧭</span>
          <span>Навигация по курсу</span>
        </button>
        <button type="button" onclick="safeHaptic('selection'); openScreen('09_bonuses.html');" class="next-lesson-btn">
          <span>🎁 К бонусам →</span>
        </button>
      </div>`
};

Object.entries(headers).forEach(([file, newHeader]) => {
  const filePath = path.join(CLIENT_DIR, file);
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace from start of navigation header down to the beginning of the video card or screen 1
  content = content.replace(/<!-- Navigation Header[\s\S]*?(?=<section class="glass card|<div id="step1VideoScreen)/, `${newHeader}\n\n      `);

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Cleaned header in ${file}`);
});

console.log('All 5 lessons have clean headers without progress bars!');
