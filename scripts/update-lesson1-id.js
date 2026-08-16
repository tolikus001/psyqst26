const fs = require('fs');
const path = require('path');

const wrongId = '6QzHvAlz22e4IEb6wVhjy0';
const correctId = '6QzHvAlz22e4IEb6wVhjy0';

function updateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes(wrongId)) {
    content = content.replaceAll(wrongId, correctId);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated ID in:', filePath);
  }
}

function processDir(dir) {
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const full = path.join(dir, file);
    const stat = fs.lstatSync(full);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git') processDir(full);
    } else if (file.endsWith('.html') || file.endsWith('.js') || file.endsWith('.json') || file.endsWith('.md')) {
      updateFile(full);
    }
  });
}

processDir('.');
console.log('Successfully updated Lesson 1 ID across all project files!');
