# 🎨 ЭТАЛОН ДИЗАЙНА УРОКА — Design Standard v1.0

> **Назначение:** Единый стандарт визуального оформления, навигации, расположения элементов, работы с видео/аудио и интеграции с ИИ для всех экранов уроков миникурса.  
> **Для кого:** Атлант (для включения в ТЗ), Кодер 2.0 (для реализации), Анатолий Фёдоров (для ознакомления).  
> **Основан на:** эталонных файлах Сценария 1 (`03_lesson1.html` и др.)

---

## 📐 1. ОБЩАЯ СТРУКТУРА ЭКРАНА УРОКА

Каждый экран урока содержит **два виртуальных экрана** (переключаются без перезагрузки страницы):

```
┌─────────────────────────────────────────┐
│            ЭКРАН 1: ВИДЕО              │
│                                         │
│  ┌─ HEADER BAR ─────────────────────┐  │
│  │ 🧭 Навигация  │  Следующий урок→ │  │
│  │ Урок X из 5   │   XX% пройдено   │  │
│  │ ████████░░░░░░░░ (прогресс-бар)  │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌─ ВИДЕО-КАРТОЧКА (.glass) ────────┐  │
│  │ [eyebrow] Урок X из 5            │  │
│  │ [h2] Название урока               │  │
│  │ [lead] Подзаголовок               │  │
│  │ ┌─ VIDEO (Kinescope iframe) ───┐  │  │
│  │ │  16:9, border-radius:18px    │  │  │
│  │ └─────────────────────────────┘  │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌─ ИНСАЙТ-КАРТОЧКА (.glass) ───────┐  │
│  │ [eyebrow зелёный] 💡 Главный вывод│  │
│  │ [h3] Что забрать из урока         │  │
│  │ [lead] текст инсайта              │  │
│  │                                    │  │
│  │ [📥 Скачать Чек-лист] secondary   │  │
│  │ [Заполнить чек-лист ➔] primary    │  │
│  └───────────────────────────────────┘  │
│                                         │
│  [Перейти к уроку X+1 →] primary       │
│                                         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│         ЭКРАН 2: ПРАКТИКА               │
│                                         │
│  [← Назад к видеоуроку] top-nav-btn    │
│                                         │
│  ┌─ ИНТЕРАКТИВ (.glass) ────────────┐  │
│  │ Шаги практики (1–N)               │  │
│  │ Ввод, чипы, слайдеры              │  │
│  │                                    │  │
│  │ [Отправить на анализ ➔] primary   │  │
│  │                                    │  │
│  │ ┌─ РЕЗУЛЬТАТ ИИ ──────────────┐  │  │
│  │ │ 📷 Факт / 🎬 Триллер /      │  │  │
│  │ │ 🧘 Стабилизатор              │  │  │
│  │ └─────────────────────────────┘  │  │
│  └───────────────────────────────────┘  │
│                                         │
│  [Перейти к уроку X+1 →] primary       │
│  (появляется через 3 сек)               │
│                                         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│       BOTTOM DRAWER (Навигация)         │
│  (выезжает снизу по кнопке 🧭)         │
│                                         │
│  ──── (handle) ────                     │
│  🧭 Навигация по курсу          ✕     │
│  ─────────────────────────────────────  │
│  Уроки курса:                           │
│  [1] Урок 1 — подпись        Вы здесь  │
│  [2] Урок 2 — подпись             →    │
│  [3] Урок 3 — подпись             →    │
│  [4] Урок 4 — подпись             →    │
│  [5] Урок 5 — подпись             →    │
│  ─────────────────────────────────────  │
│  Бонусы и разбор:                       │
│  [🎁] 4 практических бонуса   4 бонуса │
│  [⭐] Индивидуальный разбор        →   │
└─────────────────────────────────────────┘
```

---

## 🧭 2. НАВИГАЦИОННЫЙ HEADER

### 2.1. Структура

```html
<header class="header-bar-nav">
  <!-- Ряд кнопок -->
  <div class="header-actions-row">
    <button class="nav-glass-tinted-btn" onclick="openNavDrawer()">
      🧭 Навигация по курсу
    </button>
    <button class="next-lesson-btn" onclick="openScreen('XX_lessonN.html')">
      Следующий урок →
    </button>
  </div>

  <!-- Прогресс -->
  <div class="header-progress-row">
    <span class="lesson-badge-sub">Урок X из 5</span>
    <span class="progress-percent-sub">XX% пройдено</span>
  </div>

  <!-- Прогресс-бар -->
  <div class="progress-track">
    <div style="width:XX%; background:linear-gradient(90deg, #C4734F, #45656D);"></div>
  </div>
</header>
```

### 2.2. Правила
- **header-bar-nav** — всегда первый элемент внутри `.app`, центрирован, `flex-direction: column`
- **nav-glass-tinted-btn** — стеклянная кнопка с акцентом `#C4734F` (терракот), `backdrop-filter: blur(18px)`
- **next-lesson-btn** — градиентная кнопка `#CC7A55 → #A85532`, белый текст, `box-shadow` с терракотовым
- **progress-track** — высота 5px, фон `rgba(36,49,57,0.08)`, заливка `#C4734F → #45656D`
- **Прогресс рассчитывается:** 20% на каждый из 5 уроков (20/40/60/80/100%)

---

## 🎬 3. ВИДЕО (Kinescope)

### 3.1. Расположение и обёртка

```html
<section class="glass card text-center">
  <div class="eyebrow">Урок X из 5</div>
  <h2>Название урока</h2>
  <p class="lead">Подзаголовок</p>

  <!-- Video Player Wrapper -->
  <div style="position:relative; width:100%; aspect-ratio:16/9;
              border-radius:18px; overflow:hidden; background:#000;
              box-shadow:0 12px 30px rgba(0,0,0,0.12);">
    <iframe id="lessonVideoIframe"
            src="https://kinescope.io/embed/VIDEO_ID?max_quality=720"
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media; gyroscope; accelerometer; clipboard-write; screen-wake-lock;"
            frameborder="0" allowfullscreen
            style="position:absolute; width:100%; height:100%; top:0; left:0;">
    </iframe>
  </div>
</section>
```

### 3.2. Обязательные правила видео
| Правило | Описание |
|---|---|
| **Авто-пауза** | При переходе к практике (`goToPractice()`, `goToStep2()`) — **обязательно** `pauseVideo()` |
| **Сброс iframe** | `iframe.src = ''` для полной остановки потока |
| **CSP** | `frame-src: https://kinescope.io https://*.kinescope.io;` |
| **Формат** | `aspect-ratio:16/9`, `border-radius:18px`, чёрный фон |
| **ID** | Уникальный для каждого урока: `lessonXVideoIframe` |

### 3.3. Функция pauseVideo()

```javascript
function pauseVideo() {
  var iframe = document.getElementById('lessonVideoIframe');
  if (iframe) {
    var currentSrc = iframe.src;
    if (currentSrc && currentSrc.includes('kinescope.io')) {
      iframe.src = '';
    }
  }
}
```

---

## 🎧 4. АУДИО (медитации, MP3)

### 4.1. Расположение
- Аудиоплеер размещается **внутри** `.glass.card`, обычно в бонусных уроках
- Источники: Amvera cloud (`https://inter01-anatolyfedorov.amvera.io/data/filename.MP3`)

### 4.2. Каскадный fallback

```javascript
// Порядок загрузки:
// 1. Amvera Cloud (основной)
// 2. Локальный сервер (резервный)
const AMVERA_HOST = 'https://inter01-anatolyfedorov.amvera.io';
const LOCAL_HOST = 'http://localhost:3000';

function resolveMediaUrl(filename) {
  return `${AMVERA_HOST}/data/${filename}`;
}
```

### 4.3. Правила аудио
- **Авто-пауза аудио** при переходе между экранами (идентично видео)
- **Формат кнопки запуска:** `secondary-btn` с иконкой 🎧 или ▶️
- **Визуальный прогресс** — полоска или бар с текущим временем

---

## 🤖 5. ИНТЕРАКТИВНАЯ ПРАКТИКА С ИИ

### 5.1. Структура шагов

Каждая практика состоит из **N шагов**, где последний — отправка на анализ ИИ:

```
Шаг 1 → Ввод текста (ситуация, описание)
Шаг 2 → Оценка по шкалам (слайдеры 0–10)
Шаг 3 → Отправка на анализ ИИ → Результат
```

### 5.2. Слайдеры оценки (`.touch-range`)

```html
<div class="touch-slider-container">
  <label>Гнев</label>
  <input type="range" class="touch-range" min="0" max="10" value="5"
         oninput="updateSlider(this)">
  <div class="slider-val-badge">5</div>
  <div class="scale-labels">
    <span>Нет</span>
    <span>Максимум</span>
  </div>
</div>
```

**Обязательный градиент дорожки:**
```css
.touch-range {
  background: linear-gradient(90deg, #2F7D59, #E59A5A, #B42318);
}
```

- Бейдж динамически окрашивается по цвету шкалы
- Подписи `justify-content: space-between`

### 5.3. Кнопка отправки

```html
<button id="submitBtn" onclick="submitToAI()" class="primary-btn pulse">
  <span>Отправить на анализ ➔</span>
</button>
<div class="attempts-left">Осталось попыток: 3</div>
```

- **Лимит попыток:** 3 (хранится в `localStorage`)
- **При исчерпании:** кнопка `disabled`, `opacity: 0.5`, текст "Попытки закончились"

### 5.4. Загрузка (AI Loading)

```html
<div id="aiLoading" class="hidden"
     style="display:none; flex-direction:column; align-items:center; gap:12px; padding:24px;">
  <div class="loading-spinner"></div>
  <p>Анализирую вашу ситуацию...</p>
</div>
```

---

## 🔌 6. ИНТЕГРАЦИЯ С ИИ — ПРАВИЛА СВЯЗИ

### 6.1. Архитектура запроса

```
Клиент (HTML) → apiPost() / apiPostLocal()
     ↓
  Бэкенд Amvera (прокси) → Polza AI / OpenAI / Gemini
     ↓
  JSON-ответ → renderResults(data)
```

### 6.2. Endpoint конвенция

| Сценарий | Урок | Endpoint | Описание |
|---|---|---|---|
| S1 | Урок 1 | `/api/lesson1-strategy` | Стратегия реакции |
| S1 | Урок 2 | `/api/lesson2-strategy` | Телесная стратегия |
| S1 | Урок 4 | `/api/lesson4-strategy` | Перехват управления |
| S1 | Урок 5 | `/api/lesson5-synthesis` | Синтез позиции |
| S2 | Урок 1 | `/api/s2-lesson1-strategy` | Факт/триллер/стабилизатор |
| S2 | Урок 2 | `/api/s2-lesson2-strategy` | Анализ S2 |
| S2 | Урок 3 | `/api/s2-lesson3-strategy` | Анализ S2 |
| S2 | Урок 4 | `/api/s2-lesson4-strategy` | Анализ S2 |
| S2 | Урок 5 | `/api/s2-lesson5-synthesis` | Итоговый синтез S2 |

### 6.3. Функция запроса к ИИ

```javascript
async function apiPostLocal(endpoint, bodyData, timeoutMs = 15000) {
  var baseUrl = window.API_BASE || '';
  var targetUrl = endpoint.startsWith('http') ? endpoint : (baseUrl + endpoint);
  
  var controller = new AbortController();
  var timer = setTimeout(function(){ controller.abort(); }, timeoutMs);

  try {
    var response = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(bodyData),
      signal: controller.signal
    });
    clearTimeout(timer);
    if (!response.ok) throw new Error("HTTP " + response.status);
    return await response.json();
  } catch (err) {
    clearTimeout(timer);
    // FALLBACK на Amvera
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
```

### 6.4. ⚠️ FALLBACK: КОГДА СВЯЗИ С ИИ НЕТ

> **КРИТИЧНО:** Если ИИ недоступен — пользователь НЕ ДОЛЖЕН видеть ошибку. Показывается **заранее подготовленный ответ**.

```javascript
} catch(err) {
  console.error(err);
  // Через 1.5с показываем заглушку — пользователь не заметит разницы
  setTimeout(function() {
    renderResults({
      fact: "Камера зафиксировала: человек пришел, прошел на кухню...",
      thriller: "Мозг рисует: он охладел, мы расстаемся...",
      stabilizer: "Прямо сейчас мне ничего не угрожает..."
    });
  }, 1500);
}
```

**Правила fallback-ответов для каждого урока:**

| Что | Требование |
|---|---|
| **Формат** | Точно такой же JSON, как от ИИ — `renderResults()` не должна различать |
| **Задержка** | 1–2 секунды (`setTimeout`) — имитирует «анализ» |
| **Качество текста** | Осмысленный, психологически корректный текст (не "Lorem ipsum") |
| **Кол-во** | Минимум 1 fallback-объект на каждый endpoint |
| **Хранение** | Текст fallback прописан **прямо в клиентском JS**, в блоке `catch` |
| **Попытки** | Fallback **расходует** попытку (attempts--) — это честно |

---

## 📱 7. BOTTOM DRAWER — НАВИГАЦИЯ ПО КУРСУ

### 7.1. Открытие

```html
<button class="nav-glass-tinted-btn" onclick="openNavDrawer()">
  🧭 Навигация по курсу
</button>
```

### 7.2. Структура HTML

```html
<div id="navDrawerOverlay" onclick="handleDrawerBackdropClick(event)">
  <div id="navDrawerBackdrop"></div>
  <div id="navDrawerPanel">
    <div class="drawer-handle" onclick="closeNavDrawer()"></div>
    <div class="drawer-header">
      <div class="drawer-title">🧭 Навигация по курсу</div>
      <button class="drawer-close-btn" onclick="closeNavDrawer()">✕</button>
    </div>
    <div class="drawer-content">
      <!-- Блок уроков -->
      <div class="drawer-section-label">Уроки курса</div>
      <div class="drawer-list">
        <a class="drawer-item active-current" onclick="navigateFromDrawer('XX_lesson1.html')">
          <div class="drawer-item-left">
            <div class="drawer-item-num">1</div>
            <div class="drawer-item-info">
              <div class="drawer-item-name">Название урока</div>
              <div class="drawer-item-sub">Подзаголовок</div>
            </div>
          </div>
          <span class="drawer-item-tag">Вы здесь</span>
        </a>
        <!-- ... остальные уроки ... -->
      </div>

      <!-- Блок бонусов -->
      <div class="drawer-section-label">Бонусы и разбор</div>
      <div class="drawer-list">
        <a class="drawer-item" onclick="navigateFromDrawer('XX_bonuses.html')">
          <!-- ... -->
          <span class="drawer-item-tag bonus">4 бонуса</span>
        </a>
      </div>
    </div>
  </div>
</div>
```

### 7.3. CSS-стили дравера (ключевые)

| Свойство | Значение |
|---|---|
| **Overlay** | `position:fixed; z-index:999999; backdrop-filter:blur(8px)` |
| **Panel** | `position:fixed; bottom:0; border-radius:28px 28px 0 0; max-height:82dvh` |
| **Анимация** | `transform:translateY(120%) → translateY(0)` за 0.32s `cubic-bezier(0.16,1,0.3,1)` |
| **Handle** | 44×4px, `rgba(31,46,53,0.2)`, `border-radius:999px` |
| **Блокировка скролла** | `document.body.style.overflow = 'hidden'` при открытии |
| **Haptic** | `safeHaptic('medium')` при открытии, `safeHaptic('selection')` при закрытии |

### 7.4. JS-функции дравера

```javascript
window.openNavDrawer = function() {
  safeHaptic('medium');
  var overlay = document.getElementById('navDrawerOverlay');
  overlay.style.display = 'block';
  void overlay.offsetHeight; // force reflow
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
};

window.closeNavDrawer = function() {
  safeHaptic('selection');
  var overlay = document.getElementById('navDrawerOverlay');
  overlay.classList.remove('active');
  setTimeout(function() {
    if (!overlay.classList.contains('active')) overlay.style.display = 'none';
  }, 320);
  document.body.style.overflow = '';
};

window.navigateFromDrawer = function(targetUrl) {
  safeHaptic('selection');
  closeNavDrawer();
  openScreen(targetUrl);  // или notibot.openArticle(id)
};
```

---

## 🔘 8. КНОПКИ И CTA

### 8.1. Типы кнопок

| Класс | Использование | Пример |
|---|---|---|
| `primary-btn` | Основное действие | «Заполнить чек-лист ➔», «Перейти к уроку X →» |
| `primary-btn pulse` | Акцентное действие с пульсацией | «Отправить на анализ ➔» |
| `secondary-btn` | Вторичное действие | «📥 Скачать Чек-лист» |
| `nav-glass-tinted-btn` | Навигация, стекло | «🧭 Навигация по курсу» |
| `next-lesson-btn` | Кнопка «следующий урок» в header | «Следующий урок →» |
| `top-nav-btn` | Возврат к видео | «← Назад к видеоуроку» |

### 8.2. Расположение кнопок

```
ЭКРАН 1 (видео):
  ├── Header: [🧭 Навигация] [Следующий урок →]
  ├── Инсайт-карточка:
  │     ├── [📥 Скачать Чек-лист] — secondary
  │     └── [Заполнить чек-лист ➔] — primary + pulse
  └── Footer: [Перейти к уроку X+1 →] — primary + pulse, 100% ширины

ЭКРАН 2 (практика):
  ├── [← Назад к видеоуроку] — top-nav-btn
  ├── [Отправить на анализ ➔] — primary + pulse (внутри карточки)
  └── [Перейти к уроку X+1 →] — primary, 100% ширины
       (появляется через 3 сек с анимацией)
```

### 8.3. Кнопка «Следующий урок» — отложенное появление

```javascript
function revealNextLessonBtn() {
  var btn = document.getElementById('nextLessonBlock');
  if (btn) {
    btn.style.display = 'block';
    requestAnimationFrame(function() {
      btn.style.opacity = '1';
      btn.style.transform = 'translateY(0)';
    });
  }
}

// Появляется через 3 секунды на Экране 2
setTimeout(revealNextLessonBtn, 3000);
```

---

## 🎨 9. ПАЛИТРА И СТИЛИ

### 9.1. CSS-переменные (обязательные)

```css
:root {
  --nb-bg: #F3F6F5;
  --nb-text: #243139;
  --nb-text-2: #68767C;
  --nb-accent: #7F9B8E;
  --nb-deep: #243139;
  --nb-sea: #45656D;
  --nb-line: rgba(14, 31, 46, 0.10);
  --nb-gold: #C8B28F;
  --danger: #B42318;
  --warning: #B7791F;
  --success: #2F7D59;
}
```

### 9.2. Фирменные элементы

| Элемент | Описание |
|---|---|
| **Фон** | `#E8EDE7` — приглушённый тёплый серо-зелёный |
| **Фоновый арт** | `#maisonArtBackground` — base64 текстура, `position:fixed; z-index:0` |
| **Карточки** | `.glass.card` — стеклянные, белые, `backdrop-filter:blur`, `border-radius` |
| **Шрифт** | Inter (400–900), через Google Fonts CDN |
| **Заголовки** | **Всегда `text-align: center`** (Правило 7) |
| **Иконки** | Emoji-символы (🧭 💡 📥 📷 🎬 🧘 🎁 ⭐) — не требуют CDN |

---

## 🔐 10. БЕЗОПАСНОСТЬ

### 10.1. Content Security Policy

```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://list.notibot.ru
             https://telegram.org https://kinescope.io https://*.kinescope.io;
  frame-src 'self' https://kinescope.io https://*.kinescope.io;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: https:;
  connect-src 'self' https: http://localhost:3000;
" />
```

### 10.2. Запрет утечки ключей
- **НИКАКИХ** API-ключей в клиентском коде (Правило 14)
- Все запросы к ИИ — через прокси Amvera (`process.env.POLZA_API_KEY`)
- Fallback-ответы **НЕ** содержат секретов

---

## 📲 11. NOTIBOT SDK

### 11.1. Инициализация (в `<head>`)

```html
<script src="https://telegram.org/js/telegram-web-app.js"></script>
<script src="https://list.notibot.ru/notibot-bridge.js"></script>
<script>
  // Early Interceptor
  window.notibotInitData = null;
  window.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'NOTIBOT_INIT' && event.data.data) {
      window.notibotInitData = event.data.data;
    }
  });
</script>
<script>
  // Fallback Inlined Notibot Bridge if standalone
  if (!window.notibot) {
    // ... (полный fallback NotibotBridge класс)
  }
</script>
```

### 11.2. Навигация между статьями

```javascript
function openScreen(filename) {
  // Каскад: notibot.openArticle → fallback → прямой URL
  var articleIds = {
    '16_lesson1.html': '5hR7Av3us4aIKmTZr7b6J2',
    '17_lesson2.html': '2NvyoluAQiidfuwZTClFNy',
    // ... все article ID
  };

  var id = articleIds[filename];
  if (id && window.notibot && window.notibot.openArticle) {
    window.notibot.openArticle(id);
  } else {
    window.location.href = filename;
  }
}
```

### 11.3. safeHaptic()

```javascript
function safeHaptic(style) {
  try {
    if (window.notibot) {
      if (style === 'selection') window.notibot.hapticSelection();
      else if (style === 'success') window.notibot.hapticNotification('success');
      else if (style === 'error') window.notibot.hapticNotification('error');
      else window.notibot.hapticImpact(style || 'medium');
    }
  } catch(e) {}
}
```

---

## ✅ 12. ЧЕКЛИСТ ДЛЯ ТЗ (АТЛАНТ)

Каждое ТЗ на урок **ОБЯЗАНО** включать или ссылаться на этот стандарт по следующим пунктам:

- [ ] **Header Bar** с навигацией и прогресс-баром (§2)
- [ ] **Video Wrapper** с конкретным Kinescope ID (§3)
- [ ] **Инсайт-карточка** с текстом и кнопками (§1)
- [ ] **Интерактивная практика** — типы шагов и шкалы (§5)
- [ ] **AI Endpoint** — конкретный путь `/api/...` (§6.2)
- [ ] **Fallback-ответ** — текст заглушки при отсутствии ИИ (§6.4)
- [ ] **Notibot Article ID** для навигации (§11.2)
- [ ] **Bottom Drawer** — список уроков сценария + бонусы (§7)
- [ ] **CTA кнопки** — текст и целевой файл (§8)
- [ ] **pauseVideo()** вызывается перед практикой (§3.2)

---

## 📎 ССЫЛКА ДЛЯ ВКЛЮЧЕНИЯ В ТЗ

При создании ТЗ Атлант может написать:

> Дизайн и расположение элементов — строго по `baza/DESIGN_STANDARD.md`

Или ссылаться на конкретные секции:

> Навигационный drawer — по §7 из `baza/DESIGN_STANDARD.md`  
> Правила fallback ИИ — по §6.4 из `baza/DESIGN_STANDARD.md`

---

*Версия: 1.0 | Дата: 29.08.2026 | Автор: Кодер 2.0 на основе эталонных файлов S1*
