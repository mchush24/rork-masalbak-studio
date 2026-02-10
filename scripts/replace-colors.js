#!/usr/bin/env node

/**
 * Hardcoded Hex Color Replacement Script
 *
 * Replaces hardcoded hex colors with Colors token references in .ts/.tsx files.
 * Context-aware: only replaces in style contexts, not data arrays or color definitions.
 *
 * Usage:
 *   node scripts/replace-colors.js --phase=1       # Exact match (18 colors, ~730 refs)
 *   node scripts/replace-colors.js --phase=2       # Short hex & grays (~100 refs)
 *   node scripts/replace-colors.js --phase=all     # Both phases
 *   node scripts/replace-colors.js --dry-run       # Preview only
 */

const fs = require('fs');
const path = require('path');

// ============================================================================
// CONFIGURATION
// ============================================================================

const DRY_RUN = process.argv.includes('--dry-run');
const PHASE = (process.argv.find(a => a.startsWith('--phase=')) || '--phase=all').split('=')[1];

const ROOT = path.resolve(__dirname, '..');

// Files to SKIP entirely
const EXCLUDED_FILES = new Set([
  'components/coloring/color/MoodPalette.tsx',
  'components/coloring/color/GradientPicker.tsx',
  'components/ColoringCanvas.tsx',
  'components/ui/EmptyState.tsx',
  'components/ui/ErrorState.tsx',
  'lib/delight/SeasonalThemes.tsx',
  'lib/pdf/PdfService.ts',
  'lib/theme/ThemeProvider.tsx',
  'constants/colors.ts',
  'constants/design-system.ts',
  'constants/ioo-config.ts',
  'scripts/replace-colors.js',
].map(f => path.resolve(ROOT, f)));

// Directories to skip
const SKIP_DIRS = new Set(['node_modules', '.expo', '.git', 'backend', 'dist', 'build', '.next']);

// Directories to scan
const SCAN_DIRS = ['app', 'components', 'lib', 'utils', 'types'].map(d => path.resolve(ROOT, d));

// ============================================================================
// PHASE 1: Exact match replacements (birebir eşleşme)
// ============================================================================
const PHASE1_RULES = [
  // White variants
  { hex: '#FFFFFF', token: 'Colors.neutral.white', ci: true },
  { hex: '#FFF', token: 'Colors.neutral.white', ci: true, exact3: true },
  // Neutrals
  { hex: '#2D3748', token: 'Colors.neutral.darkest', ci: true },
  { hex: '#4A5568', token: 'Colors.neutral.dark', ci: true },
  { hex: '#718096', token: 'Colors.neutral.medium', ci: true },
  { hex: '#A0AEC0', token: 'Colors.neutral.light', ci: true },
  { hex: '#E2E8F0', token: 'Colors.neutral.lighter', ci: true },
  { hex: '#F7FAFC', token: 'Colors.neutral.lightest', ci: true },
  // Primary
  { hex: '#FF9B7A', token: 'Colors.primary.sunset', ci: true },
  { hex: '#FFB299', token: 'Colors.primary.peach', ci: true },
  // Secondary
  { hex: '#A78BFA', token: 'Colors.secondary.lavender', ci: true },
  { hex: '#C4B5FD', token: 'Colors.secondary.lavenderLight', ci: true },
  { hex: '#78C8E8', token: 'Colors.secondary.sky', ci: true },
  { hex: '#FFD56B', token: 'Colors.secondary.sunshine', ci: true },
  { hex: '#FFB5D8', token: 'Colors.secondary.rose', ci: true },
  { hex: '#FF6B6B', token: 'Colors.secondary.coral', ci: true },
  { hex: '#7ED99C', token: 'Colors.secondary.grass', ci: true },
  { hex: '#6FEDD6', token: 'Colors.secondary.mint', ci: true },
  // Semantic
  { hex: '#68D89B', token: 'Colors.semantic.success', ci: true },
];

// ============================================================================
// PHASE 2: Short hex and common gray normalization
// ============================================================================
const PHASE2_RULES = [
  { hex: '#333333', token: 'Colors.neutral.darkest', ci: true },
  { hex: '#333', token: 'Colors.neutral.darkest', ci: true, exact3: true },
  { hex: '#666666', token: 'Colors.neutral.medium', ci: true },
  { hex: '#666', token: 'Colors.neutral.medium', ci: true, exact3: true },
  { hex: '#999999', token: 'Colors.neutral.light', ci: true },
  { hex: '#999', token: 'Colors.neutral.light', ci: true, exact3: true },
  { hex: '#CCCCCC', token: 'Colors.neutral.lighter', ci: true },
  { hex: '#CCC', token: 'Colors.neutral.lighter', ci: true, exact3: true },
  { hex: '#DDDDDD', token: 'Colors.neutral.lighter', ci: true },
  { hex: '#DDD', token: 'Colors.neutral.lighter', ci: true, exact3: true },
  { hex: '#F5F5F5', token: 'Colors.neutral.lightest', ci: true },
  { hex: '#F0F0F0', token: 'Colors.neutral.lightest', ci: true },
  { hex: '#000000', token: 'Colors.neutral.darkest', ci: true },
  { hex: '#000', token: 'Colors.neutral.darkest', ci: true, exact3: true },
];

// ============================================================================
// FILE DISCOVERY
// ============================================================================

function getAllFiles(dir, exts = ['.ts', '.tsx']) {
  const results = [];
  if (!fs.existsSync(dir)) return results;

  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    if (SKIP_DIRS.has(item.name)) continue;
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      results.push(...getAllFiles(fullPath, exts));
    } else if (exts.some(ext => item.name.endsWith(ext))) {
      if (!EXCLUDED_FILES.has(fullPath)) {
        results.push(fullPath);
      }
    }
  }
  return results;
}

// ============================================================================
// CONTEXT DETECTION
// ============================================================================

/**
 * Determines if a line is NOT a valid replacement target.
 * Returns true if the line should be SKIPPED.
 */
function shouldSkipLine(line) {
  const t = line.trim();

  // Skip empty lines
  if (!t) return true;

  // Skip comments
  if (t.startsWith('//') || t.startsWith('*') || t.startsWith('/*')) return true;

  // Skip: Array elements with multiple hex colors (gradient arrays)
  // e.g. ['#FF6B6B', '#FFE66D', '#4ECDC4']
  if (/\[.*['"]#[0-9a-fA-F]{3,8}['"].*,.*['"]#[0-9a-fA-F]{3,8}['"]/.test(t)) return true;

  // Skip: `as const` array/tuple declarations
  if (/\]\s*as\s+const/.test(t)) return true;

  // Skip: Bare array element lines
  if (/^\s*['"]#[0-9a-fA-F]{3,8}['"],?\s*(\/\/.*)?$/.test(t)) return true;

  // Skip: HTML template string with CSS
  if (/[a-z-]+\s*:\s*#[0-9a-fA-F]{3,8}\s*;/.test(t)) return true;

  // Skip: Template literal content (backtick strings with HTML/CSS)
  if (/`.*#[0-9a-fA-F]{3,8}.*`/.test(t) && (t.includes('<') || t.includes('}'))) return true;

  // Skip: Test data / mock data objects
  if (/test|mock|fixture|sample|example|dummy|placeholder/i.test(t) && /data|config|fixture/i.test(t)) return true;

  return false;
}

/**
 * Checks if we're inside a region that should be skipped entirely:
 * - Template literals containing HTML
 * - Large data arrays
 * - Test configurations
 */
function createRegionTracker() {
  let templateLiteralDepth = 0;
  let braceDepth = 0;
  let inSkippedBlock = false;
  let skipBlockName = '';

  // Known data block patterns that should NOT be touched
  const DATA_BLOCK_PATTERNS = [
    /(?:const|let|var)\s+(?:TEST_CONFIG|MOCK_DATA|SAMPLE_DATA|ILLUSTRATIONS|ERROR_CONFIG|SEASONAL_THEMES)/,
    /(?:const|let|var)\s+\w+Colors?\s*=\s*\[/,
    /gradients?\s*[:=]\s*\[/,
    /fiberTips\s*[:=]\s*\[/,
    /holographic\s*[:=]\s*\{/,
    /series\s*[:=]\s*\[/,
  ];

  return {
    processLine(line) {
      // Track template literals with HTML content
      const backtickCount = (line.match(/`/g) || []).length;
      if (backtickCount % 2 !== 0) {
        templateLiteralDepth = templateLiteralDepth === 0 ? 1 : 0;
      }

      // If we're in a template literal, skip
      if (templateLiteralDepth > 0) return true;

      return false;
    }
  };
}

// ============================================================================
// REPLACEMENT ENGINE
// ============================================================================

/**
 * Build regex for a hex color rule
 */
function buildRegex(rule) {
  const hex = rule.hex.replace('#', '');
  const flags = rule.ci ? 'gi' : 'g';

  if (rule.exact3 && hex.length === 3) {
    // For 3-char hex, must match exactly 3 chars after #
    // Avoid matching '#FFFFFF' when looking for '#FFF'
    // Match: '#FFF' but NOT '#FFF000' or '#FFFFFF'
    return new RegExp(`(['"])#${hex}\\1(?![0-9a-fA-F])`, flags);
  }

  return new RegExp(`(['"])#${hex}\\1`, flags);
}

/**
 * Process a single file
 */
function processFile(filePath, rules) {
  let content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  let totalReplacements = 0;
  const details = [];
  const tracker = createRegionTracker();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Skip if in template literal
    if (tracker.processLine(line)) continue;

    // Skip lines that aren't replacement targets
    if (shouldSkipLine(line)) continue;

    let newLine = line;

    for (const rule of rules) {
      const regex = buildRegex(rule);
      let match;

      // Check if this line has the pattern
      if (!regex.test(newLine)) continue;

      // Reset and do actual replacement
      newLine = newLine.replace(buildRegex(rule), (fullMatch, quote) => {
        totalReplacements++;
        details.push({
          line: i + 1,
          from: fullMatch,
          to: rule.token,
        });
        return rule.token;
      });
    }

    if (newLine !== line) {
      lines[i] = newLine;
    }
  }

  if (totalReplacements > 0) {
    content = lines.join('\n');

    // Add Colors import if needed
    content = ensureColorsImport(content);

    if (!DRY_RUN) {
      fs.writeFileSync(filePath, content, 'utf-8');
    }
  }

  return { totalReplacements, details };
}

/**
 * Ensure Colors is imported from @/constants/colors
 */
function ensureColorsImport(content) {
  // Already has Colors imported from correct path
  if (/import\s+\{[^}]*\bColors\b[^}]*\}\s+from\s+['"]@\/constants\/colors['"]/.test(content)) {
    return content;
  }

  // Has import from @/constants/colors but without Colors
  const existingImport = content.match(/(import\s+\{)([^}]*?)(\}\s+from\s+['"]@\/constants\/colors['"])/);
  if (existingImport) {
    const currentImports = existingImport[2].trim();
    // Check if Colors is already in there (more thorough check)
    if (!/\bColors\b/.test(currentImports)) {
      const newImports = currentImports.endsWith(',')
        ? `${currentImports} Colors`
        : `${currentImports}, Colors`;
      return content.replace(existingImport[0],
        `${existingImport[1]} ${newImports} ${existingImport[3]}`);
    }
    return content;
  }

  // Need to add a new import line
  // Find the last import statement
  const importRegex = /^import\s+.*$/gm;
  let lastMatch = null;
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    // Track the end of potentially multiline imports
    let endIdx = match.index + match[0].length;
    // Check if import continues on next lines (multiline)
    const remaining = content.substring(endIdx);
    const nextLineMatch = remaining.match(/^[^;]*;/s);
    if (nextLineMatch && !match[0].includes(';') && !match[0].match(/from\s+['"]/)) {
      endIdx += nextLineMatch[0].length;
    }
    lastMatch = { index: match.index, endIndex: endIdx, text: match[0] };
  }

  if (lastMatch) {
    // Find the end of the last import line (including semicolon)
    let insertAt = lastMatch.index + lastMatch.text.length;
    // If the import doesn't end with semicolon, find it
    const afterImport = content.substring(insertAt);
    if (!lastMatch.text.includes(';')) {
      const semiIdx = afterImport.indexOf(';');
      if (semiIdx !== -1) {
        insertAt += semiIdx + 1;
      }
    }
    return content.substring(0, insertAt) +
      "\nimport { Colors } from '@/constants/colors';" +
      content.substring(insertAt);
  }

  // No imports found, add at top
  return "import { Colors } from '@/constants/colors';\n" + content;
}

// ============================================================================
// MAIN
// ============================================================================

function main() {
  console.log('='.repeat(70));
  console.log(`  Hardcoded Hex Color Replacement Script`);
  console.log(`  Phase: ${PHASE} | Dry Run: ${DRY_RUN}`);
  console.log('='.repeat(70));

  // Collect all files
  const allFiles = [];
  for (const dir of SCAN_DIRS) {
    allFiles.push(...getAllFiles(dir));
  }

  console.log(`\n  Found ${allFiles.length} files to process`);

  // Determine which rules to use
  let rules = [];
  if (PHASE === '1' || PHASE === 'all') {
    rules.push(...PHASE1_RULES);
    console.log(`  Phase 1: ${PHASE1_RULES.length} color rules loaded`);
  }
  if (PHASE === '2' || PHASE === 'all') {
    rules.push(...PHASE2_RULES);
    console.log(`  Phase 2: ${PHASE2_RULES.length} color rules loaded`);
  }

  let grandTotal = 0;
  const fileResults = [];

  for (const file of allFiles) {
    const { totalReplacements, details } = processFile(file, rules);
    if (totalReplacements > 0) {
      const relPath = path.relative(ROOT, file);
      fileResults.push({ file: relPath, count: totalReplacements, details });
      grandTotal += totalReplacements;
    }
  }

  // Sort by replacement count
  fileResults.sort((a, b) => b.count - a.count);

  // Report
  console.log(`\n${'='.repeat(70)}`);
  console.log(`  RESULTS`);
  console.log(`${'='.repeat(70)}`);

  for (const result of fileResults) {
    console.log(`\n  ${result.file} (${result.count} replacements)`);
    // Show summary by token
    const tokenCounts = {};
    for (const d of result.details) {
      const key = `${d.from} → ${d.to}`;
      tokenCounts[d.to] = (tokenCounts[d.to] || 0) + 1;
    }
    for (const [token, count] of Object.entries(tokenCounts).sort((a, b) => b[1] - a[1])) {
      console.log(`    ${count}x → ${token}`);
    }
  }

  console.log(`\n${'='.repeat(70)}`);
  console.log(`  TOTAL: ${grandTotal} replacements across ${fileResults.length} files`);
  if (DRY_RUN) {
    console.log('  (DRY RUN - no files were modified)');
  }
  console.log('='.repeat(70));

  return grandTotal;
}

main();
