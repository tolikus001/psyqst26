const fs = require('fs');
const path = require('path');

const wrongId14 = '1CkSHuhyH7kVgjKZxWPCDs';
const correctId14 = '1CkSHuhyH7kVgjKZxWPCDs';

function updateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes(wrongId14)) {
    content = content.replaceAll(wrongId14, correctId14);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated 14 ID in:', filePath);
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
console.log('Successfully updated 14_individual_offer ID across all project files!');
