/**
 * Telegram & Notibot Real-Time Personalization Engine
 * Automatically extracts user name & avatar from Telegram WebApp, Notibot Bridge SDK, URL params, or LocalStorage.
 */
(function() {
  function getUrlParam(param) {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get(param);
    } catch (e) {
      return null;
    }
  }

  function extractTelegramUser() {
    // 1. Telegram WebApp
    try {
      if (window.Telegram && window.Telegram.WebApp) {
        if (typeof window.Telegram.WebApp.ready === 'function') {
          window.Telegram.WebApp.ready();
          window.Telegram.WebApp.expand();
        }
        if (window.Telegram.WebApp.initDataUnsafe && window.Telegram.WebApp.initDataUnsafe.user) {
          return window.Telegram.WebApp.initDataUnsafe.user;
        }
      }
    } catch (e) {}

    // 2. Notibot Init Data (via postMessage)
    try {
      if (window.notibotInitData && window.notibotInitData.user) {
        return window.notibotInitData.user;
      }
    } catch (e) {}

    // 3. Notibot global bridge object
    try {
      if (window.notibot && window.notibot.user) {
        return window.notibot.user;
      }
    } catch (e) {}

    // 4. URL Search Query (?name=... or ?first_name=... or ?user=...)
    try {
      const qName = getUrlParam('first_name') || getUrlParam('name') || getUrlParam('user');
      if (qName) {
        return { first_name: decodeURIComponent(qName) };
      }
    } catch (e) {}

    // 5. LocalStorage Cache
    try {
      const cached = localStorage.getItem('psy_user_data');
      if (cached) {
        return JSON.parse(cached);
      }
      const cachedName = localStorage.getItem('psy_user_name');
      if (cachedName) {
        return { first_name: cachedName };
      }
    } catch (e) {}

    return null;
  }

  function applyPersonalization(user) {
    user = user || extractTelegramUser();

    let firstName = '';
    let photoUrl = '';

    if (user) {
      firstName = user.first_name || user.firstName || user.name || user.username || '';
      photoUrl = user.photo_url || user.photoURL || user.avatar_url || user.avatarUrl || '';
      try {
        localStorage.setItem('psy_user_data', JSON.stringify(user));
        if (firstName) localStorage.setItem('psy_user_name', firstName);
      } catch (e) {}
    }

    firstName = String(firstName || '').trim().split(/\s+/)[0];

    // Update Greeting in Header
    const greetingEl = document.getElementById('userGreeting');
    if (greetingEl) {
      greetingEl.textContent = firstName ? `Привет, ${firstName}!` : 'Привет!';
    }

    // Update Avatar in Header
    const avatarEl = document.getElementById('userAvatar');
    if (avatarEl) {
      avatarEl.innerHTML = '';
      if (photoUrl) {
        const img = document.createElement('img');
        img.src = photoUrl;
        img.alt = firstName || 'Avatar';
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        img.style.borderRadius = '9999px';
        img.onerror = function() {
          avatarEl.innerHTML = '';
          avatarEl.textContent = firstName ? firstName.charAt(0).toUpperCase() : '?';
        };
        avatarEl.appendChild(img);
      } else {
        avatarEl.textContent = firstName ? firstName.charAt(0).toUpperCase() : '?';
      }
    }

    // Optional personalization elements with data-user-name
    document.querySelectorAll('[data-user-name]').forEach(el => {
      el.textContent = firstName || el.getAttribute('data-default') || 'Участник';
    });

    window.currentUser = user || (firstName ? { first_name: firstName } : null);
    window.currentUserName = firstName || 'Участник';
  }

  // Initialize immediately & on events
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => applyPersonalization());
  } else {
    applyPersonalization();
  }

  // Listen for Notibot async initialization
  window.addEventListener('message', function(event) {
    if (event.data && (event.data.type === 'NOTIBOT_INIT' || event.data.type === 'NOTIBOT_READY')) {
      if (event.data.data && event.data.data.user) {
        window.notibotInitData = event.data.data;
        applyPersonalization(event.data.data.user);
      }
    }
  });

  window.applyPersonalization = applyPersonalization;
  window.extractTelegramUser = extractTelegramUser;
})();
