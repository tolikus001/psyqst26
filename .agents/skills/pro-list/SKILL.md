---
name: Список Про (Premium Icon List)
description: Создание стильных структурированных списков с иконками Lucide или кастомными CSS-маркерами для блоков результатов, преимуществ или болей.
---

# 💎 Список Про (Premium Icon List)

Этот скил используется, когда пользователь просит сделать красивый список, список про, список с иконками, показать результаты мастер-класса, перечислить боли или преимущества в премиальном стиле.

---

## 🔍 Триггеры для вызова скила
Реагируй на запросы, содержащие слова:
`список про`, `pro-list`, `список с иконками`, `красивый список`, `список результатов`, `список преимуществ`, `перечень болей`.

---

## 📐 Правила проектирования списков

1. **Изоляция контента**:
   - Данные для списка выносятся в массив объектов (например, в начале файла компонента), чтобы разметка была чистой и легко изменяемой.
   
2. **Адаптивная верстка (Tailwind)**:
   - Элемент списка должен быть флекс-контейнером с выравниванием по верхнему краю: `flex items-start gap-4`.
   - **Критически важно**: для контейнера иконки задавать `flex-shrink-0` (или `shrink-0`), чтобы при длинном тексте иконка не сжималась и оставалась круглой/квадратной.
   - Отступы между элементами должны быть свободными (например, `gap-y-4` для родительского контейнера или разделение через пунктирный бордер).

3. **Использование темы**:
   - Цвета иконок должны быть привязаны к акцентным переменным темы: `var(--color-accent)`.

---

## 🎨 Шаблоны реализации

### Вариант 1: Список на Lucide-иконках (Рекомендуемый)
Используется для списков результатов или преимуществ:

```javascript
// Данные списка
const resultsData = [
  {
    title: '3 действия вместо списка на 100 задач',
    desc: 'Поймёте, с чего начать, чтобы не пытаться чинить весь бизнес сразу.',
    icon: 'gem'
  },
  {
    title: 'Идеи для допродаж',
    desc: 'Увидите, что можно добавить к заказу, чтобы поднять чек без давления.',
    icon: 'sparkles'
  }
];

// Генерация разметки
export function renderResultsList() {
  const listItems = resultsData.map((item, index) => `
    <div class="flex items-start gap-4">
      <!-- Иконка с фиксированным размером и защитой от сжатия -->
      <div class="w-8 h-8 rounded-lg bg-[var(--color-surface)] flex items-center justify-center shrink-0 text-[var(--color-accent)]">
        <i data-lucide="${item.icon}" class="w-4 h-4"></i>
      </div>
      
      <!-- Текст -->
      <div class="flex-1 min-w-0">
        <h4 class="text-sm font-semibold text-[var(--color-text)] mb-1">${item.title}</h4>
        <p class="text-xs text-[var(--color-muted)] leading-relaxed">${item.desc}</p>
      </div>
    </div>
    
    ${index < resultsData.length - 1 ? '<div class="h-px bg-[var(--color-border)] my-4 border-dashed"></div>' : ''}
  `).join('');

  return `
    <div class="card p-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl flex flex-col gap-1">
      ${listItems}
    </div>
  `;
}
```

### Вариант 2: Список на CSS-маркерах (Стиль Ромбик ♦)
Используется для компактных списков, например программы дней или буллетов:

```javascript
// Данные списка
const programBullets = [
  'Список допродаж, которые можно внедрить в шарах',
  'Примеры, как предлагать допродажу в переписке',
  'Схема "3 варианта предложения": базовый, красивый, вау'
];

export function renderProgramBullets() {
  const itemsHtml = programBullets.map(bullet => `
    <li class="relative pl-5 text-sm text-[var(--color-muted)] leading-relaxed before:content-['♦'] before:absolute before:left-0 before:text-[var(--color-accent)] before:text-[10px] before:top-0.5">
      ${bullet}
    </li>
  `).join('');

  return `
    <ul class="flex flex-col gap-2.5 list-none pl-1">
      ${itemsHtml}
    </ul>
  `;
}
```

---

## 🛠️ Чек-лист для Агента:
1. [ ] Вы импортировали и вызвали `initIcons()` после вставки списка в DOM (для Lucide иконок)?
2. [ ] У иконки прописан класс `shrink-0` или `flex-shrink-0`?
3. [ ] Расстояние между иконкой и текстом не зажато (используется `gap-3` или `gap-4`)?
4. [ ] Разделители выполнены полупрозрачными линиями (`border-dashed` или `bg-[var(--color-border)]`)?
