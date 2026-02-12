#!/usr/bin/env node
/**
 * Fix TS2339 errors caused by _-prefixing destructured typed props.
 * Reads TSC output, finds _prop patterns, and removes them from destructuring.
 *
 * Usage: npx tsc --noEmit 2>&1 | node scripts/fix-ts-prefix-errors.js
 */
const fs = require('fs');
const input = fs.readFileSync('/dev/stdin', 'utf8');

// Parse TSC errors: file(line,col): error TS2339: Property '_xxx' does not exist
const errorRe = /^(.+?)\((\d+),(\d+)\): error TS2339: Property '(_\w+)'/gm;
const fixes = {};
let match;

while ((match = errorRe.exec(input)) !== null) {
  const [, filePath, lineStr, colStr, propName] = match;
  if (!fixes[filePath]) fixes[filePath] = [];
  fixes[filePath].push({
    line: parseInt(lineStr),
    col: parseInt(colStr),
    prefixedName: propName,
    originalName: propName.substring(1), // remove leading _
  });
}

let totalFixed = 0;
let filesFixed = 0;

for (const [filePath, items] of Object.entries(fixes)) {
  let content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  let modified = false;

  // Group by line
  const byLine = {};
  for (const item of items) {
    if (!byLine[item.line]) byLine[item.line] = [];
    byLine[item.line].push(item);
  }

  for (const [lineNum, lineItems] of Object.entries(byLine)) {
    const idx = parseInt(lineNum) - 1;
    let line = lines[idx];
    if (!line) continue;

    for (const item of lineItems) {
      // Strategy 1: If this is a destructured prop, remove it from destructuring
      // Pattern: { ..., _propName, ... } or { ..., _propName: alias, ... }

      // Remove _propName from destructuring (with optional trailing comma/whitespace)
      const patterns = [
        // _propName, (with comma after)
        new RegExp(`\\b${item.prefixedName}\\b\\s*,\\s*`, 'g'),
        // , _propName (with comma before, at end of destructuring)
        new RegExp(`,\\s*\\b${item.prefixedName}\\b(?=\\s*[})])`, 'g'),
        // _propName (sole item - rare, but handle it)
        new RegExp(`\\b${item.prefixedName}\\b`, 'g'),
      ];

      const origLine = line;

      // Try removing with trailing comma first
      let newLine = line.replace(patterns[0], '');
      if (newLine === line) {
        // Try removing with leading comma
        newLine = line.replace(patterns[1], '');
      }

      if (newLine !== origLine) {
        line = newLine;
        totalFixed++;
        modified = true;
      } else {
        // Fallback: just revert the _ prefix back to original name
        line = line.replace(new RegExp(`\\b${item.prefixedName}\\b`, 'g'), item.originalName);
        if (line !== origLine) {
          totalFixed++;
          modified = true;
        }
      }
    }

    lines[idx] = line;
  }

  if (modified) {
    content = lines.join('\n');
    fs.writeFileSync(filePath, content, 'utf8');
    filesFixed++;
  }
}

console.log(`Fixed ${totalFixed} TS2339 errors across ${filesFixed} files`);
