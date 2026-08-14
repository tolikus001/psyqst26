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

  window.API_BASE = API_BASE;
  window.AMVERA_HOST = AMVERA_HOST;

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
})();
