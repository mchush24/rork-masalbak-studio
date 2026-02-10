/**
 * Dashboard Header
 * Role-aware header with greeting and mascot visibility
 * Part of #17: Profesyonel Dashboard Tasarımı
 */

import React, { useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  MessageCircle,
  Settings,
  Bell,
} from 'lucide-react-native';
import { spacing, radius, shadows } from '@/constants/design-system';
import { ProfessionalColors, Colors } from '@/constants/colors';
import {
  useRole,
  useRoleText,
  useMascotSettings,
  ROLE_TEXTS,
} from '@/lib/contexts/RoleContext';
import { Ioo as IooMascot } from '@/components/Ioo';
import { GreetingService } from '@/lib/services/greeting-service';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const isSmallDevice = SCREEN_HEIGHT < 700;

interface DashboardHeaderProps {
  userName?: string;
  onMascotPress?: () => void;
  onSettingsPress?: () => void;
  onNotificationsPress?: () => void;
  notificationCount?: number;
}

export function DashboardHeader({
  userName,
  onMascotPress,
  onSettingsPress,
  onNotificationsPress,
  notificationCount = 0,
}: DashboardHeaderProps) {
  const { role, config } = useRole();
  const mascotSettings = useMascotSettings();
  const dashboardTitle = useRoleText('dashboard_title');
  const dashboardSubtitle = useRoleText('dashboard_subtitle');

  // Get time-based greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    let greetingKey: keyof typeof ROLE_TEXTS;

    if (hour < 12) {
      greetingKey = 'greeting_morning';
    } else if (hour < 18) {
      greetingKey = 'greeting_afternoon';
    } else {
      greetingKey = 'greeting_evening';
    }

    return ROLE_TEXTS[greetingKey][role];
  }, [role]);

  const showMascot = mascotSettings.showOnDashboard;
  const isProfessional = role === 'teacher' || role === 'expert';

  // Get role-specific gradient colors
  const getHeaderGradient = (): [string, string] => {
    switch (role) {
      case 'expert':
        return [ProfessionalColors.roles.expert.gradient[0], Colors.neutral.white];
      case 'teacher':
        return [ProfessionalColors.roles.teacher.gradient[0], Colors.neutral.white];
      default:
        return ['#F8F7FC', Colors.neutral.white];
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={getHeaderGradient()}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradient}
      >
        {/* Top Bar with Actions */}
        <View style={styles.topBar}>
          <View style={styles.titleContainer}>
            <Text style={[styles.dashboardTitle, isProfessional && styles.titleProfessional]}>
              {dashboardTitle}
            </Text>
          </View>

          <View style={styles.actionsContainer}>
            {onNotificationsPress && (
              <Pressable
                style={({ pressed }) => [
                  styles.actionButton,
                  pressed && styles.actionButtonPressed,
                ]}
                onPress={onNotificationsPress}
              >
                <Bell size={20} color={isProfessional ? ProfessionalColors.text.secondary : Colors.neutral.dark} />
                {notificationCount > 0 && (
                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationText}>
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </Text>
                  </View>
                )}
              </Pressable>
            )}

            {onSettingsPress && (
              <Pressable
                style={({ pressed }) => [
                  styles.actionButton,
                  pressed && styles.actionButtonPressed,
                ]}
                onPress={onSettingsPress}
              >
                <Settings size={20} color={isProfessional ? ProfessionalColors.text.secondary : Colors.neutral.dark} />
              </Pressable>
            )}
          </View>
        </View>

        {/* Greeting Section */}
        <View style={styles.greetingSection}>
          {/* Mascot (conditionally shown) */}
          {showMascot && (
            <Pressable
              style={styles.mascotContainer}
              onPress={onMascotPress}
            >
              <IooMascot
                size={isSmallDevice ? 'small' : 'medium'}
                animated
                showGlow={mascotSettings.prominence === 'high'}
                mood="happy"
              />
              {mascotSettings.prominence === 'high' && (
                <View style={styles.chatHint}>
                  <MessageCircle size={10} color={Colors.primary.sunset} />
                  <Text style={styles.chatHintText}>Sohbet</Text>
                </View>
              )}
            </Pressable>
          )}

          {/* Greeting Text */}
          <View style={[styles.greetingTextContainer, !showMascot && styles.greetingTextFull]}>
            <Text style={[styles.greetingText, isProfessional && styles.greetingTextProfessional]}>
              {greeting}
            </Text>
            {userName && (
              <Text style={styles.userName}>
                {isProfessional ? userName : `Merhaba, ${userName}`}
              </Text>
            )}
            <Text style={[styles.subtitle, isProfessional && styles.subtitleProfessional]}>
              {dashboardSubtitle}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing['4'],
  },
  gradient: {
    borderRadius: radius.xl,
    padding: spacing['4'],
    ...shadows.sm,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing['3'],
  },
  titleContainer: {
    flex: 1,
  },
  dashboardTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.neutral.medium,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  titleProfessional: {
    color: ProfessionalColors.text.secondary,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: spacing['2'],
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  actionButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  notificationText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.neutral.white,
  },
  greetingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
  },
  mascotContainer: {
    alignItems: 'center',
    gap: spacing['1'],
  },
  chatHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  chatHintText: {
    fontSize: 9,
    color: Colors.primary.sunset,
    fontWeight: '500',
  },
  greetingTextContainer: {
    flex: 1,
  },
  greetingTextFull: {
    paddingLeft: 0,
  },
  greetingText: {
    fontSize: isSmallDevice ? 18 : 20,
    fontWeight: '700',
    color: Colors.neutral.darker,
    marginBottom: 2,
  },
  greetingTextProfessional: {
    color: ProfessionalColors.text.primary,
    fontSize: isSmallDevice ? 16 : 18,
  },
  userName: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.neutral.dark,
    marginBottom: spacing['2'],
  },
  subtitle: {
    fontSize: 13,
    color: Colors.neutral.medium,
    lineHeight: 18,
  },
  subtitleProfessional: {
    color: ProfessionalColors.text.secondary,
  },
});

export default DashboardHeader;
