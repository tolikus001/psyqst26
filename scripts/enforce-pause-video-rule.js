const fs = require("fs");
const path = require("path");

const clientDir = path.resolve("out/client");
const htmlFiles = fs.readdirSync(clientDir).filter(f => f.endsWith(".html"));

htmlFiles.forEach(file => {
  const filePath = path.join(clientDir, file);
  let content = fs.readFileSync(filePath, "utf8");

  // Ensure openScreen calls pauseVideo if available
  content = content.replace(
    /function openScreen\(target\) \{/g,
    `function openScreen(target) {\n    try { if (typeof pauseVideo === 'function') pauseVideo(); } catch(e){}`
  );

  // Clean duplicate pause calls if already present
  content = content.replace(
    /function openScreen\(target\) \{\s*try \{\s*if \(typeof pauseVideo === 'function'\) pauseVideo\(\);\s*\} catch\(e\)\{\}\s*try \{\s*if \(typeof pauseVideo === 'function'\) pauseVideo\(\);\s*\} catch\(e\)\{\}/g,
    `function openScreen(target) {\n    try { if (typeof pauseVideo === 'function') pauseVideo(); } catch(e){}`
  );

  fs.writeFileSync(filePath, content, "utf8");
});

// Also update api-config.js
const apiConfigPath = path.join(clientDir, "api-config.js");
if (fs.existsSync(apiConfigPath)) {
  let apiContent = fs.readFileSync(apiConfigPath, "utf8");
  apiContent = apiContent.replace(
    /function openScreen\(target\) \{/g,
    `function openScreen(target) {\n    try { if (typeof pauseVideo === 'function') pauseVideo(); } catch(e){}`
  );
  apiContent = apiContent.replace(
    /function openScreen\(target\) \{\s*try \{\s*if \(typeof pauseVideo === 'function'\) pauseVideo\(\);\s*\} catch\(e\)\{\}\s*try \{\s*if \(typeof pauseVideo === 'function'\) pauseVideo\(\);\s*\} catch\(e\)\{\}/g,
    `function openScreen(target) {\n    try { if (typeof pauseVideo === 'function') pauseVideo(); } catch(e){}`
  );
  fs.writeFileSync(apiConfigPath, apiContent, "utf8");
}

console.log("Successfully enforced auto-pause video rule across all client files!");
