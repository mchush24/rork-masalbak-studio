#!/usr/bin/env node
const data = JSON.parse(require('fs').readFileSync('/dev/stdin', 'utf8'));
const byRule = {};
for (const f of data) {
  for (const m of f.messages) {
    if (m.severity !== 1) continue;
    if (!byRule[m.ruleId]) byRule[m.ruleId] = [];
    byRule[m.ruleId].push({ file: f.filePath, line: m.line, message: m.message });
  }
}
const detailed = [
  '@typescript-eslint/no-unused-vars',
  '@typescript-eslint/no-require-imports',
  'no-console',
  '@typescript-eslint/array-type',
  'react/no-unknown-property',
];
for (const rule of detailed) {
  if (!byRule[rule]) continue;
  console.log('\n=== ' + rule + ' (' + byRule[rule].length + ') ===');
  for (const w of byRule[rule])
    console.log(w.file.replace(/.*renkioo\//, '') + ':' + w.line + ' ' + w.message);
}

// For exhaustive-deps, group by file
console.log('\n=== react-hooks/exhaustive-deps (by file) ===');
if (byRule['react-hooks/exhaustive-deps']) {
  const byFile = {};
  for (const w of byRule['react-hooks/exhaustive-deps']) {
    const short = w.file.replace(/.*renkioo\//, '');
    if (!byFile[short]) byFile[short] = [];
    byFile[short].push(w.line);
  }
  for (const [f, lines] of Object.entries(byFile).sort((a, b) => b[1].length - a[1].length)) {
    console.log(f + ': ' + lines.join(','));
  }
}

// For no-explicit-any, group by file
console.log('\n=== @typescript-eslint/no-explicit-any (by file) ===');
if (byRule['@typescript-eslint/no-explicit-any']) {
  const byFile = {};
  for (const w of byRule['@typescript-eslint/no-explicit-any']) {
    const short = w.file.replace(/.*renkioo\//, '');
    if (!byFile[short]) byFile[short] = [];
    byFile[short].push(w.line);
  }
  for (const [f, lines] of Object.entries(byFile).sort((a, b) => b[1].length - a[1].length)) {
    console.log(f + ': ' + lines.join(','));
  }
}
