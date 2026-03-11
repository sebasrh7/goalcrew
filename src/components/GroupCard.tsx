import { Ionicons } from "@expo/vector-icons";
import { format, parseISO } from "date-fns";
import { enUS, es, fr } from "date-fns/locale";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { FontSize, GROUP_ICONS, Radius, Spacing } from "../constants";
import { formatCurrency } from "../lib/currency";
import { useColors } from "../lib/useColors";
import { impactAsync } from "../lib/haptics";
import { useTranslation } from "../lib/i18n";
import { useSettingsStore } from "../store/settingsStore";
import { GroupWithStats } from "../types";
import { ProgressBar } from "./UI";

interface GroupCardProps {
  group: GroupWithStats;
  onPress: () => void;
}

export const GroupCard = React.memo(function GroupCard({ group, onPress }: GroupCardProps) {
  const C = useColors();
  const styles = useMemo(() => createStyles(C), [C]);
  const { settings } = useSettingsStore();
  const { t } = useTranslation();

  const handlePress = () => {
    impactAsync("Light");
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
    GROUP_ICONS.find((icon) => icon.name === group.emoji) || GROUP_ICONS[0];

  const safeProgress = isFinite(group.progress_percent) ? group.progress_percent : 0;

  const progressColor =
    safeProgress >= 70
      ? C.green
      : safeProgress >= 40
        ? C.accent
        : C.yellow;

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
      <LinearGradient colors={[C.surface2, C.surface] as any} style={styles.card}>
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
            <Ionicons name="people" size={12} color={C.text2} />
            <Text style={styles.metaText}>{memberCount}</Text>
          </View>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.metaText}>{deadlineFormatted}</Text>
        </View>

        <Text style={[styles.percent, { color: progressColor }]}>
          {safeProgress}%
        </Text>

        <ProgressBar
          progress={safeProgress}
          height={5}
          color={progressColor}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
            {savedAmount} {t("of")} {goalAmount}
          </Text>
          <Text
            style={[
              styles.daysLeft,
              (group.days_remaining ?? 0) < 30 && { color: C.yellow },
            ]}
          >
            {getDaysText(group.days_remaining)}
          </Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
});

const createStyles = (C: any) => StyleSheet.create({
  card: {
    width: 200,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: C.surface3,
  },
  iconContainer: {
    marginBottom: Spacing.sm,
    alignItems: "center",
  },
  name: {
    fontSize: FontSize.lg,
    fontWeight: "800",
    color: C.text,
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
    color: C.text2,
  },
  metaDot: {
    color: C.text3,
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
    color: C.text2,
  },
  daysLeft: {
    fontSize: 10,
    color: C.text3,
    fontWeight: "700",
  },
});
