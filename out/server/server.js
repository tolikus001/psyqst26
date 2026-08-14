const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = parseInt(process.env.PORT || '3000', 10);
const POLZA_URL = process.env.POLZA_URL || process.env.POLZA_BASE_URL || 'https://api.polza.ai/v1';
const POLZA_API_KEY = process.env.POLZA_API_KEY || '';
const POLZA_MODEL = process.env.POLZA_MODEL || 'gpt-4o-mini';

// CORS Headers
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Range, Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Range, Content-Length, Accept-Ranges');
}

// Resolve Media/Data File Path
function resolveFilePath(targetName) {
  const cleanName = path.basename(targetName).trim();
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
  setCorsHeaders(res);
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
    setCorsHeaders(res);
    res.writeHead(204);
    return res.end();
  }

  // Healthcheck
  if (pathname === '/health' && req.method === 'GET') {
    setCorsHeaders(res);
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    return res.end(JSON.stringify({ ok: true, status: 'running', service: 'psyquest-media-ai-zero-dep', timestamp: new Date().toISOString() }));
  }

  // Serve Client Files or Index
  if (pathname === '/' || pathname.endsWith('.html') || pathname.endsWith('.css') || pathname.endsWith('.js')) {
    const filename = pathname === '/' ? 'index.html' : path.basename(pathname);
    const clientPath = path.join(__dirname, '..', 'client', filename);
    if (fs.existsSync(clientPath)) {
      return handleMediaStream(req, res, clientPath, req.method === 'HEAD');
    }
  }

  // API Files Diagnostics
  if (pathname === '/api/files' && req.method === 'GET') {
    setCorsHeaders(res);
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
      setCorsHeaders(res);
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end(`File not found: ${filename}`);
    }

    if (req.method === 'GET' || req.method === 'HEAD') {
      return handleMediaStream(req, res, filePath, req.method === 'HEAD');
    }
  }

  // Handle JSON POST requests
  if (req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', async () => {
      setCorsHeaders(res);
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
          'Ты формируешь персональную обратную связь по интерактивной диагностике отношений.',
          'Это образовательный психологический материал, не медицинская и не клиническая диагностика.',
          'Объясняй цикл: ситуация -> интерпретация -> напряжение -> действие -> реакция партнёра -> повторение.',
          'Первый шаг должен занимать не более 15 минут.',
          'Верни только валидный JSON без Markdown.',
          '{"title":"название стратегии","summary":"персональное описание","strength":"что помогает","limitation":"что поддерживает повторение","cycle":["ситуация","интерпретация","напряжение","действие","реакция","повторение"],"firstStep":"первый шаг","transition":"связка к материалам"}'
        ].join('\n');

        const userPrompt = `Участник: ${userName}\nОтветы: ${JSON.stringify(answers)}`;
        let aiRaw = await callPolzaAI(systemPrompt, userPrompt, true);
        let aiParsed = null;
        if (aiRaw) {
          try { aiParsed = JSON.parse(cleanJsonText(aiRaw)); } catch (e) {}
        }

        const fallback = {
          title: 'Поиск и выбор партнёра',
          summary: 'В неопределенности вы пытаетесь немедленно получить ясность или спасаетесь активностью. Из-за этого вы пропускаете тревожные сигналы и привязываетесь к эмоционально недоступным людям.',
          strength: 'Вы умеете замечать детали, цените искренний контакт и стремитесь строить глубокие отношения.',
          limitation: 'Смещение фокуса с вопроса «Подходит ли он мне?» на вопрос «Как его завоевать и что со мной не так?».',
          cycle: [
            'Неопределенность или молчание партнера',
            'Мысль: «со мной что-то не так / надо срочно что-то сделать»',
            'Рост соматического спазма тревоги',
            'Импульсивное сообщение или выяснение отношений',
            'Временное облегчение, но партнер отдаляется',
            'Повторение цикла и переход в роль догоняющего'
          ],
          firstStep: 'Перед следующим звонком или сообщением сделайте паузу на 2 глубоких выдоха и разделите лист на две колонки: «Сухие факты» и «Мои догадки».',
          transition: 'Перейдите к персональному видео-разбору Анатолия Фёдорова и практическому курсу «Новый сценарий».'
        };

        res.writeHead(200);
        return res.end(JSON.stringify({ success: true, route: 'partner', result: aiParsed || fallback }));
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
        return res.end(JSON.stringify({ success: true, result: resData, analysis: formattedText }));
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

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Psy-Course Zero-Dependency Media & AI Server running on http://localhost:${PORT}`);
});
