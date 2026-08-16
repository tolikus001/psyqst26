const fs = require('fs');
const path = require('path');

const CLIENT_DIR = path.join(__dirname, '..', 'out', 'client');
const oakJpg = path.join(CLIENT_DIR, 'leaves_oak.jpg');
const oakBase64 = 'data:image/jpeg;base64,' + fs.readFileSync(oakJpg).toString('base64');

console.log('Oak Base64 size:', oakBase64.length);

const targetBlock = `#maisonArtBackground {
  position: fixed !important;
  inset: 0 !important;
  z-index: 0 !important;
  background-image: url("${oakBase64}");
  background-repeat: no-repeat !important;
  background-position: center center !important;
  background-size: cover !important;
  opacity: 0.22 !important;
  filter: saturate(1.0) contrast(1.0) brightness(1.0) !important;
  transform: translateZ(0);
  pointer-events: none !important;
}`;

const files = fs.readdirSync(CLIENT_DIR).filter(f => f.endsWith('.html') && !f.startsWith('test_'));

files.forEach(file => {
  const filePath = path.join(CLIENT_DIR, file);
  let content = fs.readFileSync(filePath, 'utf8');

  const startIdx = content.indexOf('#maisonArtBackground {');
  if (startIdx !== -1) {
    const endIdx = content.indexOf('}', startIdx);
    if (endIdx !== -1) {
      content = content.slice(0, startIdx) + targetBlock + content.slice(endIdx + 1);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated clean background block in ${file}`);
    }
  } else {
    console.log(`Could not find #maisonArtBackground in ${file}`);
  }
});

console.log('Done!');
