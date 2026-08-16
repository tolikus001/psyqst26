const fs = require("fs");
const path = require("path");

const interactiveChoicesCss = `
/* Action Choices for Lesson 2 (Stage 4) */
.action-choice-group {
  display: flex !important;
  flex-direction: column !important;
  gap: 6px !important;
  margin-top: 6px !important;
}

.action-choice {
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  padding: 10px 14px !important;
  border-radius: 12px !important;
  background: #FFFFFF !important;
  border: 1px solid rgba(14, 31, 46, 0.10) !important;
  color: var(--nb-text) !important;
  font-size: 13px !important;
  font-weight: 600 !important;
  cursor: pointer !important;
  transition: all 0.18s ease !important;
  user-select: none !important;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02) !important;
}

.action-choice:hover {
  border-color: rgba(18, 68, 83, 0.28) !important;
  box-shadow: 0 4px 12px rgba(14, 31, 46, 0.05) !important;
}

.action-choice.active {
  border-color: var(--nb-sea) !important;
  background: rgba(18, 68, 83, 0.08) !important;
  color: var(--nb-deep) !important;
  font-weight: 700 !important;
  box-shadow: 0 4px 14px rgba(18, 68, 83, 0.10) !important;
}

.action-choice.active strong {
  color: var(--nb-sea) !important;
}

/* Criteria Grid & Items for Lesson 2 (Stage 5) */
.criteria-grid {
  display: flex !important;
  flex-direction: column !important;
  gap: 8px !important;
  margin-top: 6px !important;
}

.criteria-item {
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  padding: 12px 14px !important;
  border-radius: 14px !important;
  background: #FFFFFF !important;
  border: 1px solid rgba(14, 31, 46, 0.10) !important;
  color: var(--nb-text) !important;
  font-size: 13.5px !important;
  font-weight: 600 !important;
  cursor: pointer !important;
  transition: all 0.18s ease !important;
  user-select: none !important;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02) !important;
}

.criteria-item:hover {
  border-color: rgba(18, 68, 83, 0.28) !important;
  box-shadow: 0 4px 12px rgba(14, 31, 46, 0.05) !important;
}

.criteria-item.active {
  border-color: var(--nb-sea) !important;
  background: rgba(18, 68, 83, 0.08) !important;
  color: var(--nb-deep) !important;
  font-weight: 700 !important;
  box-shadow: 0 4px 14px rgba(18, 68, 83, 0.10) !important;
}

.criteria-checkbox {
  width: 20px !important;
  height: 20px !important;
  border-radius: 6px !important;
  border: 2px solid rgba(14, 31, 46, 0.24) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  font-size: 11px !important;
  font-weight: 900 !important;
  color: transparent !important;
  transition: all 0.18s ease !important;
  background: #FFFFFF !important;
}

.criteria-item.active .criteria-checkbox {
  border-color: var(--nb-sea) !important;
  background: var(--nb-sea) !important;
  color: #FFFFFF !important;
}
`;

// 1. Update theme.css
const themeCssPath = path.resolve("out/client/theme.css");
let themeCss = fs.readFileSync(themeCssPath, "utf8");
if (!themeCss.includes(".action-choice {")) {
  themeCss += "\n" + interactiveChoicesCss;
  fs.writeFileSync(themeCssPath, themeCss, "utf8");
  console.log("Added action-choice and criteria-item styles to theme.css");
}

// 2. Update all inlined HTML files
const clientDir = path.resolve("out/client");
const files = fs.readdirSync(clientDir).filter(f => f.endsWith(".html"));

files.forEach(f => {
  const filePath = path.join(clientDir, f);
  let html = fs.readFileSync(filePath, "utf8");
  if (html.includes("<style id=\"inlined-theme\">") && !html.includes(".action-choice {")) {
    html = html.replace("</style>", interactiveChoicesCss + "\n</style>");
    fs.writeFileSync(filePath, html, "utf8");
    console.log(`Inlined interactive choice styles into ${f}`);
  }
});

console.log("Successfully updated all interactive choices styles!");
