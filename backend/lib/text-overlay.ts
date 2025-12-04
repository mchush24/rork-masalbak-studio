/**
 * Text Overlay System
 *
 * Adds text overlays to story images with optimal positioning,
 * typography, and multi-language support.
 */

export interface TextOverlayOptions {
  text: string;
  language: 'tr' | 'en';
  imageWidth: number;
  imageHeight: number;
  position?: 'bottom' | 'top' | 'center';
  maxLines?: number;
}

export interface TextOverlayStyle {
  fontSize: number;
  fontFamily: string;
  fontColor: string;
  fontWeight: string;
  lineHeight: number;
  textShadow: string;
  backgroundColor: string;
  padding: number;
  borderRadius: number;
  maxWidth: string;
}

/**
 * Calculate optimal font size based on text length and image dimensions
 */
export function calculateFontSize(
  text: string,
  imageWidth: number,
  imageHeight: number
): number {
  const baseSize = Math.floor(imageWidth / 30); // ~34px for 1024px width
  const textLength = text.length;

  // Adjust based on text length
  if (textLength < 40) {
    return Math.min(baseSize * 1.2, 48); // Larger for short text
  } else if (textLength < 80) {
    return baseSize;
  } else {
    return Math.max(baseSize * 0.8, 24); // Smaller for long text
  }
}

/**
 * Get font family based on language
 */
export function getFontFamily(language: 'tr' | 'en'): string {
  // Fonts with good Turkish character support
  return language === 'tr'
    ? "'Nunito', 'Open Sans', Arial, sans-serif"
    : "'Comic Neue', 'Fredoka', 'Nunito', Arial, sans-serif";
}

/**
 * Split text into multiple lines for better readability
 */
export function splitTextIntoLines(
  text: string,
  maxCharsPerLine: number = 50
): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

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

  return lines;
}

/**
 * Get complete text overlay style
 */
export function getTextOverlayStyle(
  options: TextOverlayOptions
): TextOverlayStyle {
  const { text, language, imageWidth, imageHeight, position = 'bottom' } = options;

  const fontSize = calculateFontSize(text, imageWidth, imageHeight);
  const fontFamily = getFontFamily(language);

  return {
    fontSize,
    fontFamily,
    fontColor: '#FFFFFF',
    fontWeight: '700',
    lineHeight: 1.5,
    textShadow: '2px 2px 4px rgba(0,0,0,0.8), -1px -1px 2px rgba(0,0,0,0.5)',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: Math.floor(fontSize * 0.8),
    borderRadius: Math.floor(fontSize * 0.4),
    maxWidth: '90%',
  };
}

/**
 * Calculate text position on image
 */
export function calculateTextPosition(
  position: 'bottom' | 'top' | 'center',
  imageWidth: number,
  imageHeight: number,
  style: TextOverlayStyle
): { top?: string; bottom?: string; left: string; right: string } {
  const horizontalPadding = '5%';

  switch (position) {
    case 'bottom':
      return {
        bottom: `${style.padding * 2}px`,
        left: horizontalPadding,
        right: horizontalPadding,
      };
    case 'top':
      return {
        top: `${style.padding * 2}px`,
        left: horizontalPadding,
        right: horizontalPadding,
      };
    case 'center':
      return {
        top: '50%',
        left: horizontalPadding,
        right: horizontalPadding,
      };
    default:
      return {
        bottom: `${style.padding * 2}px`,
        left: horizontalPadding,
        right: horizontalPadding,
      };
  }
}

/**
 * Generate HTML for text overlay
 */
export function generateTextOverlayHTML(
  text: string,
  options: TextOverlayOptions
): string {
  const style = getTextOverlayStyle(options);
  const position = calculateTextPosition(
    options.position || 'bottom',
    options.imageWidth,
    options.imageHeight,
    style
  );

  const lines = splitTextIntoLines(text, 50);
  const textContent = lines.join('<br>');

  const positionStyles = Object.entries(position)
    .map(([key, value]) => `${key}: ${value}`)
    .join('; ');

  return `
    <div style="
      position: absolute;
      ${positionStyles};
      background: ${style.backgroundColor};
      backdrop-filter: blur(10px);
      border-radius: ${style.borderRadius}px;
      padding: ${style.padding}px;
      max-width: ${style.maxWidth};
      text-align: center;
      box-sizing: border-box;
    ">
      <p style="
        font-family: ${style.fontFamily};
        font-size: ${style.fontSize}px;
        font-weight: ${style.fontWeight};
        line-height: ${style.lineHeight};
        color: ${style.fontColor};
        text-shadow: ${style.textShadow};
        margin: 0;
        padding: 0;
      ">
        ${textContent}
      </p>
    </div>
  `;
}

/**
 * Generate CSS for Google Fonts
 */
export function generateFontImports(): string {
  return `
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=Comic+Neue:wght@700&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700&display=swap');
  `;
}
