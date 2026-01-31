/**
 * ProgressIndicators - Advanced progress visualizations
 * Phase 13: Loading States 2.0
 *
 * Provides animated progress indicators:
 * - Circular progress
 * - Linear progress
 * - Step progress
 * - Upload/download progress
 * - Determinate/indeterminate states
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle, StyleProp, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withSpring,
  interpolate,
  Easing,
  cancelAnimation,
  SharedValue,
  useAnimatedProps,
} from 'react-native-reanimated';
import Svg, { Circle, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Check, Upload, Download, Loader2 } from 'lucide-react-native';
import { UIColors as Colors } from '@/constants/color-aliases';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface CircularProgressProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  showPercentage?: boolean;
  animated?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Circular progress indicator
 */
export function CircularProgress({
  progress,
  size = 80,
  strokeWidth = 8,
  color = Colors.primary.purple,
  backgroundColor = Colors.neutral.lighter,
  showPercentage = true,
  animated = true,
  style,
}: CircularProgressProps) {
  const animatedProgress = useSharedValue(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  useEffect(() => {
    if (animated) {
      animatedProgress.value = withTiming(progress, {
        duration: 800,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      animatedProgress.value = progress;
    }
  }, [progress, animated]);

  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset = circumference - (animatedProgress.value / 100) * circumference;
    return {
      strokeDashoffset,
    };
  });

  const textStyle = useAnimatedStyle(() => ({
    opacity: withTiming(1, { duration: 300 }),
  }));

  return (
    <View style={[styles.circularContainer, { width: size, height: size }, style]}>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={color} />
            <Stop offset="100%" stopColor={Colors.primary.pink} />
          </LinearGradient>
        </Defs>
        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
          {/* Background circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={backgroundColor}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#progressGradient)"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeLinecap="round"
            animatedProps={animatedProps}
          />
        </G>
      </Svg>
      {showPercentage && (
        <Animated.Text style={[styles.percentageText, { fontSize: size * 0.2 }, textStyle]}>
          {Math.round(progress)}%
        </Animated.Text>
      )}
    </View>
  );
}

interface LinearProgressProps {
  progress: number; // 0-100
  height?: number;
  color?: string;
  backgroundColor?: string;
  animated?: boolean;
  indeterminate?: boolean;
  rounded?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Linear progress bar
 */
export function LinearProgress({
  progress,
  height = 8,
  color = Colors.primary.purple,
  backgroundColor = Colors.neutral.lighter,
  animated = true,
  indeterminate = false,
  rounded = true,
  style,
}: LinearProgressProps) {
  const animatedProgress = useSharedValue(0);
  const indeterminatePosition = useSharedValue(0);

  useEffect(() => {
    if (indeterminate) {
      indeterminatePosition.value = withRepeat(
        withTiming(1, { duration: 1500, easing: Easing.linear }),
        -1,
        false
      );
    } else if (animated) {
      animatedProgress.value = withTiming(progress, {
        duration: 500,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      animatedProgress.value = progress;
    }

    return () => {
      cancelAnimation(indeterminatePosition);
    };
  }, [progress, animated, indeterminate]);

  const progressStyle = useAnimatedStyle(() => {
    if (indeterminate) {
      const translateX = interpolate(
        indeterminatePosition.value,
        [0, 0.5, 1],
        [-100, 0, 100]
      );
      return {
        width: '30%',
        transform: [{ translateX: `${translateX}%` as any }],
      };
    }
    return {
      width: `${animatedProgress.value}%`,
    };
  });

  return (
    <View
      style={[
        styles.linearContainer,
        { height, backgroundColor, borderRadius: rounded ? height / 2 : 0 },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.linearProgress,
          { backgroundColor: color, borderRadius: rounded ? height / 2 : 0 },
          progressStyle,
        ]}
      />
    </View>
  );
}

interface StepProgressProps {
  steps: number;
  currentStep: number;
  labels?: string[];
  color?: string;
  completedColor?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * Step-based progress indicator
 */
export function StepProgress({
  steps,
  currentStep,
  labels,
  color = Colors.primary.purple,
  completedColor = Colors.emotion.trust,
  style,
}: StepProgressProps) {
  return (
    <View style={[styles.stepContainer, style]}>
      {Array.from({ length: steps }).map((_, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;

        return (
          <React.Fragment key={index}>
            <StepDot
              isCompleted={isCompleted}
              isCurrent={isCurrent}
              stepNumber={index + 1}
              label={labels?.[index]}
              color={color}
              completedColor={completedColor}
            />
            {index < steps - 1 && (
              <StepConnector
                isCompleted={index < currentStep}
                color={color}
                completedColor={completedColor}
              />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

interface StepDotProps {
  isCompleted: boolean;
  isCurrent: boolean;
  stepNumber: number;
  label?: string;
  color: string;
  completedColor: string;
}

function StepDot({
  isCompleted,
  isCurrent,
  stepNumber,
  label,
  color,
  completedColor,
}: StepDotProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(isCurrent ? 1 : 0.5);

  useEffect(() => {
    if (isCurrent) {
      scale.value = withSpring(1.1, { damping: 10 });
      opacity.value = withTiming(1, { duration: 200 });
    } else {
      scale.value = withSpring(1, { damping: 15 });
      opacity.value = withTiming(isCompleted ? 1 : 0.5, { duration: 200 });
    }
  }, [isCurrent, isCompleted]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const dotColor = isCompleted ? completedColor : isCurrent ? color : Colors.neutral.light;

  return (
    <View style={styles.stepDotContainer}>
      <Animated.View
        style={[
          styles.stepDot,
          { backgroundColor: dotColor },
          animatedStyle,
        ]}
      >
        {isCompleted ? (
          <Check size={14} color={Colors.neutral.white} />
        ) : (
          <Animated.Text style={styles.stepNumber}>{stepNumber}</Animated.Text>
        )}
      </Animated.View>
      {label && (
        <Animated.Text
          style={[
            styles.stepLabel,
            { color: isCurrent ? color : Colors.neutral.medium },
          ]}
        >
          {label}
        </Animated.Text>
      )}
    </View>
  );
}

interface StepConnectorProps {
  isCompleted: boolean;
  color: string;
  completedColor: string;
}

function StepConnector({ isCompleted, completedColor }: StepConnectorProps) {
  const progress = useSharedValue(isCompleted ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(isCompleted ? 1 : 0, { duration: 300 });
  }, [isCompleted]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <View style={styles.stepConnectorContainer}>
      <View style={styles.stepConnectorBackground} />
      <Animated.View
        style={[
          styles.stepConnectorProgress,
          { backgroundColor: completedColor },
          animatedStyle,
        ]}
      />
    </View>
  );
}

interface UploadProgressProps {
  progress: number;
  status: 'idle' | 'uploading' | 'success' | 'error';
  fileName?: string;
  fileSize?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * Upload progress indicator
 */
export function UploadProgress({
  progress,
  status,
  fileName,
  fileSize,
  style,
}: UploadProgressProps) {
  const iconScale = useSharedValue(1);

  useEffect(() => {
    if (status === 'success') {
      iconScale.value = withSequence(
        withTiming(1.3, { duration: 150 }),
        withSpring(1, { damping: 8 })
      );
    }
  }, [status]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return Colors.emotion.trust;
      case 'error':
        return Colors.emotion.fear;
      default:
        return Colors.primary.purple;
    }
  };

  const getIcon = () => {
    switch (status) {
      case 'success':
        return <Check size={20} color={Colors.neutral.white} />;
      case 'uploading':
        return <Upload size={20} color={Colors.neutral.white} />;
      default:
        return <Upload size={20} color={Colors.neutral.white} />;
    }
  };

  return (
    <View style={[styles.uploadContainer, style]}>
      <Animated.View
        style={[
          styles.uploadIcon,
          { backgroundColor: getStatusColor() },
          iconStyle,
        ]}
      >
        {getIcon()}
      </Animated.View>
      <View style={styles.uploadInfo}>
        {fileName && (
          <Animated.Text style={styles.uploadFileName} numberOfLines={1}>
            {fileName}
          </Animated.Text>
        )}
        {fileSize && (
          <Animated.Text style={styles.uploadFileSize}>{fileSize}</Animated.Text>
        )}
        {status === 'uploading' && (
          <LinearProgress
            progress={progress}
            height={4}
            style={{ marginTop: 8 }}
          />
        )}
      </View>
      <Animated.Text style={[styles.uploadPercentage, { color: getStatusColor() }]}>
        {status === 'success' ? 'Tamam' : `${Math.round(progress)}%`}
      </Animated.Text>
    </View>
  );
}

interface SpinnerProps {
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * Simple spinning loader
 */
export function Spinner({
  size = 24,
  color = Colors.primary.purple,
  style,
}: SpinnerProps) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 1000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View style={[styles.spinnerContainer, animatedStyle, style]}>
      <Loader2 size={size} color={color} />
    </Animated.View>
  );
}

interface DotsLoaderProps {
  size?: number;
  color?: string;
  count?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Bouncing dots loader
 */
export function DotsLoader({
  size = 8,
  color = Colors.primary.purple,
  count = 3,
  style,
}: DotsLoaderProps) {
  return (
    <View style={[styles.dotsContainer, style]}>
      {Array.from({ length: count }).map((_, index) => (
        <BouncingDot
          key={index}
          size={size}
          color={color}
          delay={index * 150}
        />
      ))}
    </View>
  );
}

interface BouncingDotProps {
  size: number;
  color: string;
  delay: number;
}

function BouncingDot({ size, color, delay }: BouncingDotProps) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    const startAnimation = () => {
      translateY.value = withRepeat(
        withSequence(
          withTiming(-size, { duration: 300, easing: Easing.out(Easing.cubic) }),
          withTiming(0, { duration: 300, easing: Easing.in(Easing.cubic) })
        ),
        -1,
        false
      );
      opacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 300 }),
          withTiming(0.4, { duration: 300 })
        ),
        -1,
        false
      );
    };

    const timeout = setTimeout(startAnimation, delay);
    return () => clearTimeout(timeout);
  }, [delay, size]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.bouncingDot,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: color },
        animatedStyle,
      ]}
    />
  );
}

interface PulseLoaderProps {
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * Pulsing circle loader
 */
export function PulseLoader({
  size = 40,
  color = Colors.primary.purple,
  style,
}: PulseLoaderProps) {
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 800, easing: Easing.out(Easing.cubic) }),
        withTiming(0.8, { duration: 800, easing: Easing.in(Easing.cubic) })
      ),
      -1,
      false
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.3, { duration: 800 }),
        withTiming(1, { duration: 800 })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.pulseLoader,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: color },
        animatedStyle,
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  // Circular Progress
  circularContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentageText: {
    position: 'absolute',
    fontWeight: '700',
    color: Colors.neutral.dark,
  },

  // Linear Progress
  linearContainer: {
    width: '100%',
    overflow: 'hidden',
  },
  linearProgress: {
    height: '100%',
  },

  // Step Progress
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepDotContainer: {
    alignItems: 'center',
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.neutral.white,
  },
  stepLabel: {
    fontSize: 11,
    marginTop: 6,
    textAlign: 'center',
    maxWidth: 60,
  },
  stepConnectorContainer: {
    flex: 1,
    height: 3,
    marginHorizontal: 4,
    marginTop: 12,
  },
  stepConnectorBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.neutral.lighter,
    borderRadius: 2,
  },
  stepConnectorProgress: {
    height: '100%',
    borderRadius: 2,
  },

  // Upload Progress
  uploadContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: Colors.neutral.white,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  uploadIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadInfo: {
    flex: 1,
    marginLeft: 12,
  },
  uploadFileName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.neutral.dark,
  },
  uploadFileSize: {
    fontSize: 12,
    color: Colors.neutral.medium,
    marginTop: 2,
  },
  uploadPercentage: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 12,
  },

  // Spinner
  spinnerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Dots Loader
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bouncingDot: {},

  // Pulse Loader
  pulseLoader: {},
});

export default {
  CircularProgress,
  LinearProgress,
  StepProgress,
  UploadProgress,
  Spinner,
  DotsLoader,
  PulseLoader,
};
