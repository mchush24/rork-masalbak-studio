/**
 * Ioo - The Fluffy Cloud Mascot
 *
 * Custom designed mascot with:
 * - Fluffy white cloud body
 * - Rainbow-colored glasses
 * - Green sparkly fiber optic hair
 * - Waving hand
 * - Smooth animations
 *
 * Available versions:
 * - Ioo/IooMascotImage: 2D image with 3D-like effects (default, lightweight)
 * - Ioo3D/IooMascot3D: Real 3D model with react-three-fiber (heavier, ~13MB)
 * - IooSvg: SVG-based mascot
 */

// Export the custom image mascot as the default Ioo
export { IooMascotImage as Ioo, IooMascotImage as default } from './IooMascotImage';

// Export the real 3D version for native apps
export { IooMascot3D as Ioo3D, IooMascot3D } from './IooMascot3D';

// Also export the SVG version for cases where it might be needed
export { IooMascotNew as IooSvg } from './IooMascotNew';

// Re-export types
export type { IooMood, IooSize } from './IooMascotImage';
