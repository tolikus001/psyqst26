/**
 * Telegram & Notibot Real-Time Personalization Engine
 * Automatically extracts user name & avatar from Telegram WebApp, Notibot Bridge SDK, URL params, or LocalStorage.
 */
(function() {
  function getInitials(name) {
    if (!name) return '👋';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  function extractTelegramUser() {
    // 1. Notibot Bridge SDK (Global Object)
    try {
      if (window.notibot && window.notibot.user && (window.notibot.user.displayName || window.notibot.user.first_name || window.notibot.user.firstName || window.notibot.user.name)) {
        return window.notibot.user;
      }
    } catch (e) {}

    // 2. Notibot Init Data (via early postMessage)
    try {
      if (window.notibotInitData && window.notibotInitData.user) {
        return window.notibotInitData.user;
      }
    } catch (e) {}

    // 3. Telegram WebApp SDK
    try {
      if (window.Telegram && window.Telegram.WebApp) {
        if (typeof window.Telegram.WebApp.ready === 'function') {
          window.Telegram.WebApp.ready();
          window.Telegram.WebApp.expand();
        }
        if (window.Telegram.WebApp.initDataUnsafe && window.Telegram.WebApp.initDataUnsafe.user) {
          return window.Telegram.WebApp.initDataUnsafe.user;
        }
        if (window.Telegram.WebApp.initData) {
          const params = new URLSearchParams(window.Telegram.WebApp.initData);
          const userStr = params.get('user');
          if (userStr) return JSON.parse(userStr);
        }
      }
    } catch (e) {}

    // 4. URL Params & Hash Fragment (?tgWebAppData=... / #tgWebAppData=... / ?name=... / ?first_name=...)
    try {
      const rawParams = window.location.search + '&' + window.location.hash.replace(/^#/, '');
      const urlParams = new URLSearchParams(rawParams);
      const tgData = urlParams.get('tgWebAppData') || urlParams.get('tgWebAppInitData');
      if (tgData) {
        const parsed = new URLSearchParams(tgData);
        const userJson = parsed.get('user');
        if (userJson) return JSON.parse(userJson);
      }
      const directUser = urlParams.get('user');
      if (directUser) {
        try { return JSON.parse(decodeURIComponent(directUser)); } catch(e) { return { displayName: directUser }; }
      }
      const qName = urlParams.get('displayName') || urlParams.get('first_name') || urlParams.get('name');
      if (qName) {
        return { displayName: decodeURIComponent(qName) };
      }
    } catch (e) {}

    // 5. LocalStorage Cache
    try {
      const cached = localStorage.getItem('psy_user_data');
      if (cached) return JSON.parse(cached);
      const cachedName = localStorage.getItem('psy_user_name');
      if (cachedName) return { displayName: cachedName };
    } catch (e) {}

    return null;
  }

  function applyThemeColors(colors) {
    if (!colors) return;
    const root = document.documentElement;
    if (colors.background) root.style.setProperty('--nb-bg', colors.background);
    if (colors.textPrimary) root.style.setProperty('--nb-text', colors.textPrimary);
    if (colors.textSecondary) root.style.setProperty('--nb-text-2', colors.textSecondary);
    if (colors.primaryMain) root.style.setProperty('--nb-accent', colors.primaryMain);
  }

  function applyPersonalization(user) {
    user = user || extractTelegramUser();
    let rawName = '';
    let photoUrl = '';

    if (user) {
      rawName = user.displayName || user.first_name || user.firstName || user.name || user.username || '';
      photoUrl = user.photoURL || user.photo_url || user.avatar_url || user.avatarUrl || '';
      try {
        localStorage.setItem('psy_user_data', JSON.stringify(user));
        if (rawName) localStorage.setItem('psy_user_name', rawName);
      } catch (e) {}
    }

    const firstName = String(rawName || '').trim().split(/\s+/)[0];
    window.currentUserName = firstName || 'Участник';
    window.currentUser = user || (firstName ? { displayName: firstName, first_name: firstName } : null);

    // Update Greeting in Header (КОДЕР 2.0: "Привет, {Имя}!" или "Привет!")
    const greetingEl = document.getElementById('userGreeting');
    if (greetingEl) {
      greetingEl.textContent = firstName ? `Привет, ${firstName}!` : 'Привет!';
    }

    // Update Avatar in Header (КОДЕР 2.0: аватар с fallback на инициалы)
    const avatarEl = document.getElementById('userAvatar');
    if (avatarEl) {
      if (photoUrl) {
        avatarEl.innerHTML = '<img src="' + photoUrl + '" alt="' + (firstName || 'Avatar') + '" style="width:100%;height:100%;object-fit:cover;border-radius:9999px;" onerror="this.parentNode.setAttribute(\'data-fallback\',\'1\');this.style.display=\'none\';this.parentNode.textContent=\'' + getInitials(firstName) + '\';" />';
      } else {
        avatarEl.textContent = getInitials(firstName);
      }
    }

    // Optional personalization elements with data-user-name
    document.querySelectorAll('[data-user-name]').forEach(el => {
      el.textContent = firstName || el.getAttribute('data-default') || 'Участник';
    });
  }

  function handleNotibotInit(user, app) {
    if (app && app.colors) applyThemeColors(app.colors);
    applyPersonalization(user);
  }

  // Subscribe to Notibot Bridge
  if (window.notibot && typeof window.notibot.onUpdate === 'function') {
    window.notibot.onUpdate(handleNotibotInit);
    if (window.notibotInitData) {
      handleNotibotInit(window.notibotInitData.user, window.notibotInitData.app);
    } else if (window.notibot.app && Object.keys(window.notibot.app).length > 0) {
      handleNotibotInit(window.notibot.user, window.notibot.app);
    }
  }

  // Initialize immediately & on events
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => applyPersonalization());
  } else {
    applyPersonalization();
  }

  // Periodic check for async Telegram/Notibot init
  let pollAttempts = 0;
  const pollTimer = setInterval(() => {
    pollAttempts++;
    const u = extractTelegramUser();
    if (u && (u.displayName || u.first_name || u.firstName || u.name || u.username)) {
      applyPersonalization(u);
      clearInterval(pollTimer);
    }
    if (pollAttempts >= 20) clearInterval(pollTimer);
  }, 100);

  // Listen for Notibot async initialization postMessages
  window.addEventListener('message', function(event) {
    if (!event.data) return;
    const isInit = event.data.type === 'NOTIBOT_INIT' ||
                   event.data.type === 'notibot:init' ||
                   event.data.type === 'NOTIBOT_READY' ||
                   event.data.type === 'notibot_init';
    if (isInit) {
      const u = (event.data.data && event.data.data.user) || event.data.user || (event.data.data && event.data.data.displayName ? event.data.data : null);
      const a = (event.data.data && event.data.data.app) || event.data.app || {};
      if (u) {
        window.notibotInitData = event.data.data || { user: u, app: a };
        handleNotibotInit(u, a);
      }
    }
  });

  window.applyPersonalization = applyPersonalization;
  window.extractTelegramUser = extractTelegramUser;
  window.getInitials = getInitials;
  window.handleNotibotInit = handleNotibotInit;
  window.applyThemeColors = applyThemeColors;
})();
