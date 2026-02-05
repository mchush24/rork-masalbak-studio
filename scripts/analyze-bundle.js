#!/usr/bin/env node

/**
 * Bundle Size Analyzer
 *
 * Analyzes the React Native bundle size and generates a report
 *
 * Usage:
 *   node scripts/analyze-bundle.js [platform]
 *
 * Options:
 *   platform: 'ios' | 'android' | 'web' (default: 'ios')
 *
 * Example:
 *   npm run analyze:bundle
 *   npm run analyze:bundle android
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const PLATFORMS = ['ios', 'android', 'web'];
const OUTPUT_DIR = path.join(__dirname, '..', '.bundle-analysis');
const BUNDLE_SIZE_LIMIT_MB = 5; // Warning threshold

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function ensureOutputDir() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
}

function getBundlePath(platform) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return path.join(OUTPUT_DIR, `bundle-${platform}-${timestamp}.js`);
}

function getSourcemapPath(bundlePath) {
  return `${bundlePath}.map`;
}

async function createBundle(platform) {
  const bundlePath = getBundlePath(platform);
  const sourcemapPath = getSourcemapPath(bundlePath);

  log(`\n📦 Creating ${platform} bundle...`, 'cyan');

  const entryFile = 'node_modules/expo-router/entry.js';

  const command = [
    'npx react-native bundle',
    `--platform ${platform}`,
    `--dev false`,
    `--entry-file ${entryFile}`,
    `--bundle-output ${bundlePath}`,
    `--sourcemap-output ${sourcemapPath}`,
    '--minify true',
  ].join(' ');

  try {
    execSync(command, {
      stdio: 'pipe',
      cwd: path.join(__dirname, '..'),
    });

    return { bundlePath, sourcemapPath };
  } catch (error) {
    log(`Failed to create bundle: ${error.message}`, 'red');
    return null;
  }
}

function analyzeBundle(bundlePath) {
  if (!fs.existsSync(bundlePath)) {
    log(`Bundle not found: ${bundlePath}`, 'red');
    return null;
  }

  const stats = fs.statSync(bundlePath);
  const content = fs.readFileSync(bundlePath, 'utf8');

  // Basic analysis
  const analysis = {
    path: bundlePath,
    size: stats.size,
    sizeFormatted: formatBytes(stats.size),
    sizeMB: stats.size / (1024 * 1024),
    lineCount: content.split('\n').length,
    timestamp: new Date().toISOString(),
  };

  // Check for common large dependencies
  const patterns = {
    'react-native-reanimated': /react-native-reanimated/g,
    '@shopify/react-native-skia': /react-native-skia/g,
    'lottie-react-native': /lottie-react-native/g,
    'expo-camera': /expo-camera/g,
    'expo-av': /expo-av/g,
    '@tanstack/react-query': /tanstack.*react-query/g,
    three: /three\.module/g,
    '@react-three/fiber': /react-three.*fiber/g,
    '@supabase/supabase-js': /supabase/g,
    moment: /moment\.js/g,
    lodash: /lodash/g,
  };

  analysis.detectedLibraries = [];
  for (const [name, pattern] of Object.entries(patterns)) {
    const matches = content.match(pattern);
    if (matches && matches.length > 0) {
      analysis.detectedLibraries.push({
        name,
        occurrences: matches.length,
      });
    }
  }

  return analysis;
}

function generateReport(analyses) {
  const report = {
    generatedAt: new Date().toISOString(),
    bundles: analyses,
    summary: {
      totalSize: analyses.reduce((sum, a) => sum + (a?.size || 0), 0),
      averageSize: 0,
      largestBundle: null,
      warnings: [],
    },
  };

  const validAnalyses = analyses.filter(Boolean);
  if (validAnalyses.length > 0) {
    report.summary.averageSize = report.summary.totalSize / validAnalyses.length;
    report.summary.largestBundle = validAnalyses.reduce((max, a) =>
      a.size > (max?.size || 0) ? a : max
    );

    // Check for warnings
    for (const analysis of validAnalyses) {
      if (analysis.sizeMB > BUNDLE_SIZE_LIMIT_MB) {
        report.summary.warnings.push(
          `Bundle exceeds ${BUNDLE_SIZE_LIMIT_MB}MB limit: ${analysis.sizeFormatted}`
        );
      }

      // Check for problematic libraries
      const problematicLibs = ['moment', 'lodash'];
      for (const lib of analysis.detectedLibraries) {
        if (problematicLibs.includes(lib.name)) {
          report.summary.warnings.push(
            `Consider replacing ${lib.name} with a lighter alternative`
          );
        }
      }
    }
  }

  return report;
}

function printReport(report) {
  log('\n' + '═'.repeat(60), 'cyan');
  log('  📊 BUNDLE SIZE ANALYSIS REPORT', 'bold');
  log('═'.repeat(60), 'cyan');

  for (const bundle of report.bundles.filter(Boolean)) {
    log(`\n📦 ${path.basename(bundle.path)}`, 'blue');
    log(`   Size: ${bundle.sizeFormatted}`, bundle.sizeMB > BUNDLE_SIZE_LIMIT_MB ? 'red' : 'green');
    log(`   Lines: ${bundle.lineCount.toLocaleString()}`);

    if (bundle.detectedLibraries.length > 0) {
      log('   Detected libraries:', 'yellow');
      for (const lib of bundle.detectedLibraries.slice(0, 10)) {
        log(`     • ${lib.name}`);
      }
    }
  }

  log('\n' + '─'.repeat(60));
  log('📈 SUMMARY', 'bold');
  log(`   Total size: ${formatBytes(report.summary.totalSize)}`);

  if (report.summary.warnings.length > 0) {
    log('\n⚠️  WARNINGS:', 'yellow');
    for (const warning of report.summary.warnings) {
      log(`   • ${warning}`, 'yellow');
    }
  } else {
    log('\n✅ No warnings - bundle size looks good!', 'green');
  }

  log('\n' + '═'.repeat(60) + '\n', 'cyan');
}

function saveReport(report) {
  const reportPath = path.join(OUTPUT_DIR, 'bundle-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  log(`📄 Report saved to: ${reportPath}`, 'green');

  // Also save a history entry
  const historyPath = path.join(OUTPUT_DIR, 'history.json');
  let history = [];
  if (fs.existsSync(historyPath)) {
    try {
      history = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
    } catch {
      history = [];
    }
  }

  history.push({
    timestamp: report.generatedAt,
    totalSize: report.summary.totalSize,
    bundles: report.bundles.filter(Boolean).map((b) => ({
      platform: path.basename(b.path).split('-')[1],
      size: b.size,
    })),
  });

  // Keep last 50 entries
  if (history.length > 50) {
    history = history.slice(-50);
  }

  fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));
}

async function main() {
  const args = process.argv.slice(2);
  const platform = args[0] || 'ios';

  if (!PLATFORMS.includes(platform)) {
    log(`Invalid platform: ${platform}. Use one of: ${PLATFORMS.join(', ')}`, 'red');
    process.exit(1);
  }

  log('🔍 Bundle Size Analyzer', 'bold');
  log(`   Platform: ${platform}`);

  ensureOutputDir();

  // Create and analyze bundle
  const result = await createBundle(platform);
  if (!result) {
    process.exit(1);
  }

  const analysis = analyzeBundle(result.bundlePath);
  const report = generateReport([analysis]);

  printReport(report);
  saveReport(report);

  // Cleanup bundle files (keep only reports)
  try {
    fs.unlinkSync(result.bundlePath);
    if (fs.existsSync(result.sourcemapPath)) {
      fs.unlinkSync(result.sourcemapPath);
    }
  } catch {
    // Ignore cleanup errors
  }

  // Exit with error if bundle is too large
  if (analysis && analysis.sizeMB > BUNDLE_SIZE_LIMIT_MB * 1.5) {
    log('❌ Bundle size exceeds critical threshold!', 'red');
    process.exit(1);
  }
}

main().catch((error) => {
  log(`Error: ${error.message}`, 'red');
  process.exit(1);
});
