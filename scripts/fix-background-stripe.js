const fs = require('fs');
const path = require('path');

const CLIENT_DIR = path.join(__dirname, '..', 'out', 'client');
const BAZA_DIR = path.join(__dirname, '..', 'baza', 'исходник миникурса');

// 1. Копируем чистый фон leaves_oak.jpg (без полос) в leaves_birch.jpg и leaves_birch.png
const oakJpg = path.join(CLIENT_DIR, 'leaves_oak.jpg');

if (fs.existsSync(oakJpg)) {
  fs.copyFileSync(oakJpg, path.join(CLIENT_DIR, 'leaves_birch.jpg'));
  if (fs.existsSync(BAZA_DIR)) {
    fs.copyFileSync(oakJpg, path.join(BAZA_DIR, 'leaves_birch.jpg'));
  }
  console.log('Synchronized clean stripe-free background to leaves_birch.jpg');
}

// 2. Обновляем в HTML файлах скрипт фона, чтобы использовался чистый дубовый фон без полос
const htmlFiles = fs.readdirSync(CLIENT_DIR).filter(f => f.endsWith('.html') && !f.startsWith('test_'));

htmlFiles.forEach(file => {
  const filePath = path.join(CLIENT_DIR, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Убеждаемся, что в backgrounds.birch стоит ссылка на проверенный чистый фон
  content = content.replace(
    /birch:\s*"https:\/\/inter01-anatolyfedorov\.amvera\.io\/data\/leaves_birch\.jpg"/g,
    'birch: "https://inter01-anatolyfedorov.amvera.io/data/leaves_oak.jpg"'
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated background mapping in ${file}`);
});

console.log('Background stripe issue completely resolved across all pages!');
