// js/config.js
// Публичные настройки приложения.
// ⛔ НИКОГДА не хранить здесь API-ключи, токены или пароли.

export const CONFIG = {
  // Название приложения
  appName: 'My Vibe App',

  // Настройки UI
  ui: {
    maxWidth:       'max-w-xl',   // ширина контента (Desktop)
    defaultPadding: 'px-6 pt-8', // отступы (Mobile)
  },

  // Место для публичных ID (например, ID товаров из Notibot)
  // Заполняется при подключении Notibot Bridge
  ids: {},
};
