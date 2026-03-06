import { Ionicons } from "@expo/vector-icons";
import {
    addMonths,
    eachDayOfInterval,
    endOfMonth,
    format,
    getDay,
    isSameDay,
    isToday,
    startOfMonth,
    subMonths,
} from "date-fns";
import { enUS, es, fr } from "date-fns/locale";
import React, { useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { FontSize, Radius, Spacing } from "../constants";
import { formatCurrency } from "../lib/currency";
import { Language, t } from "../lib/i18n";
import { useColors } from "../lib/useColors";
import { Contribution } from "../types";

interface ContributionCalendarProps {
  contributions: Contribution[];
  userId: string;
  currency: string;
  lang: Language;
}

const DAY_LABELS: Record<Language, string[]> = {
  es: ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"],
  en: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
  fr: ["Lu", "Ma", "Me", "Je", "Ve", "Sa", "Di"],
};

export function ContributionCalendar({
  contributions,
  userId,
  currency,
  lang,
}: ContributionCalendarProps) {
  const C = useColors();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const dateLocale = lang === "en" ? enUS : lang === "fr" ? fr : es;

  // Build a map of date -> contributions for fast lookup
  const contribsByDate = useMemo(() => {
    const map: Record<string, Contribution[]> = {};
    contributions.forEach((c) => {
      const key = format(new Date(c.created_at), "yyyy-MM-dd");
      if (!map[key]) map[key] = [];
      map[key].push(c);
    });
    return map;
  }, [contributions]);

  // Build the calendar grid
  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });

    // Monday=0, Sunday=6 (ISO)
    let startDayOfWeek = getDay(start); // Sunday=0
    // Convert to Monday-based: Mon=0..Sun=6
    startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

    return { days, startPadding: startDayOfWeek };
  }, [currentMonth]);

  // Get contributions for selected date
  const selectedContribs = useMemo(() => {
    if (!selectedDate) return [];
    const key = format(selectedDate, "yyyy-MM-dd");
    return contribsByDate[key] || [];
  }, [selectedDate, contribsByDate]);

  const goToPrevMonth = () => setCurrentMonth((prev) => subMonths(prev, 1));
  const goToNextMonth = () => setCurrentMonth((prev) => addMonths(prev, 1));
  const goToToday = () => {
    setCurrentMonth(new Date());
    setSelectedDate(new Date());
  };

  const monthLabel = format(currentMonth, "MMMM yyyy", { locale: dateLocale });

  const styles = useMemo(() => createStyles(C), [C]);

  return (
    <View style={styles.container}>
      {/* Month navigation */}
      <View style={styles.monthNav}>
        <TouchableOpacity onPress={goToPrevMonth} style={styles.navBtn}>
          <Ionicons name="chevron-back" size={20} color={C.text} />
        </TouchableOpacity>
        <TouchableOpacity onPress={goToToday}>
          <Text style={styles.monthLabel}>
            {monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={goToNextMonth} style={styles.navBtn}>
          <Ionicons name="chevron-forward" size={20} color={C.text} />
        </TouchableOpacity>
      </View>

      {/* Day of week headers */}
      <View style={styles.weekRow}>
        {DAY_LABELS[lang].map((d) => (
          <View key={d} style={styles.dayCell}>
            <Text style={styles.dayLabel}>{d}</Text>
          </View>
        ))}
      </View>

      {/* Calendar grid */}
      <View style={styles.grid}>
        {/* Padding for start of month */}
        {Array.from({ length: calendarDays.startPadding }).map((_, i) => (
          <View key={`pad-${i}`} style={styles.dayCell} />
        ))}

        {calendarDays.days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const dayContribs = contribsByDate[key] || [];
          const hasUserContrib = dayContribs.some((c) => c.user_id === userId);
          const hasGroupContrib = dayContribs.length > 0;
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const today = isToday(day);

          return (
            <TouchableOpacity
              key={key}
              onPress={() => setSelectedDate(day)}
              style={[
                styles.dayCell,
                isSelected && styles.dayCellSelected,
                today && !isSelected && styles.dayCellToday,
              ]}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.dayNumber,
                  isSelected && styles.dayNumberSelected,
                  today && !isSelected && styles.dayNumberToday,
                ]}
              >
                {format(day, "d")}
              </Text>
              {/* Dots: green = user, accent = group-only */}
              <View style={styles.dotRow}>
                {hasUserContrib && (
                  <View
                    style={[styles.dot, { backgroundColor: C.green }]}
                  />
                )}
                {hasGroupContrib && !hasUserContrib && (
                  <View
                    style={[styles.dot, { backgroundColor: C.accent2 }]}
                  />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Selected date details */}
      {selectedDate && (
        <View style={styles.detailSection}>
          <Text style={styles.detailDate}>
            {isToday(selectedDate)
              ? t("calendarToday", lang)
              : format(selectedDate, "d MMMM", { locale: dateLocale })}
          </Text>
          {selectedContribs.length === 0 ? (
            <Text style={styles.detailEmpty}>
              {t("calendarNoContribs", lang)}
            </Text>
          ) : (
            selectedContribs.map((c) => (
              <View key={c.id} style={styles.detailItem}>
                <View
                  style={[
                    styles.detailDot,
                    {
                      backgroundColor:
                        c.user_id === userId ? C.green : C.accent2,
                    },
                  ]}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.detailName}>
                    <Text style={{ fontWeight: "800" }}>
                      {c.user?.name ?? t("someone", lang)}
                    </Text>
                    {` — ${formatCurrency(c.amount, currency)}`}
                  </Text>
                  {c.note && <Text style={styles.detailNote}>"{c.note}"</Text>}
                </View>
                <Text style={styles.detailTime}>
                  {format(new Date(c.created_at), "HH:mm")}
                </Text>
              </View>
            ))
          )}
        </View>
      )}
    </View>
  );
}

const createStyles = (C: any) => StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  monthNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  navBtn: {
    padding: Spacing.xs,
  },
  monthLabel: {
    fontSize: FontSize.lg,
    fontWeight: "800",
    color: C.text,
    textTransform: "capitalize",
  },
  weekRow: {
    flexDirection: "row",
  },
  dayLabel: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: C.text3,
    textAlign: "center",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 2,
  },
  dayCellSelected: {
    backgroundColor: C.accent,
    borderRadius: Radius.sm,
  },
  dayCellToday: {
    borderWidth: 1,
    borderColor: C.accent2,
    borderRadius: Radius.sm,
  },
  dayNumber: {
    fontSize: FontSize.sm,
    color: C.text,
    fontWeight: "600",
  },
  dayNumberSelected: {
    color: "#fff",
    fontWeight: "900",
  },
  dayNumberToday: {
    color: C.accent2,
    fontWeight: "900",
  },
  dotRow: {
    flexDirection: "row",
    gap: 2,
    height: 6,
    marginTop: 1,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  detailSection: {
    borderTopWidth: 1,
    borderTopColor: C.surface3,
    paddingTop: Spacing.md,
    gap: Spacing.sm,
  },
  detailDate: {
    fontSize: FontSize.base,
    fontWeight: "800",
    color: C.text,
  },
  detailEmpty: {
    fontSize: FontSize.sm,
    color: C.text3,
    textAlign: "center",
    paddingVertical: Spacing.md,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  detailDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 5,
  },
  detailName: {
    fontSize: FontSize.sm,
    color: C.text,
  },
  detailNote: {
    fontSize: FontSize.xs,
    color: C.text2,
    fontStyle: "italic",
    marginTop: 1,
  },
  detailTime: {
    fontSize: FontSize.xs,
    color: C.text3,
    marginTop: 4,
  },
});
