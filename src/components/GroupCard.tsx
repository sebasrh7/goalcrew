import { Ionicons } from "@expo/vector-icons";
import { format, parseISO } from "date-fns";
import { enUS, es, fr } from "date-fns/locale";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors, FontSize, Radius, Spacing, TRIP_ICONS } from "../constants";
import { formatCurrency } from "../lib/currency";
import { useTranslation } from "../lib/i18n";
import { useSettingsStore } from "../store/settingsStore";
import { GroupWithStats } from "../types";
import { ProgressBar } from "./UI";

interface GroupCardProps {
  group: GroupWithStats;
  onPress: () => void;
}

export function GroupCard({ group, onPress }: GroupCardProps) {
  const { settings } = useSettingsStore();
  const { t } = useTranslation();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  // Get appropriate locale for date formatting
  const getDateLocale = () => {
    switch (settings?.language) {
      case "en":
        return enUS;
      case "fr":
        return fr;
      default:
        return es;
    }
  };

  const deadlineFormatted = format(parseISO(group.deadline), "d MMM", {
    locale: getDateLocale(),
  });

  const memberCount = group.members?.length ?? 0;

  // Find the icon configuration
  const groupIcon =
    TRIP_ICONS.find((icon) => icon.name === group.emoji) || TRIP_ICONS[0];

  const progressColor =
    group.progress_percent >= 70
      ? Colors.green
      : group.progress_percent >= 40
        ? Colors.accent
        : Colors.yellow;

  // Format currency based on user settings
  const userCurrency = settings?.currency || "USD";
  const savedAmount = formatCurrency(group.total_saved, userCurrency);
  const goalAmount = formatCurrency(group.total_goal, userCurrency);

  // Get days text in user's language
  const getDaysText = (days: number) => {
    if (settings?.language === "en") return `${days}d`;
    if (settings?.language === "fr") return `${days}j`;
    return `${days}d`;
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.85}>
      <LinearGradient colors={["#1c2338", "#141929"]} style={styles.card}>
        <View style={styles.iconContainer}>
          <Ionicons
            name={groupIcon.name as any}
            size={24}
            color={groupIcon.color}
          />
        </View>
        <Text style={styles.name} numberOfLines={1}>
          {group.name}
        </Text>

        <View style={styles.meta}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Ionicons name="people" size={12} color={Colors.text2} />
            <Text style={styles.metaText}>{memberCount}</Text>
          </View>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.metaText}>{deadlineFormatted}</Text>
        </View>

        <Text style={[styles.percent, { color: progressColor }]}>
          {group.progress_percent}%
        </Text>

        <ProgressBar
          progress={group.progress_percent}
          height={5}
          color={progressColor}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {savedAmount} {t("of")} {goalAmount}
          </Text>
          <Text
            style={[
              styles.daysLeft,
              group.days_remaining < 30 && { color: Colors.yellow },
            ]}
          >
            {getDaysText(group.days_remaining)}
          </Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 200,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.surface3,
  },
  iconContainer: {
    marginBottom: Spacing.sm,
    alignItems: "center",
  },
  name: {
    fontSize: FontSize.lg,
    fontWeight: "800",
    color: Colors.text,
    marginBottom: 4,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: Spacing.md,
  },
  metaText: {
    fontSize: FontSize.xs,
    color: Colors.text2,
  },
  metaDot: {
    color: Colors.text3,
    fontSize: FontSize.xs,
  },
  percent: {
    fontSize: FontSize.xxl,
    fontWeight: "900",
    marginBottom: Spacing.sm,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: Spacing.sm,
  },
  footerText: {
    fontSize: 10,
    color: Colors.text2,
  },
  daysLeft: {
    fontSize: 10,
    color: Colors.text3,
    fontWeight: "700",
  },
});
