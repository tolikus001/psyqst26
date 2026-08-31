/**
 * Unified API & Media Connector for Local, Notibot and Amvera Environments
 */
(function() {
  var isLocal = window.location.hostname === 'localhost' || 
                window.location.hostname === '127.0.0.1' || 
                window.location.protocol === 'file:';

  var AMVERA_HOST = 'https://inter01-anatolyfedorov.amvera.io';
  var LOCAL_HOST = 'http://localhost:3000';

  var API_BASE = (window.location.protocol === 'file:')
    ? (window.USE_AMVERA_FOR_FILE ? AMVERA_HOST : LOCAL_HOST)
    : (isLocal ? '' : AMVERA_HOST);

  var NOTIBOT_ARTICLES = {
    '01_psyquest.html': '35Kvp1YSxOSOzKeVKcpom2',
    '02_landing_partner.html': '54xiZ3LlRdXnk88t9xPt7s',
    '03_lesson1.html': '6QzHvAlz22e4IEb6wVhjy0',
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
    '14_individual_offer.html': '1CkSHuhyH7kVgjKZxWPCDs',

    '15_landing_partner_2.html': '1N6rOVg7p2VxqHnNA11HTe',
    '16_lesson1.html': '5hR7Av3us4aIKmTZr7b6J2',
    '17_lesson2.html': '2NvyoluAQiidfuwZTClFNy',
    '18_lesson3.html': '0VLe3JSTGaykCYI4GGmRrc',
    '19_lesson4.html': '3xxTBsJJZGpXnJBURlJWLo',
    '20_lesson5.html': '3EUOYisS5lzwNG4LSB9Ttw',
    '21_bonuses.html': '0dBgBZKrNbtzqhhtL7LweT',
    '22_bonus1.html': '2aGABwdvffujaWDzT9kPx6',
    '23_bonus2.html': '1XqffrsaxNLrLI8inXo9fx',
    '24_bonus3.html': '0ORCSoM30o4K6tlmZ4KYmP',
    '25_bonus4.html': '6j07iXAve1PXf3vko48gGa',

    '26_landing_family.html': '26_landing_family.html',
    '27_lesson1.html': '27_lesson1.html',
    '28_lesson2.html': '28_lesson2.html',
    '29_lesson3.html': '29_lesson3.html',
    '30_lesson4.html': '30_lesson4.html',
    '31_lesson5.html': '31_lesson5.html',
    '32_bonuses.html': '32_bonuses.html',
    '33_bonus1.html': '33_bonus1.html',
    '34_bonus2.html': '34_bonus2.html',
    '35_bonus3.html': '35_bonus3.html',
    '36_bonus4.html': '36_bonus4.html',

    '37_landing_crisis.html': '37_landing_crisis.html',
    '38_lesson1.html': '38_lesson1.html',
    '39_lesson2.html': '39_lesson2.html',
    '40_lesson3.html': '40_lesson3.html',
    '41_lesson4.html': '41_lesson4.html',
    '42_lesson5.html': '42_lesson5.html',
    '43_bonuses.html': '43_bonuses.html',
    '44_bonus1.html': '44_bonus1.html',
    '45_bonus2.html': '45_bonus2.html',
    '46_bonus3.html': '46_bonus3.html',
    '47_bonus4.html': '47_bonus4.html'
  };

  var NOTIBOT_PRODUCTS = {
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

  function openScreen(target) {
    try { if (typeof pauseVideo === 'function') pauseVideo(); } catch(e){}
    var raw = String(target || '').trim();
    var clean = raw.split('?')[0].split('#')[0].replace(/^\.?\//, '');
    var articleId = NOTIBOT_ARTICLES[clean] || NOTIBOT_ARTICLES[raw] || NOTIBOT_ARTICLES[target];
    if (window.notibot && articleId && !articleId.endsWith('.html') && typeof window.notibot.openArticle === 'function' && window.parent && window.parent !== window) {
      window.notibot.openArticle(articleId);
    } else {
      window.location.href = target;
    }
  }

  function openProduct(targetId) {
    var realId = NOTIBOT_PRODUCTS[targetId] || targetId;
    if (window.notibot && typeof window.notibot.openProduct === 'function') {
      window.notibot.openProduct(realId);
    } else if (window.notibot && typeof window.notibot.openStorefront === 'function') {
      window.notibot.openStorefront();
    }
  }

  async function apiPost(endpoint, bodyData, timeoutMs) {
    timeoutMs = timeoutMs || 12000;
    var targetUrl = endpoint.startsWith('http') ? endpoint : (API_BASE + endpoint);
    var controller = new AbortController();
    var timer = setTimeout(function() { controller.abort(); }, timeoutMs);

    try {
      var response = await fetch(targetUrl, {
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
        throw new Error('HTTP ' + response.status);
      }
      return await response.json();
    } catch (err) {
      clearTimeout(timer);
      console.warn('[API Warning] Request to ' + targetUrl + ' failed (' + err.message + '). Trying fallback endpoint...');

      if (API_BASE !== AMVERA_HOST && !endpoint.startsWith('http')) {
        try {
          var fallbackRes = await fetch(AMVERA_HOST + endpoint, {
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

  function resolveMediaUrl(filename) {
    var clean = filename.replace(/^\/+(data|media)\/+/, '');
    if (isLocal && window.location.protocol !== 'file:') {
      return '/data/' + clean;
    }
    return AMVERA_HOST + '/data/' + clean;
  }

  window.apiPost = apiPost;
  window.resolveMediaUrl = resolveMediaUrl;
  window.openScreen = openScreen;
  window.openProduct = openProduct;
})();
