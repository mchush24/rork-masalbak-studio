/**
 * Ioo - The Fluffy Cloud Mascot
 * Part of #2: Ioo Maskot Görsel Tutarlılığı
 *
 * Custom designed mascot with:
 * - Fluffy white cloud body
 * - Rainbow-colored glasses
 * - Green sparkly fiber optic hair
 * - Waving hand
 * - Smooth animations
 *
 * COMPONENT SELECTION GUIDE:
 * ============================================================================
 *
 * 1. Ioo / IooMascotImage (DEFAULT - RECOMMENDED)
 *    - Uses PNG image with 3D effects
 *    - Lightweight, fast rendering
 *    - Use for: Most use cases, mobile apps
 *
 * 2. IooRoleAware
 *    - Automatically adapts to user role (parent/teacher/expert)
 *    - Use for: Dashboard, empty states, chat, role-dependent UI
 *
 * 3. IooSvg / IooMascotNew
 *    - SVG with fiber optic hair and rainbow glasses
 *    - Use for: Marketing, hero sections, onboarding
 *
 * 4. IooMascotFinal
 *    - Clean, minimal SVG (Molang-inspired)
 *    - Use for: Simple, cute contexts
 *
 * 5. IooMascotPro
 *    - Premium Pixar-quality SVG
 *    - Use for: Special occasions, celebrations
 *
 * For detailed configuration, see: @/constants/ioo-config.ts
 */

// Export the custom image mascot as the default Ioo
export { IooMascotImage as Ioo, IooMascotImage as default } from './IooMascotImage';

// Also export the SVG version for cases where it might be needed
export { IooMascotNew as IooSvg } from './IooMascotNew';

// Other SVG variants
export { IooMascotFinal } from './IooMascotFinal';
export { IooMascotPro } from './IooMascotPro';

// Role-aware mascot component (Part of #21: Maskot Kullanımını Yetişkin Odaklı Yap)
export { IooRoleAware, AssistantIcon, ChatAvatar, useRoleMascotProps } from './IooRoleAware';

// Re-export types from config for consistency
export type { IooMood, IooSize } from '@/constants/ioo-config';

// Re-export config for advanced usage
export {
  CORE_MOODS,
  SIZE_MAP,
  IOO_COLORS,
  IOO_DEFAULTS,
  ROLE_IOO_DEFAULTS,
  COMPONENT_RECOMMENDATIONS,
  getPixelSize,
} from '@/constants/ioo-config';
