const fs = require('fs');
const path = require('path');

// 1. Read base head and styles from 16_lesson1.html
const lesson1Html = fs.readFileSync(path.join(__dirname, '../out/client/16_lesson1.html'), 'utf8');

const headMatch = lesson1Html.match(/<!doctype html>[\s\S]*?<\/head>/i);
if (!headMatch) {
  console.error("Failed to extract head from 16_lesson1.html");
  process.exit(1);
}
const standardHead = headMatch[0];

// Drawer Generator for S2
function getDrawerHtml(currentFile) {
  const lessons = [
    { num: 1, file: '16_lesson1.html', title: 'Почему один поступок занимает всю голову', sub: 'Факт → триллер → стабилизатор' },
    { num: 2, file: '17_lesson2.html', title: 'Почему вы тащите всё на себе', sub: 'Контроль и гиперответственность' },
    { num: 3, file: '18_lesson3.html', title: 'Как перестать спасать и начать жить', sub: 'Границы и опоры' },
    { num: 4, file: '19_lesson4.html', title: 'Что делать, когда накрывает', sub: 'Экстренная самопомощь' },
    { num: 5, file: '20_lesson5.html', title: 'Новая я в отношениях', sub: 'Закрепление взрослой позиции' }
  ];

  const bonusActive = currentFile === '21_bonuses.html' || currentFile.startsWith('22_') || currentFile.startsWith('23_') || currentFile.startsWith('24_') || currentFile.startsWith('25_');

  let lessonItems = lessons.map(l => {
    const isCurrent = l.file === currentFile;
    return `            <!-- Урок ${l.num} -->
            <a href="javascript:void(0);" onclick="navigateFromDrawer('${l.file}'); return false;" class="drawer-item ${isCurrent ? 'active-current' : ''}">
              <div class="drawer-item-left">
                <div class="drawer-item-num">${l.num}</div>
                <div class="drawer-item-info">
                  <div class="drawer-item-name">${l.title}</div>
                  <div class="drawer-item-sub">${l.sub}</div>
                </div>
              </div>
              ${isCurrent ? '<span class="drawer-item-tag">Вы здесь</span>' : '<span style="color:rgba(31,46,53,0.3); font-size:16px;">→</span>'}
            </a>`;
  }).join('\n\n');

  return `  <!-- =========================================================
       BOTTOM DRAWER / НАВИГАЦИЯ ПО КУРСУ (Сценарий 2)
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
${lessonItems}
          </div>
        </div>

        <!-- Блок бонусов -->
        <div>
          <div class="drawer-section-label">Бонусы и разбор</div>
          <div class="drawer-list">
            <!-- 4 практических бонуса -->
            <a href="javascript:void(0);" onclick="navigateFromDrawer('21_bonuses.html'); return false;" class="drawer-item ${bonusActive ? 'active-current' : ''}">
              <div class="drawer-item-left">
                <div class="drawer-item-num" style="background:rgba(196,115,79,0.14); color:#A85532;">🎁</div>
                <div class="drawer-item-info">
                  <div class="drawer-item-name">4 практических бонуса</div>
                  <div class="drawer-item-sub">Чек-листы, медитации и сценарии</div>
                </div>
              </div>
              <span class="drawer-item-tag bonus">${bonusActive ? 'Вы здесь' : '4 бонуса'}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>

  <script>
    window.openNavDrawer = function() {
      try { if (typeof safeHaptic === 'function') safeHaptic('medium'); } catch(e) {}
      var overlay = document.getElementById('navDrawerOverlay');
      if (overlay) {
        overlay.style.display = 'block';
        void overlay.offsetHeight;
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
}

const commonJsHelpers = `
    function safeHaptic(kind) {
      try {
        if (window.notibot) {
          if (kind === 'success' || kind === 'error' || kind === 'warning') {
            if (typeof notibot.hapticNotification === 'function') { notibot.hapticNotification(kind); return; }
          } else if (kind === 'selection') {
            if (typeof notibot.hapticSelection === 'function') { notibot.hapticSelection(); return; }
          } else {
            if (typeof notibot.hapticImpact === 'function') { notibot.hapticImpact(kind || 'light'); return; }
          }
        }
        if (window.Telegram && Telegram.WebApp && Telegram.WebApp.HapticFeedback) {
          var hf = Telegram.WebApp.HapticFeedback;
          if ((kind === 'success' || kind === 'error' || kind === 'warning') && typeof hf.notificationOccurred === 'function') { hf.notificationOccurred(kind); return; }
          if (kind === 'selection' && typeof hf.selectionChanged === 'function') { hf.selectionChanged(); return; }
          if (typeof hf.impactOccurred === 'function') { hf.impactOccurred(kind === 'heavy' ? 'heavy' : (kind === 'medium' ? 'medium' : 'light')); return; }
        }
        if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
          navigator.vibrate(kind === 'error' ? [30, 40, 30] : 12);
        }
      } catch (e) { }
    }

    function pauseVideo() {
      var iframes = document.querySelectorAll('iframe');
      iframes.forEach(function(iframe) {
        var currentSrc = iframe.src;
        if (currentSrc && currentSrc.includes('kinescope.io')) {
          iframe.src = '';
        }
      });
      var audios = document.querySelectorAll('audio');
      audios.forEach(function(a) { a.pause(); });
    }

    async function apiPostLocal(endpoint, bodyData, timeoutMs = 15000) {
      var baseUrl = (window.API_BASE && window.API_BASE !== '') ? window.API_BASE : '';
      var targetUrl = endpoint.startsWith('http') ? endpoint : (baseUrl + endpoint);
      
      var controller = new AbortController();
      var timer = setTimeout(function(){ controller.abort(); }, timeoutMs);

      try {
        var response = await fetch(targetUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(bodyData),
          signal: controller.signal
        });
        clearTimeout(timer);
        if (!response.ok) throw new Error("HTTP " + response.status);
        return await response.json();
      } catch (err) {
        clearTimeout(timer);
        if (window.AMVERA_HOST && targetUrl !== (window.AMVERA_HOST + endpoint)) {
           try {
             var fb = await fetch(window.AMVERA_HOST + endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bodyData)
             });
             if(fb.ok) return await fb.json();
           } catch(e) {}
        }
        throw err;
      }
    }
`;

// ----------------------------------------------------
// 18_LESSON3.HTML
// ----------------------------------------------------
function buildLesson3() {
  const file = '18_lesson3.html';
  const html = `${standardHead.replace(/<title>.*?<\/title>/i, '<title>Урок 3: Как остановить мысленную жвачку и выключить суд в голове — Анатолий Фёдоров</title>')}
<body>
  <div id="maisonArtBackground"></div>
  <div id="loading-screen" class="loader-screen">
    <div class="loader-spinner mb-4"></div>
    <span class="text-sm tracking-widest text-nb-accent uppercase font-bold animate-pulse">Загрузка...</span>
  </div>

  <main class="app-shell">
    <div class="app">

      <!-- Navigation Header (Урок 3 из 5) -->
      <header class="header-bar-nav">
        <div class="header-actions-row">
          <button type="button" onclick="openNavDrawer();" class="nav-glass-tinted-btn">
            <span>🧭</span>
            <span>Навигация по курсу</span>
          </button>
          <button type="button" onclick="safeHaptic('selection'); openScreen('19_lesson4.html');" class="next-lesson-btn">
            <span>Следующий урок →</span>
          </button>
        </div>

        <div class="header-progress-row">
          <span class="lesson-badge-sub">Урок 3 из 5</span>
          <span class="progress-percent-sub">60% пройдено</span>
        </div>

        <div class="progress-track" style="width:100%; height:5px; background:rgba(36,49,57,0.08); border-radius:999px; overflow:hidden;">
          <div style="width:60%; height:100%; background:linear-gradient(90deg, #C4734F, #45656D); border-radius:999px;"></div>
        </div>
      </header>

      <!-- SCREEN 1: VIDEO & INSIGHT -->
      <div id="step1VideoScreen" style="display:flex; flex-direction:column; gap:14px;">

        <section class="glass card text-center">
          <div class="eyebrow" style="margin-bottom:8px;">Урок 3 из 5</div>
          <h2 style="font-size:18px; font-weight:800; color:var(--nb-deep); line-height:1.3; margin-bottom:6px; text-align:center;">Как остановить мысленную жвачку и выключить суд в голове</h2>
          <p class="lead" style="font-size:13px; line-height:1.4; color:var(--nb-text-2); margin-bottom:12px; text-align:center;">Почему мы спорим с призраками в голове и как вернуть покой телу.</p>

          <div style="position:relative; width:100%; aspect-ratio:16/9; border-radius:18px; overflow:hidden; background:#000; box-shadow:0 12px 30px rgba(0,0,0,0.12);">
            <iframe id="kinescopeVideo" src="https://kinescope.io/embed/qYx9t8Hu9S4rEquGxYBMyP?max_quality=720"
              allow="autoplay; fullscreen; picture-in-picture; encrypted-media; gyroscope; accelerometer; clipboard-write; screen-wake-lock;"
              frameborder="0" allowfullscreen
              style="position:absolute; width:100%; height:100%; top:0; left:0;"></iframe>
          </div>
        </section>

        <section id="insightSection" class="glass card text-center">
          <div class="eyebrow" style="background:rgba(47,125,89,0.1); color:var(--success); border-color:rgba(47,125,89,0.2); margin-bottom:8px;">
            💡 Главный вывод
          </div>
          <h3 style="font-size:16px; font-weight:800; margin-bottom:8px; text-align:center;">Что важно забрать из урока</h3>
          <p class="lead" style="font-size:13px; line-height:1.5; color:var(--nb-text); margin-bottom:16px; text-align:center;">
            Мысли перестают крутиться в голове только тогда, когда они выгружены наружу. Выгрузите накрутку в тренажёр и закрепите состояние медитацией «Штиль после шторма».
          </p>

          <div style="display:flex; flex-direction:column; gap:10px;">
            <button onclick="goToPractice()" class="primary-btn pulse" style="width:100%; min-height:46px;">
              <span>Перейти к практикуму ➔</span>
            </button>
          </div>
        </section>

        <div style="padding-top:4px;">
          <button onclick="safeHaptic('selection'); openScreen('19_lesson4.html');" class="primary-btn pulse"
            style="width:100%; display:flex; justify-content:center; align-items:center; min-height:48px;">
            <span>Перейти к уроку 4 →</span>
          </button>
        </div>

      </div>

      <!-- SCREEN 2: INTERACTIVE PRACTICE -->
      <div id="step2InteractiveScreen" style="display:none; flex-direction:column; gap:14px;">

        <div>
          <button onclick="goToVideo()" class="top-nav-btn" style="display:inline-flex; align-items:center; gap:6px; font-weight:700; font-size:13px; color:var(--nb-deep); background:rgba(255,255,255,0.75); backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px); padding:6px 14px; border-radius:9999px; border:1px solid rgba(255,255,255,0.85); box-shadow:0 2px 8px rgba(0,0,0,0.04); text-decoration:none; cursor:pointer;">
            ← Назад к видеоуроку
          </button>
        </div>

        <div class="glass card text-center" style="padding: 16px 18px;">
          <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; gap:6px; margin-bottom:8px;">
            <div class="eyebrow" style="margin:0; background:rgba(217, 131, 78, 0.12); color:#A85532; border-color:rgba(217, 131, 78, 0.25);">
              ☀️ Выгрузка мысленной жвачки
            </div>
            <div class="strategy-badge" style="margin:0 auto; font-size:11.5px; font-weight:800; background:rgba(36,49,57,0.06); color:var(--nb-deep); padding:2px 10px; border-radius:999px;">
              Осталось попыток:&nbsp;<span id="attemptsCount" style="color:#A85532; font-weight:900;">3</span>
            </div>
          </div>
          <p style="font-size:12.5px; line-height:1.4; color:var(--nb-text-2); margin:0; text-align:center;">
            Выпишите всё, не стесняясь в выражениях, чтобы остановить инерцию мыслей.
          </p>
        </div>

        <!-- STEP 1 -->
        <div id="step1" class="glass card" style="display:flex; flex-direction:column; gap:12px;">
          <h3 style="font-size:16px; font-weight:800; text-align:center; margin:0;">Шаг 1. Опишите ситуацию откровенно</h3>
          <p style="font-size:13px; color:var(--nb-text-2); text-align:center; margin:0;">Пишите всё как есть: что он сказал, что сделал, почему это бесит и не выходит из головы.</p>
          <textarea id="situationInput" rows="4" style="width:100%; border-radius:12px; padding:10px 12px; font-size:13px; border:1px solid rgba(36,49,57,0.15); background:#FFF; resize:vertical; font-family:inherit; line-height:1.4;" placeholder="Пишите без цензуры всё, что крутится в голове..."></textarea>
          <button onclick="handleStep1()" class="primary-btn" style="width:100%; min-height:44px;">Далее</button>
        </div>

        <!-- STEP 2 -->
        <div id="step2" class="glass card" style="display:none; flex-direction:column; gap:12px;">
          <h3 style="font-size:16px; font-weight:800; text-align:center; margin:0;">Шаг 2. Где была нарушена справедливость?</h3>
          <p style="font-size:13px; color:var(--nb-text-2); text-align:center; margin:0;">Выделите боль: что именно вы испытывали в моменте? Почему кажется, что с вами поступили несправедливо?</p>
          <textarea id="painInput" rows="3" style="width:100%; border-radius:12px; padding:10px 12px; font-size:13px; border:1px solid rgba(36,49,57,0.15); background:#FFF; resize:vertical; font-family:inherit; line-height:1.4;" placeholder="Например: я вложила всю душу, а он обесценил это одной фразой..."></textarea>
          <button onclick="handleStep2()" class="primary-btn" style="width:100%; min-height:44px;">Далее</button>
        </div>

        <!-- STEP 3 -->
        <div id="step3" class="glass card" style="display:none; flex-direction:column; gap:12px; position:relative;">
          <h3 style="font-size:16px; font-weight:800; text-align:center; margin:0;">Шаг 3. Где в теле вы чувствуете напряжение?</h3>
          <p style="font-size:13px; color:var(--nb-text-2); text-align:center; margin:0;">Отметьте телесные сигналы, которые включились:</p>
          
          <div style="display:flex; flex-direction:column; gap:8px; margin:4px 0;">
            <label style="display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:12px; background:rgba(255,255,255,0.6); border:1px solid rgba(36,49,57,0.1); cursor:pointer;">
              <input type="checkbox" name="bodySignals" value="throat" style="accent-color:var(--nb-sea); width:18px; height:18px;">
              <span style="font-size:13px; font-weight:600; color:var(--nb-deep);">🗣 Горло (ком, невысказанные слова)</span>
            </label>
            <label style="display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:12px; background:rgba(255,255,255,0.6); border:1px solid rgba(36,49,57,0.1); cursor:pointer;">
              <input type="checkbox" name="bodySignals" value="chest" style="accent-color:var(--nb-sea); width:18px; height:18px;">
              <span style="font-size:13px; font-weight:600; color:var(--nb-deep);">🫀 Грудь / Солнечное сплетение (тяжесть, сжатие)</span>
            </label>
            <label style="display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:12px; background:rgba(255,255,255,0.6); border:1px solid rgba(36,49,57,0.1); cursor:pointer;">
              <input type="checkbox" name="bodySignals" value="jaw" style="accent-color:var(--nb-sea); width:18px; height:18px;">
              <span style="font-size:13px; font-weight:600; color:var(--nb-deep);">😬 Сжатые челюсти и зубы</span>
            </label>
            <label style="display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:12px; background:rgba(255,255,255,0.6); border:1px solid rgba(36,49,57,0.1); cursor:pointer;">
              <input type="checkbox" name="bodySignals" value="shoulders" style="accent-color:var(--nb-sea); width:18px; height:18px;">
              <span style="font-size:13px; font-weight:600; color:var(--nb-deep);">💆‍♀️ Плечи и шея (каменные, приподнятые)</span>
            </label>
            <label style="display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:12px; background:rgba(255,255,255,0.6); border:1px solid rgba(36,49,57,0.1); cursor:pointer;">
              <input type="checkbox" name="bodySignals" value="stomach" style="accent-color:var(--nb-sea); width:18px; height:18px;">
              <span style="font-size:13px; font-weight:600; color:var(--nb-deep);">🕳 Живот (спазм, холод)</span>
            </label>
          </div>
          
          <button id="submitBtn" onclick="submitToAI()" class="primary-btn pulse" style="width:100%; min-height:46px;">
            <span>Выгрузить жвачку и получить формулу стабилизации ➔</span>
          </button>
          
          <div id="aiLoading" style="display:none; position:absolute; inset:0; background:rgba(255,255,255,0.88); backdrop-filter:blur(6px); border-radius:24px; flex-direction:column; align-items:center; justify-content:center; z-index:20;">
            <div class="loader-spinner" style="margin-bottom:8px;"></div>
            <p style="font-size:13px; font-weight:700; color:var(--nb-accent); margin:0;">Останавливаю внутренний суд...</p>
          </div>
        </div>

        <!-- RESULTS CARD & MEDITATION -->
        <div id="resultCard" class="glass card" style="display:none; flex-direction:column; gap:14px;">
          <h3 style="font-size:18px; font-weight:800; text-align:center; margin:0;">Формула стабилизации</h3>
          
          <div style="background:rgba(127,155,142,0.1); border-radius:14px; padding:14px; border:1px solid rgba(127,155,142,0.3);">
            <div style="font-size:11px; color:var(--nb-accent); font-weight:800; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:4px; text-align:center;">🧘‍♀️ Ваша стабилизирующая формула</div>
            <p id="resFormula" style="font-size:14px; font-weight:700; color:var(--nb-deep); text-align:center; line-height:1.5; margin:0;">
              «Да, у меня сейчас инерция мышления. Я живой человек, меня задело. Но споря в голове, я сжигаю свои силы. Прямо сейчас мне ничего не угрожает. Я выбираю свой покой.»
            </p>
          </div>

          <!-- Meditation Player -->
          <div style="background:rgba(255,255,255,0.6); border-radius:14px; padding:14px; border:1px solid rgba(36,49,57,0.08); text-align:center;">
            <div class="eyebrow" style="background:rgba(47,125,89,0.1); color:var(--success); border-color:rgba(47,125,89,0.2); margin-bottom:6px;">
              🎧 Медитация заземления
            </div>
            <h4 style="font-size:15px; font-weight:800; margin:0 0 4px 0; color:var(--nb-deep);">«Штиль после шторма» (10–15 минут)</h4>
            <p style="font-size:12px; color:var(--nb-text-2); margin:0 0 10px 0;">Наденьте наушники, закройте глаза и позвольте телу выдохнуть накопившееся напряжение.</p>
            
            <audio id="meditationAudio" controls preload="metadata" style="width:100%; accent-color:var(--nb-accent);">
              <source src="https://inter01-anatolyfedorov.amvera.io/data/meditation1-3.MP3" type="audio/mpeg">
              Ваш браузер не поддерживает аудио.
            </audio>
          </div>

          <div style="background:rgba(200,178,143,0.12); padding:10px 12px; border-radius:10px; text-align:center;">
            <p style="font-size:12px; font-weight:600; color:var(--nb-deep); margin:0;">Результат сохранен в Блок №3 «Карты опоры»</p>
          </div>
          
          <div style="text-align:center;">
            <p style="font-size:13px; color:var(--nb-text-2); line-height:1.5; margin:0;">Вы выгрузили мысленную жвачку и дали телу выдохнуть. Но что на самом деле раскачивает ваши эмоции изнутри и бросает из ярости в чувство вины? Как встретиться со своими настоящими чувствами — разберём в Уроке 4.</p>
          </div>

          <button onclick="handleCta(event)" class="primary-btn pulse" style="width:100%; min-height:48px; text-align:center;">
            <span>Перейти к Уроку 4: Встреча с собой и Мудрой Я →</span>
          </button>
        </div>

      </div>
      
      <div class="pb-12"></div>
    </div>
  </main>

  <script>
${commonJsHelpers}

    function handleCta(e) {
      if(e && e.preventDefault) e.preventDefault();
      safeHaptic('success');
      var CTA_ID = '3xxTBsJJZGpXnJBURlJWLo';
      var CTA_FALLBACK = '19_lesson4.html';
      
      if(typeof openScreen === 'function') {
         openScreen(CTA_FALLBACK);
      } else {
        if (window.notibot) {
          try { window.notibot.openArticle(CTA_ID); } 
          catch(err) { window.location.href = CTA_FALLBACK; }
        } else {
          window.location.href = CTA_FALLBACK;
        }
      }
    }

    function goToVideo() {
      safeHaptic('selection');
      var s2 = document.getElementById('step2InteractiveScreen');
      if (s2) s2.style.display = 'none';
      var s1 = document.getElementById('step1VideoScreen');
      if (s1) s1.style.display = 'flex';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function goToPractice() {
      safeHaptic('selection');
      pauseVideo();
      var s1 = document.getElementById('step1VideoScreen');
      if (s1) s1.style.display = 'none';
      var s2 = document.getElementById('step2InteractiveScreen');
      if (s2) s2.style.display = 'flex';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function handleStep1() {
      var v = document.getElementById('situationInput').value.trim();
      if(!v) {
        safeHaptic('error');
        alert('Пожалуйста, опишите ситуацию.');
        return;
      }
      safeHaptic('selection');
      document.getElementById('step1').style.display = 'none';
      document.getElementById('step2').style.display = 'flex';
    }

    function handleStep2() {
      var p = document.getElementById('painInput').value.trim();
      if(!p) {
        safeHaptic('error');
        alert('Пожалуйста, выделите боль и нарушение справедливости.');
        return;
      }
      safeHaptic('selection');
      document.getElementById('step2').style.display = 'none';
      document.getElementById('step3').style.display = 'flex';
    }

    var attempts = 3;
    var ATTEMPTS_KEY = 's2_lesson3_attempts';
    var savedAttempts = localStorage.getItem(ATTEMPTS_KEY);
    if(savedAttempts !== null) {
      attempts = parseInt(savedAttempts, 10);
    }
    
    function updateAttemptsDisplay() {
      var el = document.getElementById('attemptsCount');
      if(el) el.textContent = attempts;
      if(attempts <= 0) {
        var btn = document.getElementById('submitBtn');
        if(btn) {
          btn.disabled = true;
          btn.style.opacity = '0.5';
          btn.querySelector('span').textContent = 'Попытки закончились';
        }
      }
    }
    updateAttemptsDisplay();

    async function submitToAI() {
      if(attempts <= 0) {
        safeHaptic('error');
        return;
      }
      
      var situation = document.getElementById('situationInput').value.trim();
      var pain = document.getElementById('painInput').value.trim();
      var bodyNodes = document.querySelectorAll('input[name="bodySignals"]:checked');
      var bodySignals = Array.from(bodyNodes).map(n => n.value);

      safeHaptic('medium');
      var elLoading = document.getElementById('aiLoading');
      if (elLoading) elLoading.style.display = 'flex';
      
      try {
        var payload = {
           situation: situation,
           pain: pain,
           bodySignals: bodySignals
        };
        
        var apiFunc = (typeof apiPost === 'function') ? apiPost : apiPostLocal;
        var data = await apiFunc('/api/s2-lesson3-strategy', payload);
        
        if(!data || !data.formula) {
           throw new Error("Invalid API response");
        }
        renderResults(data);
        
      } catch(err) {
        console.error(err);
        setTimeout(function() {
          renderResults({
            formula: "«Да, у меня сейчас инерция мышления. Я живой человек, меня задело. Но споря в голове, я сжигаю свои силы. Прямо сейчас мне ничего не угрожает. Я выбираю свой покой.»"
          });
        }, 1500);
      }
    }
    
    function renderResults(data) {
        var elLoading = document.getElementById('aiLoading');
        if (elLoading) elLoading.style.display = 'none';
        
        safeHaptic('success');
        
        attempts--;
        localStorage.setItem(ATTEMPTS_KEY, attempts.toString());
        updateAttemptsDisplay();
        
        localStorage.setItem('s2_lesson3_block', JSON.stringify(data));
        localStorage.setItem('s2_lesson3_completed', 'true');
        
        if (data.formula) document.getElementById('resFormula').textContent = data.formula;
        
        document.getElementById('step3').style.display = 'none';
        var resCard = document.getElementById('resultCard');
        if (resCard) {
          resCard.style.display = 'flex';
          resCard.scrollIntoView({ behavior: 'smooth' });
        }
    }
  </script>

${getDrawerHtml(file)}

</body>
</html>`;

  fs.writeFileSync(path.join(__dirname, '../out/client', file), html, 'utf8');
  console.log(`✅ Built ${file}`);
}

// ----------------------------------------------------
// 19_LESSON4.HTML
// ----------------------------------------------------
function buildLesson4() {
  const file = '19_lesson4.html';
  const html = `${standardHead.replace(/<title>.*?<\/title>/i, '<title>Урок 4: Встреча с собой: что на самом деле раскачивает ваши эмоции — Анатолий Фёдоров</title>')}
<body>
  <div id="maisonArtBackground"></div>
  <div id="loading-screen" class="loader-screen">
    <div class="loader-spinner mb-4"></div>
    <span class="text-sm tracking-widest text-nb-accent uppercase font-bold animate-pulse">Загрузка...</span>
  </div>

  <main class="app-shell">
    <div class="app">

      <!-- Navigation Header (Урок 4 из 5) -->
      <header class="header-bar-nav">
        <div class="header-actions-row">
          <button type="button" onclick="openNavDrawer();" class="nav-glass-tinted-btn">
            <span>🧭</span>
            <span>Навигация по курсу</span>
          </button>
          <button type="button" onclick="safeHaptic('selection'); openScreen('20_lesson5.html');" class="next-lesson-btn">
            <span>Следующий урок →</span>
          </button>
        </div>

        <div class="header-progress-row">
          <span class="lesson-badge-sub">Урок 4 из 5</span>
          <span class="progress-percent-sub">80% пройдено</span>
        </div>

        <div class="progress-track" style="width:100%; height:5px; background:rgba(36,49,57,0.08); border-radius:999px; overflow:hidden;">
          <div style="width:80%; height:100%; background:linear-gradient(90deg, #C4734F, #45656D); border-radius:999px;"></div>
        </div>
      </header>

      <!-- SCREEN 1: VIDEO & INSIGHT -->
      <div id="step1VideoScreen" style="display:flex; flex-direction:column; gap:14px;">

        <section class="glass card text-center">
          <div class="eyebrow" style="margin-bottom:8px;">Урок 4 из 5</div>
          <h2 style="font-size:18px; font-weight:800; color:var(--nb-deep); line-height:1.3; margin-bottom:6px; text-align:center;">Встреча с собой: что на самом деле раскачивает ваши эмоции</h2>
          <p class="lead" style="font-size:13px; line-height:1.4; color:var(--nb-text-2); margin-bottom:12px; text-align:center;">Как остановить маятник между контролем и виной и найти точку внутренней опоры.</p>

          <div style="position:relative; width:100%; aspect-ratio:16/9; border-radius:18px; overflow:hidden; background:#000; box-shadow:0 12px 30px rgba(0,0,0,0.12);">
            <iframe id="kinescopeVideo" src="https://kinescope.io/embed/pQYPKCqxT8pw5kedQJ8CaR?max_quality=720"
              allow="autoplay; fullscreen; picture-in-picture; encrypted-media; gyroscope; accelerometer; clipboard-write; screen-wake-lock;"
              frameborder="0" allowfullscreen
              style="position:absolute; width:100%; height:100%; top:0; left:0;"></iframe>
          </div>
        </section>

        <section id="insightSection" class="glass card text-center">
          <div class="eyebrow" style="background:rgba(47,125,89,0.1); color:var(--success); border-color:rgba(47,125,89,0.2); margin-bottom:8px;">
            💡 Главный вывод
          </div>
          <h3 style="font-size:16px; font-weight:800; margin-bottom:8px; text-align:center;">Что важно забрать из урока</h3>
          <p class="lead" style="font-size:13px; line-height:1.5; color:var(--nb-text); margin-bottom:16px; text-align:center;">
            За каждым вашим тяжелым состоянием прячется сильное и здоровое убеждение. Обопритесь на него и примите слова поддержки от Мудрой Себя.
          </p>

          <div style="display:flex; flex-direction:column; gap:10px;">
            <button onclick="goToPractice()" class="primary-btn pulse" style="width:100%; min-height:46px;">
              <span>Перейти к практикуму ➔</span>
            </button>
          </div>
        </section>

        <div style="padding-top:4px;">
          <button onclick="safeHaptic('selection'); openScreen('20_lesson5.html');" class="primary-btn pulse"
            style="width:100%; display:flex; justify-content:center; align-items:center; min-height:48px;">
            <span>Перейти к уроку 5 →</span>
          </button>
        </div>

      </div>

      <!-- SCREEN 2: INTERACTIVE PRACTICE -->
      <div id="step2InteractiveScreen" style="display:none; flex-direction:column; gap:14px;">

        <div>
          <button onclick="goToVideo()" class="top-nav-btn" style="display:inline-flex; align-items:center; gap:6px; font-weight:700; font-size:13px; color:var(--nb-deep); background:rgba(255,255,255,0.75); backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px); padding:6px 14px; border-radius:9999px; border:1px solid rgba(255,255,255,0.85); box-shadow:0 2px 8px rgba(0,0,0,0.04); text-decoration:none; cursor:pointer;">
            ← Назад к видеоуроку
          </button>
        </div>

        <div class="glass card text-center" style="padding: 16px 18px;">
          <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; gap:6px; margin-bottom:8px;">
            <div class="eyebrow" style="margin:0; background:rgba(217, 131, 78, 0.12); color:#A85532; border-color:rgba(217, 131, 78, 0.25);">
              ☀️ Встреча с Мудрой Собой
            </div>
            <div class="strategy-badge" style="margin:0 auto; font-size:11.5px; font-weight:800; background:rgba(36,49,57,0.06); color:var(--nb-deep); padding:2px 10px; border-radius:999px;">
              Осталось попыток:&nbsp;<span id="attemptsCount" style="color:#A85532; font-weight:900;">3</span>
            </div>
          </div>
          <p style="font-size:12.5px; line-height:1.4; color:var(--nb-text-2); margin:0; text-align:center;">
            Соединитесь со своей настоящей внутренней устойчивостью и заберите слова напутствия.
          </p>
        </div>

        <!-- STEP 1 -->
        <div id="step1" class="glass card" style="display:flex; flex-direction:column; gap:12px;">
          <h3 style="font-size:16px; font-weight:800; text-align:center; margin:0;">Шаг 1. Какое состояние вы чаще всего подавляете?</h3>
          <div style="display:flex; flex-direction:column; gap:8px;">
            <label style="display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:12px; background:rgba(255,255,255,0.6); border:1px solid rgba(36,49,57,0.1); cursor:pointer;">
              <input type="checkbox" name="stateSuppress" value="needless" style="accent-color:var(--nb-sea); width:18px; height:18px;">
              <span style="font-size:13px; font-weight:600; color:var(--nb-deep);">💔 Страх ненужности (заслуживаю любовь опекой)</span>
            </label>
            <label style="display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:12px; background:rgba(255,255,255,0.6); border:1px solid rgba(36,49,57,0.1); cursor:pointer;">
              <input type="checkbox" name="stateSuppress" value="anxiety_pause" style="accent-color:var(--nb-sea); width:18px; height:18px;">
              <span style="font-size:13px; font-weight:600; color:var(--nb-deep);">⏳ Тревога от пауз и молчания (не выдерживаю неизвестность)</span>
            </label>
            <label style="display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:12px; background:rgba(255,255,255,0.6); border:1px solid rgba(36,49,57,0.1); cursor:pointer;">
              <input type="checkbox" name="stateSuppress" value="shame" style="accent-color:var(--nb-sea); width:18px; height:18px;">
              <span style="font-size:13px; font-weight:600; color:var(--nb-deep);">🕳 Самоедство и стыд («со мной тяжело, я всё порчу»)</span>
            </label>
            <label style="display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:12px; background:rgba(255,255,255,0.6); border:1px solid rgba(36,49,57,0.1); cursor:pointer;">
              <input type="checkbox" name="stateSuppress" value="tiredness" style="accent-color:var(--nb-sea); width:18px; height:18px;">
              <span style="font-size:13px; font-weight:600; color:var(--nb-deep);">🪫 Глубокая усталость (хочу перестать всё тащить)</span>
            </label>
          </div>
          <button onclick="handleStep1()" class="primary-btn" style="width:100%; min-height:44px;">Далее</button>
        </div>

        <!-- STEP 2 -->
        <div id="step2" class="glass card" style="display:none; flex-direction:column; gap:12px;">
          <h3 style="font-size:16px; font-weight:800; text-align:center; margin:0;">Шаг 2. Здоровые убеждения, которые за этим стоят</h3>
          <div style="display:flex; flex-direction:column; gap:8px;">
            <label style="display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:12px; background:rgba(255,255,255,0.6); border:1px solid rgba(36,49,57,0.1); cursor:pointer;">
              <input type="checkbox" name="healthyBeliefs" value="valuable" style="accent-color:var(--nb-accent); width:18px; height:18px;">
              <span style="font-size:12.5px; font-weight:600; color:var(--nb-deep);">💎 «Моя ценность существует сама по себе. Я достойна любви просто так»</span>
            </label>
            <label style="display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:12px; background:rgba(255,255,255,0.6); border:1px solid rgba(36,49,57,0.1); cursor:pointer;">
              <input type="checkbox" name="healthyBeliefs" value="clarity" style="accent-color:var(--nb-accent); width:18px; height:18px;">
              <span style="font-size:12.5px; font-weight:600; color:var(--nb-deep);">💎 «Я имею полное право на ясность и открытый диалог»</span>
            </label>
            <label style="display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:12px; background:rgba(255,255,255,0.6); border:1px solid rgba(36,49,57,0.1); cursor:pointer;">
              <input type="checkbox" name="healthyBeliefs" value="emotions_norm" style="accent-color:var(--nb-accent); width:18px; height:18px;">
              <span style="font-size:12.5px; font-weight:600; color:var(--nb-deep);">💎 «Мои чувства — это норма. Со мной всё в порядке»</span>
            </label>
            <label style="display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:12px; background:rgba(255,255,255,0.6); border:1px solid rgba(36,49,57,0.1); cursor:pointer;">
              <input type="checkbox" name="healthyBeliefs" value="shared_resp" style="accent-color:var(--nb-accent); width:18px; height:18px;">
              <span style="font-size:12.5px; font-weight:600; color:var(--nb-deep);">💎 «Ответственность делится на двоих, я имею право на отдых и опору»</span>
            </label>
          </div>
          <button onclick="handleStep2()" class="primary-btn" style="width:100%; min-height:44px;">Далее</button>
        </div>

        <!-- STEP 3 -->
        <div id="step3" class="glass card" style="display:none; flex-direction:column; gap:12px; position:relative;">
          <h3 style="font-size:16px; font-weight:800; text-align:center; margin:0;">Шаг 3. Жизнь с реализованной потребностью</h3>
          <p style="font-size:13px; color:var(--nb-text-2); text-align:center; margin:0;">Если бы эта ваша потребность была полностью реализована — как бы вы себя чувствовали? Как бы изменились ваши отношения?</p>
          <textarea id="visionInput" rows="4" style="width:100%; border-radius:12px; padding:10px 12px; font-size:13px; border:1px solid rgba(36,49,57,0.15); background:#FFF; resize:vertical; font-family:inherit; line-height:1.4;" placeholder="Опишите ваше состояние свободы, лёгкости и уверенности..."></textarea>
          
          <button id="submitBtn" onclick="submitToAI()" class="primary-btn pulse" style="width:100%; min-height:46px;">
            <span>Получить напутствие от Мудрой Себя ➔</span>
          </button>
          
          <div id="aiLoading" style="display:none; position:absolute; inset:0; background:rgba(255,255,255,0.88); backdrop-filter:blur(6px); border-radius:24px; flex-direction:column; align-items:center; justify-content:center; z-index:20;">
            <div class="loader-spinner" style="margin-bottom:8px;"></div>
            <p style="font-size:13px; font-weight:700; color:var(--nb-accent); margin:0;">Соединяю с Мудрой Собой...</p>
          </div>
        </div>

        <!-- RESULTS CARD -->
        <div id="resultCard" class="glass card" style="display:none; flex-direction:column; gap:14px;">
          <h3 style="font-size:18px; font-weight:800; text-align:center; margin:0;">Послание от Мудрой Себя</h3>
          
          <div style="background:rgba(127,155,142,0.12); border-radius:14px; padding:16px; border:1px solid rgba(127,155,142,0.3);">
            <div style="font-size:11px; color:var(--nb-accent); font-weight:800; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:6px; text-align:center;">✨ Напутствие на будущее</div>
            <p id="resWiseMessage" style="font-size:13.5px; line-height:1.6; color:var(--nb-deep); font-weight:600; margin:0;">
              «Милая, перестань заслуживать любовь контролем и тревогами. Ты уже ценна и любима. Позволь себе опереться на мужчин, позволь себе выдохнуть. Всё, что тебе нужно — уже внутри тебя.»
            </p>
          </div>

          <div style="background:rgba(200,178,143,0.12); padding:10px 12px; border-radius:10px; text-align:center;">
            <p style="font-size:12px; font-weight:600; color:var(--nb-deep); margin:0;">Результат сохранен в Блок №4 «Карты опоры»</p>
          </div>
          
          <div style="text-align:center;">
            <p style="font-size:13px; color:var(--nb-text-2); line-height:1.5; margin:0;">Вы нашли свои сильные убеждения и соединились с поддержкой Мудрой Себя. Теперь пришло время собрать все 4 шага в вашу персональную «Карту опоры» в финальном уроке.</p>
          </div>

          <button onclick="handleCta(event)" class="primary-btn pulse" style="width:100%; min-height:48px; text-align:center;">
            <span>Перейти к Уроку 5: Сборка Карты опоры →</span>
          </button>
        </div>

      </div>
      
      <div class="pb-12"></div>
    </div>
  </main>

  <script>
${commonJsHelpers}

    function handleCta(e) {
      if(e && e.preventDefault) e.preventDefault();
      safeHaptic('success');
      var CTA_ID = '3EUOYisS5lzwNG4LSB9Ttw';
      var CTA_FALLBACK = '20_lesson5.html';
      
      if(typeof openScreen === 'function') {
         openScreen(CTA_FALLBACK);
      } else {
        if (window.notibot) {
          try { window.notibot.openArticle(CTA_ID); } 
          catch(err) { window.location.href = CTA_FALLBACK; }
        } else {
          window.location.href = CTA_FALLBACK;
        }
      }
    }

    function goToVideo() {
      safeHaptic('selection');
      var s2 = document.getElementById('step2InteractiveScreen');
      if (s2) s2.style.display = 'none';
      var s1 = document.getElementById('step1VideoScreen');
      if (s1) s1.style.display = 'flex';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function goToPractice() {
      safeHaptic('selection');
      pauseVideo();
      var s1 = document.getElementById('step1VideoScreen');
      if (s1) s1.style.display = 'none';
      var s2 = document.getElementById('step2InteractiveScreen');
      if (s2) s2.style.display = 'flex';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function handleStep1() {
      safeHaptic('selection');
      document.getElementById('step1').style.display = 'none';
      document.getElementById('step2').style.display = 'flex';
    }

    function handleStep2() {
      safeHaptic('selection');
      document.getElementById('step2').style.display = 'none';
      document.getElementById('step3').style.display = 'flex';
    }

    var attempts = 3;
    var ATTEMPTS_KEY = 's2_lesson4_attempts';
    var savedAttempts = localStorage.getItem(ATTEMPTS_KEY);
    if(savedAttempts !== null) {
      attempts = parseInt(savedAttempts, 10);
    }
    
    function updateAttemptsDisplay() {
      var el = document.getElementById('attemptsCount');
      if(el) el.textContent = attempts;
      if(attempts <= 0) {
        var btn = document.getElementById('submitBtn');
        if(btn) {
          btn.disabled = true;
          btn.style.opacity = '0.5';
          btn.querySelector('span').textContent = 'Попытки закончились';
        }
      }
    }
    updateAttemptsDisplay();

    async function submitToAI() {
      if(attempts <= 0) {
        safeHaptic('error');
        return;
      }
      
      var vision = document.getElementById('visionInput').value.trim();
      var states = Array.from(document.querySelectorAll('input[name="stateSuppress"]:checked')).map(n => n.value);
      var beliefs = Array.from(document.querySelectorAll('input[name="healthyBeliefs"]:checked')).map(n => n.value);

      safeHaptic('medium');
      var elLoading = document.getElementById('aiLoading');
      if (elLoading) elLoading.style.display = 'flex';
      
      try {
        var payload = {
           states: states,
           beliefs: beliefs,
           vision: vision
        };
        
        var apiFunc = (typeof apiPost === 'function') ? apiPost : apiPostLocal;
        var data = await apiFunc('/api/s2-lesson4-strategy', payload);
        
        if(!data || !data.message) {
           throw new Error("Invalid API response");
        }
        renderResults(data);
        
      } catch(err) {
        console.error(err);
        setTimeout(function() {
          renderResults({
            message: "«Милая, перестань заслуживать любовь контролем и тревогами. Ты уже ценна и любима. Позволь себе опереться на мужчин, позволь себе выдохнуть. Всё, что тебе нужно — уже внутри тебя.»"
          });
        }, 1500);
      }
    }
    
    function renderResults(data) {
        var elLoading = document.getElementById('aiLoading');
        if (elLoading) elLoading.style.display = 'none';
        
        safeHaptic('success');
        
        attempts--;
        localStorage.setItem(ATTEMPTS_KEY, attempts.toString());
        updateAttemptsDisplay();
        
        localStorage.setItem('s2_lesson4_block', JSON.stringify(data));
        localStorage.setItem('s2_lesson4_completed', 'true');
        
        if (data.message) document.getElementById('resWiseMessage').textContent = data.message;
        
        document.getElementById('step3').style.display = 'none';
        var resCard = document.getElementById('resultCard');
        if (resCard) {
          resCard.style.display = 'flex';
          resCard.scrollIntoView({ behavior: 'smooth' });
        }
    }
  </script>

${getDrawerHtml(file)}

</body>
</html>`;

  fs.writeFileSync(path.join(__dirname, '../out/client', file), html, 'utf8');
  console.log(`✅ Built ${file}`);
}

// ----------------------------------------------------
// 20_LESSON5.HTML
// ----------------------------------------------------
function buildLesson5() {
  const file = '20_lesson5.html';
  const html = `${standardHead.replace(/<title>.*?<\/title>/i, '<title>Урок 5: Сборка нового сценария: Карта опоры — Анатолий Фёдоров</title>')}
<body>
  <div id="maisonArtBackground"></div>
  <div id="loading-screen" class="loader-screen">
    <div class="loader-spinner mb-4"></div>
    <span class="text-sm tracking-widest text-nb-accent uppercase font-bold animate-pulse">Загрузка...</span>
  </div>

  <main class="app-shell">
    <div class="app">

      <!-- Navigation Header (Урок 5 из 5) -->
      <header class="header-bar-nav">
        <div class="header-actions-row">
          <button type="button" onclick="openNavDrawer();" class="nav-glass-tinted-btn">
            <span>🧭</span>
            <span>Навигация по курсу</span>
          </button>
          <button type="button" onclick="safeHaptic('selection'); openScreen('21_bonuses.html');" class="next-lesson-btn">
            <span>Бонусы курса 🎁 →</span>
          </button>
        </div>

        <div class="header-progress-row">
          <span class="lesson-badge-sub">Урок 5 из 5</span>
          <span class="progress-percent-sub">100% пройдено</span>
        </div>

        <div class="progress-track" style="width:100%; height:5px; background:rgba(36,49,57,0.08); border-radius:999px; overflow:hidden;">
          <div style="width:100%; height:100%; background:linear-gradient(90deg, #C4734F, #2F7D59); border-radius:999px;"></div>
        </div>
      </header>

      <!-- SCREEN 1: VIDEO & INSIGHT -->
      <div id="step1VideoScreen" style="display:flex; flex-direction:column; gap:14px;">

        <section class="glass card text-center">
          <div class="eyebrow" style="margin-bottom:8px;">Финал курса • Урок 5 из 5</div>
          <h2 style="font-size:18px; font-weight:800; color:var(--nb-deep); line-height:1.3; margin-bottom:6px; text-align:center;">Сборка нового сценария: Карта опоры</h2>
          <p class="lead" style="font-size:13px; line-height:1.4; color:var(--nb-text-2); margin-bottom:12px; text-align:center;">Ваш пошаговый компас устойчивости в отношениях и финальная медитация.</p>

          <div style="position:relative; width:100%; aspect-ratio:16/9; border-radius:18px; overflow:hidden; background:#000; box-shadow:0 12px 30px rgba(0,0,0,0.12);">
            <iframe id="kinescopeVideo" src="https://kinescope.io/embed/xhqTTBCRmLZA8P3KWEXtG4?max_quality=720"
              allow="autoplay; fullscreen; picture-in-picture; encrypted-media; gyroscope; accelerometer; clipboard-write; screen-wake-lock;"
              frameborder="0" allowfullscreen
              style="position:absolute; width:100%; height:100%; top:0; left:0;"></iframe>
          </div>
        </section>

        <section id="insightSection" class="glass card text-center">
          <div class="eyebrow" style="background:rgba(47,125,89,0.1); color:var(--success); border-color:rgba(47,125,89,0.2); margin-bottom:8px;">
            💡 Главный вывод
          </div>
          <h3 style="font-size:16px; font-weight:800; margin-bottom:8px; text-align:center;">Что важно забрать из урока</h3>
          <p class="lead" style="font-size:13px; line-height:1.5; color:var(--nb-text); margin-bottom:16px; text-align:center;">
            Ваша устойчивость держится на ваших понятных осознанных шагах. Заполните Карту опоры и закрепите состояние через медитацию.
          </p>

          <div style="display:flex; flex-direction:column; gap:10px;">
            <button onclick="goToPractice()" class="primary-btn pulse" style="width:100%; min-height:46px;">
              <span>Собрать Карту опоры ➔</span>
            </button>
          </div>
        </section>

        <div style="padding-top:4px;">
          <button onclick="safeHaptic('selection'); openScreen('21_bonuses.html');" class="primary-btn pulse"
            style="width:100%; display:flex; justify-content:center; align-items:center; min-height:48px;">
            <span>Перейти к 4 бонусам курса →</span>
          </button>
        </div>

      </div>

      <!-- SCREEN 2: INTERACTIVE PRACTICE -->
      <div id="step2InteractiveScreen" style="display:none; flex-direction:column; gap:14px;">

        <div>
          <button onclick="goToVideo()" class="top-nav-btn" style="display:inline-flex; align-items:center; gap:6px; font-weight:700; font-size:13px; color:var(--nb-deep); background:rgba(255,255,255,0.75); backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px); padding:6px 14px; border-radius:9999px; border:1px solid rgba(255,255,255,0.85); box-shadow:0 2px 8px rgba(0,0,0,0.04); text-decoration:none; cursor:pointer;">
            ← Назад к видеоуроку
          </button>
        </div>

        <!-- 5 Blocks of Support Map -->
        <section class="glass card" style="display:flex; flex-direction:column; gap:12px;">
          <h3 style="font-size:18px; font-weight:800; text-align:center; margin:0;">Моя Карта опоры</h3>
          <p style="font-size:12.5px; color:var(--nb-text-2); text-align:center; margin:0;">5 ключевых шагов нового сценария, собранных из ваших ответов:</p>

          <div>
            <label style="font-size:12px; font-weight:800; color:var(--nb-sea); display:block; margin-bottom:4px;">1. Реальность (без додумок)</label>
            <input type="text" id="mapStep1" value="Человек просто молчит — это не угроза мне." style="width:100%; border-radius:10px; padding:8px 10px; font-size:12.5px; border:1px solid rgba(36,49,57,0.15); background:#FFF;">
          </div>

          <div>
            <label style="font-size:12px; font-weight:800; color:var(--nb-sea); display:block; margin-bottom:4px;">2. Разговор на равных (о своей потребности)</label>
            <input type="text" id="mapStep2" value="«Я устала, мне нужна твоя помощь. Пожалуйста, реши это сегодня»." style="width:100%; border-radius:10px; padding:8px 10px; font-size:12.5px; border:1px solid rgba(36,49,57,0.15); background:#FFF;">
          </div>

          <div>
            <label style="font-size:12px; font-weight:800; color:var(--nb-sea); display:block; margin-bottom:4px;">3. Телесный сигнал</label>
            <input type="text" id="mapStep3" value="Замечаю сжатие в челюсти/плечах ➔ делаю глубокий выдох." style="width:100%; border-radius:10px; padding:8px 10px; font-size:12.5px; border:1px solid rgba(36,49,57,0.15); background:#FFF;">
          </div>

          <div>
            <label style="font-size:12px; font-weight:800; color:var(--nb-sea); display:block; margin-bottom:4px;">4. Опора и сильное убеждение</label>
            <input type="text" id="mapStep4" value="«Моя ценность существует сама по себе. Со мной всё в порядке»." style="width:100%; border-radius:10px; padding:8px 10px; font-size:12.5px; border:1px solid rgba(36,49,57,0.15); background:#FFF;">
          </div>

          <div>
            <label style="font-size:12px; font-weight:800; color:var(--nb-sea); display:block; margin-bottom:4px;">5. Право на неидеальность</label>
            <input type="text" id="mapStep5" value="Если сорвалась — это просто диагностика. В следующий раз выберу новый шаг." style="width:100%; border-radius:10px; padding:8px 10px; font-size:12.5px; border:1px solid rgba(36,49,57,0.15); background:#FFF;">
          </div>

          <button onclick="saveMap()" class="primary-btn" style="width:100%; min-height:44px; margin-top:4px;">
            <span>Сохранить мою Карту опоры ➔</span>
          </button>
        </section>

        <!-- Meditation -->
        <section class="glass card text-center" style="padding:16px;">
          <div class="eyebrow" style="background:rgba(47,125,89,0.1); color:var(--success); border-color:rgba(47,125,89,0.2); margin-bottom:6px;">
            🧘‍♀️ Финальная аудиопрактика
          </div>
          <h4 style="font-size:15px; font-weight:800; margin:0 0 4px 0; color:var(--nb-deep);">Медитация «Я остаюсь собой» (10–12 минут)</h4>
          <p style="font-size:12px; color:var(--nb-text-2); margin:0 0 10px 0;">Практика интеграции нового опыта и глубокого спокойствия от Анатолия Фёдорова.</p>
          
          <audio id="meditationAudio5" controls preload="metadata" style="width:100%; accent-color:var(--nb-accent);">
            <source src="https://inter01-anatolyfedorov.amvera.io/data/meditation1-3.MP3" type="audio/mpeg">
            Ваш браузер не поддерживает аудио.
          </audio>
        </section>

        <!-- High-Ticket Offer Block -->
        <section class="glass card text-center" style="border:2px solid rgba(196,115,79,0.3); background:rgba(255,255,255,0.85); padding:18px;">
          <div class="eyebrow" style="background:rgba(196,115,79,0.12); color:#A85532; border-color:rgba(196,115,79,0.3); margin-bottom:8px;">
            ⭐ Персональная работа
          </div>
          <h3 style="font-size:16px; font-weight:800; color:var(--nb-deep); margin-bottom:8px;">Глубокий психологический портрет + Консультация Анатолия Фёдорова</h3>
          <p style="font-size:12.5px; line-height:1.5; color:var(--nb-text-2); margin-bottom:14px;">
            21 вопрос теста, 10+ страниц детального поведенческого анализа СПА и часовая персональная консультация 1-на-1.
          </p>

          <button onclick="safeHaptic('selection'); openProduct('course_partner_10000');" class="primary-btn pulse" style="width:100%; min-height:48px; background:linear-gradient(135deg, #C4734F, #A85532);">
            <span>Записаться на разбор за 10 000 ₽</span>
          </button>
        </section>

        <div style="padding-top:4px;">
          <button onclick="safeHaptic('selection'); openScreen('21_bonuses.html');" class="secondary-btn"
            style="width:100%; display:flex; justify-content:center; align-items:center; min-height:46px;">
            <span>Перейти к 4 бонусам курса →</span>
          </button>
        </div>

      </div>
      
      <div class="pb-12"></div>
    </div>
  </main>

  <script>
${commonJsHelpers}

    function goToVideo() {
      safeHaptic('selection');
      var s2 = document.getElementById('step2InteractiveScreen');
      if (s2) s2.style.display = 'none';
      var s1 = document.getElementById('step1VideoScreen');
      if (s1) s1.style.display = 'flex';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function goToPractice() {
      safeHaptic('selection');
      pauseVideo();
      var s1 = document.getElementById('step1VideoScreen');
      if (s1) s1.style.display = 'none';
      var s2 = document.getElementById('step2InteractiveScreen');
      if (s2) s2.style.display = 'flex';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function saveMap() {
      safeHaptic('success');
      var mapData = {
        step1: document.getElementById('mapStep1').value,
        step2: document.getElementById('mapStep2').value,
        step3: document.getElementById('mapStep3').value,
        step4: document.getElementById('mapStep4').value,
        step5: document.getElementById('mapStep5').value
      };
      localStorage.setItem('s2_lesson5_map', JSON.stringify(mapData));
      localStorage.setItem('s2_lesson5_completed', 'true');
      alert('✅ Карта опоры успешно сохранена в вашем профиле!');
    }

    window.addEventListener('DOMContentLoaded', function() {
      var saved = localStorage.getItem('s2_lesson5_map');
      if(saved) {
        try {
          var d = JSON.parse(saved);
          if(d.step1) document.getElementById('mapStep1').value = d.step1;
          if(d.step2) document.getElementById('mapStep2').value = d.step2;
          if(d.step3) document.getElementById('mapStep3').value = d.step3;
          if(d.step4) document.getElementById('mapStep4').value = d.step4;
          if(d.step5) document.getElementById('mapStep5').value = d.step5;
        }catch(e){}
      }
    });
  </script>

${getDrawerHtml(file)}

</body>
</html>`;

  fs.writeFileSync(path.join(__dirname, '../out/client', file), html, 'utf8');
  console.log(`✅ Built ${file}`);
}

// ----------------------------------------------------
// 21_BONUSES.HTML
// ----------------------------------------------------
function buildBonusesHub() {
  const file = '21_bonuses.html';

  let img1 = '', img2 = '', img3 = '', img4 = '';
  try {
    const html09 = fs.readFileSync('out/client/09_bonuses.html', 'utf8');
    const m1 = html09.match(/<!-- Bonus 1 -->[\s\S]*?<img src="([^"]+)"/);
    const m2 = html09.match(/<!-- Bonus 2 -->[\s\S]*?<img src="([^"]+)"/);
    const m3 = html09.match(/<!-- Bonus 3 -->[\s\S]*?<img src="([^"]+)"/);
    const m4 = html09.match(/<!-- Bonus 4 -->[\s\S]*?<img src="([^"]+)"/);
    if (m1) img1 = m1[1];
    if (m2) img2 = m2[1];
    if (m3) img3 = m3[1];
    if (m4) img4 = m4[1];
  } catch (e) {}

  const bonusGridStyles = `
  <style>
    .bonuses-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr) !important;
      gap: 12px;
      margin: 0 auto 16px auto;
      width: 100%;
      box-sizing: border-box;
      padding: 0 2px;
    }
    @media (min-width: 480px) {
      .bonuses-grid {
        gap: 14px;
      }
    }
    .bonus-card-premium {
      position: relative;
      background: #1B2832;
      border: 1.5px solid rgba(255, 255, 255, 0.55);
      box-shadow: 0 6px 20px rgba(36, 49, 57, 0.14), 0 0 0 1px rgba(36, 49, 57, 0.1);
      border-radius: 16px;
      overflow: hidden;
      cursor: pointer;
      text-decoration: none;
      transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
      text-align: center;
      aspect-ratio: 1 / 1;
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
    }
    .bonus-card-premium:hover {
      transform: translateY(-3px) scale(1.02);
      box-shadow: 0 12px 28px rgba(36, 49, 57, 0.22), 0 0 0 1px rgba(217, 131, 78, 0.5);
      border-color: rgba(255, 255, 255, 0.85);
    }
    .bonus-card-premium:active {
      transform: scale(0.97);
    }
    .bonus-card-bg-img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
      transition: transform 0.4s ease;
      z-index: 1;
    }
    .bonus-card-premium:hover .bonus-card-bg-img {
      transform: scale(1.08);
    }
    .bonus-card-overlay {
      position: relative;
      z-index: 2;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      height: 100%;
      flex: 1;
      padding: 14px 10px;
      background: linear-gradient(180deg, rgba(14, 31, 46, 0.35) 0%, rgba(14, 31, 46, 0.55) 50%, rgba(14, 31, 46, 0.75) 100%);
      box-sizing: border-box;
    }
    .bonus-card-content {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .bonus-card-title {
      font-size: 14.5px;
      font-weight: 900;
      color: #FFFFFF;
      line-height: 1.25;
      margin: 0;
      text-align: center;
      text-shadow: 0 2px 6px rgba(0, 0, 0, 0.95);
      letter-spacing: -0.2px;
    }
    @media (min-width: 480px) {
      .bonus-card-title {
        font-size: 15.5px;
      }
    }
  </style>
  `;

  let headWithStyles = standardHead.replace(/<title>.*?<\/title>/i, '<title>4 практических бонуса — Анатолий Фёдоров</title>');
  headWithStyles = headWithStyles.replace('</head>', bonusGridStyles + '</head>');

  const html = `${headWithStyles}
<body class="safe-area">
  <div id="maisonArtBackground" aria-hidden="true"></div>
  <main class="app-shell">
    <div class="app">
      <div style="display:flex; flex-direction:column; gap:12px; width:100%;">

        <!-- Top Navigation -->
        <div class="header-actions-row" style="margin-bottom: 6px;">
          <button type="button" onclick="openNavDrawer();" class="nav-glass-tinted-btn">
            <span>🧭</span>
            <span>Навигация по курсу</span>
          </button>
          <button type="button" onclick="safeHaptic('selection'); openScreen('16_lesson1.html');" class="next-lesson-btn">
            <span>К уроку 1 →</span>
          </button>
        </div>

        <!-- Main Header Section (Compact -20% height) -->
        <section class="glass card text-center" style="max-width: 440px; width: 100%; margin: 0 auto; padding: 8px 16px; border-radius: 16px; box-sizing: border-box;">
          <div class="eyebrow" style="margin-bottom: 2px; font-size: 10.5px; padding: 1px 8px; display: inline-flex; line-height: 1.2;">
            🎁 Материалы курса
          </div>
          <h1 style="font-size: 17px; font-weight: 900; color: var(--nb-deep); margin-bottom: 2px; line-height: 1.15;">
            Ваши бонусы
          </h1>
          <p class="lead" style="font-size: 11.5px; line-height: 1.35; color: var(--nb-slate); margin: 0 auto; max-width: 380px;">
            Четыре практических инструмента, которые помогут сохранить состояние опоры на себя в реальных ситуациях.
          </p>
        </section>

        <!-- 4 Bonus Cards (2 rows x 2 columns: text ON image, clickable cards) -->
        <div class="bonuses-grid">

          <!-- Bonus 1 -->
          <a href="javascript:void(0);" onclick="safeHaptic('selection'); openScreen('22_bonus1.html'); return false;" class="bonus-card-premium">
            <img src="${img1}" alt="Когда он отстранился или молчит в сети" class="bonus-card-bg-img" />
            <div class="bonus-card-overlay">
              <div class="bonus-card-content">
                <h3 class="bonus-card-title">Когда он отстранился или молчит в сети</h3>
              </div>
            </div>
          </a>

          <!-- Bonus 2 -->
          <a href="javascript:void(0);" onclick="safeHaptic('selection'); openScreen('23_bonus2.html'); return false;" class="bonus-card-premium">
            <img src="${img2}" alt="В одной комнате с молчуном" class="bonus-card-bg-img" />
            <div class="bonus-card-overlay">
              <div class="bonus-card-content">
                <h3 class="bonus-card-title">В одной комнате с молчуном</h3>
              </div>
            </div>
          </a>

          <!-- Bonus 3 -->
          <a href="javascript:void(0);" onclick="safeHaptic('selection'); openScreen('24_bonus3.html'); return false;" class="bonus-card-premium">
            <img src="${img3}" alt="Точка опоры, если вы сорвались" class="bonus-card-bg-img" />
            <div class="bonus-card-overlay">
              <div class="bonus-card-content">
                <h3 class="bonus-card-title">Точка опоры, если вы сорвались</h3>
              </div>
            </div>
          </a>

          <!-- Bonus 4 -->
          <a href="javascript:void(0);" onclick="safeHaptic('selection'); openScreen('25_bonus4.html'); return false;" class="bonus-card-premium">
            <img src="${img4}" alt="Это моя тревога или он ненадёжен?" class="bonus-card-bg-img" />
            <div class="bonus-card-overlay">
              <div class="bonus-card-content">
                <h3 class="bonus-card-title">Это моя тревога или он ненадёжен?</h3>
              </div>
            </div>
          </a>

        </div>

        <!-- Dedicated Individual Offer Card (Under the 4 bonuses) -->
        <section class="glass card text-center" style="border:1.5px solid rgba(217, 131, 78, 0.35); background:rgba(255,255,255,0.95); padding:22px 20px;">
          <div class="eyebrow" style="margin-bottom:10px; background:rgba(217, 131, 78, 0.12); color:var(--nb-terracotta); border-color:rgba(217, 131, 78, 0.25);">
            💎 Индивидуальная работа
          </div>
          <h2 style="font-size:20px; font-weight:800; color:var(--nb-deep); margin-bottom:8px;">
            Хотите разобрать ваш сценарий персонально со мной?
          </h2>
          <p class="lead" style="font-size:13.5px; line-height:1.55; color:var(--nb-text); margin:0 0 16px 0; text-align:left;">
            Курс помог вам заметить триггеры и вернуть опору на себя. На индивидуальном 1-на-1 разборе с Анатолием Фёдоровым мы соберём полную картину: определим корневые причины тревоги, проверим рисунок отношений и зафиксируем персональный алгоритм действий.
          </p>

          <button type="button" onclick="safeHaptic('selection'); openProduct('course_partner_10000');" class="primary-btn pulse" style="width:100%; min-height:48px; background:linear-gradient(105deg, #B5663E 0%, #BD7249 50%, #CB8760 100%) !important;">
            <span>Записаться на разбор за 10 000 ₽ →</span>
          </button>
        </section>

        <!-- Bottom Navigation -->
        <div style="display:flex; flex-direction:column; gap:10px; padding-top:4px;">
          <button type="button" onclick="safeHaptic('selection'); openScreen('16_lesson1.html');" class="secondary-btn" style="min-height:46px;">
            <span>Перейти к первому уроку →</span>
          </button>
        </div>

        <!-- Footer -->
        <footer class="text-center" style="display:flex; justify-content:center; margin:12px auto 0 auto; padding-bottom:24px; width:100%;">
          <div style="display:inline-flex; align-items:center; justify-content:center; background:rgba(255, 255, 255, 0.75); backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); border:1px solid rgba(255, 255, 255, 0.85); border-radius:9999px; padding:5px 14px; font-size:11px; font-weight:600; color:var(--nb-slate); box-shadow:0 2px 8px rgba(0, 0, 0, 0.04);">
            © Анатолий Фёдоров • «Я остаюсь собой»
          </div>
        </footer>

      </div>
    </div>
  </main>

  <script>
${commonJsHelpers}
  </script>
  ${getDrawerHtml(file)}
</body>
</html>`;

  fs.writeFileSync('out/client/' + file, html, 'utf8');
  console.log('✅ Built ' + file + ' (matching 09_bonuses.html standard)');
}

// ----------------------------------------------------
// 22_BONUS1.HTML
// ----------------------------------------------------
function buildBonus1() {
  const file = '22_bonus1.html';
  const html = `${standardHead.replace(/<title>.*?<\/title>/i, '<title>Бонус 1: Когда он отстранился или молчит — Анатолий Фёдоров</title>')}
<body>
  <div id="maisonArtBackground"></div>
  <div id="loading-screen" class="loader-screen">
    <div class="loader-spinner mb-4"></div>
    <span class="text-sm tracking-widest text-nb-accent uppercase font-bold animate-pulse">Загрузка...</span>
  </div>

  <main class="app-shell">
    <div class="app">

      <header class="header-bar-nav">
        <div class="header-actions-row">
          <button type="button" onclick="openNavDrawer();" class="nav-glass-tinted-btn">
            <span>🧭</span>
            <span>Навигация по курсу</span>
          </button>
          <button type="button" onclick="safeHaptic('selection'); openScreen('21_bonuses.html');" class="next-lesson-btn">
            <span>Все бонусы 🎁</span>
          </button>
        </div>
      </header>

      <div style="display:flex; flex-direction:column; gap:14px; padding-top:4px;">

        <section class="glass card text-center">
          <div class="eyebrow" style="margin-bottom:8px;">Бонус 1</div>
          <h2 style="font-size:18px; font-weight:800; color:var(--nb-deep); line-height:1.3; margin-bottom:6px; text-align:center;">Когда он отстранился или молчит в сети</h2>
          <p class="lead" style="font-size:13px; line-height:1.4; color:var(--nb-text-2); margin-bottom:12px; text-align:center;">Как пережить мужскую дистанцию и не наломать дров.</p>

          <div style="position:relative; width:100%; aspect-ratio:16/9; border-radius:18px; overflow:hidden; background:#000; box-shadow:0 12px 30px rgba(0,0,0,0.12);">
            <iframe id="kinescopeVideo" src="https://kinescope.io/embed/gJuTii2CB5xh7imx32QG9A?max_quality=720"
              allow="autoplay; fullscreen; picture-in-picture; encrypted-media; gyroscope; accelerometer; clipboard-write; screen-wake-lock;"
              frameborder="0" allowfullscreen
              style="position:absolute; width:100%; height:100%; top:0; left:0;"></iframe>
          </div>
        </section>

        <!-- AI Tool: Message Subtext -->
        <section class="glass card" style="display:flex; flex-direction:column; gap:12px; position:relative;">
          <div class="eyebrow" style="background:rgba(217,131,78,0.12); color:#A85532; margin-bottom:0;">
            🔍 Проявитель подтекста сообщения
          </div>
          <p style="font-size:12.5px; color:var(--nb-text-2); margin:0;">Вставьте черновик сообщения, которое вы хотите отправить мужчине во время его паузы:</p>
          <textarea id="draftMessage" rows="3" style="width:100%; border-radius:12px; padding:10px 12px; font-size:13px; border:1px solid rgba(36,49,57,0.15); background:#FFF; resize:vertical; font-family:inherit;" placeholder="Например: Ты где? Почему ты опять молчишь? Мы вообще увидимся сегодня?!"></textarea>
          
          <button id="btnAnalyze" onclick="analyzeDraft()" class="primary-btn pulse" style="width:100%; min-height:44px;">
            <span>Проявить подтекст с ИИ ➔</span>
          </button>

          <div id="aiLoading" style="display:none; position:absolute; inset:0; background:rgba(255,255,255,0.88); backdrop-filter:blur(6px); border-radius:24px; flex-direction:column; align-items:center; justify-content:center; z-index:20;">
            <div class="loader-spinner" style="margin-bottom:8px;"></div>
            <p style="font-size:13px; font-weight:700; color:var(--nb-accent); margin:0;">Проявляю скрытый подтекст...</p>
          </div>
        </section>

        <div id="resultBox" class="glass card" style="display:none; flex-direction:column; gap:12px;">
          <h3 style="font-size:16px; font-weight:800; color:var(--nb-deep); margin:0; text-align:center;">Анализ сообщения</h3>
          <div style="background:rgba(255,255,255,0.6); border-radius:12px; padding:12px; border-left:4px solid var(--danger);">
            <div style="font-size:11px; color:var(--danger); font-weight:800; text-transform:uppercase;">Как это прочитает мужчина:</div>
            <p id="resHowHeReads" style="font-size:13px; margin:4px 0 0 0;">Как панику, давление и требование немедленно отчитаться.</p>
          </div>
          <div style="background:rgba(127,155,142,0.12); border-radius:12px; padding:12px; border:1px solid rgba(127,155,142,0.3);">
            <div style="font-size:11px; color:var(--nb-accent); font-weight:800; text-transform:uppercase;">Спокойная взрослая альтернатива:</div>
            <p id="resAlternative" style="font-size:13px; font-weight:700; color:var(--nb-deep); margin:4px 0 0 0;">«Привет! Освободишься — набери, обсудим планы на вечер».</p>
          </div>
        </div>

      </div>
      
      <div class="pb-12"></div>
    </div>
  </main>

  <script>
${commonJsHelpers}

    async function analyzeDraft() {
      var txt = document.getElementById('draftMessage').value.trim();
      if(!txt) {
        safeHaptic('error');
        alert('Пожалуйста, введите черновик сообщения.');
        return;
      }
      safeHaptic('medium');
      var elLoading = document.getElementById('aiLoading');
      if (elLoading) elLoading.style.display = 'flex';

      try {
        var apiFunc = (typeof apiPost === 'function') ? apiPost : apiPostLocal;
        var data = await apiFunc('/api/s2-bonus1-strategy', { message: txt });
        if(!data || !data.howHeReads) throw new Error("Invalid response");
        showResults(data);
      } catch(e) {
        setTimeout(function() {
          showResults({
            howHeReads: "Как панику, претензию и попытку контролировать его личное время.",
            alternative: "«Привет! Будет минутка — напиши или набери, когда освободишься». (И положить телефон экраном вниз на 40 минут)."
          });
        }, 1200);
      }
    }

    function showResults(data) {
      var elLoading = document.getElementById('aiLoading');
      if (elLoading) elLoading.style.display = 'none';
      safeHaptic('success');
      if(data.howHeReads) document.getElementById('resHowHeReads').textContent = data.howHeReads;
      if(data.alternative) document.getElementById('resAlternative').textContent = data.alternative;
      var box = document.getElementById('resultBox');
      box.style.display = 'flex';
      box.scrollIntoView({ behavior: 'smooth' });
    }
  </script>

${getDrawerHtml(file)}

</body>
</html>`;

  fs.writeFileSync(path.join(__dirname, '../out/client', file), html, 'utf8');
  console.log(`✅ Built ${file}`);
}

// ----------------------------------------------------
// 23_BONUS2.HTML
// ----------------------------------------------------
function buildBonus2() {
  const file = '23_bonus2.html';
  const html = `${standardHead.replace(/<title>.*?<\/title>/i, '<title>Бонус 2: В одной комнате с молчуном — Анатолий Фёдоров</title>')}
<body>
  <div id="maisonArtBackground"></div>
  <div id="loading-screen" class="loader-screen">
    <div class="loader-spinner mb-4"></div>
    <span class="text-sm tracking-widest text-nb-accent uppercase font-bold animate-pulse">Загрузка...</span>
  </div>

  <main class="app-shell">
    <div class="app">

      <header class="header-bar-nav">
        <div class="header-actions-row">
          <button type="button" onclick="openNavDrawer();" class="nav-glass-tinted-btn">
            <span>🧭</span>
            <span>Навигация по курсу</span>
          </button>
          <button type="button" onclick="safeHaptic('selection'); openScreen('21_bonuses.html');" class="next-lesson-btn">
            <span>Все бонусы 🎁</span>
          </button>
        </div>
      </header>

      <div style="display:flex; flex-direction:column; gap:14px; padding-top:4px;">

        <section class="glass card text-center">
          <div class="eyebrow" style="margin-bottom:8px;">Бонус 2</div>
          <h2 style="font-size:18px; font-weight:800; color:var(--nb-deep); line-height:1.3; margin-bottom:6px; text-align:center;">В одной комнате с молчуном</h2>
          <p class="lead" style="font-size:13px; line-height:1.4; color:var(--nb-text-2); margin-bottom:12px; text-align:center;">Как выдержать чужую хмурость и переключить внимание на себя.</p>

          <div style="position:relative; width:100%; aspect-ratio:16/9; border-radius:18px; overflow:hidden; background:#000; box-shadow:0 12px 30px rgba(0,0,0,0.12);">
            <iframe id="kinescopeVideo" src="https://kinescope.io/embed/rg3Zn187P3qTTsKzCEwRF2?max_quality=720"
              allow="autoplay; fullscreen; picture-in-picture; encrypted-media; gyroscope; accelerometer; clipboard-write; screen-wake-lock;"
              frameborder="0" allowfullscreen
              style="position:absolute; width:100%; height:100%; top:0; left:0;"></iframe>
          </div>
        </section>

        <!-- Generator of Personal Evening -->
        <section class="glass card" style="display:flex; flex-direction:column; gap:12px;">
          <div class="eyebrow" style="background:rgba(47,125,89,0.1); color:var(--success); margin-bottom:0;">
            ☕️ Генератор личного вечера
          </div>
          <h3 style="font-size:16px; font-weight:800; color:var(--nb-deep); margin:0; text-align:center;">Что зажжёт вас прямо сейчас?</h3>
          <p style="font-size:12.5px; color:var(--nb-text-2); margin:0; text-align:center;">Выберите то, чем вы искренне займётесь на ближайшие 2 часа:</p>

          <div style="display:flex; flex-direction:column; gap:8px;">
            <label style="display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:12px; background:rgba(255,255,255,0.6); border:1px solid rgba(36,49,57,0.1); cursor:pointer;">
              <input type="radio" name="eveningPlan" value="bath" style="accent-color:var(--nb-sea); width:18px; height:18px;">
              <span style="font-size:13px; font-weight:600; color:var(--nb-deep);">🛁 Горячая ванна с солью и тишиной</span>
            </label>
            <label style="display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:12px; background:rgba(255,255,255,0.6); border:1px solid rgba(36,49,57,0.1); cursor:pointer;">
              <input type="radio" name="eveningPlan" value="movie" style="accent-color:var(--nb-sea); width:18px; height:18px;">
              <span style="font-size:13px; font-weight:600; color:var(--nb-deep);">🎬 Любимый фильм или сериал в наушниках</span>
            </label>
            <label style="display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:12px; background:rgba(255,255,255,0.6); border:1px solid rgba(36,49,57,0.1); cursor:pointer;">
              <input type="radio" name="eveningPlan" value="walk" style="accent-color:var(--nb-sea); width:18px; height:18px;">
              <span style="font-size:13px; font-weight:600; color:var(--nb-deep);">🎧 Прогулка на свежем воздухе с музыкой</span>
            </label>
            <label style="display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:12px; background:rgba(255,255,255,0.6); border:1px solid rgba(36,49,57,0.1); cursor:pointer;">
              <input type="radio" name="eveningPlan" value="hobby" style="accent-color:var(--nb-sea); width:18px; height:18px;">
              <span style="font-size:13px; font-weight:600; color:var(--nb-deep);">📖 Чтение книги / творчество / уход за лицом</span>
            </label>
          </div>

          <div style="background:rgba(200,178,143,0.15); border-radius:12px; padding:12px; text-align:center; border:1px solid rgba(200,178,143,0.3);">
            <div style="font-size:11px; font-weight:800; color:var(--nb-deep); text-transform:uppercase; margin-bottom:4px;">🛡 Главный щит вечера:</div>
            <p style="font-size:13px; font-weight:700; color:var(--nb-deep); margin:0;">«Я не несу ответственности за чужое хмурое лицо. Взрослый человек имеет право на своё настроение, а я имею право на свой прекрасный вечер.»</p>
          </div>
        </section>

      </div>
      
      <div class="pb-12"></div>
    </div>
  </main>

  <script>
${commonJsHelpers}
  </script>

${getDrawerHtml(file)}

</body>
</html>`;

  fs.writeFileSync(path.join(__dirname, '../out/client', file), html, 'utf8');
  console.log(`✅ Built ${file}`);
}

// ----------------------------------------------------
// 24_BONUS3.HTML
// ----------------------------------------------------
function buildBonus3() {
  const file = '24_bonus3.html';
  const html = `${standardHead.replace(/<title>.*?<\/title>/i, '<title>Бонус 3: Точка опоры, если вы сорвались — Анатолий Фёдоров</title>')}
<body>
  <div id="maisonArtBackground"></div>
  <div id="loading-screen" class="loader-screen">
    <div class="loader-spinner mb-4"></div>
    <span class="text-sm tracking-widest text-nb-accent uppercase font-bold animate-pulse">Загрузка...</span>
  </div>

  <main class="app-shell">
    <div class="app">

      <header class="header-bar-nav">
        <div class="header-actions-row">
          <button type="button" onclick="openNavDrawer();" class="nav-glass-tinted-btn">
            <span>🧭</span>
            <span>Навигация по курсу</span>
          </button>
          <button type="button" onclick="safeHaptic('selection'); openScreen('21_bonuses.html');" class="next-lesson-btn">
            <span>Все бонусы 🎁</span>
          </button>
        </div>
      </header>

      <div style="display:flex; flex-direction:column; gap:14px; padding-top:4px;">

        <section class="glass card text-center">
          <div class="eyebrow" style="margin-bottom:8px;">Бонус 3</div>
          <h2 style="font-size:18px; font-weight:800; color:var(--nb-deep); line-height:1.3; margin-bottom:6px; text-align:center;">Точка опоры, если вы сорвались</h2>
          <p class="lead" style="font-size:13px; line-height:1.4; color:var(--nb-text-2); margin-bottom:12px; text-align:center;">Как восстановиться после ссоры и поставить физический якорь.</p>

          <div style="position:relative; width:100%; aspect-ratio:16/9; border-radius:18px; overflow:hidden; background:#000; box-shadow:0 12px 30px rgba(0,0,0,0.12);">
            <iframe id="kinescopeVideo" src="https://kinescope.io/embed/tSmPqiSNmmTqSWWBPCebzj?max_quality=720"
              allow="autoplay; fullscreen; picture-in-picture; encrypted-media; gyroscope; accelerometer; clipboard-write; screen-wake-lock;"
              frameborder="0" allowfullscreen
              style="position:absolute; width:100%; height:100%; top:0; left:0;"></iframe>
          </div>
        </section>

        <!-- 3 Steps of Anchor -->
        <section class="glass card" style="display:flex; flex-direction:column; gap:12px;">
          <div class="eyebrow" style="background:rgba(47,125,89,0.1); color:var(--success); margin-bottom:0;">
            ⚓️ Физический якорь «СТОП»
          </div>
          
          <div style="background:rgba(255,255,255,0.6); border-radius:12px; padding:12px; border-left:4px solid var(--nb-sea);">
            <strong style="font-size:13px; color:var(--nb-deep);">1. Снятие вины:</strong>
            <p style="font-size:12.5px; color:var(--nb-text-2); margin:4px 0 0 0;">Срыв произошёл не из-за «плохого характера», а из-за накопившейся боли и усталости. Вы живой человек.</p>
          </div>

          <div style="background:rgba(255,255,255,0.6); border-radius:12px; padding:12px; border-left:4px solid var(--nb-accent);">
            <strong style="font-size:13px; color:var(--nb-deep);">2. Жест фиксации:</strong>
            <p style="font-size:12.5px; color:var(--nb-text-2); margin:4px 0 0 0;">Охватите пальцами правой руки левое запястье, сделайте медленный выдох и мысленно скажите: «СТОП. Я возвращаюсь к себе».</p>
          </div>

          <div style="background:rgba(127,155,142,0.12); border-radius:12px; padding:12px; border:1px solid rgba(127,155,142,0.3);">
            <strong style="font-size:13px; color:var(--nb-deep);">3. Взрослый выход из срыва (фраза):</strong>
            <p style="font-size:13px; font-weight:700; color:var(--nb-deep); margin:4px 0 0 0;">«Я вспылила, потому что устала и испугалась. Давай сделаем паузу и вернёмся к этому позже спокойно».</p>
          </div>
        </section>

      </div>
      
      <div class="pb-12"></div>
    </div>
  </main>

  <script>
${commonJsHelpers}
  </script>

${getDrawerHtml(file)}

</body>
</html>`;

  fs.writeFileSync(path.join(__dirname, '../out/client', file), html, 'utf8');
  console.log(`✅ Built ${file}`);
}

// ----------------------------------------------------
// 25_BONUS4.HTML
// ----------------------------------------------------
function buildBonus4() {
  const file = '25_bonus4.html';
  const html = `${standardHead.replace(/<title>.*?<\/title>/i, '<title>Бонус 4: Это моя тревога или он ненадёжен? — Анатолий Фёдоров</title>')}
<body>
  <div id="maisonArtBackground"></div>
  <div id="loading-screen" class="loader-screen">
    <div class="loader-spinner mb-4"></div>
    <span class="text-sm tracking-widest text-nb-accent uppercase font-bold animate-pulse">Загрузка...</span>
  </div>

  <main class="app-shell">
    <div class="app">

      <header class="header-bar-nav">
        <div class="header-actions-row">
          <button type="button" onclick="openNavDrawer();" class="nav-glass-tinted-btn">
            <span>🧭</span>
            <span>Навигация по курсу</span>
          </button>
          <button type="button" onclick="safeHaptic('selection'); openScreen('21_bonuses.html');" class="next-lesson-btn">
            <span>Все бонусы 🎁</span>
          </button>
        </div>
      </header>

      <div style="display:flex; flex-direction:column; gap:14px; padding-top:4px;">

        <section class="glass card text-center">
          <div class="eyebrow" style="margin-bottom:8px;">Бонус 4</div>
          <h2 style="font-size:18px; font-weight:800; color:var(--nb-deep); line-height:1.3; margin-bottom:6px; text-align:center;">Это моя тревога или он правда ненадёжен?</h2>
          <p class="lead" style="font-size:13px; line-height:1.4; color:var(--nb-text-2); margin-bottom:12px; text-align:center;">Аудит реальных поступков за 4 недели (дела vs слова).</p>

          <div style="position:relative; width:100%; aspect-ratio:16/9; border-radius:18px; overflow:hidden; background:#000; box-shadow:0 12px 30px rgba(0,0,0,0.12);">
            <iframe id="kinescopeVideo" src="https://kinescope.io/embed/u6RzSwLE9DpSemaR4xrcDj?max_quality=720"
              allow="autoplay; fullscreen; picture-in-picture; encrypted-media; gyroscope; accelerometer; clipboard-write; screen-wake-lock;"
              frameborder="0" allowfullscreen
              style="position:absolute; width:100%; height:100%; top:0; left:0;"></iframe>
          </div>
        </section>

        <!-- 4-Week Audit Checklist -->
        <section class="glass card" style="display:flex; flex-direction:column; gap:12px;">
          <div class="eyebrow" style="background:rgba(217,131,78,0.12); color:#A85532; margin-bottom:0;">
            📊 Чек-лист фактов за 4 недели
          </div>
          <p style="font-size:12.5px; color:var(--nb-text-2); margin:0;">Отметьте то, что реально происходит в поступках партнёра:</p>

          <div style="display:flex; flex-direction:column; gap:8px;">
            <label style="display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:12px; background:rgba(255,255,255,0.6); border:1px solid rgba(36,49,57,0.1); cursor:pointer;">
              <input type="checkbox" onchange="calcAudit()" class="audit-check" data-type="green" style="accent-color:var(--success); width:18px; height:18px;">
              <span style="font-size:12.5px; font-weight:600; color:var(--nb-deep);">🟢 Держит обещания (если пообещал — сделал)</span>
            </label>
            <label style="display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:12px; background:rgba(255,255,255,0.6); border:1px solid rgba(36,49,57,0.1); cursor:pointer;">
              <input type="checkbox" onchange="calcAudit()" class="audit-check" data-type="green" style="accent-color:var(--success); width:18px; height:18px;">
              <span style="font-size:12.5px; font-weight:600; color:var(--nb-deep);">🟢 Предупреждает, если задерживается или занят</span>
            </label>
            <label style="display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:12px; background:rgba(255,255,255,0.6); border:1px solid rgba(36,49,57,0.1); cursor:pointer;">
              <input type="checkbox" onchange="calcAudit()" class="audit-check" data-type="yellow" style="accent-color:var(--warning); width:18px; height:18px;">
              <span style="font-size:12.5px; font-weight:600; color:var(--nb-deep);">🟡 Тянет с важными решениями, пока я не надавлю</span>
            </label>
            <label style="display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:12px; background:rgba(255,255,255,0.6); border:1px solid rgba(36,49,57,0.1); cursor:pointer;">
              <input type="checkbox" onchange="calcAudit()" class="audit-check" data-type="red" style="accent-color:var(--danger); width:18px; height:18px;">
              <span style="font-size:12.5px; font-weight:600; color:var(--nb-deep);">🔴 Пропадает без объяснений на дни или врет</span>
            </label>
          </div>

          <div id="auditResultBox" style="padding:12px; border-radius:12px; background:rgba(47,125,89,0.1); border:1px solid rgba(47,125,89,0.25); text-align:center;">
            <span id="auditResultText" style="font-size:13px; font-weight:700; color:var(--success);">Отметьте пункты выше для анализа</span>
          </div>
        </section>

      </div>
      
      <div class="pb-12"></div>
    </div>
  </main>

  <script>
${commonJsHelpers}

    function calcAudit() {
      safeHaptic('selection');
      var checks = document.querySelectorAll('.audit-check:checked');
      var reds = Array.from(checks).filter(c => c.dataset.type === 'red').length;
      var greens = Array.from(checks).filter(c => c.dataset.type === 'green').length;
      
      var box = document.getElementById('auditResultBox');
      var txt = document.getElementById('auditResultText');

      if(reds > 0) {
        box.style.background = 'rgba(180,35,24,0.1)';
        box.style.borderColor = 'rgba(180,35,24,0.3)';
        txt.style.color = 'var(--danger)';
        txt.textContent = '⚠️ Красная зона: дело не только в тревоге. Есть реальные факты ненадёжности партнёра.';
      } else if (greens >= 2) {
        box.style.background = 'rgba(47,125,89,0.1)';
        box.style.borderColor = 'rgba(47,125,89,0.3)';
        txt.style.color = 'var(--success)';
        txt.textContent = '🟢 Зелёная зона: факты показывают надёжность. Ваша реакция вызвана внутренней тревогой.';
      } else {
        box.style.background = 'rgba(183,121,31,0.1)';
        box.style.borderColor = 'rgba(183,121,31,0.3)';
        txt.style.color = 'var(--warning)';
        txt.textContent = '🟡 Жёлтая зона: требуется больше наблюдений за реальными поступками без додумок.';
      }
    }
  </script>

${getDrawerHtml(file)}

</body>
</html>`;

  fs.writeFileSync(path.join(__dirname, '../out/client', file), html, 'utf8');
  console.log(`✅ Built ${file}`);
}

// ----------------------------------------------------
// 15_LANDING_PARTNER_2.HTML
// ----------------------------------------------------
function buildLanding() {
  const file = '15_landing_partner_2.html';
  const html = `${standardHead.replace(/<title>.*?<\/title>/i, '<title>Мини-курс «Я остаюсь собой» — Анатолий Фёдоров</title>')}
<body>
  <div id="maisonArtBackground"></div>
  <div id="loading-screen" class="loader-screen">
    <div class="loader-spinner mb-4"></div>
    <span class="text-sm tracking-widest text-nb-accent uppercase font-bold animate-pulse">Загрузка...</span>
  </div>

  <main class="app-shell">
    <div class="app">

      <header class="header-bar-nav">
        <div class="header-actions-row">
          <button type="button" onclick="openNavDrawer();" class="nav-glass-tinted-btn">
            <span>🧭</span>
            <span>Навигация по курсу</span>
          </button>
          <button type="button" onclick="safeHaptic('selection'); openScreen('16_lesson1.html');" class="next-lesson-btn">
            <span>К уроку 1 →</span>
          </button>
        </div>
      </header>

      <div style="display:flex; flex-direction:column; gap:14px; padding-top:4px;">

        <section class="glass card text-center">
          <div class="eyebrow" style="margin-bottom:8px;">Вводный урок курса</div>
          <h2 style="font-size:19px; font-weight:800; color:var(--nb-deep); line-height:1.3; margin-bottom:6px; text-align:center;">Мини-курс «Я остаюсь собой»</h2>
          <p class="lead" style="font-size:13px; line-height:1.4; color:var(--nb-text-2); margin-bottom:12px; text-align:center;">Как перестать зависеть от чужого настроения и вернуть внутреннюю опору.</p>

          <div style="position:relative; width:100%; aspect-ratio:16/9; border-radius:18px; overflow:hidden; background:#000; box-shadow:0 12px 30px rgba(0,0,0,0.12);">
            <iframe id="kinescopeVideo" src="https://kinescope.io/embed/xAvigBYEfvkFTgjAA8nSZK?max_quality=720"
              allow="autoplay; fullscreen; picture-in-picture; encrypted-media; gyroscope; accelerometer; clipboard-write; screen-wake-lock;"
              frameborder="0" allowfullscreen
              style="position:absolute; width:100%; height:100%; top:0; left:0;"></iframe>
          </div>
        </section>

        <!-- Intro Audio Practice -->
        <section class="glass card text-center" style="padding:16px;">
          <div class="eyebrow" style="background:rgba(47,125,89,0.1); color:var(--success); border-color:rgba(47,125,89,0.2); margin-bottom:6px;">
            🧘‍♀️ Первая аудиопрактика (10 минут)
          </div>
          <h4 style="font-size:15px; font-weight:800; margin:0 0 4px 0; color:var(--nb-deep);">«Возвращение к себе»</h4>
          <p style="font-size:12px; color:var(--nb-text-2); margin:0 0 10px 0;">Слушайте в наушниках перед началом занятий, чтобы сбросить первичное напряжение.</p>
          
          <audio id="meditationAudioIntro" controls preload="metadata" style="width:100%; accent-color:var(--nb-accent);">
            <source src="https://inter01-anatolyfedorov.amvera.io/data/meditation1-3.MP3" type="audio/mpeg">
            Ваш браузер не поддерживает аудио.
          </audio>
        </section>

        <!-- Program of 5 Lessons -->
        <section class="glass card" style="display:flex; flex-direction:column; gap:10px;">
          <div class="eyebrow" style="margin-bottom:2px;">Программа курса</div>
          <h3 style="font-size:16px; font-weight:800; color:var(--nb-deep); margin:0;">5 шагов к вашей устойчивости:</h3>

          <div style="display:flex; flex-direction:column; gap:6px; font-size:12.5px; color:var(--nb-text);">
            <div style="padding:8px 10px; border-radius:10px; background:rgba(255,255,255,0.6); display:flex; gap:8px;">
              <strong>1.</strong> <span>Почему один его поступок занимает всю вашу голову (Факт vs Триллер)</span>
            </div>
            <div style="padding:8px 10px; border-radius:10px; background:rgba(255,255,255,0.6); display:flex; gap:8px;">
              <strong>2.</strong> <span>Почему вы тащите всё на себе и как наконец выдохнуть</span>
            </div>
            <div style="padding:8px 10px; border-radius:10px; background:rgba(255,255,255,0.6); display:flex; gap:8px;">
              <strong>3.</strong> <span>Как остановить мысленную жвачку и выключить суд в голове</span>
            </div>
            <div style="padding:8px 10px; border-radius:10px; background:rgba(255,255,255,0.6); display:flex; gap:8px;">
              <strong>4.</strong> <span>Встреча с собой: что на самом деле раскачивает ваши эмоции</span>
            </div>
            <div style="padding:8px 10px; border-radius:10px; background:rgba(255,255,255,0.6); display:flex; gap:8px;">
              <strong>5.</strong> <span>Сборка нового сценария: Карта опоры</span>
            </div>
          </div>
        </section>

        <div style="padding-top:4px;">
          <button onclick="safeHaptic('selection'); openScreen('16_lesson1.html');" class="primary-btn pulse"
            style="width:100%; display:flex; justify-content:center; align-items:center; min-height:48px;">
            <span>Начать обучение: Урок 1 →</span>
          </button>
        </div>

      </div>
      
      <div class="pb-12"></div>
    </div>
  </main>

  <script>
${commonJsHelpers}
  </script>

${getDrawerHtml(file)}

</body>
</html>`;

  fs.writeFileSync(path.join(__dirname, '../out/client', file), html, 'utf8');
  console.log(`✅ Built ${file}`);
}

// Run all builders
buildLesson3();
buildLesson4();
buildLesson5();
buildBonusesHub();
buildBonus1();
buildBonus2();
buildBonus3();
buildBonus4();
buildLanding();

console.log("🎉 ALL S2 SCREENS BUILT SUCCESSFULLY!");
