#!/bin/sh
# scripts/setup-hooks.sh
# Устанавливает git pre-commit hook который запускает аудит перед каждым коммитом.
# Запуск: sh scripts/setup-hooks.sh

HOOK_PATH=".git/hooks/pre-commit"

# Проверяем что мы в git-репозитории
if [ ! -d ".git" ]; then
  echo "❌ Ошибка: .git папка не найдена. Сначала выполни: git init"
  exit 1
fi

# Создаём hook
cat > "$HOOK_PATH" << 'EOF'
#!/bin/sh
echo "🔍 Запуск аудита проекта..."
node scripts/audit.js
if [ $? -ne 0 ]; then
  echo ""
  echo "🚫 Коммит отменён. Исправь нарушения и попробуй снова."
  exit 1
fi
echo "✅ Аудит пройден. Коммит разрешён."
EOF

# Делаем hook исполняемым
chmod +x "$HOOK_PATH"

echo "✅ Git pre-commit hook установлен!"
echo "   Теперь аудит будет запускаться автоматически перед каждым коммитом."
echo ""
echo "   Проверить вручную: node scripts/audit.js"
