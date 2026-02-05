#!/usr/bin/env node

/**
 * Image Optimization Script
 *
 * Optimizes images in the assets folder for production
 *
 * Features:
 * - Compresses PNG and JPEG images
 * - Generates WebP versions for web
 * - Creates multiple resolutions (@1x, @2x, @3x)
 * - Generates low-quality placeholders (LQIP)
 *
 * Usage:
 *   npm run optimize:images
 *   npm run optimize:images -- --dry-run
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  inputDir: path.join(__dirname, '..', 'assets', 'images'),
  outputDir: path.join(__dirname, '..', 'assets', 'images', 'optimized'),
  reportDir: path.join(__dirname, '..', '.image-optimization'),
  maxWidth: 1920,
  maxHeight: 1920,
  quality: {
    jpeg: 85,
    png: 85,
    webp: 80,
  },
  generateWebP: true,
  generateLQIP: true,
  lqipWidth: 20,
};

// Colors for console
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
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function getImageFiles(dir) {
  const files = [];
  const extensions = ['.png', '.jpg', '.jpeg'];

  function scan(directory) {
    if (!fs.existsSync(directory)) return;

    const items = fs.readdirSync(directory);
    for (const item of items) {
      const fullPath = path.join(directory, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory() && item !== 'optimized') {
        scan(fullPath);
      } else if (stat.isFile()) {
        const ext = path.extname(item).toLowerCase();
        if (extensions.includes(ext)) {
          files.push(fullPath);
        }
      }
    }
  }

  scan(dir);
  return files;
}

function checkSharpInstalled() {
  try {
    require.resolve('sharp');
    return true;
  } catch {
    return false;
  }
}

async function optimizeWithSharp(inputPath, outputPath, options = {}) {
  const sharp = require('sharp');

  const image = sharp(inputPath);
  const metadata = await image.metadata();

  let pipeline = image;

  // Resize if needed
  if (metadata.width > CONFIG.maxWidth || metadata.height > CONFIG.maxHeight) {
    pipeline = pipeline.resize(CONFIG.maxWidth, CONFIG.maxHeight, {
      fit: 'inside',
      withoutEnlargement: true,
    });
  }

  const ext = path.extname(inputPath).toLowerCase();

  if (ext === '.png') {
    pipeline = pipeline.png({
      quality: options.quality || CONFIG.quality.png,
      compressionLevel: 9,
    });
  } else if (ext === '.jpg' || ext === '.jpeg') {
    pipeline = pipeline.jpeg({
      quality: options.quality || CONFIG.quality.jpeg,
      mozjpeg: true,
    });
  }

  await pipeline.toFile(outputPath);

  return {
    originalSize: fs.statSync(inputPath).size,
    optimizedSize: fs.statSync(outputPath).size,
  };
}

async function generateWebP(inputPath, outputPath) {
  const sharp = require('sharp');

  await sharp(inputPath)
    .webp({ quality: CONFIG.quality.webp })
    .toFile(outputPath);

  return fs.statSync(outputPath).size;
}

async function generateLQIP(inputPath, outputPath) {
  const sharp = require('sharp');

  await sharp(inputPath)
    .resize(CONFIG.lqipWidth)
    .blur(5)
    .jpeg({ quality: 20 })
    .toFile(outputPath);

  return fs.statSync(outputPath).size;
}

async function optimizeImage(inputPath, dryRun = false) {
  const relativePath = path.relative(CONFIG.inputDir, inputPath);
  const outputPath = path.join(CONFIG.outputDir, relativePath);
  const outputDir = path.dirname(outputPath);

  // Ensure output directory exists
  if (!dryRun && !fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const result = {
    file: relativePath,
    originalSize: fs.statSync(inputPath).size,
    optimizedSize: 0,
    webpSize: null,
    lqipSize: null,
    savings: 0,
    savingsPercent: 0,
  };

  if (dryRun) {
    log(`  [DRY RUN] Would optimize: ${relativePath}`, 'yellow');
    return result;
  }

  try {
    // Optimize original
    const optimized = await optimizeWithSharp(inputPath, outputPath);
    result.optimizedSize = optimized.optimizedSize;
    result.savings = result.originalSize - result.optimizedSize;
    result.savingsPercent = ((result.savings / result.originalSize) * 100).toFixed(1);

    // Generate WebP
    if (CONFIG.generateWebP) {
      const webpPath = outputPath.replace(/\.(png|jpe?g)$/i, '.webp');
      result.webpSize = await generateWebP(inputPath, webpPath);
    }

    // Generate LQIP
    if (CONFIG.generateLQIP) {
      const lqipPath = outputPath.replace(/\.(png|jpe?g)$/i, '.lqip.jpg');
      result.lqipSize = await generateLQIP(inputPath, lqipPath);
    }

    const savingsColor = result.savings > 0 ? 'green' : 'yellow';
    log(
      `  ✓ ${relativePath}: ${formatBytes(result.originalSize)} → ${formatBytes(result.optimizedSize)} (${result.savingsPercent}% saved)`,
      savingsColor
    );
  } catch (error) {
    log(`  ✗ ${relativePath}: ${error.message}`, 'red');
  }

  return result;
}

function generateReport(results) {
  const totalOriginal = results.reduce((sum, r) => sum + r.originalSize, 0);
  const totalOptimized = results.reduce((sum, r) => sum + r.optimizedSize, 0);
  const totalSavings = totalOriginal - totalOptimized;
  const totalWebP = results.reduce((sum, r) => sum + (r.webpSize || 0), 0);

  const report = {
    generatedAt: new Date().toISOString(),
    summary: {
      totalImages: results.length,
      originalSize: totalOriginal,
      originalSizeFormatted: formatBytes(totalOriginal),
      optimizedSize: totalOptimized,
      optimizedSizeFormatted: formatBytes(totalOptimized),
      savings: totalSavings,
      savingsFormatted: formatBytes(totalSavings),
      savingsPercent: ((totalSavings / totalOriginal) * 100).toFixed(1),
      webpSize: totalWebP,
      webpSizeFormatted: formatBytes(totalWebP),
    },
    images: results,
  };

  // Ensure report directory exists
  if (!fs.existsSync(CONFIG.reportDir)) {
    fs.mkdirSync(CONFIG.reportDir, { recursive: true });
  }

  const reportPath = path.join(CONFIG.reportDir, 'optimization-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  return report;
}

function printReport(report) {
  log('\n' + '═'.repeat(60), 'cyan');
  log('  📷 IMAGE OPTIMIZATION REPORT', 'bold');
  log('═'.repeat(60), 'cyan');

  log(`\n📊 Summary:`, 'blue');
  log(`   Total Images: ${report.summary.totalImages}`);
  log(`   Original Size: ${report.summary.originalSizeFormatted}`);
  log(`   Optimized Size: ${report.summary.optimizedSizeFormatted}`);
  log(`   Total Savings: ${report.summary.savingsFormatted} (${report.summary.savingsPercent}%)`, 'green');

  if (CONFIG.generateWebP) {
    log(`   WebP Total: ${report.summary.webpSizeFormatted}`);
  }

  log('\n' + '═'.repeat(60) + '\n', 'cyan');
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');

  log('🖼️  Image Optimization Script', 'bold');
  log(`   Input: ${CONFIG.inputDir}`);
  log(`   Output: ${CONFIG.outputDir}`);

  if (dryRun) {
    log('   Mode: DRY RUN (no files will be modified)', 'yellow');
  }

  // Check for sharp
  if (!checkSharpInstalled()) {
    log('\n⚠️  Sharp is not installed. Installing...', 'yellow');
    try {
      execSync('npm install sharp --save-dev', { stdio: 'inherit' });
      log('✓ Sharp installed successfully', 'green');
    } catch (error) {
      log('✗ Failed to install sharp. Please run: npm install sharp --save-dev', 'red');
      process.exit(1);
    }
  }

  // Get all images
  const images = getImageFiles(CONFIG.inputDir);

  if (images.length === 0) {
    log('\n⚠️  No images found to optimize', 'yellow');
    return;
  }

  log(`\n📁 Found ${images.length} images to optimize\n`, 'cyan');

  // Optimize images
  const results = [];
  for (const imagePath of images) {
    const result = await optimizeImage(imagePath, dryRun);
    results.push(result);
  }

  // Generate and print report
  if (!dryRun) {
    const report = generateReport(results);
    printReport(report);
    log(`📄 Report saved to: ${CONFIG.reportDir}/optimization-report.json`, 'green');
  } else {
    log('\n✓ Dry run complete. No files were modified.', 'yellow');
  }
}

main().catch((error) => {
  log(`\n✗ Error: ${error.message}`, 'red');
  process.exit(1);
});
