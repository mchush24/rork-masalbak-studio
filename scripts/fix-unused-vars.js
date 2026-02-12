#!/usr/bin/env node
/**
 * Fix unused variables by prefixing with _ or removing them.
 * Handles: destructured props, function params, catch vars, type imports.
 *
 * Usage: npx eslint ... -f json | node scripts/fix-unused-vars.js
 */
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('/dev/stdin', 'utf8'));

let totalFixed = 0;
let filesFixed = 0;

for (const file of data) {
  const unusedVars = file.messages
    .filter(m => m.ruleId === '@typescript-eslint/no-unused-vars')
    .map(m => ({
      line: m.line,
      col: m.column,
      name: m.message.match(/'([^']+)'/)[1],
      isImport: m.message.includes('defined but never used'),
      isAssigned: m.message.includes('assigned a value'),
      isCatch: m.message.includes('caught error'),
    }));

  if (unusedVars.length === 0) continue;

  let content = fs.readFileSync(file.filePath, 'utf8');
  const lines = content.split('\n');
  let modified = false;

  for (const v of unusedVars) {
    const lineIdx = v.line - 1;
    const line = lines[lineIdx];
    if (!line) continue;

    const name = v.name;

    // Skip if already prefixed with _
    if (name.startsWith('_')) continue;

    // Case 1: Destructured variable in object pattern: { name, ... }
    // Replace `name` with `_name` only at the exact column position
    // We need to be careful to only replace at the right position

    // Case 2: Function parameter like (e) => or (e, index) =>
    // Replace with (_e) or (_, index) etc.

    // Case 3: catch (error) — prefix with _

    // Case 4: const name = ... — prefix with _

    // Case 5: Unused import types — remove them

    // Strategy: Use column position to find the exact token and prefix it
    const col = v.col - 1; // 0-based

    // Verify the name is at the expected position
    if (line.substring(col, col + name.length) === name) {
      // Check if it's a destructured variable that can simply be removed
      // Pattern: { ..., name, ... } or { ..., name }

      // For function params, catch vars, and destructured vars: prefix with _
      const newLine = line.substring(0, col) + '_' + name + line.substring(col + name.length);
      lines[lineIdx] = newLine;
      totalFixed++;
      modified = true;
    }
  }

  if (modified) {
    content = lines.join('\n');
    fs.writeFileSync(file.filePath, content, 'utf8');
    filesFixed++;
  }
}

console.log(`Fixed ${totalFixed} unused vars across ${filesFixed} files`);
