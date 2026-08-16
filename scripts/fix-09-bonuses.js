const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CLIENT_DIR = path.join(__dirname, '..', 'out', 'client');
const targetFile = path.join(CLIENT_DIR, '09_bonuses.html');

// 1. Get original content from git HEAD
const originalContent = execSync('git show HEAD:out/client/09_bonuses.html', { encoding: 'utf8' });

// 2. Drawer CSS to include in <style>
const DRAWER_CSS = `
    /* =========================================================
       NAVIGATION HEADER & DRAWER STYLES
       ========================================================= */
    .header-bar-nav {
      display: flex;
      flex-direction: column;
      gap: 10px;
      width: 100%;
      padding: 4px 0 2px;
    }

    .header-actions-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
      width: 100%;
    }

    .nav-glass-tinted-btn {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      font-weight: 700;
      font-size: 13px;
      letter-spacing: -0.2px;
      color: #A85532 !important;
      background: rgba(196, 115, 79, 0.12);
      backdrop-filter: blur(18px);
      -webkit-backdrop-filter: blur(18px);
      padding: 8px 14px;
      border-radius: 9999px;
      border: 1px solid rgba(196, 115, 79, 0.32);
      box-shadow: 0 4px 14px rgba(196, 115, 79, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.7);
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      white-space: nowrap;
      flex-shrink: 0;
      text-decoration: none;
    }

    .nav-glass-tinted-btn:hover {
      background: rgba(196, 115, 79, 0.18);
      border-color: rgba(196, 115, 79, 0.45);
      transform: translateY(-1px);
    }

    .nav-glass-tinted-btn:active {
      transform: scale(0.96) translateY(0);
      background: rgba(196, 115, 79, 0.22);
    }

    .next-lesson-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      font-weight: 700;
      font-size: 13px;
      letter-spacing: -0.2px;
      color: #FFFFFF !important;
      background: linear-gradient(135deg, rgba(204, 122, 85, 0.96) 0%, rgba(168, 85, 50, 0.98) 100%);
      padding: 8px 16px;
      border-radius: 9999px;
      border: 1px solid rgba(255, 255, 255, 0.4);
      box-shadow: 0 6px 20px rgba(196, 115, 79, 0.32), inset 0 1px 1.5px rgba(255, 255, 255, 0.55);
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      white-space: nowrap;
      text-decoration: none;
    }

    .next-lesson-btn:hover {
      background: linear-gradient(135deg, rgba(214, 132, 95, 1) 0%, rgba(178, 95, 60, 1) 100%);
      box-shadow: 0 8px 24px rgba(196, 115, 79, 0.45), inset 0 1px 1.5px rgba(255, 255, 255, 0.7);
      transform: translateY(-1px);
    }

    .next-lesson-btn:active {
      transform: scale(0.96) translateY(0);
    }

    /* BOTTOM DRAWER STYLES */
    #navDrawerOverlay {
      position: fixed;
      inset: 0;
      z-index: 9999;
      visibility: hidden;
      transition: visibility 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    #navDrawerOverlay.active {
      visibility: visible;
    }

    #navDrawerBackdrop {
      position: absolute;
      inset: 0;
      background: rgba(15, 23, 28, 0.45);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    #navDrawerOverlay.active #navDrawerBackdrop {
      opacity: 1;
    }

    #navDrawerPanel {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      max-width: 500px;
      margin: 0 auto;
      background: rgba(255, 255, 255, 0.96);
      backdrop-filter: blur(28px);
      -webkit-backdrop-filter: blur(28px);
      border-top: 1px solid rgba(255, 255, 255, 0.85);
      border-radius: 30px 30px 0 0;
      box-shadow: 0 -12px 48px rgba(0, 0, 0, 0.22);
      transform: translateY(100%);
      transition: transform 0.34s cubic-bezier(0.16, 1, 0.3, 1);
      display: flex;
      flex-direction: column;
      max-height: 85vh;
      overflow: hidden;
    }

    #navDrawerOverlay.active #navDrawerPanel {
      transform: translateY(0);
    }

    .drawer-handle {
      width: 44px;
      height: 4px;
      background: rgba(31, 46, 53, 0.16);
      border-radius: 999px;
      margin: 12px auto 6px;
      cursor: pointer;
    }

    .drawer-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 20px 14px;
      border-bottom: 1px solid rgba(31, 46, 53, 0.07);
    }

    .drawer-title {
      font-size: 17px;
      font-weight: 800;
      color: #1F2E35;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .drawer-close-btn {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: rgba(31, 46, 53, 0.06);
      border: none;
      font-size: 15px;
      font-weight: 700;
      color: #1F2E35;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background 0.2s;
    }

    .drawer-close-btn:active {
      background: rgba(31, 46, 53, 0.12);
    }

    .drawer-content {
      overflow-y: auto;
      padding: 14px 18px 28px;
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    .drawer-section-label {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      color: rgba(31, 46, 53, 0.45);
      margin-bottom: 6px;
      padding-left: 6px;
    }

    .drawer-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .drawer-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 14px;
      background: rgba(248, 250, 249, 0.85);
      border: 1px solid rgba(31, 46, 53, 0.05);
      border-radius: 16px;
      text-decoration: none;
      color: #1F2E35;
      transition: all 0.18s ease;
      cursor: pointer;
    }

    .drawer-item:active {
      transform: scale(0.98);
      background: rgba(239, 243, 241, 0.95);
    }

    .drawer-item.active-current {
      background: rgba(196, 115, 79, 0.1);
      border-color: rgba(196, 115, 79, 0.35);
    }

    .drawer-item-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .drawer-item-num {
      width: 28px;
      height: 28px;
      border-radius: 8px;
      background: rgba(31, 46, 53, 0.07);
      color: #1F2E35;
      font-weight: 800;
      font-size: 13px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .drawer-item.active-current .drawer-item-num {
      background: #C4734F;
      color: #FFFFFF;
    }

    .drawer-item-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
      text-align: left;
    }

    .drawer-item-name {
      font-size: 14px;
      font-weight: 700;
      line-height: 1.25;
      color: #1F2E35;
    }

    .drawer-item-sub {
      font-size: 11px;
      color: rgba(31, 46, 53, 0.55);
      font-weight: 500;
    }

    .drawer-item-tag {
      font-size: 11px;
      font-weight: 700;
      color: #A85532;
      background: rgba(255, 255, 255, 0.95);
      padding: 3px 8px;
      border-radius: 6px;
      border: 1px solid rgba(196, 115, 79, 0.25);
    }

    .drawer-item-tag.bonus {
      color: #A85532;
      border-color: rgba(196, 115, 79, 0.3);
      background: #FFF8F5;
    }
`;

// 3. New top bar for 09_bonuses.html
const NEW_TOP_NAV = `      <!-- Top Navigation -->
      <div class="header-actions-row" style="margin-bottom: 6px;">
        <button type="button" onclick="openNavDrawer();" class="nav-glass-tinted-btn">
          <span>🧭</span>
          <span>Навигация по курсу</span>
        </button>
        <button type="button" onclick="safeHaptic('selection'); openScreen('03_lesson1.html');" class="next-lesson-btn">
          <span>К уроку 1 →</span>
        </button>
      </div>`;

// 4. Drawer HTML
const DRAWER_HTML = `
  <!-- =========================================================
       BOTTOM DRAWER / НАВИГАЦИЯ ПО КУРСУ
       ========================================================= -->
  <div id="navDrawerOverlay" onclick="handleDrawerBackdropClick(event)">
    <div id="navDrawerBackdrop"></div>

    <div id="navDrawerPanel">
      <div class="drawer-handle" onclick="closeNavDrawer()"></div>

      <div class="drawer-header">
        <div class="drawer-title">
          <span style="color:#C4734F;">🧭</span>
          <span>Навигация по курсу</span>
        </div>
        <button type="button" class="drawer-close-btn" onclick="closeNavDrawer()">✕</button>
      </div>

      <div class="drawer-content">
        <!-- Блок старта -->
        <div>
          <div class="drawer-section-label">Главная</div>
          <div class="drawer-list">
            <a href="javascript:void(0);" onclick="navigateFromDrawer('02_landing_partner.html'); return false;" class="drawer-item">
              <div class="drawer-item-left">
                <div class="drawer-item-num" style="background:rgba(47,125,89,0.12); color:#2F7D59;">🏠</div>
                <div class="drawer-item-info">
                  <div class="drawer-item-name">Старт курса</div>
                  <div class="drawer-item-sub">Главная страница и программа</div>
                </div>
              </div>
              <span style="color:rgba(31,46,53,0.3); font-size:16px;">→</span>
            </a>
          </div>
        </div>

        <!-- Блок уроков -->
        <div>
          <div class="drawer-section-label">Уроки миникурса</div>
          <div class="drawer-list">
            <!-- Урок 1 -->
            <a href="javascript:void(0);" onclick="navigateFromDrawer('03_lesson1.html'); return false;" class="drawer-item">
              <div class="drawer-item-left">
                <div class="drawer-item-num">1</div>
                <div class="drawer-item-info">
                  <div class="drawer-item-name">Молчание, запускающее сценарий</div>
                  <div class="drawer-item-sub">Факт → тревога → попытка догнать</div>
                </div>
              </div>
              <span style="color:rgba(31,46,53,0.3); font-size:16px;">→</span>
            </a>

            <!-- Урок 2 -->
            <a href="javascript:void(0);" onclick="navigateFromDrawer('04_lesson2.html'); return false;" class="drawer-item">
              <div class="drawer-item-left">
                <div class="drawer-item-num">2</div>
                <div class="drawer-item-info">
                  <div class="drawer-item-name">Как тело включает тревогу</div>
                  <div class="drawer-item-sub">Сжатие, спазм, импульс действовать</div>
                </div>
              </div>
              <span style="color:rgba(31,46,53,0.3); font-size:16px;">→</span>
            </a>

            <!-- Урок 3 -->
            <a href="javascript:void(0);" onclick="navigateFromDrawer('05_lesson3.html'); return false;" class="drawer-item">
              <div class="drawer-item-left">
                <div class="drawer-item-num">3</div>
                <div class="drawer-item-info">
                  <div class="drawer-item-name">Ловушка объяснений</div>
                  <div class="drawer-item-sub">Почему мы оправдываем холодность</div>
                </div>
              </div>
              <span style="color:rgba(31,46,53,0.3); font-size:16px;">→</span>
            </a>

            <!-- Урок 4 -->
            <a href="javascript:void(0);" onclick="navigateFromDrawer('06_lesson4.html'); return false;" class="drawer-item">
              <div class="drawer-item-left">
                <div class="drawer-item-num">4</div>
                <div class="drawer-item-info">
                  <div class="drawer-item-name">Перехват управления</div>
                  <div class="drawer-item-sub">Пауза между импульсом и реакцией</div>
                </div>
              </div>
              <span style="color:rgba(31,46,53,0.3); font-size:16px;">→</span>
            </a>

            <!-- Урок 5 -->
            <a href="javascript:void(0);" onclick="navigateFromDrawer('07_lesson5.html'); return false;" class="drawer-item">
              <div class="drawer-item-left">
                <div class="drawer-item-num">5</div>
                <div class="drawer-item-info">
                  <div class="drawer-item-name">Новый выбор в отношениях</div>
                  <div class="drawer-item-sub">Закрепление взрослой позиции</div>
                </div>
              </div>
              <span style="color:rgba(31,46,53,0.3); font-size:16px;">→</span>
            </a>
          </div>
        </div>

        <!-- Блок бонусов -->
        <div>
          <div class="drawer-section-label">Бонусы и разбор</div>
          <div class="drawer-list">
            <!-- Бонусы -->
            <a href="javascript:void(0);" onclick="navigateFromDrawer('09_bonuses.html'); return false;" class="drawer-item active-current">
              <div class="drawer-item-left">
                <div class="drawer-item-num" style="background:rgba(196,115,79,0.14); color:#A85532;">🎁</div>
                <div class="drawer-item-info">
                  <div class="drawer-item-name">4 практических бонуса</div>
                  <div class="drawer-item-sub">Чек-листы, медитации и сценарии</div>
                </div>
              </div>
              <span class="drawer-item-tag bonus">Вы здесь</span>
            </a>

            <!-- Индивидуальный разбор -->
            <a href="javascript:void(0);" onclick="navigateFromDrawer('14_individual_offer.html'); return false;" class="drawer-item">
              <div class="drawer-item-left">
                <div class="drawer-item-num" style="background:rgba(49,130,206,0.12); color:#2B6CB0;">⭐</div>
                <div class="drawer-item-info">
                  <div class="drawer-item-name">Индивидуальный разбор</div>
                  <div class="drawer-item-sub">Персональная работа со сценарием</div>
                </div>
              </div>
              <span style="color:rgba(31,46,53,0.3); font-size:16px;">→</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>

  <script>
    function openNavDrawer() {
      if (typeof safeHaptic === 'function') safeHaptic('medium');
      var overlay = document.getElementById('navDrawerOverlay');
      if (overlay) overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeNavDrawer() {
      if (typeof safeHaptic === 'function') safeHaptic('selection');
      var overlay = document.getElementById('navDrawerOverlay');
      if (overlay) overlay.classList.remove('active');
      document.body.style.overflow = '';
    }

    function handleDrawerBackdropClick(e) {
      if (e.target.id === 'navDrawerOverlay' || e.target.id === 'navDrawerBackdrop') {
        closeNavDrawer();
      }
    }

    function navigateFromDrawer(targetUrl) {
      if (typeof safeHaptic === 'function') safeHaptic('selection');
      closeNavDrawer();
      if (typeof openScreen === 'function') {
        openScreen(targetUrl);
      } else {
        window.location.href = targetUrl;
      }
    }
  </script>
`;

// Insert CSS
let updatedContent = originalContent.replace('</style>', `${DRAWER_CSS}\n  </style>`);

// Replace old top navigation button with new two-button header
const oldNavBlock = `      <!-- Top Navigation -->
      <div>
        <a href="javascript:void(0);" onclick="safeHaptic('selection'); openScreen('07_lesson5.html'); return false;" class="top-nav-btn" style="display:inline-flex; align-items:center; gap:6px; font-weight:700; font-size:13px; color:var(--nb-deep); background:rgba(255,255,255,0.75); backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px); padding:6px 14px; border-radius:9999px; border:1px solid rgba(255,255,255,0.85); box-shadow:0 2px 8px rgba(0,0,0,0.04); text-decoration:none; cursor:pointer;">
          ← Вернуться к уроку 5
        </a>
      </div>`;

updatedContent = updatedContent.replace(oldNavBlock, NEW_TOP_NAV);

// Insert Drawer HTML before </body>
updatedContent = updatedContent.replace('</body>', `${DRAWER_HTML}\n</body>`);

fs.writeFileSync(targetFile, updatedContent, 'utf8');
console.log('09_bonuses.html successfully restored with all 4 bonuses and navigation drawer!');
