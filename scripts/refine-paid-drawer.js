const fs = require('fs');
const path = require('path');

const CLIENT_DIR = path.join(__dirname, '..', 'out', 'client');

function getDrawerHtml(activeFile) {
  return `
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
        <!-- Блок уроков -->
        <div>
          <div class="drawer-section-label">Уроки курса</div>
          <div class="drawer-list">
            <!-- Урок 1 -->
            <a href="javascript:void(0);" onclick="navigateFromDrawer('03_lesson1.html'); return false;" class="drawer-item ${activeFile === '03_lesson1.html' ? 'active-current' : ''}">
              <div class="drawer-item-left">
                <div class="drawer-item-num">1</div>
                <div class="drawer-item-info">
                  <div class="drawer-item-name">Молчание, запускающее сценарий</div>
                  <div class="drawer-item-sub">Факт → тревога → попытка догнать</div>
                </div>
              </div>
              ${activeFile === '03_lesson1.html' ? '<span class="drawer-item-tag">Вы здесь</span>' : '<span style="color:rgba(31,46,53,0.3); font-size:16px;">→</span>'}
            </a>

            <!-- Урок 2 -->
            <a href="javascript:void(0);" onclick="navigateFromDrawer('04_lesson2.html'); return false;" class="drawer-item ${activeFile === '04_lesson2.html' ? 'active-current' : ''}">
              <div class="drawer-item-left">
                <div class="drawer-item-num">2</div>
                <div class="drawer-item-info">
                  <div class="drawer-item-name">Как тело включает тревогу</div>
                  <div class="drawer-item-sub">Сжатие, спазм, импульс действовать</div>
                </div>
              </div>
              ${activeFile === '04_lesson2.html' ? '<span class="drawer-item-tag">Вы здесь</span>' : '<span style="color:rgba(31,46,53,0.3); font-size:16px;">→</span>'}
            </a>

            <!-- Урок 3 -->
            <a href="javascript:void(0);" onclick="navigateFromDrawer('05_lesson3.html'); return false;" class="drawer-item ${activeFile === '05_lesson3.html' ? 'active-current' : ''}">
              <div class="drawer-item-left">
                <div class="drawer-item-num">3</div>
                <div class="drawer-item-info">
                  <div class="drawer-item-name">Ловушка объяснений</div>
                  <div class="drawer-item-sub">Почему мы оправдываем холодность</div>
                </div>
              </div>
              ${activeFile === '05_lesson3.html' ? '<span class="drawer-item-tag">Вы здесь</span>' : '<span style="color:rgba(31,46,53,0.3); font-size:16px;">→</span>'}
            </a>

            <!-- Урок 4 -->
            <a href="javascript:void(0);" onclick="navigateFromDrawer('06_lesson4.html'); return false;" class="drawer-item ${activeFile === '06_lesson4.html' ? 'active-current' : ''}">
              <div class="drawer-item-left">
                <div class="drawer-item-num">4</div>
                <div class="drawer-item-info">
                  <div class="drawer-item-name">Перехват управления</div>
                  <div class="drawer-item-sub">Пауза между импульсом и реакцией</div>
                </div>
              </div>
              ${activeFile === '06_lesson4.html' ? '<span class="drawer-item-tag">Вы здесь</span>' : '<span style="color:rgba(31,46,53,0.3); font-size:16px;">→</span>'}
            </a>

            <!-- Урок 5 -->
            <a href="javascript:void(0);" onclick="navigateFromDrawer('07_lesson5.html'); return false;" class="drawer-item ${activeFile === '07_lesson5.html' ? 'active-current' : ''}">
              <div class="drawer-item-left">
                <div class="drawer-item-num">5</div>
                <div class="drawer-item-info">
                  <div class="drawer-item-name">Новый выбор в отношениях</div>
                  <div class="drawer-item-sub">Закрепление взрослой позиции</div>
                </div>
              </div>
              ${activeFile === '07_lesson5.html' ? '<span class="drawer-item-tag">Вы здесь</span>' : '<span style="color:rgba(31,46,53,0.3); font-size:16px;">→</span>'}
            </a>
          </div>
        </div>

        <!-- Блок бонусов -->
        <div>
          <div class="drawer-section-label">Бонусы курса</div>
          <div class="drawer-list">
            <!-- Все бонусы -->
            <a href="javascript:void(0);" onclick="navigateFromDrawer('09_bonuses.html'); return false;" class="drawer-item ${activeFile === '09_bonuses.html' ? 'active-current' : ''}">
              <div class="drawer-item-left">
                <div class="drawer-item-num" style="background:rgba(196,115,79,0.14); color:#A85532;">🎁</div>
                <div class="drawer-item-info">
                  <div class="drawer-item-name">4 практических бонуса</div>
                  <div class="drawer-item-sub">Чек-листы, памятки и сценарии</div>
                </div>
              </div>
              ${activeFile === '09_bonuses.html' ? '<span class="drawer-item-tag bonus">Вы здесь</span>' : '<span style="color:rgba(31,46,53,0.3); font-size:16px;">→</span>'}
            </a>

            <!-- Индивидуальный разбор -->
            <a href="javascript:void(0);" onclick="navigateFromDrawer('14_individual_offer.html'); return false;" class="drawer-item ${activeFile === '14_individual_offer.html' ? 'active-current' : ''}">
              <div class="drawer-item-left">
                <div class="drawer-item-num" style="background:rgba(49,130,206,0.12); color:#2B6CB0;">⭐</div>
                <div class="drawer-item-info">
                  <div class="drawer-item-name">Индивидуальный разбор</div>
                  <div class="drawer-item-sub">Персональная работа со сценарием</div>
                </div>
              </div>
              ${activeFile === '14_individual_offer.html' ? '<span class="drawer-item-tag">Вы здесь</span>' : '<span style="color:rgba(31,46,53,0.3); font-size:16px;">→</span>'}
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
`;
}

const paidFiles = [
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

paidFiles.forEach(file => {
  const filePath = path.join(CLIENT_DIR, file);
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace drawer HTML
  const drawerHtml = getDrawerHtml(file);
  content = content.replace(/<!-- =========================================================\s*BOTTOM DRAWER \/ НАВИГАЦИЯ ПО КУРСУ[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/, drawerHtml.trim());

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Updated clean paid drawer in:', file);
});

console.log('Paid drawer refinement completed!');
