// js/utils.js
// Переиспользуемые вспомогательные функции.
// Перед созданием новой функции — проверь, нет ли похожей здесь.

/**
 * Создать DOM-элемент из HTML-строки.
 * @param {string} html
 * @returns {HTMLElement}
 */
export function createElement(html) {
  const template = document.createElement('template');
  template.innerHTML = html.trim(); // safe: html аргумент — шаблон из компонента, не данные пользователя
  return template.content.firstChild;
}

/**
 * Безопасно экранировать HTML (защита от XSS).
 * Используй при вставке пользовательских данных в разметку.
 * @param {string} str
 * @returns {string}
 */
export function escapeHtml(str) {
  return String(str)
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&#039;');
}

/**
 * Показать элемент (убрать класс hidden).
 * @param {string|HTMLElement} selectorOrEl
 */
export function show(selectorOrEl) {
  const el = typeof selectorOrEl === 'string'
    ? document.querySelector(selectorOrEl)
    : selectorOrEl;
  if (el) el.classList.remove('hidden');
}

/**
 * Скрыть элемент (добавить класс hidden).
 * @param {string|HTMLElement} selectorOrEl
 */
export function hide(selectorOrEl) {
  const el = typeof selectorOrEl === 'string'
    ? document.querySelector(selectorOrEl)
    : selectorOrEl;
  if (el) el.classList.add('hidden');
}

/**
 * Форматировать число как цену (например: 1500 → "1 500 ₽").
 * @param {number} amount
 * @param {string} currency
 * @returns {string}
 */
export function formatPrice(amount, currency = '₽') {
  return `${Number(amount).toLocaleString('ru-RU')} ${currency}`;
}

/**
 * Debounce — отложить выполнение функции.
 * Полезно для предотвращения двойных нажатий.
 * @param {Function} fn
 * @param {number} delay — мс
 * @returns {Function}
 */
export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Инициализировать Lucide иконки после рендера компонентов.
 * Вызывать один раз после добавления HTML в DOM.
 */
export function initIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}
