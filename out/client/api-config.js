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
    lesson1: '6QzHvAlz22e4IEb6wVhjy0',
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
    individual_offer: '1CkSHuhyH7kVgjKZxWPCDs',

    '01_psyquest.html': '35Kvp1YSxOSOzKeVKcpom2',
    '01_psyquest': '35Kvp1YSxOSOzKeVKcpom2',
    '01_quest.html': '35Kvp1YSxOSOzKeVKcpom2',
    'psyquest': '35Kvp1YSxOSOzKeVKcpom2',

    '02_landing_partner.html': '54xiZ3LlRdXnk88t9xPt7s',
    '02_landing_partner': '54xiZ3LlRdXnk88t9xPt7s',
    '02_landing.html': '54xiZ3LlRdXnk88t9xPt7s',
    'landing_partner': '54xiZ3LlRdXnk88t9xPt7s',

    '03_lesson1.html': '6QzHvAlz22e4IEb6wVhjy0',
    '03_lesson1': '6QzHvAlz22e4IEb6wVhjy0',
    'lesson1.html': '6QzHvAlz22e4IEb6wVhjy0',
    'lesson_1': '6QzHvAlz22e4IEb6wVhjy0',
    'lesson-1': '6QzHvAlz22e4IEb6wVhjy0',
    '01_lesson1.html': '6QzHvAlz22e4IEb6wVhjy0',
    '01_lesson1': '6QzHvAlz22e4IEb6wVhjy0',

    '04_lesson2.html': '6wQPr20VEfbLD5Jg6GeEVR',
    '04_lesson2': '6wQPr20VEfbLD5Jg6GeEVR',
    'lesson2.html': '6wQPr20VEfbLD5Jg6GeEVR',
    'lesson_2': '6wQPr20VEfbLD5Jg6GeEVR',
    'lesson-2': '6wQPr20VEfbLD5Jg6GeEVR',
    '02_lesson2.html': '6wQPr20VEfbLD5Jg6GeEVR',

    '05_lesson3.html': '0wFlaZghZ7ZieZiqFtJpSs',
    '05_lesson3': '0wFlaZghZ7ZieZiqFtJpSs',
    'lesson3.html': '0wFlaZghZ7ZieZiqFtJpSs',
    'lesson_3': '0wFlaZghZ7ZieZiqFtJpSs',
    'lesson-3': '0wFlaZghZ7ZieZiqFtJpSs',
    '03_lesson3.html': '0wFlaZghZ7ZieZiqFtJpSs',

    '06_lesson4.html': '1ddMHSu3zb0ixr2CWRLKvg',
    '06_lesson4': '1ddMHSu3zb0ixr2CWRLKvg',
    'lesson4.html': '1ddMHSu3zb0ixr2CWRLKvg',
    'lesson_4': '1ddMHSu3zb0ixr2CWRLKvg',
    'lesson-4': '1ddMHSu3zb0ixr2CWRLKvg',
    '04_lesson4.html': '1ddMHSu3zb0ixr2CWRLKvg',

    '07_lesson5.html': '4uMyKJZW4TdZJM8z9G7Zbg',
    '07_lesson5': '4uMyKJZW4TdZJM8z9G7Zbg',
    'lesson5.html': '4uMyKJZW4TdZJM8z9G7Zbg',
    'lesson_5': '4uMyKJZW4TdZJM8z9G7Zbg',
    'lesson-5': '4uMyKJZW4TdZJM8z9G7Zbg',
    '05_lesson5.html': '4uMyKJZW4TdZJM8z9G7Zbg',

    '08_portrait_quest.html': '2plu9h6VcWiAQ3TrZ8nLql',
    '08_portrait_quest': '2plu9h6VcWiAQ3TrZ8nLql',
    'portrait_quest.html': '2plu9h6VcWiAQ3TrZ8nLql',

    '09_bonuses.html': '6ZwOzlMAERTYgkV2FsWnVx',
    '09_bonuses': '6ZwOzlMAERTYgkV2FsWnVx',
    'bonuses.html': '6ZwOzlMAERTYgkV2FsWnVx',

    '10_bonus1.html': '5MKoAoaLdnrJqZaczYSZth',
    '10_bonus1': '5MKoAoaLdnrJqZaczYSZth',
    'bonus1.html': '5MKoAoaLdnrJqZaczYSZth',

    '11_bonus2.html': '5DiBJPDNERZWQCXQ7C2OoX',
    '11_bonus2': '5DiBJPDNERZWQCXQ7C2OoX',
    'bonus2.html': '5DiBJPDNERZWQCXQ7C2OoX',

    '12_bonus3.html': '38HgDSX5SePPcFWySLUMNs',
    '12_bonus3': '38HgDSX5SePPcFWySLUMNs',
    'bonus3.html': '38HgDSX5SePPcFWySLUMNs',

    '13_bonus4.html': '7NGEU2ikhiLHvuuyxhmL6K',
    '13_bonus4': '7NGEU2ikhiLHvuuyxhmL6K',
    'bonus4.html': '7NGEU2ikhiLHvuuyxhmL6K',

    '14_individual_offer.html': '1CkSHuhyH7kVgjKZxWPCDs',
    '14_individual_offer': '1CkSHuhyH7kVgjKZxWPCDs',
        '14_individual_offer.html': '1CkSHuhyH7kVgjKZxWPCDs',
    '14_individual_offer': '1CkSHuhyH7kVgjKZxWPCDs',
    'individual_offer.html': '1CkSHuhyH7kVgjKZxWPCDs',

    '15_landing_partner_2': '1N6rOVg7p2VxqHnNA11HTe',
    '15_landing_partner_2.html': '1N6rOVg7p2VxqHnNA11HTe',
    'landing_partner_2': '1N6rOVg7p2VxqHnNA11HTe',
    '16_lesson1': '5hR7Av3us4aIKmTZr7b6J2',
    '16_lesson1.html': '5hR7Av3us4aIKmTZr7b6J2',
    '16_lesson2_1': '5hR7Av3us4aIKmTZr7b6J2',
    '17_lesson2': '2NvyoluAQiidfuwZTClFNy',
    '17_lesson2.html': '2NvyoluAQiidfuwZTClFNy',
    '17_lesson2_2': '2NvyoluAQiidfuwZTClFNy',
    '18_lesson3': '0VLe3JSTGaykCYI4GGmRrc',
    '18_lesson3.html': '0VLe3JSTGaykCYI4GGmRrc',
    '18_lesson2_3': '0VLe3JSTGaykCYI4GGmRrc',
    '19_lesson4': '3xxTBsJJZGpXnJBURlJWLo',
    '19_lesson4.html': '3xxTBsJJZGpXnJBURlJWLo',
    '19_lesson2_4': '3xxTBsJJZGpXnJBURlJWLo',
    '20_lesson5': '3EUOYisS5lzwNG4LSB9Ttw',
    '20_lesson5.html': '3EUOYisS5lzwNG4LSB9Ttw',
    '20_lesson2_5': '3EUOYisS5lzwNG4LSB9Ttw',
    '21_bonuses': '0dBgBZKrNbtzqhhtL7LweT',
    '21_bonuses.html': '0dBgBZKrNbtzqhhtL7LweT',
    '21_lp_bonuses_2': '0dBgBZKrNbtzqhhtL7LweT',
    '22_bonus1': '2aGABwdvffujaWDzT9kPx6',
    '22_bonus1.html': '2aGABwdvffujaWDzT9kPx6',
    '22_bonus2_1': '2aGABwdvffujaWDzT9kPx6',
    '23_bonus2': '1XqffrsaxNLrLI8inXo9fx',
    '23_bonus2.html': '1XqffrsaxNLrLI8inXo9fx',
    '23_bonus2_2': '1XqffrsaxNLrLI8inXo9fx',
    '24_bonus3': '0ORCSoM30o4K6tlmZ4KYmP',
    '24_bonus3.html': '0ORCSoM30o4K6tlmZ4KYmP',
    '24_bonus2_3': '0ORCSoM30o4K6tlmZ4KYmP',
    '25_bonus4': '6j07iXAve1PXf3vko48gGa',
    '25_bonus4.html': '6j07iXAve1PXf3vko48gGa',
    '25_bonus2_4': '6j07iXAve1PXf3vko48gGa'

  };

  // Official Notibot Product IDs
  const NOTIBOT_PRODUCTS = {
    course: '4ec2ypRLStHYlW0lRrAzHI',
    course_i_choose: '4ec2ypRLStHYlW0lRrAzHI',
    course_partner_2400: '5kbi43jpKV2ZEPdw4gs3rW',
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
    try { if (typeof pauseVideo === 'function') pauseVideo(); } catch(e){}
    const raw = String(target || '').trim();
    const clean = raw.split('?')[0].split('#')[0].replace(/^\.?\//, '');
    const articleId = NOTIBOT_ARTICLES[clean] || NOTIBOT_ARTICLES[raw] || NOTIBOT_ARTICLES[target];
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
