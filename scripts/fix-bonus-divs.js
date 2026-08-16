const fs = require('fs');
const path = require('path');

const clientDir = path.join(__dirname, '..', 'out', 'client');
const bonusFiles = ['09_bonuses.html', '10_bonus1.html', '11_bonus2.html', '12_bonus3.html', '13_bonus4.html'];

bonusFiles.forEach(f => {
  const filePath = path.join(clientDir, f);
  let content = fs.readFileSync(filePath, 'utf8');

  // Match the single closing div right before </main>
  if (content.includes('    </div>\n  </main>')) {
    content = content.replace('    </div>\n  </main>', '    </div>\n    </div>\n  </main>');
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed div tags in:', f);
  } else if (content.includes('  </div>\n</main>')) {
    content = content.replace('  </div>\n</main>', '  </div>\n  </div>\n</main>');
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed div tags in:', f);
  } else if (content.includes('</div>\n  </main>')) {
    content = content.replace('</div>\n  </main>', '</div>\n    </div>\n  </main>');
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed div tags in:', f);
  }
});
