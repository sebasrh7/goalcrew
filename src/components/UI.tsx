import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { Colors, FontSize, Radius, Spacing } from "../constants";
import { MemberStatus } from "../types";

// ─── Button ──────────────────────────────────────────────────────────────────

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  disabled?: boolean;
  icon?: string;
  style?: ViewStyle;
}

export function Button({
  title,
  onPress,
  variant = "primary",
  size = "md",
  isLoading,
  disabled,
  icon,
  style,
}: ButtonProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const sizeStyle = {
    sm: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: Radius.md },
    md: { paddingVertical: 14, paddingHorizontal: 20, borderRadius: Radius.lg },
    lg: { paddingVertical: 17, paddingHorizontal: 24, borderRadius: Radius.xl },
  }[size];

  const textSize = { sm: FontSize.sm, md: FontSize.md, lg: FontSize.lg }[size];

  if (variant === "primary") {
    return (
      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled || isLoading}
        style={[{ opacity: disabled ? 0.5 : 1 }, style]}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={Colors.gradientPrimary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.btnBase, sizeStyle]}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              {icon && (
                <Text style={[styles.btnText, { fontSize: textSize }]}>
                  {icon}{" "}
                </Text>
              )}
              <Text style={[styles.btnText, { fontSize: textSize }]}>
                {title}
              </Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  const variantStyles: Record<
    string,
    { bg: string; textColor: string; border?: string }
  > = {
    secondary: {
      bg: Colors.surface2,
      textColor: Colors.text,
      border: Colors.surface3,
    },
    ghost: { bg: "transparent", textColor: Colors.accent2 },
    danger: {
      bg: "rgba(248,113,113,0.12)",
      textColor: Colors.red,
      border: "rgba(248,113,113,0.3)",
    },
  };

  const vs = variantStyles[variant];

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
      style={[
        styles.btnBase,
        sizeStyle,
        {
          backgroundColor: vs.bg,
          borderWidth: vs.border ? 1 : 0,
          borderColor: vs.border,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator color={vs.textColor} size="small" />
      ) : (
        <>
          {icon && (
            <Text style={[{ fontSize: textSize, color: vs.textColor }]}>
              {icon}{" "}
            </Text>
          )}
          <Text
            style={[
              styles.btnText,
              { fontSize: textSize, color: vs.textColor },
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  gradient?: boolean;
}

export function Card({ children, style, gradient }: CardProps) {
  if (gradient) {
    return (
      <LinearGradient
        colors={["#1a1555", "#141929"]}
        style={[styles.card, style]}
      >
        {children}
      </LinearGradient>
    );
  }
  return <View style={[styles.card, style]}>{children}</View>;
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

interface AvatarProps {
  name: string;
  size?: number;
  gradient?: readonly [string, string];
  style?: ViewStyle;
}

export function Avatar({ name, size = 40, gradient, style }: AvatarProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const fontSize = size * 0.35;
  const colors = gradient ?? getAvatarGradient(name);

  return (
    <LinearGradient
      colors={colors as any}
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          ...styles.avatarCenter,
        },
        style,
      ]}
    >
      <Text style={{ color: "#fff", fontSize, fontWeight: "800" }}>
        {initials}
      </Text>
    </LinearGradient>
  );
}

function getAvatarGradient(name: string): [string, string] {
  const gradients: [string, string][] = [
    [Colors.accent, Colors.accent2],
    ["#22d3a0", "#059669"],
    ["#f59e0b", "#d97706"],
    ["#a78bfa", "#7c3aed"],
    ["#f87171", "#dc2626"],
    ["#60a5fa", "#2563eb"],
  ];
  const index = name.charCodeAt(0) % gradients.length;
  return gradients[index];
}

// ─── ProgressBar ──────────────────────────────────────────────────────────────

interface ProgressBarProps {
  progress: number; // 0-100
  height?: number;
  color?: string;
  style?: ViewStyle;
  animated?: boolean;
}

export function ProgressBar({
  progress,
  height = 6,
  color,
  style,
}: ProgressBarProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const fillColor =
    color ??
    (clampedProgress >= 90
      ? Colors.green
      : clampedProgress >= 60
        ? Colors.accent
        : clampedProgress >= 30
          ? Colors.yellow
          : Colors.red);

  return (
    <View
      style={[
        {
          height,
          backgroundColor: Colors.surface3,
          borderRadius: height / 2,
          overflow: "hidden",
        },
        style,
      ]}
    >
      <LinearGradient
        colors={[fillColor, fillColor + "CC"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          width: `${clampedProgress}%`,
          height: "100%",
          borderRadius: height / 2,
        }}
      />
    </View>
  );
}

// ─── StatusPill ───────────────────────────────────────────────────────────────

interface StatusPillProps {
  status: MemberStatus;
  style?: ViewStyle;
}

export function StatusPill({ status, style }: StatusPillProps) {
  const config = {
    on_track: {
      emoji: "🟢",
      label: "Al día",
      bg: "rgba(34,211,160,.15)",
      color: Colors.green,
    },
    at_risk: {
      emoji: "🟡",
      label: "En riesgo",
      bg: "rgba(251,191,36,.15)",
      color: Colors.yellow,
    },
    behind: {
      emoji: "🔴",
      label: "Atrasado",
      bg: "rgba(248,113,113,.15)",
      color: Colors.red,
    },
  }[status];

  return (
    <View style={[styles.pill, { backgroundColor: config.bg }, style]}>
      <Text style={{ fontSize: 10 }}>{config.emoji}</Text>
      <Text style={[styles.pillText, { color: config.color }]}>
        {config.label}
      </Text>
    </View>
  );
}

// ─── SectionHeader ────────────────────────────────────────────────────────────

interface SectionHeaderProps {
  title: string;
  action?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export function SectionHeader({
  title,
  action,
  onAction,
  style,
}: SectionHeaderProps) {
  return (
    <View style={[styles.sectionHeader, style]}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action && (
        <TouchableOpacity onPress={onAction}>
          <Text style={styles.sectionAction}>{action}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────

interface EmptyStateProps {
  emoji: string;
  title: string;
  description: string;
  action?: { label: string; onPress: () => void };
}

export function EmptyState({
  emoji,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>{emoji}</Text>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyDesc}>{description}</Text>
      {action && (
        <Button
          title={action.label}
          onPress={action.onPress}
          style={{ marginTop: Spacing.lg }}
        />
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  btnBase: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  btnText: {
    color: "#fff",
    fontWeight: "700",
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.surface3,
  },
  avatarCenter: {
    alignItems: "center",
    justifyContent: "center",
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  pillText: {
    fontSize: FontSize.xs,
    fontWeight: "700",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: "800",
    color: Colors.text,
  },
  sectionAction: {
    fontSize: FontSize.base,
    color: Colors.accent2,
    fontWeight: "700",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing.xxxl,
    paddingHorizontal: Spacing.xxl,
  },
  emptyEmoji: {
    fontSize: 56,
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontSize: FontSize.xl,
    fontWeight: "900",
    color: Colors.text,
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  emptyDesc: {
    fontSize: FontSize.base,
    color: Colors.text2,
    textAlign: "center",
    lineHeight: 22,
  },
});

// ─── AchievementIcon Export ──────────────────────────────────────────────────
export { AchievementIcon } from "./AchievementIcon";
