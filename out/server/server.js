const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

// Auto-load .env file without external dependencies
function loadEnv() {
  const envPaths = [
    path.join(__dirname, '.env'),
    path.join(__dirname, '..', '.env'),
    path.join(__dirname, '..', '..', '.env')
  ];
  for (const envPath of envPaths) {
    try {
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8');
        content.split('\n').forEach(line => {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
            const idx = trimmed.indexOf('=');
            const key = trimmed.slice(0, idx).trim();
            const val = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
            if (!process.env[key]) {
              process.env[key] = val;
            }
          }
        });
        break;
      }
    } catch (e) {}
  }
}
loadEnv();

const PORT = parseInt(process.env.PORT || '80', 10);
const POLZA_URL = process.env.POLZA_URL || process.env.POLZA_BASE_URL || 'https://api.polza.ai/v1';
const POLZA_API_KEY = process.env.POLZA_API_KEY || '';
const POLZA_MODEL = process.env.POLZA_MODEL || 'gpt-4o-mini';

// CORS Headers (whitelist: NotiBot, Amvera, localhost)
const ALLOWED_ORIGINS = [
  'https://list.notibot.ru',
  'https://inter01-anatolyfedorov.amvera.io',
  'http://localhost:3000',
  'http://localhost:8080',
  'http://127.0.0.1:3000'
];

function setCorsHeaders(res, req) {
  const origin = req && req.headers && req.headers.origin;
  if (origin) {
    if (ALLOWED_ORIGINS.indexOf(origin) !== -1 ||
        /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) ||
        origin === 'null') {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
    } else {
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Range, Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Range, Content-Length, Accept-Ranges');
}

// Resolve Media/Data File Path
function resolveFilePath(targetName) {
  let cleanName = path.basename(targetName).trim();
  
  // Alias mapping to avoid heavy duplicate files
  const aliases = {
    'video0.mp4': 'lesson0.mp4',
    'урок 0.mp4': 'lesson0.mp4',
    'lesson0_v2.mp4': 'lesson0.mp4',
    'meditation2-0.mp3': 'meditation 2-0.mp3',
    'meditation_2-0.mp3': 'meditation 2-0.mp3',
    'meditation2-3.mp3': 'meditation 2-3.mp3',
    'meditation_2-3.mp3': 'meditation 2-3.mp3',
    'meditation2-5.mp3': 'meditation 2-5.mp3',
    'meditation_2-5.mp3': 'meditation 2-5.mp3'
  };
  if (aliases[cleanName.toLowerCase()]) {
    cleanName = aliases[cleanName.toLowerCase()];
  }

  const searchDirs = [
    '/data',
    path.join(__dirname, 'files'),
    path.join(__dirname, 'media'),
    path.join(__dirname, 'data'),
    path.join(__dirname, '..', 'client'),
    __dirname
  ];

  for (const dir of searchDirs) {
    try {
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir);
        if (files.includes(cleanName)) {
          return path.join(dir, cleanName);
        }
        const lowerName = cleanName.toLowerCase();
        const found = files.find((f) => f.toLowerCase() === lowerName);
        if (found) {
          return path.join(dir, found);
        }
      }
    } catch (e) {}
  }
  return null;
}

// Media Streaming with HTTP 206 Partial Content
function handleMediaStream(req, res, filePath, isHead = false) {
  setCorsHeaders(res, req);
  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;
  const ext = path.extname(filePath).toLowerCase();

  let contentType = 'application/octet-stream';
  if (ext === '.mp4') contentType = 'video/mp4';
  else if (ext === '.pdf') contentType = 'application/pdf';
  else if (ext === '.mp3') contentType = 'audio/mpeg';
  else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
  else if (ext === '.png') contentType = 'image/png';
  else if (ext === '.webp') contentType = 'image/webp';
  else if (ext === '.svg') contentType = 'image/svg+xml';
  else if (ext === '.html') contentType = 'text/html; charset=utf-8';
  else if (ext === '.css') contentType = 'text/css; charset=utf-8';
  else if (ext === '.js') contentType = 'application/javascript; charset=utf-8';

  res.setHeader('Accept-Ranges', 'bytes');

  if (ext === '.pdf') {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', fileSize);
    res.setHeader('Content-Disposition', `inline; filename="${path.basename(filePath)}"`);
    if (isHead) return res.writeHead(200).end();
    return fs.createReadStream(filePath).pipe(res);
  }

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    if (start >= fileSize || end >= fileSize) {
      res.setHeader('Content-Range', `bytes */${fileSize}`);
      res.writeHead(416, { 'Content-Type': 'text/plain' });
      return res.end('Requested range not satisfiable');
    }

    const chunksize = (end - start) + 1;
    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Content-Length': chunksize,
      'Content-Type': contentType
    });

    if (isHead) return res.end();
    fs.createReadStream(filePath, { start, end }).pipe(res);
  } else {
    res.writeHead(200, {
      'Content-Length': fileSize,
      'Content-Type': contentType
    });
    if (isHead) return res.end();
    fs.createReadStream(filePath).pipe(res);
  }
}

// Clean JSON text from Markdown fences
function cleanJsonText(text) {
  if (typeof text !== 'string') return '';
  return text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
}

// Heuristic check for gibberish / incoherent / too short input
function isGibberishText(text) {
  if (!text || typeof text !== 'string') return true;
  const clean = text.trim();
  if (clean.length < 5) return true;
  
  // Repeated single character 4+ times (e.g. "aaaa", ".....")
  if (/(.)\1{3,}/i.test(clean)) return true;

  // Common filler / non-answers / trolling / gibberish patterns
  const fillerPatterns = [
    /^(не знаю|хз|хз что|ничего|ни о чем|нет слов|просто так|тест|проверка|тестовый|asdf|qwerty|1234|бла бла|лалала|фыва)/i,
    /^(да|нет|ок|норм|понятно|ладно|хм|ну|ага|угу)$/i
  ];
  for (const pat of fillerPatterns) {
    if (pat.test(clean)) return true;
  }

  const words = clean.split(/\s+/).filter(Boolean);
  // Repeated words like "да да да да" or "нет нет нет"
  if (words.length >= 2) {
    const uniqueWords = new Set(words);
    if (uniqueWords.size === 1) return true;
  }

  // Single long word without spaces > 20 characters
  if (words.length === 1 && clean.length > 20) return true;
  
  // Letter checks
  const letters = clean.replace(/[^a-zA-Zа-яА-ЯёЁ]/g, '');
  if (letters.length >= 4) {
    const vowels = letters.match(/[аеёиоуыэюяaeiouy]/gi);
    const vowelCount = vowels ? vowels.length : 0;
    if (vowelCount === 0 || (vowelCount / letters.length) < 0.12) {
      return true; // No vowels or keyboard mash
    }
    const unique = new Set(letters.toLowerCase()).size;
    if (letters.length >= 8 && unique <= 3) {
      return true;
    }
  }
  
  const mashPatterns = [/фыва/i, /йцук/i, /ячсм/i, /qwerty/i, /asdf/i, /zxcv/i];
  for (const pat of mashPatterns) {
    if (pat.test(clean) && clean.length < 25) {
      return true;
    }
  }
  return false;
}

const GIBBERISH_RESPONSE = {
  invalid: true,
  message: 'Ваши ответы были неполноценными, и я не смог их расшифровать. Пожалуйста, опишите ситуацию подробнее своими словами.'
};

// Call Polza AI Gateway
async function callPolzaAI(systemPrompt, userPrompt, jsonFormat = false) {
  const apiKey = POLZA_API_KEY;
  if (!apiKey) return null;

  const endpoint = POLZA_URL.endsWith('/chat/completions')
    ? POLZA_URL
    : `${POLZA_URL.replace(/\/+$/, '')}/chat/completions`;

  try {
    const body = {
      model: POLZA_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3
    };

    if (jsonFormat) {
      body.response_format = { type: 'json_object' };
    }

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (err) {
    console.error('[Polza AI] Error:', err.message);
    return null;
  }
}

// Native HTTP Server (Zero Dependencies)
const server = http.createServer(async (req, res) => {
  const reqUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = decodeURIComponent(reqUrl.pathname);

  // CORS Preflight
  if (req.method === 'OPTIONS') {
    setCorsHeaders(res, req);
    res.writeHead(204);
    return res.end();
  }

  // Healthcheck
  if (pathname === '/health' && req.method === 'GET') {
    setCorsHeaders(res, req);
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    return res.end(JSON.stringify({ ok: true, status: 'running', service: 'psyquest-media-ai-zero-dep', timestamp: new Date().toISOString() }));
  }

  // Serve Client Files (HTML, CSS, JS, Images, PDFs, Audio, Video, etc.)
  const staticExts = ['.html', '.css', '.js', '.png', '.jpg', '.jpeg', '.webp', '.svg', '.ico', '.mp4', '.mp3', '.m4a', '.wav', '.ogg', '.json', '.pdf'];
  if (pathname === '/' || staticExts.some(ext => pathname.toLowerCase().endsWith(ext))) {
    const filename = pathname === '/' ? 'index.html' : path.basename(pathname);
    const clientPath = path.join(__dirname, '..', 'client', filename);
    if (fs.existsSync(clientPath)) {
      return handleMediaStream(req, res, clientPath, req.method === 'HEAD');
    }
  }

  // API Files Diagnostics
  if (pathname === '/api/files' && req.method === 'GET') {
    setCorsHeaders(res, req);
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    const result = {};
    const searchDirs = ['/data', path.join(__dirname, 'files'), path.join(__dirname, '..', 'client'), __dirname];
    for (const dir of searchDirs) {
      try {
        if (fs.existsSync(dir)) {
          result[dir] = fs.readdirSync(dir).map((f) => {
            try {
              const stat = fs.statSync(path.join(dir, f));
              return { name: f, size: stat.size, isFile: stat.isFile() };
            } catch (e) {
              return { name: f };
            }
          });
        }
      } catch (e) {
        result[dir] = `Error: ${e.message}`;
      }
    }
    return res.end(JSON.stringify(result));
  }

  // Media Streaming (/data/* or /media/*)
  if (pathname.startsWith('/data/') || pathname.startsWith('/media/')) {
    const filename = pathname.replace(/^\/(data|media)\//, '');
    const filePath = resolveFilePath(filename);

    if (!filePath) {
      setCorsHeaders(res, req);
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end(`File not found: ${filename}`);
    }

    if (req.method === 'GET' || req.method === 'HEAD') {
      return handleMediaStream(req, res, filePath, req.method === 'HEAD');
    }
  }

  // ─── Rate Limiting for AI endpoints (10 req/min per IP) ───
  const AI_ENDPOINTS = ['/api/psyquest', '/api/analyze', '/api/lesson1-strategy',
    '/api/lesson2-strategy', '/api/lesson4-strategy', '/api/lesson5-synthesis',
    '/api/portrait-assessment', '/api/send-telegram-summary', '/api/s2-lesson1-strategy',
    '/api/s2-lesson2-strategy', '/api/s2-lesson3-strategy', '/api/s2-lesson4-strategy'];

  if (req.method === 'POST' && AI_ENDPOINTS.indexOf(pathname) !== -1) {
    const clientIp = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
    const now = Date.now();
    const windowMs = 60000; // 1 minute
    const maxRequests = 10;

    if (!global._rateLimitMap) global._rateLimitMap = {};
    const bucket = global._rateLimitMap[clientIp] || [];
    const recent = bucket.filter(function(t) { return t > now - windowMs; });
    global._rateLimitMap[clientIp] = recent;

    if (recent.length >= maxRequests) {
      setCorsHeaders(res, req);
      res.writeHead(429, { 'Content-Type': 'application/json; charset=utf-8' });
      return res.end(JSON.stringify({ error: 'RATE_LIMIT', message: 'Слишком много запросов. Подождите минуту.' }));
    }
    recent.push(now);

    // Cleanup stale IPs every 5 minutes
    if (!global._rateLimitCleanup) {
      global._rateLimitCleanup = setInterval(function() {
        var map = global._rateLimitMap || {};
        var cutoff = Date.now() - windowMs;
        Object.keys(map).forEach(function(ip) {
          map[ip] = map[ip].filter(function(t) { return t > cutoff; });
          if (map[ip].length === 0) delete map[ip];
        });
      }, 300000);
    }
  }

  // Handle JSON POST requests
  if (req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', async () => {
      setCorsHeaders(res, req);
      res.setHeader('Content-Type', 'application/json; charset=utf-8');

      let parsed = {};
      try {
        parsed = JSON.parse(body || '{}');
      } catch (e) {
        res.writeHead(400);
        return res.end(JSON.stringify({ error: 'INVALID_JSON' }));
      }

      // Route: /api/psyquest or /api/analyze
      if (pathname === '/api/psyquest' || pathname === '/api/analyze') {
        const { answers = [], userName = 'Участник' } = parsed;
        const systemPrompt = [
          'Ты — экспертный клинический и системно-поведенческий психолог, ассистент Анатолия Фёдорова.',
          'Твоя задача — внимательно проанализировать ответы участника (включая свободный текст и варианты ответа) и классифицировать его ситуацию СТРОГО в один из 4-х сценариев:',
          '1. "partner" — Сценарий 1: «Поиск и выбор партнёра» (тяга к сложным/холодным людям, выбор не тех, страх отвержения, качели в начале знакомства).',
          '2. "emotions" — Сценарий 2: «Эмоциональная устойчивость» (дофамино-кортизоловая петля, зависимость от сообщений и настроения, тревога при паузах).',
          '3. "family" — Сценарий 3: «Перезагрузка отношений» (бытовая усталость, взаимные претензии, эмоциональная дистанция в паре/браке).',
          '4. "crisis" — Сценарий 4: «Кризис и сложные решения» (измена, острая боль, шок, угроза развода/расставания, мучительный выбор).',
          '',
          'Верни ТОЛЬКО валидный JSON без markdown и кавычек ```json:',
          '{"route":"partner|emotions|family|crisis","title":"Название сценария","summary":"Персональное глубокое описание ситуации участника (обрати внимание на его свободный текст)","danger":"Главная скрытая ловушка сценария","firstStep":"Первое практическое действие на 10-15 минут","transition":"Связка к видео-разбору Анатолия Фёдорова"}'
        ].join('\n');

        const userPrompt = `Участник: ${userName}\nОтветы и комментарии:\n${answers.map((a, i) => `${i + 1}. ${a}`).join('\n')}`;
        let aiRaw = await callPolzaAI(systemPrompt, userPrompt, true);
        let aiParsed = null;
        if (aiRaw) {
          try { aiParsed = JSON.parse(cleanJsonText(aiRaw)); } catch (e) {}
        }

        // Extract any custom written text from answers
        const customAnswers = answers
          .filter(a => typeof a === 'string' && (a.includes('Свой вариант') || a.includes('Свой ответ')))
          .map(a => a.replace(/^.*?:\s*/, ''));

        // Fallback intelligent classification if AI offline
        const textBlob = JSON.stringify(answers).toLowerCase();
        let fallbackRoute = 'family';
        if (textBlob.includes('измен') || textBlob.includes('кризис') || textBlob.includes('уход') || textBlob.includes('развод') || textBlob.includes('шок') || textBlob.includes('плохо') || textBlob.includes('разрыв')) {
          fallbackRoute = 'crisis';
        } else if (textBlob.includes('выбираю не тех') || textBlob.includes('не тех') || textBlob.includes('холодн') || textBlob.includes('начать новые') || textBlob.includes('выбирать партн')) {
          fallbackRoute = 'partner';
        } else if (textBlob.includes('эмоци') || textBlob.includes('дофамин') || textBlob.includes('тревог') || textBlob.includes('сообщен') || textBlob.includes('завис') || textBlob.includes('качел') || textBlob.includes('всё на мне') || textBlob.includes('все на мне') || textBlob.includes('подстраива')) {
          fallbackRoute = 'emotions';
        } else {
          fallbackRoute = 'family';
        }

        let customNote = '';
        if (customAnswers.length > 0) {
          customNote = ` На основе вашего комментария («${customAnswers.join('; ')}») видно, что для вас важна персональная специфика ситуации.`;
        }

        const scenarioFallbacks = {
          partner: {
            route: 'partner',
            title: 'Сценарий 1: «Поиск и выбор партнёра»',
            summary: `В неопределенности вы пытаетесь немедленно получить ясность или спасаетесь активностью. Из-за этого вы пропускаете тревожные сигналы и привязываетесь к эмоционально недоступным людям.${customNote}`,
            danger: 'Смещение фокуса с вопроса «Подходит ли он мне?» на вопрос «Как его завоевать и что со мной не так?».',
            firstStep: 'Перед следующим сообщением сделайте паузу на 2 выдоха и разделите лист на две колонки: «Сухие факты» и «Мои догадки».',
            transition: 'Перейдите к персональному видео-разбору Анатолия Фёдорова и практическому курсу «Новый сценарий».'
          },
          emotions: {
            route: 'emotions',
            title: 'Сценарий 2: «Эмоциональная устойчивость»',
            summary: `Ваша нервная система попала в дофамино-кортизоловую петлю. Паузы в общении вызывают спазм тревоги, а редкие сообщения — мгновенный салют дофамина.${customNote}`,
            danger: 'Потеря эмоционального суверенитета и накопление скрытого напряжения перед эмоциональным взрывом.',
            firstStep: 'Используйте практику соматического заземления и технику 3-х шагов выхода из дофаминовых качелей.',
            transition: 'Перейдите к урокам курса «Новый сценарий» для возврата внутреннего ядра.'
          },
          family: {
            route: 'family',
            title: 'Сценарий 3: «Перезагрузка отношений»',
            summary: (textBlob.includes('ок') || textBlob.includes('нормальн') || textBlob.includes('хорошо'))
              ? `В ваших отношениях сохраняется базовая стабильность и спокойствие. Главная цель — углублять контакт, поддерживать искреннее тепло и предотвращать скрытое накопление недосказанности.${customNote}`
              : `Отношения застряли в цикле бытовой усталости, взаимных претензий и эмоционального отдаления в паре.${customNote}`,
            danger: 'Привыкание к фоновому отдалению или попытка решать трудности через накопление молчаливых уступок.',
            firstStep: 'Зафиксируйте правила безопасного диалога без взаимных претензий и перехода на личности.',
            transition: 'Перейдите к системному разбору сценариев с Анатолием Фёдоровым.'
          },
          crisis: {
            route: 'crisis',
            title: 'Сценарий 4: «Кризис и сложные решения»',
            summary: `Острая ситуация неопределенности или шока. Психика требует немедленных судьбоносных решений на пике боли.${customNote}`,
            danger: 'Принятие решений в состоянии аффекта из страха одиночества или безысходности.',
            firstStep: 'Снимите острую соматическую реакцию и дайте себе мораторий на окончательные решения на 48 часов.',
            transition: 'Перейдите к экспертной поддержке и методологии выхода из кризиса.'
          }
        };

        const resolvedRoute = (aiParsed && aiParsed.route && ['partner', 'emotions', 'family', 'crisis'].includes(aiParsed.route))
          ? aiParsed.route
          : fallbackRoute;

        const resolvedData = aiParsed || scenarioFallbacks[resolvedRoute];

        res.writeHead(200);
        return res.end(JSON.stringify({
          success: true,
          route: resolvedRoute,
          result: resolvedData
        }));
      }

      // Route: /api/lesson1-strategy
      if (pathname === '/api/lesson1-strategy') {
        const { fact = '', feeling = '', action = '', relief = '', result = '' } = parsed;
        const systemPrompt = [
          'Ты — профессиональный психолог-аналитик поведения, наставник Анатолий Фёдоров. Твоя задача — провести бережный, глубокий системно-поведенческий анализ 5 ответов клиентки для Урока 1.',
          'Верни ответ строго в формате JSON:',
          '{"trigger":"Описание сработавшей программы триггера (до 300 символов)","neuro":"Анализ реакции нервной системы и баланса пользы/цены (до 400 символов)","tension":"Точка напряжения (до 300 символов)","action":"Первый практический шаг для выхода и заземления на 15 минут (до 350 символов)"}'
        ].join('\n');

        const userPrompt = `1. Факт: ${fact}\n2. Ощущения: ${feeling}\n3. Действия: ${action}\n4. Эффект: ${relief}\n5. Итог: ${result}`;
        let aiRaw = await callPolzaAI(systemPrompt, userPrompt, true);
        let aiParsed = null;
        if (aiRaw) {
          try { aiParsed = JSON.parse(cleanJsonText(aiRaw)); } catch (e) {}
        }

        const fallback = {
          trigger: 'Сработал подсознательный фильтр: как только возникает неопределенность или дистанция, внимание смещается с вопроса «Нужен ли мне этот человек?» на «Что мне сделать, чтобы меня выбрали?». Это автоматическое переключение отнимает твою устойчивость.',
          neuro: 'В теле активируется привычный спазм ожидания (тревожная реакция), которую мозг путает с влюбленностью. Срочные действия дают секундный сброс напряжения (мнимую пользу), но закрепляют долгосрочную цену — потерю контроля над своей жизнью и переход в роль догоняющего.',
          tension: 'Максимальный пик напряжения возникает в момент ожидания ответа, когда ум строит катастрофические сценарии отвержения.',
          action: 'Сделай медленный выдох. Твоя задача на сегодня — отлепить реальные факты от тревожных фантазий ума. Останови суету и спроси себя: «Если я сейчас промолчу, какую тревогу я пытаюсь заглушить?» Вернись в позицию выбирающей.'
        };

        const resData = aiParsed || fallback;
        const formattedText = `
🔍 **Разбор твоего сценария по методу Анатолия Фёдорова:**

• **Сработавший триггер**: ${resData.trigger}
• **Реакция нервной системы**: ${resData.neuro}
• **Точка напряжения**: ${resData.tension}
• **Твой первый шаг заземления**: ${resData.action}
        `.trim();

        res.writeHead(200);
        return res.end(JSON.stringify({ success: true, isAi: !!aiParsed, result: resData, analysis: formattedText }));
      }

      // Route: /api/s2-lesson1-strategy (Сценарий 2, Урок 1: Наблюдаемый факт vs Мысли в голове)
      if (pathname === '/api/s2-lesson1-strategy') {
        const { situation = '', thriller = '', emotions = {} } = parsed;
        if (isGibberishText(thriller) || isGibberishText(situation)) {
          setCorsHeaders(res, req);
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          return res.end(JSON.stringify(GIBBERISH_RESPONSE));
        }

        const systemPrompt = [
          'Ты — «Интеллектуальный попутчик», семейный психолог Анатолий Фёдоров.',
          'Твой голос: спокойный, взрослый, мужской, основательный, живой разговор за чашкой чая без заумной академической тягомотины и без коучингового пафоса.',
          'Пиши простыми живыми словами, чтобы понял любой человек, который никогда не читал книг по психологии.',
          'СТРОГИЕ ПРАВИЛА:',
          '1. ЗАПРЕЩЕНО использовать клише: «честно говоря», «давайте погрузимся», «путь к себе», «трансформация», «авторский метод СПА», «практика-стабилизатор».',
          '2. ВАЖНЕЙШАЯ ПРОВЕРКА ВАЛИДНОСТИ: если входные данные участника — бессмыслица, белиберда, случайный набор букв/слов, троллинг или бессодержательный текст, по которому невозможно понять реальную жизненную ситуацию, верни СТРОГО JSON: {"invalid": true, "message": "Ваши ответы были неполноценными, и я не смог их расшифровать. Пожалуйста, опишите ситуацию подробнее своими словами."}',
          '3. Если данные осмысленны: отдели реальный физический факт от тревожных мыслей, которые накрутила голова, и дай 3 простых жизненных шага.',
          '4. Верни ответ СТРОГО в формате JSON без markdown разметки:',
          '{"fact":"(описание только реального физического факта того, что произошло на самом деле, без домыслов и прогнозов, до 220 символов)","thriller":"(разбор того, какие тревожные мысли накрутил испуганный мозг от неизвестности, простыми словами, до 220 символов)","stabilizer":"1. Тело: (простое телесное действие: опустить плечи, стопы в пол, медленный выдох через рот)\\n\\n2. Граница: (напоминание себе простыми словами: чужое молчание — это просто чужое настроение, мне сейчас ничего не угрожает, это не приговор)\\n\\n3. Действие: (бытовое действие прямо сейчас: убрать руки от телефона, налить воды, дать паузе повисеть, не быть аниматором)"}'
        ].join('\n');

        const userPrompt = `Ситуация (что произошло): ${situation}\nМысли в голове (что накрутилось): ${thriller}\nШкалы эмоций (0-10): раздражение/злость=${emotions.anger || 0}, тревога/паника=${emotions.anxiety || 0}, обида/досада=${emotions.resentment || 0}, холод/оцепенение=${emotions.coldness || 0}`;

        let aiRaw = await callPolzaAI(systemPrompt, userPrompt, true);
        let aiParsed = null;
        if (aiRaw) {
          try { aiParsed = JSON.parse(cleanJsonText(aiRaw)); } catch (e) {}
        }

        if (aiParsed && aiParsed.invalid) {
          setCorsHeaders(res, req);
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          return res.end(JSON.stringify(aiParsed));
        }

        const fallback = {
          fact: `В реальности произошло только это: ${situation ? situation.slice(0, 150) : 'партнер пришел молчаливый и отдалился'}. Без домыслов и прогнозов на будущее.`,
          thriller: `Голова накрутила: ${thriller ? thriller.slice(0, 150) : 'он охладел, мы расстанемся, я ему не нужна'}. Мозг от неизвестности всегда рисует худший сценарий.`,
          stabilizer: '1. Тело: Опустите плечи, почувствуйте стопами пол под собой и сделайте спокойный длинный выдох через рот. Напряжение сразу начнет отпускать.\n\n2. Граница: Напомните себе: прямо сейчас мне ничего физически не угрожает. Его хмурость или молчание — это его настроение и его погода. Это не приговор мне и не конец отношений.\n\n3. Действие: Уберите руки от телефона, налейте стакан теплой воды и дайте паузе случиться. Вы не обязаны быть аниматором чужого настроения и срочно всё спасать.'
        };

        const resData = aiParsed || fallback;
        setCorsHeaders(res, req);
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        return res.end(JSON.stringify(resData));
      }

      // Route: /api/s2-lesson2-strategy (Сценарий 2, Урок 2: Переводчик на язык партнёра)
      if (pathname === '/api/s2-lesson2-strategy') {
        const { situation = '', phrase = '', need = '' } = parsed;
        if (isGibberishText(need) || isGibberishText(phrase)) {
          setCorsHeaders(res, req);
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          return res.end(JSON.stringify(GIBBERISH_RESPONSE));
        }

        const systemPrompt = [
          'Ты — «Интеллектуальный попутчик», мудрый наставник и переводчик в отношениях в проекте Анатолия Фёдорова.',
          'Твоя задача — помочь участнику перевести привычную претензию/контроль на язык истинной потребности без нападения и защит.',
          'ВАЖНЕЙШАЯ ПРОВЕРКА: если ответы — бессмыслица, белиберда, случайный набор букв или бессодержательный текст, верни СТРОГО: {"invalid": true, "message": "Ваши ответы были неполноценными, и я не смог их расшифровать. Пожалуйста, опишите ситуацию подробнее своими словами."}',
          'СТРОГИЙ ФОРМАТ JSON:',
          '{"partnerView":"(Как эта фраза звучит для партнёра: почему вызывает сопротивление или желание отстраниться, 1-2 предложения)","needView":"(Какая истинная глубинная потребность прячется за этими словами на самом деле, 1-2 предложения)","alternatives":"1. «(первый бережный вариант фразы от первого лица)»<br>2. «(второй вариант)»<br>3. «(третий вариант)»"}'
        ].join('\n');

        const userPrompt = `Ситуация: ${situation}\nЧто сказали/хотели сказать: ${phrase}\nИстинная потребность: ${need}`;
        let aiRaw = await callPolzaAI(systemPrompt, userPrompt, true);
        let aiParsed = null;
        if (aiRaw) {
          try { aiParsed = JSON.parse(cleanJsonText(aiRaw)); } catch (e) {}
        }

        if (aiParsed && aiParsed.invalid) {
          setCorsHeaders(res, req);
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          return res.end(JSON.stringify(aiParsed));
        }

        const fallback = {
          partnerView: 'Фраза звучит как скрытый упрёк и требование оправдаться, из-за чего партнёр не слышит саму боль, а уходит в глухую оборону или отдаляется.',
          needView: `За этой реакцией стоит живая потребность: «${need.slice(0, 100)}». Вам нужно не обвинить, а почувствовать безопасность и надёжность.`,
          alternatives: '1. «Мне сейчас тревожно и не хватает ясности. Давай спокойно поговорим 10 минут, для меня это очень важно.»<br>2. «Я очень устала всё держать в голове. Мне нужна твоя помощь и участие, чтобы выдохнуть.»<br>3. «Когда ты отдаляешься, мне кажется, что я остаюсь одна. Скажи, что сейчас происходит?»'
        };

        const resData = aiParsed || fallback;
        setCorsHeaders(res, req);
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        return res.end(JSON.stringify(resData));
      }

      // Route: /api/s2-lesson3-strategy (Сценарий 2, Урок 3: Остановка внутреннего шторма)
      if (pathname === '/api/s2-lesson3-strategy') {
        const { situation = '', pain = '', bodySignals = [] } = parsed;
        if (isGibberishText(pain) || (situation && isGibberishText(situation) && situation.length > 0)) {
          setCorsHeaders(res, req);
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          return res.end(JSON.stringify(GIBBERISH_RESPONSE));
        }

        const systemPrompt = [
          'Ты — «Интеллектуальный попутчик», наставник Анатолий Фёдоров.',
          'Твоя задача — помочь участнику остановить внутренний шторм, снять мысленную жвачку и дать одну сильную стабилизирующую формулу самоподдержки.',
          'ВАЖНЕЙШАЯ ПРОВЕРКА: если ответы — бессмыслица, белиберда, случайный набор букв или бессодержательный текст, верни СТРОГО: {"invalid": true, "message": "Ваши ответы были неполноценными, и я не смог их расшифровать. Пожалуйста, опишите ситуацию подробнее своими словами."}',
          'СТРОГИЙ ФОРМАТ JSON:',
          '{"formula":"«(точная, ёмкая формула из 3-4 предложений от первого лица, признающая эмоции, отделяющая фантазии от реальности и возвращающая покой в тело)»"}'
        ].join('\n');

        const userPrompt = `Ситуация: ${situation}\nМысли и обвинения в голове: ${pain}\nТелесные сигналы: ${Array.isArray(bodySignals) ? bodySignals.join(', ') : bodySignals}`;
        let aiRaw = await callPolzaAI(systemPrompt, userPrompt, true);
        let aiParsed = null;
        if (aiRaw) {
          try { aiParsed = JSON.parse(cleanJsonText(aiRaw)); } catch (e) {}
        }

        if (aiParsed && aiParsed.invalid) {
          setCorsHeaders(res, req);
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          return res.end(JSON.stringify(aiParsed));
        }

        const fallback = {
          formula: '«Да, у меня сейчас инерция мышления. Я живой человек, меня задело. Но споря в голове, я сжигаю свои силы. Прямо сейчас мне ничего не угрожает. Я выбираю свой покой и отпускаю чужое настроение.»'
        };

        const resData = aiParsed || fallback;
        setCorsHeaders(res, req);
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        return res.end(JSON.stringify(resData));
      }

      // Route: /api/s2-lesson4-strategy (Сценарий 2, Урок 4: Напутствие Мудрой Себя)
      if (pathname === '/api/s2-lesson4-strategy') {
        const { states = [], beliefs = [], vision = '' } = parsed;
        if (isGibberishText(vision)) {
          setCorsHeaders(res, req);
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          return res.end(JSON.stringify(GIBBERISH_RESPONSE));
        }

        const systemPrompt = [
          'Ты — «Интеллектуальный попутчик», наставник Анатолий Фёдоров, проводник голоса взрослой, мудрой позиции участницы.',
          'Твоя задача — собрать тёплое, глубокое напутствие с уважением и поддержкой.',
          'СТРОГИЙ ЗАПРЕТ: НИКАКОЙ фамильярности! Запрещены обращения вроде "милая", "дорогая", "девочка моя" и т.п. Тон — спокойный, взрослый, поддерживающий, уважительный на "Вы".',
          'ВАЖНЕЙШАЯ ПРОВЕРКА: если ответы — бессмыслица, белиберда, случайный набор букв или бессодержательный текст, верни СТРОГО: {"invalid": true, "message": "Ваши ответы были неполноценными, и я не смог их расшифровать. Пожалуйста, опишите ситуацию подробнее своими словами."}',
          'СТРОГИЙ ФОРМАТ JSON:',
          '{"message":"«(глубокое, взрослое напутствие: 3-4 предложения, опора на безусловную ценность, снятие вины, разрешение отпустить гиперконтроль, уважение и покой)»"}'
        ].join('\n');

        const userPrompt = `Подавленные состояния: ${Array.isArray(states) ? states.join(', ') : states}\nЗдоровые убеждения: ${Array.isArray(beliefs) ? beliefs.join(', ') : beliefs}\nОбраз реализованной потребности: ${vision}`;
        let aiRaw = await callPolzaAI(systemPrompt, userPrompt, true);
        let aiParsed = null;
        if (aiRaw) {
          try { aiParsed = JSON.parse(cleanJsonText(aiRaw)); } catch (e) {}
        }

        if (aiParsed && aiParsed.invalid) {
          setCorsHeaders(res, req);
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          return res.end(JSON.stringify(aiParsed));
        }

        const fallback = {
          message: '«Перестаньте заслуживать любовь контролем и тревогами. Ваша ценность существует сама по себе. Позвольте себе выдохнуть и опереться на собственную силу. Всё, что вам нужно для устойчивости — уже внутри вас.»'
        };

        const resData = aiParsed || fallback;
        setCorsHeaders(res, req);
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        return res.end(JSON.stringify(resData));
      }

      // Route: /api/lesson2-strategy (Карта притяжения)
      if (pathname === '/api/lesson2-strategy') {
        const {
          situation = '',
          bodyScore = 0,
          bodyLevel = 'умеренное',
          bodyLevelDisplay = 'умеренная',
          actionsClarity = 'противоречивые сигналы',
          actionsClarityDisplay = 'противоречивые сигналы',
          criteria = [],
          resultTitle = '',
          resultText = '',
          userName = 'Участник'
        } = parsed;

        const criteriaStr = Array.isArray(criteria) ? criteria.join(', ') : criteria;

        const systemPrompt = [
          'Ты — «Интеллектуальный попутчик» и бережный наставник в курсе «Я выбираю». Твоя задача — составить персональный разбор «Карты притяжения» для Урока 2.',
          '',
          'СТРОГИЕ ТРЕБОВАНИЯ К ФОРМАТУ:',
          'Верни ответ ИСКЛЮЧИТЕЛЬНО в формате валидного JSON со строгой структурой без Markdown-разметки (без **, без #, без кавычек-ёлочек в ключах):',
          '{',
          '  "body": "Текст о реакции тела (строго 2-3 предложения)",',
          '  "behavior": "Текст о поступках человека (строго 2-3 предложения)",',
          '  "focus": "Текст с ориентирами для дальнейшего наблюдения с упоминанием 3 критериев (строго 2-3 предложения)"',
          '}',
          '',
          'ИНСТРУКЦИЯ ПО СОДЕРЖАНИЮ:',
          '1. "body" (Что показывает тело): Опиши уровень телесного напряжения (' + bodyLevelDisplay + '). Укажи, что телесная реакция может сопровождать как притяжение, так и тревожную неопределённость. Не делай вывод о совместимости только по реакции тела.',
          '2. "behavior" (Что показывают поступки): Опираясь только на ответы (' + actionsClarityDisplay + '), опиши последовательность, ясность и взаимность поведения человека. Не додумывай скрытые мотивы.',
          '3. "focus" (На что обратить внимание): Обязательно назови 3 выбранных ориентира (' + (criteriaStr || 'эмоциональная доступность, взаимная инициатива, ясность') + ') и дай конкретные ориентиры для следующих контактов.',
          '',
          'ОГРАНИЧЕНИЯ (ЗАПРЕЩЕНО):',
          '- Не ставить диагнозы и не определять типы привязанности.',
          '- Не утверждать, что человек подходит или не подходит пользователю.',
          '- Не советовать продолжить или завершить отношения.',
          '- Не приписывать человеку скрытые мотивы.',
          '- Не использовать неподтверждённые утверждения о гормонах и нервной системе.',
          '- Не использовать слова «точно», «однозначно», «всегда».',
          '- Не писать более трёх предложений в одном блоке.',
          '- НЕ использовать символы ** и # в тексте.'
        ].join('\n');

        const userPrompt = `Участник: ${userName}\nОписание ситуации: ${situation}\nТелесное возбуждение: ${bodyLevelDisplay}\nПоведение человека: ${actionsClarityDisplay}\nТри выбранных ориентира: ${criteriaStr}\nИтоговый результат: ${resultTitle}`;

        let aiRaw = await callPolzaAI(systemPrompt, userPrompt, true);
        let aiParsed = null;
        if (aiRaw) {
          try {
            const clean = cleanJsonText(aiRaw);
            aiParsed = JSON.parse(clean);
          } catch (e) {
            console.error('JSON parse error in lesson2-strategy:', e);
          }
        }

        // Clean any markdown formatting from parsed fields
        function cleanText(str) {
          if (!str || typeof str !== 'string') return '';
          return str.replace(/[*#_`]/g, '').trim();
        }

        const fallback = {
          body: bodyLevel === 'выраженное'
            ? `Телесное напряжение выраженное. Оно может сопровождать и сильное притяжение, и тревожную неопределённость, поэтому одной реакции тела пока недостаточно для вывода о совместимости.`
            : (bodyLevel === 'низкое'
              ? `Телесное напряжение низкое, дыхание и тело остаются спокойными. Такое спокойствие может свидетельствовать о безопасности контакта, но само по себе требует наблюдения за динамикой общения.`
              : `Телесное напряжение умеренное. Оно может сопровождать и интерес к человеку, и реакцию на паузы в общении, поэтому только по реакции тела пока рано делать выводы.`),
          behavior: actionsClarity === 'достаточно последовательное поведение'
            ? `В поведении человека прослеживается достаточная последовательность и инициатива. Его слова подкрепляются конкретными поступками и договоренностями.`
            : (actionsClarity === 'мало последовательности'
              ? `В поведении человека пока мало последовательности и ясности. Сейчас недостаточно фактов, чтобы считать контакт устойчивым и надежным.`
              : `Сигналы и поступки человека пока противоречивы: проявления внимания сменяются дистанцией. Для понимания ситуации требуется больше времени и фактов.`),
          focus: `Ваши главные ориентиры: ${criteriaStr || 'эмоциональная доступность, взаимная инициатива и способность обсуждать сложное'}. Во время следующих контактов наблюдайте, проявляет ли человек инициативу, совпадают ли его слова с поступками и становится ли вам спокойнее после общения.`
        };

        const resultObj = {
          body: cleanText(aiParsed?.body) || fallback.body,
          behavior: cleanText(aiParsed?.behavior || aiParsed?.actions) || fallback.behavior,
          focus: cleanText(aiParsed?.focus) || fallback.focus
        };

        res.writeHead(200);
        return res.end(JSON.stringify({
          success: true,
          isAi: !!aiParsed,
          result: resultObj
        }));
      }

      // Route: /api/lesson4-strategy (Вернуть себе свою силу — ИИ Разбор)
      if (pathname === '/api/lesson4-strategy') {
        const {
          mode = 'resource',
          quality = '',
          allowedBehavior = '',
          rules = [],
          resource = '',
          bodyChange = '',
          newAction = '',
          userName = 'Участник'
        } = parsed;

        const rulesStr = Array.isArray(rules) ? rules.join('; ') : rules;

        function cleanSimple(str) {
          if (!str || typeof str !== 'string') return '';
          return str.replace(/[*#_`]/g, '').trim();
        }

        // Mode 1: Resource & Explanation (Stage 4)
        if (mode === 'resource') {
          const systemPrompt = [
            'Ты — «Интеллектуальный попутчик» в курсе «Я выбираю».',
            'Твоя задача — помочь участнику отделить полезный ресурс от разрушительного поведения и найти здоровую форму качества, которое привлекает его в других людях.',
            '',
            'СТРОГИЕ ТРЕБОВАНИЯ К ФОРМАТУ:',
            'Верни ответ ИСКЛЮЧИТЕЛЬНО в формате валидного JSON со строгой структурой без Markdown-разметки:',
            '{',
            '  "resource": "Здоровая форма выбранного качества (краткая ёмкая формулировка)",',
            '  "explanation": "Краткое бережное объяснение связи с внутренним запретом участника в 1–2 предложениях"',
            '}',
            '',
            'ОГРАНИЧЕНИЯ (ЗАПРЕЩЕНО):',
            '- Не ставить диагнозы и не искать травмы в детстве.',
            '- Не советовать копировать резкость, агрессию или неуважение.',
            '- Не использовать категоричные слова «точно», «всегда», «однозначно».',
            '- НЕ использовать символы ** и # в тексте.'
          ].join('\n');

          const userPrompt = `Участник: ${userName}\nКачество-магнит: ${quality}\nЧто позволяет себе другой человек (а участник запрещает): ${allowedBehavior}\nВнутренние правила и запреты: ${rulesStr}`;

          let aiRaw = await callPolzaAI(systemPrompt, userPrompt, true);
          let aiParsed = null;
          if (aiRaw) {
            try { aiParsed = JSON.parse(cleanJsonText(aiRaw)); } catch (e) {}
          }

          const qLower = (quality || '').toLowerCase();
          let fallbackResource = 'Внимание к собственным потребностям';
          let fallbackExplanation = 'Это способность замечать и уважать свои желания, выстраивая ясный и честный контакт с окружающими.';

          if (qLower.includes('дерзост')) {
            fallbackResource = 'Право прямо говорить «нет»';
            fallbackExplanation = 'Это способность спокойно обозначать свои границы и открыто выражать несогласие без агрессии и чувства вины.';
          } else if (qLower.includes('независим')) {
            fallbackResource = 'Способность принимать решения с опорой на себя';
            fallbackExplanation = 'Это внутренняя автономия и готовность делать выбор, не нуждаясь в постоянном внешнем одобрении.';
          } else if (qLower.includes('яркост')) {
            fallbackResource = 'Право быть заметной и занимать пространство';
            fallbackExplanation = 'Это естественное проявление своей индивидуальности и открытое присутствие в общении.';
          } else if (qLower.includes('спонтан')) {
            fallbackResource = 'Разрешение иногда отступать от жесткого плана';
            fallbackExplanation = 'Это гибкость и способность доверять моменту, сохраняя внутреннее спокойствие.';
          } else if (qLower.includes('уверен')) {
            fallbackResource = 'Право на собственное мнение и ценность';
            fallbackExplanation = 'Это устойчивое признание своей значимости без потребности что-либо доказывать другим.';
          } else if (qLower.includes('эмоциональн')) {
            fallbackResource = 'Способность открыто проживать и называть свои чувства';
            fallbackExplanation = 'Это честный контакт со своими переживаниями и право делиться ими в безопасной форме.';
          } else if (qLower.includes('решительн')) {
            fallbackResource = 'Право действовать без бесконечных сомнений';
            fallbackExplanation = 'Это готовность делать первый шаг и брать ответственность за свои решения.';
          }

          const resObj = {
            resource: cleanSimple(aiParsed?.resource) || fallbackResource,
            explanation: cleanSimple(aiParsed?.explanation) || fallbackExplanation
          };

          res.writeHead(200);
          return res.end(JSON.stringify({
            success: true,
            isAi: !!aiParsed,
            result: resObj
          }));
        }

        // Mode 2: Permission Phrase & Final Synthesis (Stage 6 / Result)
        const systemPrompt = [
          'Ты — «Интеллектуальный попутчик» в курсе «Я выбираю».',
          'Твоя задача — составить персональную фразу-разрешение и безопасный шаг для практики «Вернуть себе свою силу».',
          '',
          'СТРОГИЕ ТРЕБОВАНИЯ К ФОРМАТУ:',
          'Верни ответ ИСКЛЮЧИТЕЛЬНО в формате валидного JSON со строгой структурой без Markdown-разметки:',
          '{',
          '  "permission": "Персональная фраза-разрешение от первого лица (строго одно предложение, начинающееся с «Я разрешаю себе...»)",',
          '  "safe_action": "Безопасный способ проявить это качество (1 предложение)"',
          '}',
          '',
          'ТРЕБОВАНИЯ К ФРАЗЕ-РАЗРЕШЕНИЮ:',
          '- Строго одно предложение от первого лица.',
          '- Без диагнозов, без обещаний мгновенной трансформации.',
          '- Соединяет выбранное качество со здоровым уважением к себе и другим.',
          '- Пример: «Я разрешаю себе быть заметной, сохраняя уважение к себе и другим».',
          '',
          'ОГРАНИЧЕНИЯ (ЗАПРЕЩЕНО):',
          '- Не использовать слова «точно», «всегда», «однозначно».',
          '- НЕ использовать символы ** и # в тексте.'
        ].join('\n');

        const userPrompt = `Участник: ${userName}\nКачество: ${quality}\nЧто позволял другой человек: ${allowedBehavior}\nВнутренние правила: ${rulesStr}\nЗдоровая форма: ${resource}\nОщущение в теле: ${bodyChange}\nНовый поступок: ${newAction}`;

        let aiRaw = await callPolzaAI(systemPrompt, userPrompt, true);
        let aiParsed = null;
        if (aiRaw) {
          try { aiParsed = JSON.parse(cleanJsonText(aiRaw)); } catch (e) {}
        }

        const qLower = (quality || '').toLowerCase();
        let fallbackPerm = `Я разрешаю себе ${resource ? resource.toLowerCase().replace(/^(право|способность|разрешение)\s+/i, '') : 'проявлять свою силу'}, сохраняя уважение к себе и другим.`;
        if (qLower.includes('дерзост')) fallbackPerm = 'Я разрешаю себе прямо говорить «нет» и защищать свои границы, сохраняя уважение к себе и другим.';
        else if (qLower.includes('независим')) fallbackPerm = 'Я разрешаю себе принимать решения с опорой на себя, сохраняя уважение к себе и другим.';
        else if (qLower.includes('яркост')) fallbackPerm = 'Я разрешаю себе быть заметной и занимать своё место, сохраняя уважение к себе и другим.';
        else if (qLower.includes('спонтан')) fallbackPerm = 'Я разрешаю себе быть живой и естественной в своих проявлениях, сохраняя уважение к себе и другим.';
        else if (qLower.includes('уверен')) fallbackPerm = 'Я разрешаю себе опираться на свою ценность, сохраняя уважение к себе и другим.';
        else if (qLower.includes('эмоциональн')) fallbackPerm = 'Я разрешаю себе открыто называть свои чувства, сохраняя бережность к себе и окружающим.';
        else if (qLower.includes('решительн')) fallbackPerm = 'Я разрешаю себе действовать и делать выбор, сохраняя уважение к себе и другим.';

        const finalPerm = cleanSimple(aiParsed?.permission) || fallbackPerm;
        const finalAction = cleanSimple(aiParsed?.safe_action) || newAction;

        res.writeHead(200);
        return res.end(JSON.stringify({
          success: true,
          isAi: !!aiParsed,
          result: {
            permission: finalPerm,
            safe_action: finalAction
          }
        }));
      }

      // Route: /api/lesson5-synthesis (Итоговый разбор «Мой новый сценарий»)
      if (pathname === '/api/lesson5-synthesis') {
        const {
          trigger = 'Пока не определено',
          feelings = 'Пока не определено',
          oldAction = 'Пока не определено',
          bodySignal = 'Пока не определено',
          criteria = [],
          strength = 'Пока не определено',
          newAction = 'Пока не определено',
          userName = 'Участник'
        } = parsed;

        function cleanSimple(str) {
          if (!str || typeof str !== 'string') return '';
          return str.replace(/[*#_`]/g, '').trim();
        }

        const criteriaList = Array.isArray(criteria) ? criteria : [criteria];
        const criteriaStr = criteriaList.filter(Boolean).join(', ') || 'Пока не определено';

        const systemPrompt = [
          'Ты — «Интеллектуальный попутчик» в курсе «Я выбираю» Анатолия Фёдорова.',
          'Твоя задача — объединить результаты всех пройденных уроков участника в единую бережную карту «Мой новый сценарий».',
          '',
          'СТРОГИЕ ТРЕБОВАНИЯ К ФОРМАТУ:',
          'Верни ответ ИСКЛЮЧИТЕЛЬНО в формате валидного JSON со строгой структурой без Markdown-разметки:',
          '{',
          '  "trigger": "Краткая формулировка того, что запускает прежний сценарий",',
          '  "body_signal": "Первый телесный сигнал напряжения",',
          '  "old_reaction": "Привычная реакция и автоматическое действие",',
          '  "pause": "Конкретная точка остановки (пауза, длинный выдох, откладывание решения)",',
          '  "criteria": ["Ориентир 1", "Ориентир 2", "Ориентир 3"],',
          '  "strength": "Возвращённая здоровая сила и качество",',
          '  "new_action": "Новый осознанный способ действия",',
          '  "support_phrase": "Персональная поддерживающая фраза от первого лица (строго одно предложение, «Я разрешаю себе...»)"',
          '}',
          '',
          'ОГРАНИЧЕНИЯ (ЗАПРЕЩЕНО):',
          '- Не придумывать данные, если передано «Пока не определено».',
          '- Не использовать категоричные слова «точно», «всегда», «однозначно».',
          '- Не ставить диагнозы и ярлыки.',
          '- НЕ использовать символы ** и # в тексте.'
        ].join('\n');

        const userPrompt = `Участник: ${userName}\nТриггер (Урок 1): ${trigger}\nМысли и чувства (Урок 1): ${feelings}\nПривычное действие (Урок 1): ${oldAction}\nСигнал тела (Урок 2): ${bodySignal}\nОриентиры в отношениях (Урок 2): ${criteriaStr}\nВозвращенная сила (Урок 4): ${strength}\nНовый поступок (Урок 4): ${newAction}`;

        let aiRaw = await callPolzaAI(systemPrompt, userPrompt, true);
        let aiParsed = null;
        if (aiRaw) {
          try { aiParsed = JSON.parse(cleanJsonText(aiRaw)); } catch (e) {}
        }

        // Deterministic fallback based on supplied data
        const fallbackObj = {
          trigger: trigger,
          body_signal: bodySignal,
          old_reaction: oldAction,
          pause: 'Заметить напряжение в теле, сделать длинный выдох и отложить действие до возвращения спокойствия',
          criteria: criteriaList.length > 0 && criteriaList[0] !== 'Пока не определено' ? criteriaList : ['Пока не определено'],
          strength: strength,
          new_action: newAction,
          support_phrase: `«Я разрешаю себе делать выбор из спокойствия и уважения к себе, сохраняя свою силу».`
        };

        const finalResult = {
          trigger: cleanSimple(aiParsed?.trigger) || fallbackObj.trigger,
          body_signal: cleanSimple(aiParsed?.body_signal) || fallbackObj.body_signal,
          old_reaction: cleanSimple(aiParsed?.old_reaction) || fallbackObj.old_reaction,
          pause: cleanSimple(aiParsed?.pause) || fallbackObj.pause,
          criteria: Array.isArray(aiParsed?.criteria) && aiParsed.criteria.length > 0 ? aiParsed.criteria.map(cleanSimple) : fallbackObj.criteria,
          strength: cleanSimple(aiParsed?.strength) || fallbackObj.strength,
          new_action: cleanSimple(aiParsed?.new_action) || fallbackObj.new_action,
          support_phrase: cleanSimple(aiParsed?.support_phrase) || fallbackObj.support_phrase
        };

        if (!finalResult.support_phrase.startsWith('«')) {
          finalResult.support_phrase = `«${finalResult.support_phrase.replace(/^["'«]+|["'»]+$/g, '')}»`;
        }

        res.writeHead(200);
        return res.end(JSON.stringify({
          success: true,
          isAi: !!aiParsed,
          result: finalResult
        }));
      }

      // Route: /api/portrait-assessment
      if (pathname === '/api/portrait-assessment') {
        const { answers = [], userName = 'Участник' } = parsed;
        const systemPrompt = 'Ты — экспертная система системно-поведенческого анализа и ИИ-помощник Анатолия Фёдорова. Составь персональный структурированный психологический портрет по 21 вопросу.';
        const userPrompt = `Участник: ${userName}\nОтветы: ${JSON.stringify(answers)}`;
        const aiReport = await callPolzaAI(systemPrompt, userPrompt, false);

        res.writeHead(200);
        return res.end(JSON.stringify({
          success: true,
          report: aiReport || `Персональный психологический портрет для ${userName} сформирован и направлен в экспертную систему.`
        }));
      }

      // Route: /api/send-telegram-summary (Отправка разбора в личные сообщения бота)
      if (pathname === '/api/send-telegram-summary') {
        const { lessonNumber = 1, title = '', message = '', user = {} } = parsed;
        const botToken = process.env.TELEGRAM_BOT_TOKEN || '';
        const chatId = user?.id || user?.userId || user?.telegram_id || user?.telegramId || user?.chat_id || user?.chatId || process.env.TELEGRAM_DEFAULT_CHAT_ID || '';

        console.log(`[Telegram PM Summary] Lesson ${lessonNumber} for user ${user?.first_name || user?.id || 'guest'}`);

        let delivered = false;

        if (botToken && chatId) {
          try {
            const https = require('https');
            const postData = JSON.stringify({
              chat_id: chatId,
              text: message
            });

            delivered = await new Promise((resolve) => {
              const reqTg = https.request({
                hostname: 'api.telegram.org',
                path: `/bot${botToken}/sendMessage`,
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Content-Length': Buffer.byteLength(postData)
                }
              }, (resTg) => {
                let tgData = '';
                resTg.on('data', chunk => tgData += chunk);
                resTg.on('end', () => {
                  try {
                    const parsedRes = JSON.parse(tgData);
                    resolve(parsedRes.ok === true);
                  } catch (e) {
                    resolve(false);
                  }
                });
              });

              reqTg.on('error', (err) => {
                console.error('[Telegram Bot API error]:', err.message);
                resolve(false);
              });
              reqTg.write(postData);
              reqTg.end();
            });
          } catch (e) {
            console.error('[Telegram Bot Send Exception]:', e);
          }
        }

        res.writeHead(200);
        return res.end(JSON.stringify({
          success: true,
          delivered: delivered,
          lesson: lessonNumber
        }));
      }

      // Unknown POST
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'NOT_FOUND' }));
    });
    return;
  }

  // Default 404
  setCorsHeaders(res);
  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Not Found');
});

server.on('error', (err) => {
  if ((err.code === 'EACCES' || err.code === 'EADDRINUSE') && PORT !== 3000) {
    console.warn(`[Port Fallback] Port ${PORT} unavailable (${err.code}), listening on 3000...`);
    server.listen(3000, '0.0.0.0');
  } else {
    console.error('[Server Error]:', err);
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Psy-Course Zero-Dependency Media & AI Server running on port ${PORT}`);
});
