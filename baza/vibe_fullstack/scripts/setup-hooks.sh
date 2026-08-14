#!/bin/sh

# Установка Git-хуков (pre-commit и pre-push) для авто-проверки безопасности
if [ ! -d ".git" ]; then
  echo "⚠️ Git репозиторий не инициализирован. Сначала выполните: git init"
  exit 1
fi

mkdir -p .git/hooks

# 1. Pre-commit Hook
cat << 'EOF' > .git/hooks/pre-commit
#!/bin/sh
echo "🔒 [Pre-commit] Выполняю автодиагностику безопасности..."
node scripts/audit.js
if [ $? -ne 0 ]; then
  echo "❌ Ошибка: Коммит заблокирован из-за критичных уязвимостей."
  exit 1
fi
EOF

# 2. Pre-push Hook
cat << 'EOF' > .git/hooks/pre-push
#!/bin/sh
echo "🚀 [Pre-push] Выполняю финальный аудит кода перед публикацией..."
node scripts/audit.js
if [ $? -ne 0 ]; then
  echo "❌ Ошибка: Пуш заблокирован. Исправьте критичные P0/P1 уязвимости перед публикацией."
  exit 1
fi
EOF

chmod +x .git/hooks/pre-commit
chmod +x .git/hooks/pre-push

echo "✅ Git Hooks (pre-commit и pre-push) успешно установлены!"
echo "Теперь код проверяется автоматически перед каждым сохранением и публикацией."
