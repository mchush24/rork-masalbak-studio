/**
 * İOO - The Fluffy Cloud Mascot with Fiber Optic Hair
 *
 * Manifesto v8.0 Uyumlu Tasarım
 *
 * ALTIN FORMÜL:
 * Baby Schema + Shape Language + Renk Psikolojisi + Kawaii + Parasosyal İlişki + Biyofili + Fiber Optik
 *
 * 5 DNA ELEMANI (Tüm ürünlerde korunmalı):
 * 1. Yuvarlak bulut gövde (baby schema - %65 oran)
 * 2. Gökkuşağı gözlükler (tanınabilirlik)
 * 3. Çim/fiber saçlar (biyofili + fiber optik estetik)
 * 4. Büyük gözler (%30 yüz alanı)
 * 5. Aydede gülümseme (kawaii)
 *
 * NÖROLOJİK HEDEFLER:
 * - Fusiform yüz alanı + nucleus accumbens → Sevimlilik + ödül
 * - Parasempatik aktivasyon → Stres azalması (yeşil çimler)
 * - Görsel dikkat ağı → Büyü/hayal hissi (fiber optik parıltı)
 */

import React, { memo, useEffect } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import Svg, {
  Defs,
  RadialGradient,
  LinearGradient,
  Stop,
  Ellipse,
  Circle,
  Path,
  G,
} from 'react-native-svg';
import { IooMood, IooSize, getPixelSize, IOO_COLORS } from '@/constants/ioo-config';
import { Colors } from '@/constants/colors';

// Re-export types for backwards compatibility
export type { IooMood, IooSize } from '@/constants/ioo-config';

interface IooProps {
  size?: IooSize | number;
  mood?: IooMood;
  animated?: boolean;
  showGlow?: boolean;
  onPress?: () => void;
}

// Use unified fiber tip colors from config
const FIBER_TIP_COLORS = IOO_COLORS.fiberTips;

export const IooMascotNew = memo(function IooMascotNew({
  size = 'medium',
  _mood = 'happy',
  animated = true,
  showGlow = true,
  onPress,
}: IooProps) {
  const dimensions = getPixelSize(size);

  // Animation values
  const breathe = useSharedValue(1);
  const float = useSharedValue(0);
  const wave = useSharedValue(0);
  const eyeBlink = useSharedValue(1);
  const fiberGlow = useSharedValue(0.7);

  useEffect(() => {
    if (!animated) return;

    // Gentle breathing - baby schema softness
    breathe.value = withRepeat(
      withSequence(
        withTiming(1.015, { duration: 2200, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.985, { duration: 2200, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Floating animation - soft fascination (ART theory)
    float.value = withRepeat(
      withSequence(
        withTiming(-3, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(3, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Hand wave - social signal
    wave.value = withRepeat(
      withSequence(
        withDelay(2000, withTiming(12, { duration: 200 })),
        withTiming(-12, { duration: 200 }),
        withTiming(10, { duration: 180 }),
        withTiming(-8, { duration: 180 }),
        withTiming(5, { duration: 150 }),
        withTiming(0, { duration: 150 }),
        withTiming(0, { duration: 3000 })
      ),
      -1,
      false
    );

    // Fiber optic tip glow pulse
    fiberGlow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.6, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Random blink - lifelike behavior
    const blinkInterval = setInterval(
      () => {
        eyeBlink.value = withSequence(
          withTiming(0.1, { duration: 70 }),
          withTiming(1, { duration: 70 })
        );
      },
      3000 + Math.random() * 2500
    );

    return () => clearInterval(blinkInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animated]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breathe.value }, { translateY: float.value }],
  }));

  const handStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${wave.value}deg` }],
  }));

  // Dimensions - Baby Schema proportions
  const w = dimensions;
  const h = dimensions * 1.1; // Head = 65% ratio
  const cx = w / 2;
  const cy = h * 0.5; // Center for better proportion

  // Generate grass/fiber blade data
  const generateGrassBlades = () => {
    const blades = [];
    const numBlades = 15;

    for (let i = 0; i < numBlades; i++) {
      const angle = -70 + (140 * i) / (numBlades - 1); // -70 to 70 degrees
      const length = 0.18 + Math.random() * 0.08; // Variable length
      const curve = (Math.random() - 0.5) * 15; // Random curve
      const thickness = 0.022 + Math.random() * 0.012;

      blades.push({
        angle,
        length,
        curve,
        thickness,
        tipColor: FIBER_TIP_COLORS[i % FIBER_TIP_COLORS.length],
        delay: i * 100,
      });
    }
    return blades;
  };

  const grassBlades = generateGrassBlades();

  const Content = (
    <Animated.View style={[styles.container, { width: w + 40, height: h + 50 }, containerStyle]}>
      {/* Ambient Glow - Hale effect */}
      {showGlow && (
        <View style={[styles.glowContainer, { top: h * 0.1, left: 10 }]}>
          <Svg width={w + 20} height={h + 20}>
            <Defs>
              <RadialGradient id="ambientGlow" cx="50%" cy="45%" r="55%">
                <Stop offset="0%" stopColor="#FFE4EC" stopOpacity="0.5" />
                <Stop offset="40%" stopColor="#E8F4FF" stopOpacity="0.3" />
                <Stop offset="100%" stopColor="#F0E8FF" stopOpacity="0" />
              </RadialGradient>
            </Defs>
            <Ellipse
              cx={(w + 20) / 2}
              cy={(h + 20) * 0.45}
              rx={w * 0.55}
              ry={h * 0.45}
              fill="url(#ambientGlow)"
            />
          </Svg>
        </View>
      )}

      {/* Ground Shadow */}
      <View style={[styles.shadowContainer, { top: h + 15, left: 20 }]}>
        <Svg width={w} height={25}>
          <Defs>
            <RadialGradient id="groundShadow" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={Colors.neutral.darkest} stopOpacity="0.12" />
              <Stop offset="100%" stopColor={Colors.neutral.darkest} stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Ellipse cx={w / 2} cy={12} rx={w * 0.35} ry={10} fill="url(#groundShadow)" />
        </Svg>
      </View>

      <Svg width={w + 40} height={h + 40} viewBox={`-20 -20 ${w + 40} ${h + 40}`}>
        <Defs>
          {/* Fluffy cloud body - pastel rainbow gradient */}
          <RadialGradient id="cloudBody" cx="30%" cy="25%" r="85%">
            <Stop offset="0%" stopColor={Colors.neutral.white} />
            <Stop offset="20%" stopColor="#FFF8FA" />
            <Stop offset="40%" stopColor="#FFF5F8" />
            <Stop offset="60%" stopColor="#F8F5FF" />
            <Stop offset="80%" stopColor="#F5FAFF" />
            <Stop offset="100%" stopColor="#F0F8FF" />
          </RadialGradient>

          {/* Rainbow shimmer overlay for fluffy texture */}
          <LinearGradient id="rainbowShimmer" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FFD1DC" stopOpacity="0.25" />
            <Stop offset="25%" stopColor="#FFECD2" stopOpacity="0.2" />
            <Stop offset="50%" stopColor="#E8FFE8" stopOpacity="0.15" />
            <Stop offset="75%" stopColor="#D1E8FF" stopOpacity="0.2" />
            <Stop offset="100%" stopColor="#E8D1FF" stopOpacity="0.25" />
          </LinearGradient>

          {/* Inner body depth */}
          <RadialGradient id="innerDepth" cx="50%" cy="60%" r="50%">
            <Stop offset="0%" stopColor="#FFF0F5" stopOpacity="0.3" />
            <Stop offset="100%" stopColor="#E8E0F0" stopOpacity="0.1" />
          </RadialGradient>

          {/* Glasses frame - golden metallic */}
          <LinearGradient id="glassFrame" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#FFD700" />
            <Stop offset="30%" stopColor="#FFAA00" />
            <Stop offset="70%" stopColor="#FF8C00" />
            <Stop offset="100%" stopColor="#CC7000" />
          </LinearGradient>

          {/* Left lens - rainbow gradient */}
          <RadialGradient id="lensLeft" cx="30%" cy="30%" r="80%">
            <Stop offset="0%" stopColor={Colors.secondary.coral} stopOpacity="0.75" />
            <Stop offset="35%" stopColor="#FFE66D" stopOpacity="0.7" />
            <Stop offset="70%" stopColor="#4ECDC4" stopOpacity="0.75" />
            <Stop offset="100%" stopColor={Colors.secondary.lavender} stopOpacity="0.8" />
          </RadialGradient>

          {/* Right lens - rainbow gradient (different angle) */}
          <RadialGradient id="lensRight" cx="70%" cy="30%" r="80%">
            <Stop offset="0%" stopColor="#FF9F43" stopOpacity="0.75" />
            <Stop offset="35%" stopColor="#26DE81" stopOpacity="0.7" />
            <Stop offset="70%" stopColor="#45AAF2" stopOpacity="0.75" />
            <Stop offset="100%" stopColor="#D980FA" stopOpacity="0.8" />
          </RadialGradient>

          {/* Grass/fiber gradient - biophilic green */}
          <LinearGradient id="grassBase" x1="0%" y1="100%" x2="0%" y2="0%">
            <Stop offset="0%" stopColor="#27AE60" />
            <Stop offset="40%" stopColor="#2ECC71" />
            <Stop offset="70%" stopColor="#58D68D" />
            <Stop offset="100%" stopColor="#82E0AA" />
          </LinearGradient>

          {/* Fiber optic root glow */}
          <RadialGradient id="fiberRoot" cx="50%" cy="100%" r="100%">
            <Stop offset="0%" stopColor={Colors.neutral.white} stopOpacity="0.9" />
            <Stop offset="50%" stopColor="#E8FFE8" stopOpacity="0.5" />
            <Stop offset="100%" stopColor="#82E0AA" stopOpacity="0" />
          </RadialGradient>

          {/* Blush gradient */}
          <RadialGradient id="blush" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#FFB6C1" stopOpacity="0.6" />
            <Stop offset="100%" stopColor="#FFB6C1" stopOpacity="0" />
          </RadialGradient>

          {/* Hand gradient */}
          <RadialGradient id="handGrad" cx="30%" cy="30%" r="80%">
            <Stop offset="0%" stopColor={Colors.neutral.white} />
            <Stop offset="50%" stopColor="#FFF8FA" />
            <Stop offset="100%" stopColor="#FFE8EE" />
          </RadialGradient>
        </Defs>

        {/* ===== FLUFFY CLOUD BODY ===== */}
        {/* Multiple overlapping circles for cotton/cloud texture */}
        <G>
          {/* Layer 1: Base fluffy bumps */}
          <Circle cx={cx - w * 0.25} cy={cy + h * 0.12} r={w * 0.22} fill="url(#cloudBody)" />
          <Circle cx={cx + w * 0.25} cy={cy + h * 0.12} r={w * 0.22} fill="url(#cloudBody)" />
          <Circle cx={cx} cy={cy + h * 0.18} r={w * 0.26} fill="url(#cloudBody)" />

          {/* Layer 2: Middle bumps */}
          <Circle cx={cx - w * 0.3} cy={cy - h * 0.02} r={w * 0.2} fill="url(#cloudBody)" />
          <Circle cx={cx + w * 0.3} cy={cy - h * 0.02} r={w * 0.2} fill="url(#cloudBody)" />
          <Circle cx={cx - w * 0.15} cy={cy + h * 0.05} r={w * 0.24} fill="url(#cloudBody)" />
          <Circle cx={cx + w * 0.15} cy={cy + h * 0.05} r={w * 0.24} fill="url(#cloudBody)" />

          {/* Layer 3: Main center body */}
          <Circle cx={cx} cy={cy} r={w * 0.3} fill="url(#cloudBody)" />

          {/* Layer 4: Top/head area - larger for baby schema, connects to hair */}
          <Circle cx={cx} cy={cy - h * 0.12} r={w * 0.32} fill="url(#cloudBody)" />
          <Circle cx={cx - w * 0.15} cy={cy - h * 0.1} r={w * 0.22} fill="url(#cloudBody)" />
          <Circle cx={cx + w * 0.15} cy={cy - h * 0.1} r={w * 0.22} fill="url(#cloudBody)" />
          {/* Extra top bumps to seamlessly connect with hair */}
          <Circle cx={cx} cy={cy - h * 0.22} r={w * 0.26} fill="url(#cloudBody)" />
          <Circle cx={cx - w * 0.12} cy={cy - h * 0.2} r={w * 0.2} fill="url(#cloudBody)" />
          <Circle cx={cx + w * 0.12} cy={cy - h * 0.2} r={w * 0.2} fill="url(#cloudBody)" />
          {/* Very top - hair root area */}
          <Circle cx={cx} cy={cy - h * 0.28} r={w * 0.18} fill="url(#cloudBody)" />
          <Circle cx={cx - w * 0.08} cy={cy - h * 0.26} r={w * 0.14} fill="url(#cloudBody)" />
          <Circle cx={cx + w * 0.08} cy={cy - h * 0.26} r={w * 0.14} fill="url(#cloudBody)" />

          {/* Rainbow shimmer overlay */}
          <Circle cx={cx} cy={cy} r={w * 0.3} fill="url(#rainbowShimmer)" />
          <Circle cx={cx - w * 0.2} cy={cy + h * 0.08} r={w * 0.22} fill="url(#rainbowShimmer)" />
          <Circle cx={cx + w * 0.2} cy={cy + h * 0.08} r={w * 0.22} fill="url(#rainbowShimmer)" />

          {/* Inner depth/dimension */}
          <Ellipse cx={cx} cy={cy + h * 0.05} rx={w * 0.25} ry={h * 0.15} fill="url(#innerDepth)" />

          {/* Fluffy highlight spots - cotton texture */}
          <Circle
            cx={cx - w * 0.22}
            cy={cy - h * 0.08}
            r={w * 0.045}
            fill={Colors.neutral.white}
            opacity={0.8}
          />
          <Circle
            cx={cx + w * 0.28}
            cy={cy + h * 0.05}
            r={w * 0.035}
            fill={Colors.neutral.white}
            opacity={0.7}
          />
          <Circle
            cx={cx - w * 0.1}
            cy={cy + h * 0.2}
            r={w * 0.03}
            fill={Colors.neutral.white}
            opacity={0.6}
          />
          <Circle
            cx={cx + w * 0.08}
            cy={cy - h * 0.15}
            r={w * 0.025}
            fill={Colors.neutral.white}
            opacity={0.7}
          />
        </G>

        {/* ===== FIBER OPTIC GRASS HAIR ===== */}
        {/* Root glow - fiber optic light source - embedded in top of head */}
        <Ellipse cx={cx} cy={cy - h * 0.22} rx={w * 0.2} ry={h * 0.1} fill="url(#fiberRoot)" />

        {/* Grass blades with fiber optic tips */}
        <G>
          {grassBlades.map((blade, i) => {
            const hairBase = cy - h * 0.24; // Hair starts embedded in head
            const startX = cx + Math.sin((blade.angle * Math.PI) / 180) * w * 0.08;
            const startY = hairBase;
            const endX =
              cx + Math.sin(((blade.angle + blade.curve) * Math.PI) / 180) * w * blade.length * 1.5;
            const endY =
              hairBase - Math.cos((blade.angle * Math.PI) / 180) * h * blade.length * 1.2;
            const ctrlX =
              cx +
              Math.sin(((blade.angle + blade.curve * 0.5) * Math.PI) / 180) *
                w *
                blade.length *
                0.85;
            const ctrlY =
              hairBase - Math.cos((blade.angle * Math.PI) / 180) * h * blade.length * 0.65;

            return (
              <G key={i}>
                {/* Grass blade */}
                <Path
                  d={`M ${startX} ${startY} Q ${ctrlX} ${ctrlY} ${endX} ${endY}`}
                  stroke="url(#grassBase)"
                  strokeWidth={w * blade.thickness}
                  strokeLinecap="round"
                  fill="none"
                />
                {/* Light trail effect - opacity gradient along blade */}
                <Path
                  d={`M ${startX} ${startY} Q ${ctrlX} ${ctrlY} ${endX} ${endY}`}
                  stroke={Colors.neutral.white}
                  strokeWidth={w * blade.thickness * 0.4}
                  strokeLinecap="round"
                  fill="none"
                  opacity={0.3}
                />
                {/* Fiber optic glowing tip */}
                <Circle cx={endX} cy={endY} r={w * 0.025} fill={blade.tipColor} opacity={0.9} />
                {/* Tip glow halo */}
                <Circle cx={endX} cy={endY} r={w * 0.04} fill={blade.tipColor} opacity={0.4} />
                {/* Bright center of tip */}
                <Circle
                  cx={endX}
                  cy={endY}
                  r={w * 0.012}
                  fill={Colors.neutral.white}
                  opacity={0.9}
                />
              </G>
            );
          })}
        </G>

        {/* ===== RAINBOW GLASSES ===== */}
        <G>
          {/* Left lens */}
          <Circle cx={cx - w * 0.14} cy={cy - h * 0.05} r={w * 0.13} fill="url(#lensLeft)" />
          {/* Left lens shine */}
          <Ellipse
            cx={cx - w * 0.18}
            cy={cy - h * 0.09}
            rx={w * 0.04}
            ry={w * 0.025}
            fill={Colors.neutral.white}
            opacity={0.7}
          />

          {/* Right lens */}
          <Circle cx={cx + w * 0.14} cy={cy - h * 0.05} r={w * 0.13} fill="url(#lensRight)" />
          {/* Right lens shine */}
          <Ellipse
            cx={cx + w * 0.1}
            cy={cy - h * 0.09}
            rx={w * 0.04}
            ry={w * 0.025}
            fill={Colors.neutral.white}
            opacity={0.7}
          />

          {/* Glasses frame - left */}
          <Circle
            cx={cx - w * 0.14}
            cy={cy - h * 0.05}
            r={w * 0.145}
            stroke="url(#glassFrame)"
            strokeWidth={w * 0.032}
            fill="none"
          />
          {/* Glasses frame - right */}
          <Circle
            cx={cx + w * 0.14}
            cy={cy - h * 0.05}
            r={w * 0.145}
            stroke="url(#glassFrame)"
            strokeWidth={w * 0.032}
            fill="none"
          />
          {/* Bridge */}
          <Path
            d={`M ${cx - w * 0.01} ${cy - h * 0.05} L ${cx + w * 0.01} ${cy - h * 0.05}`}
            stroke="url(#glassFrame)"
            strokeWidth={w * 0.03}
            strokeLinecap="round"
          />
          {/* Temple arms (sides) */}
          <Path
            d={`M ${cx - w * 0.285} ${cy - h * 0.05} L ${cx - w * 0.34} ${cy - h * 0.03}`}
            stroke="url(#glassFrame)"
            strokeWidth={w * 0.022}
            strokeLinecap="round"
          />
          <Path
            d={`M ${cx + w * 0.285} ${cy - h * 0.05} L ${cx + w * 0.34} ${cy - h * 0.03}`}
            stroke="url(#glassFrame)"
            strokeWidth={w * 0.022}
            strokeLinecap="round"
          />
        </G>

        {/* ===== EYES (behind glasses) - 30% of face area ===== */}
        <G>
          {/* Left eye */}
          <Ellipse
            cx={cx - w * 0.14}
            cy={cy - h * 0.04}
            rx={w * 0.042}
            ry={w * 0.058}
            fill="#2C3E50"
          />
          <Circle cx={cx - w * 0.15} cy={cy - h * 0.06} r={w * 0.016} fill={Colors.neutral.white} />
          <Circle
            cx={cx - w * 0.13}
            cy={cy - h * 0.045}
            r={w * 0.008}
            fill={Colors.neutral.white}
            opacity={0.6}
          />

          {/* Right eye */}
          <Ellipse
            cx={cx + w * 0.14}
            cy={cy - h * 0.04}
            rx={w * 0.042}
            ry={w * 0.058}
            fill="#2C3E50"
          />
          <Circle cx={cx + w * 0.13} cy={cy - h * 0.06} r={w * 0.016} fill={Colors.neutral.white} />
          <Circle
            cx={cx + w * 0.15}
            cy={cy - h * 0.045}
            r={w * 0.008}
            fill={Colors.neutral.white}
            opacity={0.6}
          />
        </G>

        {/* ===== AYDEDE GÜLÜMSEME (Crescent Smile) - More visible ===== */}
        <Path
          d={`M ${cx - w * 0.1} ${cy + h * 0.12} Q ${cx} ${cy + h * 0.2} ${cx + w * 0.1} ${cy + h * 0.12}`}
          stroke="#D76A7C"
          strokeWidth={w * 0.028}
          strokeLinecap="round"
          fill="none"
        />

        {/* ===== BLUSH CHEEKS (Kawaii) ===== */}
        <Ellipse
          cx={cx - w * 0.26}
          cy={cy + h * 0.06}
          rx={w * 0.055}
          ry={w * 0.038}
          fill="url(#blush)"
        />
        <Ellipse
          cx={cx + w * 0.26}
          cy={cy + h * 0.06}
          rx={w * 0.055}
          ry={w * 0.038}
          fill="url(#blush)"
        />

        {/* ===== SMALL NOSE (minimal - baby schema) ===== */}
        <Ellipse
          cx={cx}
          cy={cy + h * 0.05}
          rx={w * 0.014}
          ry={w * 0.01}
          fill="#E8A0B0"
          opacity={0.6}
        />
      </Svg>

      {/* ===== WAVING HAND ===== */}
      <Animated.View style={[styles.handContainer, { right: 0, top: cy - h * 0.05 }, handStyle]}>
        <Svg width={w * 0.28} height={w * 0.35} viewBox="0 0 45 55">
          <Defs>
            <RadialGradient id="handGradLocal" cx="30%" cy="30%" r="80%">
              <Stop offset="0%" stopColor={Colors.neutral.white} />
              <Stop offset="50%" stopColor="#FFF8FA" />
              <Stop offset="100%" stopColor="#FFE8EE" />
            </RadialGradient>
          </Defs>
          {/* Arm */}
          <Ellipse cx={18} cy={40} rx={10} ry={16} fill="url(#handGradLocal)" />
          {/* Palm */}
          <Circle cx={18} cy={22} r={12} fill="url(#handGradLocal)" />
          {/* Fingers spread */}
          <Ellipse cx={8} cy={10} rx={4.5} ry={9} fill="url(#handGradLocal)" />
          <Ellipse cx={16} cy={6} rx={4} ry={10} fill="url(#handGradLocal)" />
          <Ellipse cx={24} cy={8} rx={4} ry={9} fill="url(#handGradLocal)" />
          <Ellipse cx={31} cy={14} rx={3.5} ry={7} fill="url(#handGradLocal)" />
          {/* Thumb */}
          <Ellipse cx={4} cy={24} rx={5} ry={7} fill="url(#handGradLocal)" />
          {/* Hand highlight */}
          <Circle cx={14} cy={18} r={3} fill={Colors.neutral.white} opacity={0.6} />
        </Svg>
      </Animated.View>
    </Animated.View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
        {Content}
      </Pressable>
    );
  }

  return Content;
});

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowContainer: {
    position: 'absolute',
  },
  shadowContainer: {
    position: 'absolute',
  },
  handContainer: {
    position: 'absolute',
    transformOrigin: 'center bottom',
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
});

// Re-export for compatibility
export { IooMascotNew as Ioo };
export default IooMascotNew;
