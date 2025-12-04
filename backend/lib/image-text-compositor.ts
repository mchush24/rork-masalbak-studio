/**
 * Image Text Compositor
 *
 * Renders text directly onto images using Puppeteer (HTML Canvas)
 * This ensures text appears on images everywhere (mobile app, PDF, etc.)
 */

import puppeteer from 'puppeteer';

export interface TextCompositorOptions {
  imageBuffer: Buffer;
  text: string;
  language: 'tr' | 'en';
  position?: 'bottom' | 'top' | 'center';
}

/**
 * Calculate font size based on text length
 */
function calculateFontSize(text: string, imageWidth: number): number {
  const baseSize = Math.floor(imageWidth / 25); // ~40px for 1024px
  const textLength = text.length;

  if (textLength < 40) {
    return Math.min(baseSize * 1.3, 56);
  } else if (textLength < 80) {
    return baseSize;
  } else {
    return Math.max(baseSize * 0.75, 28);
  }
}

/**
 * Split text into lines that fit within max width
 */
function wrapText(
  text: string,
  maxWidth: number,
  fontSize: number
): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  // Estimate character width (rough approximation)
  const avgCharWidth = fontSize * 0.6;
  const maxCharsPerLine = Math.floor(maxWidth / avgCharWidth);

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (testLine.length <= maxCharsPerLine) {
      currentLine = testLine;
    } else {
      if (currentLine) {
        lines.push(currentLine);
      }
      currentLine = word;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  // Limit to 3 lines max
  return lines.slice(0, 3);
}

/**
 * Render text onto image and return composite buffer using Puppeteer
 */
export async function compositeTextOnImage(
  options: TextCompositorOptions
): Promise<Buffer> {
  const { imageBuffer, text, language, position = 'bottom' } = options;

  try {
    // Convert image buffer to base64 data URL
    const imageBase64 = imageBuffer.toString('base64');
    const imageDataURL = `data:image/png;base64,${imageBase64}`;

    // Calculate font size
    const fontSize = calculateFontSize(text, 1024); // Assume 1024px width

    // Wrap text
    const lines = wrapText(text, 800, fontSize);
    const textHTML = lines.join('<br>');

    // Create HTML with image and text overlay
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&display=swap');

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      width: 1024px;
      height: 1024px;
      overflow: hidden;
    }

    .container {
      position: relative;
      width: 100%;
      height: 100%;
    }

    .background-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .text-overlay {
      position: absolute;
      ${position === 'bottom' ? 'bottom: 40px;' : position === 'top' ? 'top: 40px;' : 'top: 50%; transform: translateY(-50%);'}
      left: 5%;
      right: 5%;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(10px);
      border-radius: ${Math.floor(fontSize * 0.4)}px;
      padding: ${Math.floor(fontSize * 0.8)}px;
      text-align: center;
    }

    .text-content {
      font-family: 'Nunito', Arial, sans-serif;
      font-size: ${fontSize}px;
      font-weight: 800;
      line-height: 1.4;
      color: #FFFFFF;
      text-shadow:
        2px 2px 4px rgba(0, 0, 0, 0.9),
        -1px -1px 2px rgba(0, 0, 0, 0.5),
        0 0 10px rgba(0, 0, 0, 0.8);
      margin: 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <img src="${imageDataURL}" alt="Story" class="background-image" />
    <div class="text-overlay">
      <p class="text-content">${textHTML}</p>
    </div>
  </div>
</body>
</html>
    `;

    // Render with Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1024, height: 1024 });
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const screenshot = await page.screenshot({
      type: 'png',
      omitBackground: false,
    });

    await browser.close();

    return Buffer.from(screenshot);
  } catch (error) {
    console.error('[ImageCompositor] Error compositing text:', error);
    // Return original image if compositing fails
    return imageBuffer;
  }
}

/**
 * Helper: Composite text on multiple images
 */
export async function compositeTextOnMultipleImages(
  images: { buffer: Buffer; text: string }[],
  language: 'tr' | 'en' = 'tr'
): Promise<Buffer[]> {
  const results: Buffer[] = [];

  for (const img of images) {
    const composite = await compositeTextOnImage({
      imageBuffer: img.buffer,
      text: img.text,
      language,
      position: 'bottom',
    });
    results.push(composite);
  }

  return results;
}
