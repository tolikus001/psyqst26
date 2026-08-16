const fs = require("fs");
const path = require("path");
const vm = require("vm");

const files = [
  "out/client/03_lesson1.html",
  "out/client/04_lesson2.html",
  "out/client/05_lesson3.html",
  "out/client/06_lesson4.html",
  "out/client/07_lesson5.html"
];

files.forEach(f => {
  const content = fs.readFileSync(f, "utf8");
  const scripts = content.match(/<script(?:\s+[^>]*)?>([\s\S]*?)<\/script>/gi) || [];
  scripts.forEach((s, idx) => {
    const code = s.replace(/<\/?script(?:\s+[^>]*)?>/gi, "");
    if (!code.trim()) return;
    try {
      new vm.Script(code);
    } catch (err) {
      console.log(`Error in ${f} script #${idx + 1}: ${err.message}`);
      console.log("Snippet around error:");
      const lines = code.split("\n");
      lines.slice(0, 30).forEach((l, li) => console.log(`${li + 1}: ${l}`));
    }
  });
});
