#!/usr/bin/env node
// scripts/audit.js
// Аудитор проекта Vibe HTML Kit.
// Проверяет соблюдение архитектурных правил перед коммитом.
// Запуск: node scripts/audit.js

import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, relative, extname } from 'path';

// ── Конфигурация ────────────────────────────────────────────────
const ROOT        = process.cwd();
const MAX_LINES   = 150;
const SCAN_DIRS   = ['js', 'css'];
const SCAN_EXTS   = ['.js', '.css', '.html'];

// Паттерны признаков секретов в коде
const SECRET_PATTERNS = [
  /api[_-]?key\s*[:=]\s*['"`][a-zA-Z0-9_\-]{10,}/i,
  /token\s*[:=]\s*['"`][a-zA-Z0-9_\-]{10,}/i,
  /secret\s*[:=]\s*['"`][a-zA-Z0-9_\-]{8,}/i,
  /password\s*[:=]\s*['"`][^'"`]{4,}/i,
  /ghp_[a-zA-Z0-9]{36}/,           // GitHub PAT
  /sk-[a-zA-Z0-9]{20,}/,           // OpenAI key
  /AIza[a-zA-Z0-9_\-]{35}/,        // Google API key
];

// window.notibot должен быть только в bridge.js
const NOTIBOT_BRIDGE_FILE = join(ROOT, 'js', 'bridge.js');
const NOTIBOT_CALL = /window\.notibot\./;

// Опасные паттерны — XSS и выполнение кода
const DANGEROUS_PATTERNS = [
  { re: /\beval\s*\(/,           label: 'eval()' },
  { re: /new\s+Function\s*\(/,   label: 'new Function()' },
  { re: /document\.write\s*\(/,  label: 'document.write()' },
];

// Паттерны небезопасного innerHTML (без предшествующего escapeHtml)
// Ищем .innerHTML = <что-то с переменной> без вызова escapeHtml
const UNSAFE_INNER_HTML = /\.innerHTML\s*[+]?=\s*(?!.*escapeHtml)[^'"`].*[A-Za-z_$][A-Za-z0-9_$]*/;

// Чувствительные данные в localStorage
const LOCALSTORAGE_SENSITIVE = /localStorage\.setItem\s*\([^)]*(?:token|password|secret|key|auth)/i;

// ── Утилиты ─────────────────────────────────────────────────────
const red    = (s) => `\x1b[31m${s}\x1b[0m`;
const yellow = (s) => `\x1b[33m${s}\x1b[0m`;
const green  = (s) => `\x1b[32m${s}\x1b[0m`;
const bold   = (s) => `\x1b[1m${s}\x1b[0m`;
const dim    = (s) => `\x1b[2m${s}\x1b[0m`;

let violations  = [];  // критичные ошибки — блокируют коммит
let warnings    = [];  // предупреждения — не блокируют

function addViolation(file, rule, detail) {
  violations.push({ file: relative(ROOT, file), rule, detail });
}

function addWarning(file, rule, detail) {
  warnings.push({ file: relative(ROOT, file), rule, detail });
}

// ── Сбор файлов для проверки ─────────────────────────────────────
function collectFiles(dirs) {
  const files = [];

  // index.html в корне
  const indexHtml = join(ROOT, 'index.html');
  if (existsSync(indexHtml)) files.push(indexHtml);

  // Файлы в указанных директориях
  for (const dir of dirs) {
    const dirPath = join(ROOT, dir);
    if (!existsSync(dirPath)) continue;
    collectRecursive(dirPath, files);
  }

  return files;
}

function collectRecursive(dir, acc) {
  for (const name of readdirSync(dir)) {
    const fullPath = join(dir, name);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      collectRecursive(fullPath, acc);
    } else if (SCAN_EXTS.includes(extname(name))) {
      acc.push(fullPath);
    }
  }
}

// ── Проверки ─────────────────────────────────────────────────────

/** Правило 1: Размер файла */
function checkFileSize(file, lines) {
  if (lines.length > MAX_LINES) {
    addViolation(file, 'FILE_SIZE',
      `${lines.length} строк (лимит: ${MAX_LINES}). Извлеки логику в отдельный файл.`
    );
  }
}

/** Правило 2: Секреты в коде */
function checkSecrets(file, content) {
  for (const pattern of SECRET_PATTERNS) {
    if (pattern.test(content)) {
      addViolation(file, 'SECRET_IN_CODE',
        `Обнаружен возможный секрет (API ключ / токен). Перенеси в .env файл.`
      );
      break; // одно нарушение на файл достаточно
    }
  }
}

/** Правило 3: window.notibot только в bridge.js */
function checkNotibotUsage(file, lines) {
  // Если bridge.js существует — проверяем что только он использует window.notibot
  if (!existsSync(NOTIBOT_BRIDGE_FILE)) return;
  if (file === NOTIBOT_BRIDGE_FILE) return; // bridge.js — разрешено

  lines.forEach((line, i) => {
    if (NOTIBOT_CALL.test(line)) {
      addViolation(file, 'NOTIBOT_OUTSIDE_BRIDGE',
        `Строка ${i + 1}: вызов window.notibot вне bridge.js. Используй функции из js/bridge.js.`
      );
    }
  });
}

/** Правило 4: Опасные функции (eval, document.write, new Function) */
function checkDangerousCode(file, content) {
  if (file.endsWith('audit.js')) return; // сам аудитор — исключение
  for (const { re, label } of DANGEROUS_PATTERNS) {
    if (re.test(content)) {
      addViolation(file, 'DANGEROUS_CODE',
        `Использование ${label} запрещено — выполняет произвольный код. Найди альтернативу.`
      );
    }
  }
}

/** Правило 5: Небезопасный innerHTML с переменными */
function checkUnsafeInnerHTML(file, content, lines) {
  if (!file.endsWith('.js')) return;
  lines.forEach((line, i) => {
    // Пропускаем строки только со статичными строками (без переменных)
    if (UNSAFE_INNER_HTML.test(line) && !line.trim().startsWith('//') && !line.includes('// safe:')) {
      addWarning(file, 'UNSAFE_INNER_HTML',
        `Строка ${i + 1}: innerHTML с переменной без escapeHtml(). Оберни пользовательские данные в escapeHtml().`
      );
    }
  });
}

/** Правило 6: Чувствительные данные в localStorage */
function checkLocalStorage(file, content) {
  if (!file.endsWith('.js')) return;
  if (LOCALSTORAGE_SENSITIVE.test(content)) {
    addViolation(file, 'SENSITIVE_IN_LOCALSTORAGE',
      'Обнаружено сохранение секретных данных в localStorage. localStorage доступен всем скриптам на странице.'
    );
  }
}

/** Правило 7: Логика в index.html */
function checkIndexHtml(file, content) {
  if (!file.endsWith('index.html')) return;

  // Inline JS блоки (не src="...")
  const inlineScriptMatch = content.match(/<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/gi);
  if (inlineScriptMatch) {
    const hasRealLogic = inlineScriptMatch.some(block => {
      const inner = block.replace(/<\/?script[^>]*>/gi, '').trim();
      // Разрешаем только tailwind.config и комментарии
      return inner.length > 0 && !inner.startsWith('//') && !inner.includes('tailwind.config');
    });
    if (hasRealLogic) {
      addWarning(file, 'LOGIC_IN_HTML',
        'Обнаружен inline <script> с логикой. Перенеси код в js/app.js или компонент.'
      );
    }
  }
}

/** Правило 5: Компоненты не подключены в app.js */
function checkOrphanComponents() {
  const componentsDir = join(ROOT, 'js', 'components');
  if (!existsSync(componentsDir)) return;

  const appJsPath = join(ROOT, 'js', 'app.js');
  if (!existsSync(appJsPath)) return;

  const appContent = readFileSync(appJsPath, 'utf8');
  const componentFiles = readdirSync(componentsDir).filter(f => f.endsWith('.js'));

  for (const comp of componentFiles) {
    const compName = comp.replace('.js', '');
    // Проверяем что компонент импортируется в app.js
    if (!appContent.includes(compName) && !appContent.includes(comp)) {
      addWarning(join(ROOT, 'js', 'components', comp), 'ORPHAN_COMPONENT',
        `Компонент не импортирован в js/app.js. Подключи его или удали если не нужен.`
      );
    }
  }
}

/** Правило 6: .env существует без .env.example */
function checkEnvFiles() {
  const hasEnv        = existsSync(join(ROOT, '.env'));
  const hasEnvExample = existsSync(join(ROOT, '.env.example'));
  const hasGitignore  = existsSync(join(ROOT, '.gitignore'));

  if (hasEnv && !hasGitignore) {
    addViolation(join(ROOT, '.env'), 'ENV_NOT_GITIGNORED',
      '.env файл существует но .gitignore не найден. Создай .gitignore с записью .env'
    );
  }

  if (hasEnv && hasGitignore) {
    const gitignore = readFileSync(join(ROOT, '.gitignore'), 'utf8');
    if (!gitignore.includes('.env')) {
      addViolation(join(ROOT, '.gitignore'), 'ENV_NOT_GITIGNORED',
        '.env не добавлен в .gitignore. Добавь строку: .env'
      );
    }
  }

  if (!hasEnvExample && hasEnv) {
    addWarning(ROOT, 'MISSING_ENV_EXAMPLE',
      'Есть .env но нет .env.example. Создай шаблон для других участников проекта.'
    );
  }
}

// ── Главная функция ──────────────────────────────────────────────
function runAudit() {
  console.log(bold('\n🔍 Vibe HTML Kit — Аудит проекта\n'));
  console.log(dim(`  Корень: ${ROOT}`));
  console.log(dim(`  Лимит строк: ${MAX_LINES}\n`));

  const files = collectFiles(SCAN_DIRS);
  console.log(dim(`  Проверяю ${files.length} файл(ов)...\n`));

  for (const file of files) {
    if (file.endsWith('notibot-bridge.js')) continue;
    const content = readFileSync(file, 'utf8');
    const lines   = content.split('\n');

    checkFileSize(file, lines);
    checkSecrets(file, content);
    checkDangerousCode(file, content);
    checkUnsafeInnerHTML(file, content, lines);
    checkLocalStorage(file, content);
    checkNotibotUsage(file, lines);
    checkIndexHtml(file, content);
  }

  checkOrphanComponents();
  checkEnvFiles();

  // ── Отчёт ────────────────────────────────────────────────────
  if (violations.length === 0 && warnings.length === 0) {
    console.log(green('  ✅ Всё отлично! Нарушений не найдено.\n'));
    process.exit(0);
  }

  if (warnings.length > 0) {
    console.log(yellow(bold(`  ⚠️  Предупреждения (${warnings.length}):`)));
    for (const w of warnings) {
      console.log(yellow(`\n  • [${w.rule}] ${w.file}`));
      console.log(dim(`    ${w.detail}`));
    }
    console.log('');
  }

  if (violations.length > 0) {
    console.log(red(bold(`  ❌ Критичные нарушения (${violations.length}) — коммит заблокирован:`)));
    for (const v of violations) {
      console.log(red(`\n  • [${v.rule}] ${v.file}`));
      console.log(dim(`    ${v.detail}`));
    }
    console.log('');
    console.log(red(bold('  Исправь нарушения и запусти аудит снова: node scripts/audit.js\n')));
    process.exit(1); // exit code 1 — git hook заблокирует коммит
  }

  // Только предупреждения — не блокируем
  process.exit(0);
}

runAudit();
