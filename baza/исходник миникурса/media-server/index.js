const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const PORT = parseInt(process.env.PORT || "80", 10);
const POLZA_URL = process.env.POLZA_URL || "https://polza.ai/api/v1/chat/completions";
const POLZA_API_KEY = process.env.POLZA_API_KEY || "";
const POLZA_MODEL = process.env.POLZA_MODEL || "gpt-4o-mini";

// Поиск файла (без учета регистра)
function resolveFilePath(targetName) {
  const cleanName = path.basename(targetName).trim();
  const searchDirs = [
    "/data",
    path.join(__dirname, "files"),
    path.join(__dirname, "media"),
    path.join(__dirname, "data"),
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

function setCorsHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Range, Content-Type, Authorization, X-Requested-With");
  res.setHeader("Access-Control-Expose-Headers", "Content-Range, Content-Length, Accept-Ranges");
}

function handleMediaStream(req, res, filePath, isHead = false) {
  setCorsHeaders(res);

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;
  const ext = path.extname(filePath).toLowerCase();

  let contentType = "application/octet-stream";
  if (ext === ".mp4") contentType = "video/mp4";
  else if (ext === ".pdf") contentType = "application/pdf";
  else if (ext === ".mp3") contentType = "audio/mpeg";
  else if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
  else if (ext === ".png") contentType = "image/png";

  res.setHeader("Accept-Ranges", "bytes");

  // Отдача PDF
  if (ext === ".pdf") {
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Length", fileSize);
    res.setHeader("Content-Disposition", `inline; filename="${path.basename(filePath)}"`);
    if (isHead) return res.writeHead(200).end();
    return fs.createReadStream(filePath).pipe(res);
  }

  // Потоковый стриминг Range 206 для видео
  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    if (start >= fileSize || end >= fileSize) {
      res.setHeader("Content-Range", `bytes */${fileSize}`);
      res.writeHead(416, { "Content-Type": "text/plain" });
      return res.end("Requested range not satisfiable");
    }

    const chunksize = (end - start) + 1;
    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Content-Length": chunksize,
      "Content-Type": contentType
    });

    if (isHead) return res.end();
    fs.createReadStream(filePath, { start, end }).pipe(res);
  } else {
    res.writeHead(200, {
      "Content-Length": fileSize,
      "Content-Type": contentType
    });

    if (isHead) return res.end();
    fs.createReadStream(filePath).pipe(res);
  }
}

function cleanJsonText(text) {
  if (typeof text !== "string") return "";
  return text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
}

function validateLessonResult(result) {
  return Boolean(
    result &&
    typeof result.trigger === "string" &&
    typeof result.neuro === "string" &&
    typeof result.tension === "string" &&
    typeof result.action === "string"
  );
}

function validateInput(data) {
  return Boolean(
    data &&
    data.preliminaryResult &&
    typeof data.preliminaryResult.strategy === "string" &&
    data.preliminaryResult.strategyScores &&
    data.preliminaryResult.scales &&
    Array.isArray(data.answers)
  );
}

function validateResult(result) {
  return Boolean(
    result &&
    typeof result.title === "string" &&
    typeof result.summary === "string" &&
    typeof result.strength === "string" &&
    typeof result.limitation === "string" &&
    Array.isArray(result.cycle) &&
    result.cycle.length === 6 &&
    typeof result.firstStep === "string" &&
    typeof result.transition === "string"
  );
}

async function handleAiRequest(req, res, bodyText) {
  setCorsHeaders(res);
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  try {
    const data = JSON.parse(bodyText || "{}");
    const isLesson1 = Boolean(data && data.preliminaryResult && data.preliminaryResult.lesson === 1);

    if (isLesson1) {
      if (!data.answers || !Array.isArray(data.answers)) {
        res.writeHead(400);
        return res.end(JSON.stringify({ error: "INVALID_INPUT" }));
      }
    } else {
      if (!validateInput(data)) {
        res.writeHead(400);
        return res.end(JSON.stringify({ error: "INVALID_INPUT" }));
      }
    }

    let aiInput;
    if (isLesson1) {
      aiInput = {
        lesson: 1,
        course: data.preliminaryResult.course || "Выбор партнёра",
        answers: data.answers.map((item) => ({
          block: item.block || "",
          question: item.question || "",
          customAnswer: typeof item.customAnswer === "string" ? item.customAnswer : ""
        }))
      };
    } else {
      aiInput = {
        strategy: data.preliminaryResult.strategy,
        strategyScores: data.preliminaryResult.strategyScores,
        scales: data.preliminaryResult.scales,
        answers: data.answers.map((item) => ({
          block: item.block || "",
          question: item.question || "",
          selectedAnswers: Array.isArray(item.selectedAnswers) ? item.selectedAnswers : [],
          customAnswer: typeof item.customAnswer === "string" ? item.customAnswer : ""
        }))
      };
    }

    let systemPrompt;
    if (isLesson1) {
      systemPrompt = [
        "Ты — профессиональный психолог-аналитик поведения, наставник Анатолий Фёдоров. Твоя задача — провести бережный, глубокий системно-поведенческий анализ 5 ответов клиентки для Урока 1: «Подсознательный фильтр: почему нас тянет к сложным и скучно с надёжными».",
        "",
        "ИСПОЛЬЗУЙ ПОСТОЯННОЕ ЯДРО ПСИХОЛОГИЧЕСКОГО АНАЛИЗА:",
        "1. НЕ ОПИСЫВАЙ ЛИЧНОСТЬ, ОПИСЫВАЙ МЕХАНИЗМЫ: Вместо ярлыков (например, «ты тревожная») покажи механизм: «Когда возникает неопределенность, твое внимание начинает лихорадочно искать объяснения, из-за чего растет внутреннее напряжение...».",
        "2. ПОКАЗЫВАЙ ПРИЧИННО-СЛЕДСТВЕННЫЕ СВЯЗИ: Четко демонстрируй, что приводит к чему, как одно поведение автоматически запускает другое и почему в итоге получается замкнутый цикл.",
        "3. РЕСУРС И ЕГО ЦЕНА (ФОРМУЛА «ПОЛЬЗА vs ЦЕНА»): Любая автоматическая реакция имеет мнимую пользу (например, сброс напряжения, иллюзия контроля) и невидимую долгосрочную цену (потеря позиции выбора, роль догоняющей). Разверни эту связь.",
        "4. МИНИМУМ ПРОФЕССИОНАЛЬНОГО ЖАРГОНА: Клиентка должна понимать разбор без психологического образования. Замени сложные термины простыми живыми образами (например, «тревожный спазм», «эмоциональные качели»).",
        "5. РАЗДЕЛЯЙ ФАКТЫ, ЧУВСТВА И ВЫВОДЫ: Покажи разницу между тем, что объективно произошло (Факт), что возникло в теле (Чувства) и какие догадки построил ум (Интерпретации/Выводы). Проблема всегда кроется в выводах.",
        "6. НЕ ИСПОЛЬЗУЙ КОУЧИНГОВЫЙ СТИЛЬ: Никаких лозунгов вроде «Ты справишься!», «Просто начни действовать!». Твоя задача — спокойно и конкретно объяснять механизм, а не мотивировать.",
        "7. БЕЗ СУХОГО ПОВТОРА (ЗАПРЕТ НА ЦИТИРОВАНИЕ): Категорически запрещено просто копировать слова клиентки в разбор.",
        "8. МЯГКИЙ БЕЗВИСОВЫЙ ВЫХОД: Разбор не должен вызывать чувства вины или стыда. Его цель — дать понимание того, что её поведение — это лишь привычный защитный шаблон, который можно перестроить.",
        "",
        "ТЕОРЕТИЧЕСКАЯ ОСНОВА УРОКА 1 ДЛЯ ТВОЕГО РАЗБОРА:",
        "- Подсознательный фильтр: бессознательный защитный механизм, который толкает на выбор знакомого сценария из прошлого.",
        "- Подмена понятий: мозг путает тревогу от неопределенности партнера с любовной страстью («бабочки в животе»).",
        "- Синдром скуки с надёжными: с тёплым партнером нет привычного стресса, и мозг выдает: «скучно, нет химии».",
        "- Защита от уязвимости: выбор холодного партнера защищает от истинной близости.",
        "",
        "Верни ответ строго в формате JSON со следующими ключами:",
        '{"trigger":"Описание сработавшей программы триггера (до 300 символов)","neuro":"Анализ реакции нервной системы и баланса пользы/цены (до 400 символов)","tension":"Точка напряжения (до 300 символов)","action":"Первый практический шаг для выхода и заземления на 15 минут (до 350 символов)"}'
      ].join("\n");
    } else {
      systemPrompt = [
        "Ты формируешь персональную обратную связь по интерактивной диагностике отношений.",
        "Это образовательный психологический материал, не медицинская и не клиническая диагностика.",
        "Сохраняй рассчитанную ведущую стратегию и значения шкал.",
        "Не ставь диагнозов, не оценивай партнёра, не определяй виноватого.",
        "Не советуй сохранять или прекращать отношения.",
        "Не выдумывай факты. Обращайся на «Вы».",
        "Объясняй цикл: ситуация -> интерпретация -> напряжение -> действие -> реакция партнёра -> повторение.",
        "Первый шаг должен занимать не более 15 минут.",
        "Верни только валидный JSON без Markdown.",
        '{"title":"название стратегии","summary":"персональное описание","strength":"что помогает","limitation":"что поддерживает повторение","cycle":["ситуация","интерпретация","напряжение","действие","реакция","повторение"],"firstStep":"первый шаг","transition":"связка к материалам"}'
      ].join("\n");
    }

    const apiKey = POLZA_API_KEY || (req.headers["authorization"] ? req.headers["authorization"].replace("Bearer ", "") : "");

    const polzaResponse = await fetch(POLZA_URL, {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: POLZA_MODEL,
        temperature: 0.2,
        max_tokens: 1400,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: JSON.stringify(aiInput) }
        ]
      })
    });

    const responseText = await polzaResponse.text();
    if (!polzaResponse.ok) {
      console.error("[Polza Error]:", polzaResponse.status, responseText);
      res.writeHead(502);
      return res.end(JSON.stringify({ error: "POLZA_REQUEST_FAILED", status: polzaResponse.status }));
    }

    const completion = JSON.parse(responseText);
    const content = completion?.choices?.[0]?.message?.content || "";
    const result = JSON.parse(cleanJsonText(content));

    if (isLesson1) {
      if (!validateLessonResult(result)) {
        res.writeHead(502);
        return res.end(JSON.stringify({ error: "INVALID_AI_RESULT", result }));
      }
    } else {
      if (!validateResult(result)) {
        res.writeHead(502);
        return res.end(JSON.stringify({ error: "INVALID_AI_RESULT", result }));
      }
    }

    res.writeHead(200);
    return res.end(JSON.stringify({ success: true, result }));
  } catch (err) {
    console.error("[Server Error]:", err.message);
    res.writeHead(500);
    return res.end(JSON.stringify({ error: "SERVER_ERROR", message: err.message }));
  }
}

// Создание HTTP сервера
const server = http.createServer((req, res) => {
  const reqUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const pathname = decodeURIComponent(reqUrl.pathname);

  // CORS Preflight
  if (req.method === "OPTIONS") {
    setCorsHeaders(res);
    res.writeHead(204);
    return res.end();
  }

  // Health check
  if (pathname === "/" && req.method === "GET") {
    setCorsHeaders(res);
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    return res.end(JSON.stringify({ ok: true, status: "running", service: "psyquest-media-ai" }));
  }

  // Диагностика файлов
  if (pathname === "/api/files" && req.method === "GET") {
    setCorsHeaders(res);
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    const result = {};
    const searchDirs = ["/data", path.join(__dirname, "files"), __dirname];
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

  // AI-диагностика
  if ((pathname === "/" || pathname === "/api/analyze") && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => { body += chunk; });
    req.on("end", () => { handleAiRequest(req, res, body); });
    return;
  }

  // Раздача файлов: /data/filename или /media/filename
  if (pathname.startsWith("/data/") || pathname.startsWith("/media/")) {
    const filename = pathname.replace(/^\/(data|media)\//, "");
    const filePath = resolveFilePath(filename);

    if (!filePath) {
      setCorsHeaders(res);
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      return res.end(`File not found: ${filename}`);
    }

    if (req.method === "GET" || req.method === "HEAD") {
      return handleMediaStream(req, res, filePath, req.method === "HEAD");
    }
  }

  // 404
  setCorsHeaders(res);
  res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("Not Found");
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Psyquest Zero-Dependency Media & AI Server running on port ${PORT}`);
});
