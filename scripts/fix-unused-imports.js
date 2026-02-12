#!/usr/bin/env node
/**
 * Fix unused imports reported by eslint.
 * Reads eslint JSON output from stdin.
 *
 * Usage: npx eslint ... -f json | node scripts/fix-unused-imports.js
 */
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('/dev/stdin', 'utf8'));

// Collect unused import names per file
const fileMap = {};
for (const file of data) {
  const unused = [];
  for (const msg of file.messages) {
    if (msg.ruleId !== '@typescript-eslint/no-unused-vars') continue;
    if (!msg.message.includes('defined but never used')) continue;
    const match = msg.message.match(/'([^']+)'/);
    if (match) unused.push(match[1]);
  }
  if (unused.length > 0) {
    fileMap[file.filePath] = unused;
  }
}

let totalFixed = 0;
let filesFixed = 0;

for (const [filePath, unusedList] of Object.entries(fileMap)) {
  const unusedNames = new Set(unusedList);
  let content = fs.readFileSync(filePath, 'utf8');
  const origContent = content;

  // Match import statements with named imports (possibly with default import too)
  // Handles: import { A, B } from '...'
  //          import Default, { A, B } from '...'
  //          import type { A, B } from '...'
  const importRe =
    /import\s+(?:type\s+)?(?:(\w+)\s*,\s*)?\{([\s\S]*?)\}\s+from\s+['"][^'"]+['"];?/g;

  content = content.replace(importRe, (fullMatch, defaultImport, importBlock) => {
    const items = importBlock
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const remaining = items.filter(item => {
      // Handle 'X as Y' syntax
      const parts = item.split(/\s+as\s+/);
      const alias = (parts.length > 1 ? parts[parts.length - 1] : parts[0]).trim();
      // Handle 'type X' syntax
      const cleanName = alias.replace(/^type\s+/, '');
      return !unusedNames.has(cleanName);
    });

    // Check if the default import is also unused
    const defaultIsUnused = defaultImport && unusedNames.has(defaultImport);

    if (remaining.length === items.length && !defaultIsUnused) return fullMatch;

    const removed = items.length - remaining.length + (defaultIsUnused ? 1 : 0);
    totalFixed += removed;

    if (remaining.length === 0 && (!defaultImport || defaultIsUnused)) {
      return ''; // Remove entire import line
    }

    // Rebuild the import
    const fromMatch = fullMatch.match(/from\s+['"][^'"]+['"]/);
    const fromClause = fromMatch ? fromMatch[0] : '';
    const semi = fullMatch.trimEnd().endsWith(';') ? ';' : '';
    const wasMultiline = importBlock.includes('\n');

    // Build default part
    const defaultPart = defaultImport && !defaultIsUnused ? `${defaultImport}, ` : '';

    if (remaining.length === 0 && defaultImport && !defaultIsUnused) {
      // Only default import remains
      return `import ${defaultImport} ${fromClause}${semi}`;
    }

    if (remaining.length <= 4 && !wasMultiline) {
      return `import ${defaultPart}{ ${remaining.join(', ')} } ${fromClause}${semi}`;
    } else {
      return `import ${defaultPart}{\n  ${remaining.join(',\n  ')},\n} ${fromClause}${semi}`;
    }
  });

  // Handle: import DefaultExport from '...'
  for (const name of unusedList) {
    const defaultRe = new RegExp(`^import\\s+${name}\\s+from\\s+['"][^'"]+['"];?\\s*$`, 'gm');
    content = content.replace(defaultRe, () => {
      totalFixed++;
      return '';
    });
  }

  if (content !== origContent) {
    // Clean up excess blank lines
    content = content.replace(/\n{3,}/g, '\n\n');
    fs.writeFileSync(filePath, content, 'utf8');
    filesFixed++;
  }
}

console.log(`Fixed ${totalFixed} unused imports across ${filesFixed} files`);
