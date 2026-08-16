const fs = require('fs');
const path = require('path');

const clientDir = path.join(__dirname, '..', 'out', 'client');

const pages = [
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

function generateDrawerHtml(activePage) {
  function getItem(pageFile, num, name, sub, isBonus = false, isIndividual = false) {
    const isCurrent = activePage === pageFile;
    const activeClass = isCurrent ? 'active-current' : '';
    
    let numIconHtml = `<div class="drawer-item-num">${num}</div>`;
    if (isBonus) {
      numIconHtml = `<div class="drawer-item-num" style="background:rgba(196,115,79,0.14); color:#A85532;">🎁</div>`;
    } else if (isIndividual) {
      numIconHtml = `<div class="drawer-item-num" style="background:rgba(49,130,206,0.12); color:#2B6CB0;">⭐</div>`;
    }

    let tagHtml = `<span style="color:rgba(31,46,53,0.3); font-size:16px;">→</span>`;
    if (isCurrent) {
      tagHtml = `<span class="drawer-item-tag">Вы здесь</span>`;
    } else if (isBonus) {
      tagHtml = `<span class="drawer-item-tag bonus">4 бонуса</span>`;
    }

    return `            <!-- ${name} -->
            <a href="javascript:void(0);" onclick="navigateFromDrawer('${pageFile}'); return false;" class="drawer-item ${activeClass}">
              <div class="drawer-item-left">
                ${numIconHtml}
                <div class="drawer-item-info">
                  <div class="drawer-item-name">${name}</div>
                  <div class="drawer-item-sub">${sub}</div>
                </div>
              </div>
              ${tagHtml}
            </a>`;
  }

  const lesson1 = getItem('03_lesson1.html', '1', 'Молчание, запускающее сценарий', 'Факт → тревога → попытка догнать');
  const lesson2 = getItem('04_lesson2.html', '2', 'Как тело включает тревогу', 'Сжатие, спазм, импульс действовать');
  const lesson3 = getItem('05_lesson3.html', '3', 'Ловушка объяснений', 'Почему мы оправдываем холодность');
  const lesson4 = getItem('06_lesson4.html', '4', 'Перехват управления', 'Пауза между импульсом и реакцией');
  const lesson5 = getItem('07_lesson5.html', '5', 'Новый выбор в отношениях', 'Закрепление взрослой позиции');
  const bonuses = getItem('09_bonuses.html', '🎁', '4 практических бонуса', 'Чек-листы, медитации и сценарии', true);
  const individual = getItem('14_individual_offer.html', '⭐', 'Индивидуальный разбор', 'Персональная работа со сценарием', false, true);

  return `  <!-- =========================================================
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
${lesson1}

${lesson2}

${lesson3}

${lesson4}

${lesson5}
          </div>
        </div>

        <!-- Блок бонусов -->
        <div>
          <div class="drawer-section-label">Бонусы и разбор</div>
          <div class="drawer-list">
${bonuses}

${individual}
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

pages.forEach(file => {
  const filePath = path.join(clientDir, file);
  let html = fs.readFileSync(filePath, 'utf8');

  // Replace everything from <!-- === BOTTOM DRAWER up to <script>
  let drawerIndex = html.indexOf('<!-- =========================================================\n       BOTTOM DRAWER');
  if (drawerIndex === -1) {
    drawerIndex = html.indexOf('<!-- =========================================================\r\n       BOTTOM DRAWER');
  }
  if (drawerIndex === -1) {
    drawerIndex = html.indexOf('<div id="navDrawerOverlay"');
  }

  if (drawerIndex === -1) {
    console.log(`Skipping ${file} - no navDrawerOverlay found`);
    return;
  }

  const scriptIndex = html.indexOf('<script', drawerIndex);
  if (scriptIndex === -1) {
    console.log(`Skipping ${file} - no script tag found after drawer`);
    return;
  }

  const drawerHtml = generateDrawerHtml(file);
  html = html.slice(0, drawerIndex) + drawerHtml + '\n\n  ' + html.slice(scriptIndex);

  // Ensure JS functions are correct
  const jsBlock = `  <script>
    window.openNavDrawer = function() {
      try { if (typeof safeHaptic === 'function') safeHaptic('medium'); } catch(e) {}
      var overlay = document.getElementById('navDrawerOverlay');
      if (overlay) {
        overlay.style.display = 'block';
        void overlay.offsetHeight; // force reflow
        overlay.classList.add('active');
      }
      document.body.style.overflow = 'hidden';
    };

    window.closeNavDrawer = function() {
      try { if (typeof safeHaptic === 'function') safeHaptic('selection'); } catch(e) {}
      var overlay = document.getElementById('navDrawerOverlay');
      if (overlay) {
        overlay.classList.remove('active');
        setTimeout(function() {
          if (!overlay.classList.contains('active')) {
            overlay.style.display = 'none';
          }
        }, 320);
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
  </script>`;

  // Replace the drawer script section
  const lastScriptIndex = html.lastIndexOf('<script>');
  if (lastScriptIndex !== -1 && html.includes('window.openNavDrawer')) {
    const endBodyIndex = html.lastIndexOf('</body>');
    html = html.slice(0, lastScriptIndex) + jsBlock.trim() + '\n\n' + html.slice(endBodyIndex);
  }

  fs.writeFileSync(filePath, html, 'utf8');
  console.log(`✅ Applied complete drawer to ${file}`);
});
