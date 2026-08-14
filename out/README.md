# Практический курс по отношениям (Анатолий Фёдоров)

## 📌 Архитектура проекта

Проект создан на основе оригинальных транскрибаций автора (**Анатолий Фёдоров**, системно-поведенческий анализ) и спецификации **Кодер 2.0 / Notibot Bridge SDK**.

```
out/
├── server/                      # Бэкенд для облака Amvera + Polza AI API
│   ├── server.js                # Express REST API (/api/psyquest, /api/lesson1-strategy, /api/portrait-assessment)
│   ├── package.json             # Зависимости Node.js
│   ├── amvera.yml               # Конфигурация деплоя на Amvera
│   └── .env.example             # Переменные окружения (POLZA_API_KEY, POLZA_BASE_URL, POLZA_MODEL)
│
├── client/                      # Фронтенд-страницы для Notibot (Vibe Web Apps)
│   ├── 01_psyquest.html         # Псиквест (8 вопросов, классификация сценария, вызов ИИ)
│   ├── 02_landing_partner.html  # Продающий лендинг сценария 1 (видео 0, подарок 12 мин, таймер 1 час, оффер 2 400 ₽, 4 бонуса)
│   ├── 03_lesson1.html          # Урок 1: «Отлепляем факты от интерпретаций» + 5-шаговый ИИ-разбор стратегии
│   ├── 04_lesson2.html          # Урок 2: «Бабочки в животе или спазм» + Соматический чек-лист безопасности
│   ├── 05_lesson3.html          # Урок 3: «Качели и 3 шага срыва» + Ресурсная медитация
│   ├── 06_lesson4.html          # Урок 4: «Внутренние запреты и тень» + Практика 6 шагов возврата силы
│   ├── 07_lesson5.html          # Урок 5: «Закрепление сценария» + Интеграционная медитация + High-ticket оффер (10 000 ₽)
│   ├── 08_portrait_quest.html   # Опросник на 21 вопрос для составления 10-страничного портрета ИИ
│   └── index.html               # Навигационный дашборд для быстрого тестирования всех экранов
└── README.md
```

---

## 🚀 Деплой на Amvera (Бэкенд)

1. Перейдите в панель Amvera и создайте проект типа **Node.js**.
2. В репозиторий проекта загрузите содержимое папки `out/server/`.
3. В настройках переменных окружения укажите:
   - `POLZA_API_KEY` — Ваш ключ шлюза Polza AI
   - `POLZA_BASE_URL` — `https://api.polza.ai/v1`
   - `POLZA_MODEL` — `gpt-4o-mini` (или `gpt-4o`)
4. Amvera автоматически выполнит `npm install` и запустит `npm start` согласно `amvera.yml`.

---

## 📲 Интеграция с Notibot (Фронтенд)

- Все страницы содержат **Notibot Bridge SDK** (`https://list.notibot.ru/notibot-bridge.js`) и ранний перехватчик сообщений `NOTIBOT_INIT` в `<head>`.
- Навигация и покупки осуществляются через нативные методы:
  - `window.notibot.openProduct('course_partner_2400')` — покупка курса за 2 400 ₽
  - `window.notibot.openProduct('portrait_consultation_10000')` — покупка портрета и консультации за 10 000 ₽
  - `safeHaptic(type)` — тактильный отклик (Notibot / Telegram WebApp / Haptic API).
