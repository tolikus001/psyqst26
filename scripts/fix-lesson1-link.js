const fs = require('fs');
const path = require('path');

const clientDir = path.join(__dirname, '..', 'out', 'client');
const files = fs.readdirSync(clientDir).filter(f => f.endsWith('.html') || f === 'api-config.js');

const expandedArticlesObj = `const NOTIBOT_ARTICLES = {
    quest: '35Kvp1YSxOSOzKeVKcpom2',
    landing: '54xiZ3LlRdXnk88t9xPt7s',
    lesson1: '6QzHvAlz22e4IEb6wVhjy0',
    lesson2: '6wQPr20VEfbLD5Jg6GeEVR',
    lesson3: '0wFlaZghZ7ZieZiqFtJpSs',
    lesson4: '1ddMHSu3zb0ixr2CWRLKvg',
    lesson5: '4uMyKJZW4TdZJM8z9G7Zbg',
    portrait_quest: '2plu9h6VcWiAQ3TrZ8nLql',
    bonuses: '6ZwOzlMAERTYgkV2FsWnVx',
    bonus1: '5MKoAoaLdnrJqZaczYSZth',
    bonus2: '5DiBJPDNERZWQCXQ7C2OoX',
    bonus3: '38HgDSX5SePPcFWySLUMNs',
    bonus4: '7NGEU2ikhiLHvuuyxhmL6K',
    individual_offer: '1CkSHuhyH7kVgjKZxWPCDs',

    '01_psyquest.html': '35Kvp1YSxOSOzKeVKcpom2',
    '01_psyquest': '35Kvp1YSxOSOzKeVKcpom2',
    '01_quest.html': '35Kvp1YSxOSOzKeVKcpom2',
    'psyquest': '35Kvp1YSxOSOzKeVKcpom2',

    '02_landing_partner.html': '54xiZ3LlRdXnk88t9xPt7s',
    '02_landing_partner': '54xiZ3LlRdXnk88t9xPt7s',
    '02_landing.html': '54xiZ3LlRdXnk88t9xPt7s',
    'landing_partner': '54xiZ3LlRdXnk88t9xPt7s',

    '03_lesson1.html': '6QzHvAlz22e4IEb6wVhjy0',
    '03_lesson1': '6QzHvAlz22e4IEb6wVhjy0',
    'lesson1.html': '6QzHvAlz22e4IEb6wVhjy0',
    'lesson_1': '6QzHvAlz22e4IEb6wVhjy0',
    'lesson-1': '6QzHvAlz22e4IEb6wVhjy0',
    '01_lesson1.html': '6QzHvAlz22e4IEb6wVhjy0',
    '01_lesson1': '6QzHvAlz22e4IEb6wVhjy0',

    '04_lesson2.html': '6wQPr20VEfbLD5Jg6GeEVR',
    '04_lesson2': '6wQPr20VEfbLD5Jg6GeEVR',
    'lesson2.html': '6wQPr20VEfbLD5Jg6GeEVR',
    'lesson_2': '6wQPr20VEfbLD5Jg6GeEVR',
    'lesson-2': '6wQPr20VEfbLD5Jg6GeEVR',
    '02_lesson2.html': '6wQPr20VEfbLD5Jg6GeEVR',

    '05_lesson3.html': '0wFlaZghZ7ZieZiqFtJpSs',
    '05_lesson3': '0wFlaZghZ7ZieZiqFtJpSs',
    'lesson3.html': '0wFlaZghZ7ZieZiqFtJpSs',
    'lesson_3': '0wFlaZghZ7ZieZiqFtJpSs',
    'lesson-3': '0wFlaZghZ7ZieZiqFtJpSs',
    '03_lesson3.html': '0wFlaZghZ7ZieZiqFtJpSs',

    '06_lesson4.html': '1ddMHSu3zb0ixr2CWRLKvg',
    '06_lesson4': '1ddMHSu3zb0ixr2CWRLKvg',
    'lesson4.html': '1ddMHSu3zb0ixr2CWRLKvg',
    'lesson_4': '1ddMHSu3zb0ixr2CWRLKvg',
    'lesson-4': '1ddMHSu3zb0ixr2CWRLKvg',
    '04_lesson4.html': '1ddMHSu3zb0ixr2CWRLKvg',

    '07_lesson5.html': '4uMyKJZW4TdZJM8z9G7Zbg',
    '07_lesson5': '4uMyKJZW4TdZJM8z9G7Zbg',
    'lesson5.html': '4uMyKJZW4TdZJM8z9G7Zbg',
    'lesson_5': '4uMyKJZW4TdZJM8z9G7Zbg',
    'lesson-5': '4uMyKJZW4TdZJM8z9G7Zbg',
    '05_lesson5.html': '4uMyKJZW4TdZJM8z9G7Zbg',

    '08_portrait_quest.html': '2plu9h6VcWiAQ3TrZ8nLql',
    '08_portrait_quest': '2plu9h6VcWiAQ3TrZ8nLql',
    'portrait_quest.html': '2plu9h6VcWiAQ3TrZ8nLql',

    '09_bonuses.html': '6ZwOzlMAERTYgkV2FsWnVx',
    '09_bonuses': '6ZwOzlMAERTYgkV2FsWnVx',
    'bonuses.html': '6ZwOzlMAERTYgkV2FsWnVx',

    '10_bonus1.html': '5MKoAoaLdnrJqZaczYSZth',
    '10_bonus1': '5MKoAoaLdnrJqZaczYSZth',
    'bonus1.html': '5MKoAoaLdnrJqZaczYSZth',

    '11_bonus2.html': '5DiBJPDNERZWQCXQ7C2OoX',
    '11_bonus2': '5DiBJPDNERZWQCXQ7C2OoX',
    'bonus2.html': '5DiBJPDNERZWQCXQ7C2OoX',

    '12_bonus3.html': '38HgDSX5SePPcFWySLUMNs',
    '12_bonus3': '38HgDSX5SePPcFWySLUMNs',
    'bonus3.html': '38HgDSX5SePPcFWySLUMNs',

    '13_bonus4.html': '7NGEU2ikhiLHvuuyxhmL6K',
    '13_bonus4': '7NGEU2ikhiLHvuuyxhmL6K',
    'bonus4.html': '7NGEU2ikhiLHvuuyxhmL6K',

    '14_individual_offer.html': '1CkSHuhyH7kVgjKZxWPCDs',
    '14_individual_offer': '1CkSHuhyH7kVgjKZxWPCDs',
    'individual_offer.html': '1CkSHuhyH7kVgjKZxWPCDs'
  };`;

const openScreenFunc = `  function openScreen(target) {
    try { if (typeof pauseVideo === 'function') pauseVideo(); } catch(e){}
    const raw = String(target || '').trim();
    const clean = raw.split('?')[0].split('#')[0].replace(/^(\.\/|\/)/, '');
    const articleId = NOTIBOT_ARTICLES[clean] || NOTIBOT_ARTICLES[raw] || NOTIBOT_ARTICLES[target];
    if (window.notibot && articleId && typeof window.notibot.openArticle === 'function' && window.parent && window.parent !== window) {
      window.notibot.openArticle(articleId);
    } else {
      window.location.href = target;
    }
  }`;

files.forEach(f => {
  const filePath = path.join(clientDir, f);
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace NOTIBOT_ARTICLES block
  content = content.replace(/const NOTIBOT_ARTICLES\s*=\s*\{[\s\S]*?\};/m, expandedArticlesObj);

  // Replace openScreen function block
  content = content.replace(/function openScreen\(target\)\s*\{[\s\S]*?window\.location\.href\s*=\s*target;\s*\}\s*\}/m, openScreenFunc);

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Updated:', f);
});
console.log('All files updated successfully.');
