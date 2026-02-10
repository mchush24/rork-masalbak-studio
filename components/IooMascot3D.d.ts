/**
 * Type declarations for IooMascot3D
 * Platform-specific implementations (.native.tsx / .web.tsx) are resolved at build time
 */

import React from 'react';

export type IooMood = 'neutral' | 'happy' | 'excited' | 'curious' | 'love' | 'calm' | 'thinking' | 'sleepy' | 'concerned' | 'sad';
export type IooSize = 'xs' | 'sm' | 'md' | 'tiny' | 'small' | 'medium' | 'lg' | 'large' | 'hero' | 'giant';

interface IooProps {
  size?: IooSize | number;
  mood?: IooMood;
  animated?: boolean;
  showGlow?: boolean;
  onPress?: () => void;
  autoRotate?: boolean;
}

export declare const IooMascot3D: React.MemoExoticComponent<React.FC<IooProps>>;
export default IooMascot3D;
