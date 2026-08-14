---
name: Notibot Bridge Integration & Form Debugging Guide
description: Инструкция по подключению Notibot Bridge SDK, обработке ошибок NotibotBridgeError и отладке форм.
---

# Скилл: Подключение Notibot Bridge и интеграция форм

> [!IMPORTANT]
> Этот скилл содержит правила инициализации Notibot Bridge SDK и работы с формами Notibot.
> Прочитайте его полностью перед созданием файлов `bridge.js` или компонентов приложения.

---

## 🔒 Шаг 1. Локальное подключение SDK (Content Security Policy)

Для обхода ограничений безопасности (директива CSP `script-src 'self'`) и обеспечения автономности мы подключаем Notibot Bridge SDK как локальный ресурс.

Открой `index.html` и добавь строку **синхронно** в `<head>`, **до любых других скриптов**:

```html
<!-- Notibot Bridge — СИНХРОННО, локальный файл, без defer/async -->
<script src="./js/notibot-bridge.js"></script>
```

Найди в `index.html` комментарий `💡 Notibot Bridge подключается здесь` и замени его на строку выше.

> [!WARNING]
> Никогда не подключай Bridge через `import`, `defer` или `async`, и не используй внешние CDN (они блокируются CSP).
> Только синхронный локальный `<script>` в `<head>`. Иначе приложение пропустит первое сообщение `NOTIBOT_INIT` и зависнет на загрузке.

---

## 🛠️ Шаг 2. Создание единого моста `js/bridge.js`

Создай файл `js/bridge.js`. Это должно быть **единственное место** в проекте, где происходит обращение к `window.notibot`.
Здесь мы инициализируем мост, настраиваем тему и оборачиваем метод отправки форм в безопасный промис с таймаутом в 10 секунд.

```javascript
// js/bridge.js
// Все вызовы Notibot Bridge — только отсюда.

let _state = { user: null, app: null, colors: null };
const _listeners = [];

/**
 * Инициализация Bridge. Вызывается один раз из app.js.
 * @param {Function} onReady — коллбэк { user, app, colors }
 */
export function initBridge(onReady) {
  if (!window.notibot) {
    console.error("Notibot Bridge SDK не найден на странице!");
    return;
  }

  window.notibot.onUpdate(function(user, app) {
    _state = { user, app, colors: app.colors };
    _applyTheme(_state.colors);

    if (onReady) {
      onReady(_state);
      onReady = null; // Вызываем onReady только один раз при инициализации
    }
    _listeners.forEach(fn => fn(_state));
  });
}

/** Подписаться на обновления (баланс, тема) */
export function onStateUpdate(fn) { _listeners.push(fn); }

/** Текущее состояние */
export function getState() { return _state; }

// Навигация
export function goToProduct(id)   { id ? window.notibot.openProduct(id)  : window.notibot.openStorefront(); }
export function goToArticle(id)   { id ? window.notibot.openArticle(id)  : window.notibot.openStorefront(); }
export function goToStorefront()  { window.notibot.openStorefront(); }
export function goToUserCard()    { window.notibot.openUserCard(); }

/**
 * Отправить форму с поддержкой таймаута
 * @param {string} formId — ID формы из схемы
 * @param {Array} answers — массив ответов
 */
export async function submitForm(formId, answers) {
  if (window.notibot && typeof window.notibot.submitForm === 'function') {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new window.NotibotBridgeError({
          origin: 'client',
          code: 'ERR_RATE_LIMIT',
          message: 'Превышено время ожидания ответа от Notibot (10 сек)'
        }));
      }, 10000);

      window.notibot.submitForm(formId, answers)
        .then((res) => {
          clearTimeout(timeout);
          resolve(res);
        })
        .catch((err) => {
          clearTimeout(timeout);
          reject(err); // err является экземпляром NotibotBridgeError
        });
    });
  }
  console.log("Mock submitForm call (вне Notibot):", formId, answers);
  return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 800));
}

// Тема
function _applyTheme(colors) {
  if (!colors) return;
  const r = document.documentElement;
  r.style.setProperty('--color-bg',     colors.background);
  r.style.setProperty('--color-text',   colors.textPrimary);
  r.style.setProperty('--color-muted',  colors.textSecondary);
  r.style.setProperty('--color-accent', colors.primaryMain);
  document.body.style.backgroundColor = colors.background;
  document.body.style.color           = colors.textPrimary;
}
```

---

## 📊 Шаг 3. Правила валидации схемы и отправки ответов

При отправке ответов формы бэкенд Notibot проверяет структуру полей на соответствие JSON-схеме формы.

### 3.1. Строгое совпадение названий вопросов
Поля ответов (`title`) должны **символ в символ** совпадать с заголовками вопросов из схемы на сервере.
* Остерегайтесь пробелов! Если на сервере поле называется `"Телефон "` (с пробелом на конце), отправка ключа `"Телефон"` приведет к ошибке валидации.

### 3.2. Заполнение необязательных полей
Если поле не является обязательным (`required: false`) и пользователь его не заполнил:
* **Правильно**: Отправлять пустой массив в значении ответов:
  ```javascript
  { title: "Имя", answers: name ? [name] : [] }
  ```
* **Неправильно**: Отправлять пустую строку `answers: [""]` или передавать `undefined`. Это приведет к ошибке формата данных на бэкенде.

---

## 📝 Шаг 4. Обработка ошибок и вывод в UI для отладки

### 4.1. Использование `NotibotBridgeError`
Метод `submitForm` отклоняет промис объектом `NotibotBridgeError`. Он содержит свойства:
* `message` — текст сообщения об ошибке;
* `code` — строковый код ошибки (`ERR_RATE_LIMIT`, `ERR_VALIDATION_FAILED`, `ERR_NOT_FOUND`, `ERR_NO_PARENT`, `ERR_INVALID_PAYLOAD`);
* `origin` — источник ошибки (`client` | `bridge` | `server`);
* `details` — детальные ошибки валидации полей от сервера (если есть).

### 4.2. Обязательный вывод ошибок в интерфейс
> [!IMPORTANT]
> При работе приложения внутри Mini App консоль разработчика (`console.error`) недоступна. Любые скрытые ошибки усложняют поиск проблем.
> **ОБЯЗАТЕЛЬНО** создавайте элемент вывода ошибок в форме и наполняйте его через безопасный `textContent` (для защиты от XSS).

**Пример отправщика в компоненте формы:**

```javascript
async function handleFormSubmit() {
  const formId = "65cd1efbc1b29a0012f45abc";
  const answers = [
    { title: "Ваш Email", answers: [document.getElementById('email').value] }
  ];

  const errorBox = document.getElementById('error-box');
  errorBox.classList.add('hidden');

  try {
    const result = await submitForm(formId, answers);
    console.log("Успешно отправлено:", result);
    // Скрываем форму, показываем сообщение об успехе
  } catch (error) {
    console.error("Ошибка формы:", error);
    errorBox.classList.remove('hidden');

    // Классификация ошибок
    if (error.code === 'ERR_RATE_LIMIT') {
      errorBox.textContent = "Слишком частые запросы. Пожалуйста, подождите.";
    } else if (error.code === 'ERR_VALIDATION_FAILED') {
      errorBox.textContent = `Ошибка валидации: ${error.message}`;
      if (error.details) {
        console.log("Детали ошибок валидации:", error.details);
      }
    } else {
      errorBox.textContent = `Не удалось отправить: ${error.message}`;
    }
  }
}
```

---

## ⏳ Шаг 5. Обновление app.js (Экран загрузки)

Оберни `initApp` в `initBridge` вместо прямого запуска:

```javascript
// js/app.js
import { initBridge } from './bridge.js';

initBridge(function(state) {
  initApp(state); // state содержит { user, app, colors }
});

function initApp(state) {
  // Скрываем лоадер и рендерим приложение
  const loadingEl = document.getElementById('loading');
  if (loadingEl) loadingEl.style.display = 'none';

  const appEl = document.getElementById('app');
  appEl.innerHTML = `
    <main class="max-w-xl mx-auto px-6 pt-8 pb-8 safe-top safe-bottom fade-in">
      <h1 class="text-2xl font-bold mb-2">Привет, \${state.user.displayName || 'гость'}!</h1>
      <p style="color: var(--color-muted)" class="text-sm">Баланс: \${state.user.balance} монет</p>
    </main>
  `;
}
```

Добавь в `index.html` лоадер-экран:
```html
<div id="loading" class="loader-screen">
  <div class="loader-spinner"></div>
</div>
```

И стили в `css/styles.css`:
```css
.loader-screen {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  display: flex; align-items: center; justify-content: center;
  background-color: var(--color-bg, #ffffff); z-index: 9999;
}
.loader-spinner {
  width: 32px; height: 32px; border-radius: 50%;
  border: 3px solid rgba(128,128,128,0.2);
  border-top-color: var(--color-accent, #007aff);
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
```

---

## 📚 Шаг 6. Чеклист после интеграции

- [x] SDK скопирован локально в `js/notibot-bridge.js`.
- [ ] Скрипт подключен в `index.html` синхронно в `<head>` перед остальными скриптами.
- [ ] Все вызовы `window.notibot.*` происходят только внутри файла `js/bridge.js`.
- [ ] Все формы обрабатывают ошибки через `NotibotBridgeError` и выводят их пользователю в UI с помощью `textContent`.
- [ ] Необязательные незаполненные поля отправляются как `[]`, а не как `[""]` или `undefined`.
- [ ] В приложении есть лоадер-экран, скрываемый после инициализации моста.

---

## 📖 Полная справка по методам
Подробный список всех свойств, форматов и параметров доступен в файле [`SDK-reference.md`](./SDK-reference.md).
