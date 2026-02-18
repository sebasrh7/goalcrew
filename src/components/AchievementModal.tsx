import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { ACHIEVEMENTS } from '../constants';
import { AchievementType } from '../types';
import { Colors, Spacing, Radius } from '../constants';

interface AchievementModalProps {
  achievementType: AchievementType | null;
  onDismiss: () => void;
}

export function AchievementModal({ achievementType, onDismiss }: AchievementModalProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (achievementType) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 80,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-dismiss after 4 seconds
      const timer = setTimeout(() => {
        dismiss();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [achievementType]);

  const dismiss = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 0, tension: 100, friction: 10, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
      onDismiss();
    });
  };

  if (!achievementType) return null;

  const achievement = ACHIEVEMENTS[achievementType];

  return (
    <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
      <TouchableOpacity style={styles.backdrop} onPress={dismiss} activeOpacity={1} />
      <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
        <LinearGradient
          colors={['#1a1555', '#232c42']}
          style={styles.card}
        >
          <View style={styles.badge}>
            <Text style={styles.badgeEmoji}>{achievement.emoji}</Text>
          </View>

          <Text style={styles.header}>¡Medalla desbloqueada!</Text>
          <Text style={styles.title}>{achievement.title}</Text>
          <Text style={styles.description}>{achievement.description}</Text>

          <View style={styles.glowLine} />

          <TouchableOpacity onPress={dismiss} style={styles.btn}>
            <LinearGradient
              colors={Colors.gradientPrimary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.btnGradient}
            >
              <Text style={styles.btnText}>¡Genial! 🙌</Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    inset: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  backdrop: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.75)',
  },
  container: {
    width: '80%',
    maxWidth: 320,
  },
  card: {
    borderRadius: Radius.xxl,
    padding: Spacing.xxl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(108,99,255,0.4)',
  },
  badge: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(108,99,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    borderWidth: 2,
    borderColor: 'rgba(108,99,255,0.4)',
  },
  badgeEmoji: {
    fontSize: 44,
  },
  header: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.accent2,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  description: {
    fontSize: 14,
    color: Colors.text2,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.xl,
  },
  glowLine: {
    width: '60%',
    height: 1,
    backgroundColor: 'rgba(108,99,255,0.3)',
    marginBottom: Spacing.xl,
  },
  btn: {
    width: '100%',
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  btnGradient: {
    paddingVertical: 13,
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
});
