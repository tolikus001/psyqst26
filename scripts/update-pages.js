const fs = require('fs');
const path = require('path');

const HEAD_BRIDGE_CODE = `  <script src="https://telegram.org/js/telegram-web-app.js"></script>
  <script src="https://list.notibot.ru/notibot-bridge.js"></script>
  <!-- Notibot Bridge Early Interceptor (КОДЕР 2.0) -->
  <script>
    window.notibotInitData = null;
    window.addEventListener('message', function(event) {
      if (event.data && event.data.type === 'NOTIBOT_INIT' && event.data.data) {
        window.notibotInitData = event.data.data;
      }
    });
  </script>
  <!-- Fallback Inlined Notibot Bridge if standalone -->
  <script>
    if (!window.notibot) {
      (function() {
        class NotibotBridge {
          constructor() {
            this.user = {};
            this.app = {};
            this._updateHandlers = [];
            this._lastActionTimes = {};
            this._responseHandlers = {};
            this._init();
          }
          _init() {
            window.addEventListener('message', (event) => {
              if (!event.data) return;
              const isInit = event.data.type === 'NOTIBOT_INIT' ||
                             event.data.type === 'notibot:init' ||
                             event.data.type === 'NOTIBOT_READY' ||
                             event.data.type === 'notibot_init';
              if (isInit) {
                const u = (event.data.data && event.data.data.user) || event.data.user || (event.data.data && event.data.data.displayName ? event.data.data : null);
                const a = (event.data.data && event.data.data.app) || event.data.app || {};
                if (u) this.user = u;
                if (a) this.app = a;
                this._updateHandlers.forEach(cb => {
                  try { cb(this.user, this.app); } catch(e) {}
                });
              }
            });
            if (window.parent && window.parent !== window) {
              try { window.parent.postMessage({ source: 'vibe-sandbox', type: 'READY_FOR_INIT' }, '*'); } catch(e) {}
            }
          }
          onUpdate(callback) {
            if (typeof callback === 'function') {
              this._updateHandlers.push(callback);
              if (this.user && (this.user.displayName || this.user.first_name || this.user.id || Object.keys(this.user).length > 0)) {
                callback(this.user, this.app);
              }
            }
          }
          openArticle(id) { if (window.parent) window.parent.postMessage({ source: 'vibe-sandbox', type: 'open_article', payload: { id } }, '*'); }
          openProduct(id) { if (window.parent) window.parent.postMessage({ source: 'vibe-sandbox', type: 'open_product', payload: { id } }, '*'); }
          openStorefront() { if (window.parent) window.parent.postMessage({ source: 'vibe-sandbox', type: 'open_storefront' }, '*'); }
          openLink(url) { if (window.parent) window.parent.postMessage({ source: 'vibe-sandbox', type: 'open_link', payload: { url } }, '*'); else window.location.href = url; }
          hapticImpact(style) { if (window.parent) window.parent.postMessage({ source: 'vibe-sandbox', type: 'haptic', payload: { style } }, '*'); }
          hapticNotification(type) { if (window.parent) window.parent.postMessage({ source: 'vibe-sandbox', type: 'haptic', payload: { type } }, '*'); }
          hapticSelection() { if (window.parent) window.parent.postMessage({ source: 'vibe-sandbox', type: 'haptic', payload: { style: 'selection' } }, '*'); }
        }
        window.notibot = new NotibotBridge();
      })();
    }
  </script>`;

const TELEGRAM_USER_INNER = `/**
 * Telegram & Notibot Real-Time Personalization Engine
 * Automatically extracts user name & avatar from Telegram WebApp, Notibot Bridge SDK, URL params, or LocalStorage.
 */
(function() {
  function getInitials(name) {
    if (!name) return '👋';
    const parts = name.trim().split(/\\s+/);
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

    const firstName = String(rawName || '').trim().split(/\\s+/)[0];
    window.currentUserName = firstName || 'Участник';
    window.currentUser = user || (firstName ? { displayName: firstName, first_name: firstName } : null);

    // Update Greeting in Header (КОДЕР 2.0: "Привет, {Имя}!" или "Привет!")
    const greetingEl = document.getElementById('userGreeting');
    if (greetingEl) {
      greetingEl.textContent = firstName ? \`Привет, \${firstName}!\` : 'Привет!';
    }

    // Update Avatar in Header (КОДЕР 2.0: аватар с fallback на инициалы)
    const avatarEl = document.getElementById('userAvatar');
    if (avatarEl) {
      if (photoUrl) {
        avatarEl.innerHTML = '<img src="' + photoUrl + '" alt="' + (firstName || 'Avatar') + '" style="width:100%;height:100%;object-fit:cover;border-radius:9999px;" onerror="this.parentNode.setAttribute(\\'data-fallback\\',\\'1\\');this.style.display=\\'none\\';this.parentNode.textContent=\\'' + getInitials(firstName) + '\\';" />';
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
})();`;

const SAFE_HAPTIC_CODE = `    function safeHaptic(type) {
      try {
        if (window.notibot) {
          if (type === 'selection' && typeof window.notibot.hapticSelection === 'function') {
            window.notibot.hapticSelection();
          } else if ((type === 'success' || type === 'error' || type === 'warning') && typeof window.notibot.hapticNotification === 'function') {
            window.notibot.hapticNotification(type);
          } else if (typeof window.notibot.hapticImpact === 'function') {
            window.notibot.hapticImpact(type || 'light');
          }
        } else if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.HapticFeedback) {
          if (type === 'success' || type === 'error' || type === 'warning') {
            window.Telegram.WebApp.HapticFeedback.notificationOccurred(type);
          } else {
            window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
          }
        } else if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
          navigator.vibrate(type === 'success' ? [30, 50, 30] : 20);
        }
      } catch (e) {}
    }`;

function processHtmlFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Ensure Head Bridge Code is right after <head>
  if (!content.includes('Notibot Bridge Early Interceptor (КОДЕР 2.0)')) {
    content = content.replace(/<head>(\r?\n)?/, '<head>\n' + HEAD_BRIDGE_CODE + '\n');
  }

  // 2. Update Personalization Engine if present
  if (content.includes('Telegram & Notibot Real-Time Personalization Engine')) {
    const persRegex = /\/\*\*[\s\S]*?Telegram & Notibot Real-Time Personalization Engine[\s\S]*?\(\)\);\s*<\/script>/;
    content = content.replace(persRegex, TELEGRAM_USER_INNER + '\n</script>');
  }

  // 3. Remove redundant scripts in body and replace safeHaptic
  const oldBridgeBlockRegex = /<script src="https:\/\/telegram\.org\/js\/telegram-web-app\.js"><\/script>\s*<script src="https:\/\/list\.notibot\.ru\/notibot-bridge\.js"><\/script>\s*<!-- Early [iI]nterceptor for Notibot Bridge -->\s*<script>[\s\S]*?function safeHaptic\(type\) \{[\s\S]*?\}\s*<\/script>/;
  
  if (oldBridgeBlockRegex.test(content)) {
    content = content.replace(oldBridgeBlockRegex, '<script>\n' + SAFE_HAPTIC_CODE + '\n  </script>');
  } else {
    // Look for standalone old safeHaptic
    const standaloneSafeHaptic = /function safeHaptic\(type\) \{[\s\S]*?catch\s*\([^\)]*\)\s*\{[\s\S]*?\}\s*\}/;
    if (standaloneSafeHaptic.test(content) && !content.includes('window.notibot.hapticSelection')) {
      content = content.replace(standaloneSafeHaptic, SAFE_HAPTIC_CODE.trim());
    }
  }

  // Clean up any remaining loose redundant scripts in body that were moved to <head>
  content = content.replace(/<script src="https:\/\/cdn\.jsdelivr\.net\/npm\/@tailwindcss\/browser@4"><\/script>\s*<script src="https:\/\/telegram\.org\/js\/telegram-web-app\.js"><\/script>\s*<script src="https:\/\/list\.notibot\.ru\/notibot-bridge\.js"><\/script>/g, '<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>');
  content = content.replace(/<script src="https:\/\/telegram\.org\/js\/telegram-web-app\.js"><\/script>\s*<script src="https:\/\/list\.notibot\.ru\/notibot-bridge\.js"><\/script>\s*<!-- Early [iI]nterceptor for Notibot Bridge -->/g, '');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Updated:', filePath);
}

// Process out/client
const outFiles = fs.readdirSync('out/client').filter(f => f.endsWith('.html'));
for (const f of outFiles) {
  processHtmlFile(path.join('out/client', f));
}

// Also update standalone telegram-user.js
if (fs.existsSync('out/client/telegram-user.js')) {
  fs.writeFileSync('out/client/telegram-user.js', TELEGRAM_USER_INNER + '\n', 'utf8');
  console.log('Updated: out/client/telegram-user.js');
}
