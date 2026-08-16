/**
 * Unified API & Media Connector for Local, Notibot and Amvera Environments
 */
(function() {
  // Determine backend base URL
  const isLocal = window.location.hostname === 'localhost' || 
                  window.location.hostname === '127.0.0.1' || 
                  window.location.protocol === 'file:';

  const AMVERA_HOST = 'https://inter01-anatolyfedorov.amvera.io';
  const LOCAL_HOST = 'http://localhost:3000';

  const API_BASE = (window.location.protocol === 'file:')
    ? (window.USE_AMVERA_FOR_FILE ? AMVERA_HOST : LOCAL_HOST)
    : (isLocal ? '' : AMVERA_HOST);

  // Official Notibot Article IDs for seamless inside-bot navigation
  const NOTIBOT_ARTICLES = {
    quest: '35Kvp1YSxOSOzKeVKcpom2',
    landing: '54xiZ3LlRdXnk88t9xPt7s',
    lesson1: '6QzHvAlz22e4lEb6wVhjy0',
    lesson2: '6wQPr20VEfbLD5Jg6GeEVR',
    lesson3: '0wFlaZghZ7ZieZiqFtJpSs',
    lesson4: '1ddMHSu3zb0ixr2CWRLKvg',
    lesson5: '4uMyKJZW4TdZJM8z9G7Zbg',
    portrait_quest: '2plu9h6VcWiAQ3TrZ8nLql',
    bonuses: '6ZwOzlMAERTYgkV2FsWnVx',
    bonus1: '5MKoAoaLdnrJqZaczYSZth',
    bonus2: '5DiBJPDNERZWQCXQ7C2OoX',
    bonus3: '38HgDSX5SePPcFWySLUMNs',
    bonus4: '7NGEU2ikhiLHvuuyxhmL6K',
    individual_offer: '1CkSHuhyH7kVgjKZxWpCDs',

    '01_psyquest.html': '35Kvp1YSxOSOzKeVKcpom2',
    '02_landing_partner.html': '54xiZ3LlRdXnk88t9xPt7s',
    '03_lesson1.html': '6QzHvAlz22e4lEb6wVhjy0',
    '04_lesson2.html': '6wQPr20VEfbLD5Jg6GeEVR',
    '05_lesson3.html': '0wFlaZghZ7ZieZiqFtJpSs',
    '06_lesson4.html': '1ddMHSu3zb0ixr2CWRLKvg',
    '07_lesson5.html': '4uMyKJZW4TdZJM8z9G7Zbg',
    '08_portrait_quest.html': '2plu9h6VcWiAQ3TrZ8nLql',
    '09_bonuses.html': '6ZwOzlMAERTYgkV2FsWnVx',
    '10_bonus1.html': '5MKoAoaLdnrJqZaczYSZth',
    '11_bonus2.html': '5DiBJPDNERZWQCXQ7C2OoX',
    '12_bonus3.html': '38HgDSX5SePPcFWySLUMNs',
    '13_bonus4.html': '7NGEU2ikhiLHvuuyxhmL6K',
    '14_individual_offer.html': '1CkSHuhyH7kVgjKZxWpCDs'
  };

  // Official Notibot Product IDs
  const NOTIBOT_PRODUCTS = {
    course: '4ec2ypRLStHYlW0lRrAzHI',
    course_i_choose: '4ec2ypRLStHYlW0lRrAzHI',
    course_partner_2400: '4ec2ypRLStHYlW0lRrAzHI',
    course_partner_5000: '4ec2ypRLStHYlW0lRrAzHI',
    individual_offer: '144vDCBfCUUtbKNcL9IB9',
    portrait_consultation: '144vDCBfCUUtbKNcL9IB9',
    portrait_consultation_10000: '144vDCBfCUUtbKNcL9IB9'
  };

  window.API_BASE = API_BASE;
  window.AMVERA_HOST = AMVERA_HOST;
  window.NOTIBOT_ARTICLES = NOTIBOT_ARTICLES;
  window.NOTIBOT_PRODUCTS = NOTIBOT_PRODUCTS;

  /**
   * Navigate to screen via Notibot openArticle if embedded, or window.location if standalone
   */
  function openScreen(target) {
    const clean = String(target || '').replace(/^(\.\/|\/)/, '');
    const articleId = NOTIBOT_ARTICLES[clean] || NOTIBOT_ARTICLES[target];
    if (window.notibot && articleId && typeof window.notibot.openArticle === 'function' && window.parent && window.parent !== window) {
      window.notibot.openArticle(articleId);
    } else {
      window.location.href = target;
    }
  }

  /**
   * Open Notibot Product Modal
   */
  function openProduct(targetId) {
    const realId = NOTIBOT_PRODUCTS[targetId] || targetId;
    if (window.notibot && typeof window.notibot.openProduct === 'function') {
      window.notibot.openProduct(realId);
    } else if (window.notibot && typeof window.notibot.openStorefront === 'function') {
      window.notibot.openStorefront();
    }
  }

  /**
   * Safe Fetch with Timeout and Automatic Error Handling
   */
  async function apiPost(endpoint, bodyData, timeoutMs = 12000) {
    const targetUrl = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'NotibotMiniApp'
        },
        body: JSON.stringify(bodyData),
        signal: controller.signal
      });
      clearTimeout(timer);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      clearTimeout(timer);
      console.warn(`[API Warning] Request to ${targetUrl} failed (${err.message}). Trying fallback endpoint...`);

      // If local failed on file:// or network, try Amvera host as secondary
      if (API_BASE !== AMVERA_HOST && !endpoint.startsWith('http')) {
        try {
          const fallbackRes = await fetch(`${AMVERA_HOST}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bodyData)
          });
          if (fallbackRes.ok) {
            return await fallbackRes.json();
          }
        } catch (e) {
          console.warn('[API Warning] Amvera fallback also unreachable:', e.message);
        }
      }
      throw err;
    }
  }

  /**
   * Resolve Media URL (Local or Amvera)
   */
  function resolveMediaUrl(filename) {
    const clean = filename.replace(/^\/+(data|media)\/+/, '');
    if (isLocal && window.location.protocol !== 'file:') {
      return `/data/${clean}`;
    }
    return `${AMVERA_HOST}/data/${clean}`;
  }

  window.apiPost = apiPost;
  window.resolveMediaUrl = resolveMediaUrl;
  window.openScreen = openScreen;
  window.openProduct = openProduct;
})();