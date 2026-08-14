---
name: Всплывашка (Bottom Drawer / Sheet)
description: Создание мобильных выдвижных панелей (bottom sheets) снизу экрана с блокировкой скролла и виброоткликом Notibot.
---

# 📱 Всплывашка (Bottom Drawer / Sheet)

Этот скил используется, когда пользователь просит добавить всплывашку, шторку, bottom sheet, выдвижную панель, подробное описание по клику или мобильный попап.

---

## 🔍 Триггеры для вызова скила
Реагируй на запросы, содержащие слова:
`всплывашка`, `шторка`, `bottom sheet`, `drawer`, `выдвижная панель`, `попап снизу`, `выезжающее окно`, `показать подробнее в попапе`.

---

## 📐 Архитектура и Правила

1. **Компонентная структура**:
   - Каждая всплывашка выносится в отдельный файл в папке `js/components/` (например, `js/components/detail-drawer.js`).
   - Функция рендера должна принимать объект с данными и возвращать HTML-строку или DOM-элемент.
   
2. **Лимит строк**:
   - Сам компонент всплывашки должен быть компактным (до 150 строк).

3. **Связь с Notibot (Виброотклик)**:
   - **ОБЯЗАТЕЛЬНО** вызывать легкую или среднюю вибрацию при открытии:
     ```javascript
     if (window.notibot?.hapticImpact) {
       window.notibot.hapticImpact('medium');
     }
     ```
   - **ОБЯЗАТЕЛЬНО** вызывать селекторный отклик при закрытии:
     ```javascript
     if (window.notibot?.hapticSelection) {
       window.notibot.hapticSelection();
     }
     ```

---

## 🎨 Стандартная верстка (Tailwind + CSS)

### 1. HTML структура компонента
Добавь структуру в HTML-код компонента:
```javascript
export function renderDetailDrawer({ title, content, buttonText, onAction }) {
  return `
    <div id="drawer-container" class="fixed inset-0 z-50 invisible transition-all duration-300">
      <!-- Бэкдроп (затемнение фона) -->
      <div id="drawer-backdrop" class="absolute inset-0 bg-black/40 backdrop-blur-sm opacity-0 transition-opacity duration-300"></div>
      
      <!-- Панель шторки -->
      <div id="drawer-panel" class="absolute bottom-0 left-0 right-0 max-w-xl mx-auto bg-[var(--color-bg)] rounded-t-3xl border-t border-[var(--color-border)] p-6 shadow-2xl translate-y-full transition-transform duration-300 flex flex-col max-h-[85vh]">
        
        <!-- Хэндл перетаскивания (визуальный) -->
        <div class="w-12 h-1 bg-[var(--color-border)] rounded-full mx-auto mb-4 cursor-pointer"></div>
        
        <!-- Кнопка закрытия -->
        <button id="drawer-close" class="absolute top-4 right-4 p-2 rounded-full hover:bg-[var(--color-surface)] text-[var(--color-muted)] transition-colors">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>

        <!-- Заголовок и Скроллируемый Контент -->
        <div class="overflow-y-auto pr-1 flex-1">
          <h3 class="text-xl font-bold mb-3 pr-8 text-[var(--color-text)]">${title}</h3>
          <div class="text-[var(--color-muted)] text-sm space-y-3 leading-relaxed">
            ${content}
          </div>
        </div>

        <!-- Кнопка действия (Sticky Footer) -->
        ${buttonText ? `
          <div class="pt-4 mt-4 border-t border-[var(--color-border)]">
            <button id="drawer-action-btn" class="btn-primary w-full py-3.5 bg-[var(--color-accent)] text-white font-semibold rounded-xl btn-press">
              ${buttonText}
            </button>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}
```

### 2. Добавь стили в `css/styles.css` (если они еще не добавлены)
Если требуется кастомная стилизация, используй:
```css
/* Классы управления состоянием шторки */
.drawer-visible {
  visibility: visible !important;
}
.drawer-visible #drawer-backdrop {
  opacity: 1;
}
.drawer-visible #drawer-panel {
  transform: translateY(0);
}
```

---

## ⚙️ JS Логика управления (Поведение)

При подключении обработчиков убедись в правильной работе:
1. **Блокировка прокрутки body** при открытии (чтобы не прокручивался основной сайт под попапом).
2. **Очистка иконок** через `initIcons()` после рендера.

**Пример реализации логики управления:**
```javascript
import { initIcons } from '../utils.js';

export function setupDrawerBehavior(containerEl, onActionCallback) {
  const backdrop = containerEl.querySelector('#drawer-backdrop');
  const closeBtn = containerEl.querySelector('#drawer-close');
  const actionBtn = containerEl.querySelector('#drawer-action-btn');
  
  const openDrawer = () => {
    containerEl.classList.add('drawer-visible');
    document.body.style.overflow = 'hidden'; // Лочим скролл страницы
    if (window.notibot) window.notibot.hapticImpact?.('medium');
  };

  const closeDrawer = () => {
    containerEl.classList.remove('drawer-visible');
    document.body.style.overflow = ''; // Разлочиваем скролл
    if (window.notibot) window.notibot.hapticSelection?.();
  };

  // Слушатели событий
  backdrop.addEventListener('click', closeDrawer);
  closeBtn.addEventListener('click', closeDrawer);
  
  if (actionBtn && onActionCallback) {
    actionBtn.addEventListener('click', () => {
      if (window.notibot) window.notibot.hapticImpact?.('light');
      onActionCallback();
      closeDrawer();
    });
  }

  // Отрисовываем иконки Lucide внутри попапа
  initIcons();

  return { open: openDrawer, close: closeDrawer };
}
```
