#!/usr/bin/env node
// scripts/audit.js
// Vibe Fullstack Kit — Авто-аудитор правил и безопасности (с P0-P3 матрицей уязвимостей)
// Запуск: node scripts/audit.js

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const MAX_LINES = 300;
const SCAN_EXTS = ['.ts', '.tsx', '.js', '.jsx'];

// Регулярные выражения для поиска секретов
const SECRET_PATTERNS = [
  { re: /(api_key|secret|password|token|private_key)\s*[:=]\s*["'][^"']{6,}/i, name: "Hardcoded secret variable" },
  { re: /sk-[a-zA-Z0-9_-]{20,}/, name: "OpenAI / OpenRouter API Key" },
  { re: /ghp_[a-zA-Z0-9]{36}/, name: "GitHub Personal Access Token" },
  { re: /AIza[a-zA-Z0-9_\-]{35}/, name: "Google API Key" },
];

let issues = {
  p0: [], // P0 — Critical (Deploy Blocking)
  p1: [], // P1 — High (Deploy Blocking)
  p2: [], // P2 — Medium (Warning)
  p3: [], // P3 — Low (Info)
};

function addIssue(severity, file, rule, detail) {
  issues[severity].push({ file: path.relative(ROOT, file), rule, detail });
}

function collectFiles(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const name of fs.readdirSync(dir)) {
    if (name === 'node_modules' || name === '.next' || name === '.git') continue;
    const fullPath = path.join(dir, name);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      collectFiles(fullPath, acc);
    } else if (SCAN_EXTS.includes(path.extname(name))) {
      acc.push(fullPath);
    }
  }
  return acc;
}

// 1. Check Secret Leaks
function checkSecrets(file, content) {
  const isClientFile = file.includes('/app/') && !file.includes('/api/');
  
  if (isClientFile && /process\.env\.AI_API_KEY/.test(content)) {
    addIssue('p0', file, 'SECRET_LEAK_CLIENT', 'Ключ AI_API_KEY вытащен на фронтенд! Вызовы ИИ должны идти строго через API роуты (app/api/...).');
  }

  for (const { re, name } of SECRET_PATTERNS) {
    if (re.test(content)) {
      addIssue('p0', file, 'HARDCODED_SECRET', `Обнаружен секрет (${name}). Перенеси его в файл .env.`);
      break;
    }
  }
}

// 2. Check Raw SQL Injection
function checkRawSql(file, content) {
  if (/\$queryRawUnsafe|\$executeRawUnsafe/.test(content)) {
    addIssue('p0', file, 'RAW_SQL_INJECTION', 'Запрещены непараметризованные сырые SQL запросы! Используй методы Prisma ORM.');
  }
}

// 3. Check Dangerous Code Execution
function checkDangerousCode(file, content) {
  if (/\beval\s*\(|new\s+Function\s*\(/.test(content)) {
    addIssue('p1', file, 'DANGEROUS_EXEC', 'Использование eval() или new Function() запрещено по соображениям безопасности.');
  }
}

// 4. Check Missing 'use client' for Hooks
function checkUseClient(file, content) {
  if (file.endsWith('.tsx') && !file.includes('/api/')) {
    const usesHooks = /useState|useEffect|useContext|useRef|onClick|onSubmit/.test(content);
    const hasUseClient = /^['"]use client['"]/m.test(content);

    if (usesHooks && !hasUseClient) {
      addIssue('p1', file, 'MISSING_USE_CLIENT', "Компонент использует хуки/события, но не имеет директивы 'use client' на 1-й строке.");
    }
  }
}

// 5. Check File Size Limit
function checkFileSize(file, lines) {
  if (lines.length > MAX_LINES) {
    addIssue('p2', file, 'FILE_SIZE_LIMIT', `Файл содержит ${lines.length} строк (лимит ${MAX_LINES}). Раздели логику на подкомпоненты.`);
  }
}

// 6. Check Zod Validation in API Routes
function checkZodInApiRoutes(file, content) {
  if (file.includes('/app/api/') && file.endsWith('route.ts')) {
    const isPostOrPut = /export\s+async\s+function\s+(POST|PUT|PATCH)/.test(content);
    const hasZod = /z\.object|zod/.test(content);

    if (isPostOrPut && !hasZod) {
      addIssue('p2', file, 'MISSING_ZOD_VALIDATION', 'API маршрут принимает данные, но не использует Zod для валидации req.body.');
    }
  }
}

// 7. Check ENV and Gitignore
function checkEnvAndGitignore() {
  const envExists = fs.existsSync(path.join(ROOT, '.env'));
  const gitignoreExists = fs.existsSync(path.join(ROOT, '.gitignore'));

  if (envExists && gitignoreExists) {
    const gitignoreContent = fs.readFileSync(path.join(ROOT, '.gitignore'), 'utf8');
    if (!gitignoreContent.includes('.env')) {
      addIssue('p3', path.join(ROOT, '.gitignore'), 'ENV_NOT_GITIGNORED', 'Файл .env не добавлен в .gitignore! Добавь .env в .gitignore.');
    }
  }
}

function runAudit() {
  console.log('\n🔒 Vibe Fullstack Kit — Проверка правил безопасности и кода\n');

  const files = collectFiles(path.join(ROOT, 'app')).concat(
    collectFiles(path.join(ROOT, 'lib')),
    collectFiles(path.join(ROOT, 'components'))
  );

  for (const file of files) {
    if (file.endsWith('audit.js')) continue;
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');

    checkSecrets(file, content);
    checkRawSql(file, content);
    checkDangerousCode(file, content);
    checkUseClient(file, content);
    checkFileSize(file, lines);
    checkZodInApiRoutes(file, content);
  }

  checkEnvAndGitignore();

  // Print Detailed Issues
  const printCategory = (severity, title, icon) => {
    if (issues[severity].length > 0) {
      console.log(`${icon} ${title} (${issues[severity].length}):`);
      for (const item of issues[severity]) {
        console.log(`  • [${item.rule}] ${item.file}\n    ${item.detail}`);
      }
      console.log('');
    }
  };

  printCategory('p0', 'P0 — Critical (Deploy Blocking)', '🚨');
  printCategory('p1', 'P1 — High (Deploy Blocking)', '❌');
  printCategory('p2', 'P2 — Medium (Warning)', '⚠️');
  printCategory('p3', 'P3 — Low (Informational)', '🔵');

  // Print Scorecard Table
  const p0Count = issues.p0.length;
  const p1Count = issues.p1.length;
  const p2Count = issues.p2.length;
  const p3Count = issues.p3.length;
  const totalBlocking = p0Count + p1Count;

  console.log('📊 Отчёт безопасности (Security Scorecard):');
  console.log('┌───────────────────┬───────┬───────────┐');
  console.log(`│ Уровень           │ Колич │ Статус    │`);
  console.log('├───────────────────┼───────┼───────────┤');
  console.log(`│ P0 Critical       │   ${p0Count}   │ ${p0Count === 0 ? '✅ Clean  ' : '🚨 BLOCK  '} │`);
  console.log(`│ P1 High           │   ${p1Count}   │ ${p1Count === 0 ? '✅ Clean  ' : '❌ BLOCK  '} │`);
  console.log(`│ P2 Medium         │   ${p2Count}   │ ${p2Count === 0 ? '✅ Clean  ' : '⚠️ Warning'} │`);
  console.log(`│ P3 Low            │   ${p3Count}   │ ${p3Count === 0 ? '✅ Clean  ' : '🔵 Info   '} │`);
  console.log('└───────────────────┴───────┴───────────┘\n');

  if (totalBlocking > 0) {
    console.log(`❌ Проверка не пройдена: Найдено ${totalBlocking} критичных ошибок. Коммит/Пуш заблокирован.\n`);
    process.exit(1);
  }

  console.log('✅ Всё отлично! Критичных уязвимостей не найдено.\n');
  process.exit(0);
}

runAudit();
