// js/app.js
// Главная точка входа приложения.
// Здесь импортируются и собираются все компоненты.

import { initIcons } from './utils.js';

// Импортируй компоненты по мере их создания:
// import { renderHeader }   from './components/header.js';
// import { renderQuiz }     from './components/quiz.js';
// import { renderLanding }  from './components/landing.js';

/**
 * Инициализация и рендер приложения.
 */
function initApp() {
  const appEl = document.getElementById('app');

  appEl.innerHTML = `
    <main class="max-w-xl mx-auto px-6 pt-8 pb-8 safe-top safe-bottom fade-in">
      <h1 class="text-2xl font-bold mb-2">My Vibe App</h1>
      <p style="color: var(--color-muted)" class="text-sm">
        Проект готов. Попроси агента создать что угодно — квиз, лендинг, игру…
      </p>
    </main>
  `;

  initIcons();
}

// Запуск
initApp();
