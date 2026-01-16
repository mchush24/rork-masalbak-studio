/**
 * Animated Message Component
 *
 * Provides slide-in animations for chat messages.
 * - User messages: slide from right
 * - Assistant messages: slide from left
 * Based on UX research: animations make chat feel more natural and engaging.
 */

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, ViewStyle, StyleProp } from 'react-native';

interface AnimatedMessageProps {
  children: React.ReactNode;
  type: 'user' | 'assistant';
  delay?: number;
  style?: StyleProp<ViewStyle>;
}

export function AnimatedMessage({
  children,
  type,
  delay = 0,
  style,
}: AnimatedMessageProps) {
  const slideAnim = useRef(new Animated.Value(type === 'user' ? 50 : -50)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [delay, type]);

  return (
    <Animated.View
      style={[
        styles.container,
        style,
        {
          opacity: opacityAnim,
          transform: [
            { translateX: slideAnim },
            { scale: scaleAnim },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

/**
 * Message Send Animation
 * Plays when user sends a message - quick pop effect
 */
export function MessageSendAnimation({
  children,
  onComplete,
}: {
  children: React.ReactNode;
  onComplete?: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onComplete?.();
    });
  }, []);

  return (
    <Animated.View
      style={{
        opacity: opacityAnim,
        transform: [{ scale: scaleAnim }],
      }}
    >
      {children}
    </Animated.View>
  );
}

/**
 * Message Receive Animation
 * Plays when assistant message arrives - smooth slide with bounce
 */
export function MessageReceiveAnimation({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const slideAnim = useRef(new Animated.Value(-30)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 7,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <Animated.View
      style={{
        opacity: opacityAnim,
        transform: [{ translateX: slideAnim }],
      }}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    // Base container styles
  },
});

export default AnimatedMessage;
