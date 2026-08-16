const fs = require('fs');
const path = require('path');

const CLIENT_DIR = path.join(__dirname, '..', 'out', 'client');

// Улучшенные стили шторки с !important и z-index 99999
const BULLETPROOF_DRAWER_CSS = `
    /* =========================================================
       NAVIGATION HEADER & DRAWER STYLES (BULLETPROOF)
       ========================================================= */
    .header-bar-nav {
      display: flex !important;
      flex-direction: column !important;
      gap: 10px !important;
      width: 100% !important;
      padding: 4px 0 2px !important;
      box-sizing: border-box !important;
    }

    .header-actions-row {
      display: flex !important;
      justify-content: space-between !important;
      align-items: center !important;
      gap: 8px !important;
      width: 100% !important;
      box-sizing: border-box !important;
    }

    .nav-glass-tinted-btn {
      display: inline-flex !important;
      align-items: center !important;
      gap: 7px !important;
      font-weight: 700 !important;
      font-size: 13px !important;
      letter-spacing: -0.2px !important;
      color: #A85532 !important;
      background: rgba(196, 115, 79, 0.12) !important;
      backdrop-filter: blur(18px) !important;
      -webkit-backdrop-filter: blur(18px) !important;
      padding: 8px 14px !important;
      border-radius: 9999px !important;
      border: 1px solid rgba(196, 115, 79, 0.32) !important;
      box-shadow: 0 4px 14px rgba(196, 115, 79, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.7) !important;
      cursor: pointer !important;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
      white-space: nowrap !important;
      flex-shrink: 0 !important;
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
      gap: 6px !important;
      font-weight: 700 !important;
      font-size: 13px !important;
      letter-spacing: -0.2px !important;
      color: #FFFFFF !important;
      background: linear-gradient(135deg, rgba(204, 122, 85, 0.96) 0%, rgba(168, 85, 50, 0.98) 100%) !important;
      padding: 8px 16px !important;
      border-radius: 9999px !important;
      border: 1px solid rgba(255, 255, 255, 0.4) !important;
      box-shadow: 0 6px 20px rgba(196, 115, 79, 0.32), inset 0 1px 1.5px rgba(255, 255, 255, 0.55) !important;
      cursor: pointer !important;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
      white-space: nowrap !important;
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
    }

    .header-progress-row {
      display: flex !important;
      justify-content: space-between !important;
      align-items: center !important;
      width: 100% !important;
      padding: 0 2px !important;
    }

    .lesson-badge-sub {
      font-size: 12px !important;
      font-weight: 700 !important;
      color: #45656D !important;
    }

    .progress-percent-sub {
      font-size: 12px !important;
      font-weight: 700 !important;
      color: rgba(31, 46, 53, 0.5) !important;
    }

    /* BOTTOM DRAWER STYLES */
    #navDrawerOverlay {
      position: fixed !important;
      inset: 0 !important;
      z-index: 99999 !important;
      visibility: hidden !important;
      opacity: 0 !important;
      pointer-events: none !important;
      transition: visibility 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease !important;
    }

    #navDrawerOverlay.active {
      visibility: visible !important;
      opacity: 1 !important;
      pointer-events: auto !important;
    }

    #navDrawerBackdrop {
      position: absolute !important;
      inset: 0 !important;
      background: rgba(15, 23, 28, 0.45) !important;
      backdrop-filter: blur(8px) !important;
      -webkit-backdrop-filter: blur(8px) !important;
      opacity: 0 !important;
      transition: opacity 0.3s ease !important;
    }

    #navDrawerOverlay.active #navDrawerBackdrop {
      opacity: 1 !important;
    }

    #navDrawerPanel {
      position: absolute !important;
      bottom: 0 !important;
      left: 0 !important;
      right: 0 !important;
      max-width: 500px !important;
      margin: 0 auto !important;
      background: rgba(255, 255, 255, 0.96) !important;
      backdrop-filter: blur(28px) !important;
      -webkit-backdrop-filter: blur(28px) !important;
      border-top: 1px solid rgba(255, 255, 255, 0.85) !important;
      border-radius: 30px 30px 0 0 !important;
      box-shadow: 0 -12px 48px rgba(0, 0, 0, 0.22) !important;
      transform: translateY(100%) !important;
      transition: transform 0.34s cubic-bezier(0.16, 1, 0.3, 1) !important;
      display: flex !important;
      flex-direction: column !important;
      max-height: 85vh !important;
      overflow: hidden !important;
    }

    #navDrawerOverlay.active #navDrawerPanel {
      transform: translateY(0) !important;
    }

    .drawer-handle {
      width: 44px !important;
      height: 4px !important;
      background: rgba(31, 46, 53, 0.16) !important;
      border-radius: 999px !important;
      margin: 12px auto 6px !important;
      cursor: pointer !important;
    }

    .drawer-header {
      display: flex !important;
      justify-content: space-between !important;
      align-items: center !important;
      padding: 10px 20px 14px !important;
      border-bottom: 1px solid rgba(31, 46, 53, 0.07) !important;
    }

    .drawer-title {
      font-size: 17px !important;
      font-weight: 800 !important;
      color: #1F2E35 !important;
      display: flex !important;
      align-items: center !important;
      gap: 8px !important;
    }

    .drawer-close-btn {
      width: 32px !important;
      height: 32px !important;
      border-radius: 50% !important;
      background: rgba(31, 46, 53, 0.06) !important;
      border: none !important;
      font-size: 15px !important;
      font-weight: 700 !important;
      color: #1F2E35 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      cursor: pointer !important;
      transition: background 0.2s !important;
    }

    .drawer-close-btn:active {
      background: rgba(31, 46, 53, 0.12) !important;
    }

    .drawer-content {
      overflow-y: auto !important;
      padding: 14px 18px 28px !important;
      display: flex !important;
      flex-direction: column !important;
      gap: 18px !important;
    }

    .drawer-section-label {
      font-size: 11px !important;
      font-weight: 800 !important;
      text-transform: uppercase !important;
      letter-spacing: 0.6px !important;
      color: rgba(31, 46, 53, 0.45) !important;
      margin-bottom: 6px !important;
      padding-left: 6px !important;
    }

    .drawer-list {
      display: flex !important;
      flex-direction: column !important;
      gap: 6px !important;
    }

    .drawer-item {
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
      padding: 12px 14px !important;
      background: rgba(248, 250, 249, 0.85) !important;
      border: 1px solid rgba(31, 46, 53, 0.05) !important;
      border-radius: 16px !important;
      text-decoration: none !important;
      color: #1F2E35 !important;
      transition: all 0.18s ease !important;
      cursor: pointer !important;
    }

    .drawer-item:active {
      transform: scale(0.98) !important;
      background: rgba(239, 243, 241, 0.95) !important;
    }

    .drawer-item.active-current {
      background: rgba(196, 115, 79, 0.1) !important;
      border-color: rgba(196, 115, 79, 0.35) !important;
    }

    .drawer-item-left {
      display: flex !important;
      align-items: center !important;
      gap: 12px !important;
    }

    .drawer-item-num {
      width: 28px !important;
      height: 28px !important;
      border-radius: 8px !important;
      background: rgba(31, 46, 53, 0.07) !important;
      color: #1F2E35 !important;
      font-weight: 800 !important;
      font-size: 13px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      flex-shrink: 0 !important;
    }

    .drawer-item.active-current .drawer-item-num {
      background: #C4734F !important;
      color: #FFFFFF !important;
    }

    .drawer-item-info {
      display: flex !important;
      flex-direction: column !important;
      gap: 2px !important;
      text-align: left !important;
    }

    .drawer-item-name {
      font-size: 14px !important;
      font-weight: 700 !important;
      line-height: 1.25 !important;
      color: #1F2E35 !important;
    }

    .drawer-item-sub {
      font-size: 11px !important;
      color: rgba(31, 46, 53, 0.55) !important;
      font-weight: 500 !important;
    }

    .drawer-item-tag {
      font-size: 11px !important;
      font-weight: 700 !important;
      color: #A85532 !important;
      background: rgba(255, 255, 255, 0.95) !important;
      padding: 3px 8px !important;
      border-radius: 6px !important;
      border: 1px solid rgba(196, 115, 79, 0.25) !important;
    }

    .drawer-item-tag.bonus {
      color: #A85532 !important;
      border-color: rgba(196, 115, 79, 0.3) !important;
      background: #FFF8F5 !important;
    }
`;

// Скрипт глобальных функций навигации
const BULLETPROOF_DRAWER_SCRIPT = `
  <script>
    window.openNavDrawer = function() {
      try { if (typeof safeHaptic === 'function') safeHaptic('medium'); } catch(e) {}
      var overlay = document.getElementById('navDrawerOverlay');
      if (overlay) {
        overlay.classList.add('active');
      }
      document.body.style.overflow = 'hidden';
    };

    window.closeNavDrawer = function() {
      try { if (typeof safeHaptic === 'function') safeHaptic('selection'); } catch(e) {}
      var overlay = document.getElementById('navDrawerOverlay');
      if (overlay) {
        overlay.classList.remove('active');
      }
      document.body.style.overflow = '';
    };

    window.handleDrawerBackdropClick = function(e) {
      if (e.target.id === 'navDrawerOverlay' || e.target.id === 'navDrawerBackdrop') {
        window.closeNavDrawer();
      }
    };

    window.navigateFromDrawer = function(targetUrl) {
      try { if (typeof safeHaptic === 'function') safeHaptic('selection'); } catch(e) {}
      window.closeNavDrawer();
      if (typeof openScreen === 'function') {
        openScreen(targetUrl);
      } else {
        window.location.href = targetUrl;
      }
    };
  </script>
`;

// Верхняя панель для конкретных бонусных страниц
const BONUS_PAGES_HEADER = `      <!-- Top Navigation -->
      <div class="header-actions-row" style="margin-bottom: 6px;">
        <button type="button" onclick="openNavDrawer();" class="nav-glass-tinted-btn">
          <span>🧭</span>
          <span>Навигация по курсу</span>
        </button>
        <button type="button" onclick="safeHaptic('selection'); openScreen('09_bonuses.html');" class="next-lesson-btn">
          <span>К остальным бонусам →</span>
        </button>
      </div>`;

// 1. Обновляем бонусные файлы 10, 11, 12, 13, 14
const bonusFiles = ['10_bonus1.html', '11_bonus2.html', '12_bonus3.html', '13_bonus4.html', '14_individual_offer.html'];

bonusFiles.forEach(filename => {
  const filePath = path.join(CLIENT_DIR, filename);
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  // Заменяем верхнюю навигацию на чистую
  content = content.replace(/<!-- Top Navigation -->[\s\S]*?<\/div>\s*<\/div>/, BONUS_PAGES_HEADER);

  // Обновляем CSS стили
  content = content.replace(/\/\* =========================================================\s*NAVIGATION HEADER & DRAWER STYLES[\s\S]*?\.drawer-item-tag\.bonus\s*\{[\s\S]*?\}\s*/, BULLETPROOF_DRAWER_CSS);

  // Обновляем JS скрипт в конце файла
  content = content.replace(/<script>\s*function openNavDrawer\(\)[\s\S]*?<\/script>\s*<\/body>/, `${BULLETPROOF_DRAWER_SCRIPT}\n</body>`);

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated bonus page: ${filename}`);
});

// 2. Также обновляем скрипты и CSS во всех остальных 10 страницах для надежности
const otherFiles = ['01_psyquest.html', '02_landing_partner.html', '03_lesson1.html', '04_lesson2.html', '05_lesson3.html', '06_lesson4.html', '07_lesson5.html', '08_portrait_quest.html', '09_bonuses.html', 'index.html'];

otherFiles.forEach(filename => {
  const filePath = path.join(CLIENT_DIR, filename);
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  // Обновляем CSS стили
  content = content.replace(/\/\* =========================================================\s*NAVIGATION HEADER & DRAWER STYLES[\s\S]*?\.drawer-item-tag\.bonus\s*\{[\s\S]*?\}\s*/, BULLETPROOF_DRAWER_CSS);

  // Обновляем JS скрипт
  content = content.replace(/<script>\s*function openNavDrawer\(\)[\s\S]*?<\/script>\s*<\/body>/, `${BULLETPROOF_DRAWER_SCRIPT}\n</body>`);

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated other page: ${filename}`);
});

console.log('All pages updated with bulletproof drawer and "К остальным бонусам →" button!');
