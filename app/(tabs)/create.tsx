import { Ionicons } from "@expo/vector-icons";
import {
  addDays,
  addMonths,
  differenceInDays,
  format,
  getDay,
  getDaysInMonth,
  isAfter,
  isBefore,
  isSameDay,
  startOfMonth,
  subMonths,
} from "date-fns";
import { enUS, es as esLocale, fr } from "date-fns/locale";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AlertModal } from "../../src/components/AlertModal";
import { Button, Card } from "../../src/components/UI";
import {
  Colors,
  FontSize,
  Radius,
  Spacing,
  TRIP_ICONS,
  getErrorMessage,
} from "../../src/constants";
import {
  CURRENCIES,
  formatCurrency,
  getPlaceholderAmount,
} from "../../src/lib/currency";
import { getFrequencyLabel, t } from "../../src/lib/i18n";
import { useGroupsStore } from "../../src/store/groupsStore";
import { useSettingsStore } from "../../src/store/settingsStore";
import { CreateGroupInput, DivisionType, FrequencyType } from "../../src/types";

export default function CreateScreen() {
  const router = useRouter();
  const { createGroup, isLoading } = useGroupsStore();
  const { settings } = useSettingsStore();
  const lang = settings.language || "es";

  const [name, setName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState(TRIP_ICONS[0]);
  const [goalAmount, setGoalAmount] = useState("");
  const [deadlineDate, setDeadlineDate] = useState(() =>
    addDays(new Date(), 90),
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() =>
    addDays(new Date(), 90),
  );
  const [frequency, setFrequency] = useState<FrequencyType>("weekly");
  const [customDays, setCustomDays] = useState("7");
  const [divisionType, setDivisionType] = useState<DivisionType>("equal");

  // Alert modal state
  const [alertModal, setAlertModal] = useState<{
    visible: boolean;
    title: string;
    message?: string;
    icon?: string;
    iconColor?: string;
  }>({ visible: false, title: "" });

  const showAlert = (
    title: string,
    message?: string,
    options?: { icon?: string; iconColor?: string },
  ) => {
    setAlertModal({
      visible: true,
      title,
      message,
      icon: options?.icon,
      iconColor: options?.iconColor,
    });
  };

  const dismissAlert = () =>
    setAlertModal((prev) => ({ ...prev, visible: false }));

  const currencySymbol = CURRENCIES[settings.currency]?.symbol || "$";

  const deadline = format(deadlineDate, "yyyy-MM-dd");
  const dateLocale = lang === "en" ? enUS : lang === "fr" ? fr : esLocale;
  const deadlineFormatted = format(
    deadlineDate,
    lang === "es" ? "d 'de' MMM, yyyy" : "d MMM, yyyy",
    { locale: dateLocale },
  );

  const minDate = addDays(new Date(), 7);
  const maxDate = addDays(new Date(), 365 * 3);

  const openCalendar = useCallback(() => {
    setCalendarMonth(deadlineDate);
    setShowDatePicker(true);
  }, [deadlineDate]);

  const selectDate = useCallback((day: Date) => {
    setDeadlineDate(day);
    setShowDatePicker(false);
  }, []);

  const calendarDays = useMemo(() => {
    const first = startOfMonth(calendarMonth);
    const startDow = getDay(first); // 0=Sun
    const daysInMonth = getDaysInMonth(calendarMonth);
    const days: (Date | null)[] = [];
    for (let i = 0; i < startDow; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(
        new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), d),
      );
    }
    return days;
  }, [calendarMonth]);

  const weekDayLabels =
    lang === "en"
      ? ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
      : lang === "fr"
        ? ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"]
        : ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  // Auto-calculate savings needed
  const calc = useMemo(() => {
    const amount = parseFloat(goalAmount) || 0;
    const days = Math.max(1, differenceInDays(new Date(deadline), new Date()));
    const freqDays =
      frequency === "daily"
        ? 1
        : frequency === "weekly"
          ? 7
          : frequency === "biweekly"
            ? 14
            : frequency === "monthly"
              ? 30
              : Math.max(1, parseInt(customDays) || 7); // custom
    const periods = frequency === "daily" ? days : Math.ceil(days / freqDays);
    const perPeriod = periods > 0 ? amount / periods : 0;

    return { days, periods, perPeriod };
  }, [goalAmount, deadline, frequency, customDays]);

  const handleCreate = async () => {
    if (!name.trim()) {
      showAlert(t("nameRequired", lang), t("giveGoalName", lang), {
        icon: "alert-circle",
        iconColor: Colors.yellow,
      });
      return;
    }
    if (!goalAmount || parseFloat(goalAmount) <= 0) {
      showAlert(t("invalidAmount", lang), t("enterGoalGreaterZero", lang), {
        icon: "alert-circle",
        iconColor: Colors.yellow,
      });
      return;
    }
    if (calc.days < 7) {
      showAlert(t("dateTooClose", lang), t("dateTooCloseMsg", lang), {
        icon: "calendar",
        iconColor: Colors.yellow,
      });
      return;
    }

    try {
      const input: CreateGroupInput = {
        name: name.trim(),
        emoji: selectedIcon.name,
        deadline,
        goal_amount: parseFloat(goalAmount),
        frequency,
        division_type: divisionType,
        ...(frequency === "custom"
          ? { custom_frequency_days: Math.max(1, parseInt(customDays) || 7) }
          : {}),
      };
      const group = await createGroup(input);
      router.replace(`/group/${group.id}`);
    } catch (error: unknown) {
      showAlert(
        t("error", lang),
        getErrorMessage(error) ?? t("couldNotCreateGoal", lang),
        { icon: "alert-circle", iconColor: Colors.red },
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push("/(tabs)")}>
            <Text style={styles.backBtn}>← {t("home", lang)}</Text>
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Ionicons
              name="airplane"
              size={28}
              color={Colors.accent2}
              style={{ marginRight: 8 }}
            />
            <Text style={styles.title}>{t("newGoalCard", lang)}</Text>
          </View>
          <Text style={styles.subtitle}>{t("setupGroupTrip", lang)}</Text>
        </View>

        <View style={styles.form}>
          {/* Trip name */}
          <View style={styles.field}>
            <Text style={styles.label}>{t("whereAreYouGoing", lang)}</Text>
            <TextInput
              style={styles.input}
              placeholder={t("goalNamePlaceholder", lang)}
              placeholderTextColor={Colors.text3}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              maxLength={50}
            />
          </View>

          {/* Icon picker */}
          <View style={styles.field}>
            <Text style={styles.label}>{t("tripIcon", lang)}</Text>
            <View style={styles.emojiGrid}>
              {TRIP_ICONS.map((icon) => (
                <TouchableOpacity
                  key={icon.name}
                  onPress={() => setSelectedIcon(icon)}
                  style={[
                    styles.emojiBtn,
                    icon.name === selectedIcon.name && styles.emojiBtnActive,
                  ]}
                >
                  <Ionicons
                    name={icon.name as any}
                    size={24}
                    color={icon.color}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Goal + Deadline row */}
          <View style={styles.row}>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>{t("goalPerPerson", lang)}</Text>
              <View style={styles.amountWrap}>
                <Text style={styles.currencySymbol}>{currencySymbol}</Text>
                <TextInput
                  style={styles.amountInput}
                  placeholder={getPlaceholderAmount(settings.currency)}
                  placeholderTextColor={Colors.text3}
                  value={goalAmount}
                  onChangeText={setGoalAmount}
                  keyboardType="numeric"
                  maxLength={10}
                />
              </View>
            </View>

            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>{t("deadlineDate", lang)}</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={openCalendar}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="calendar-outline"
                  size={16}
                  color={Colors.accent2}
                />
                <Text style={styles.dateButtonText}>{deadlineFormatted}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Frequency */}
          <View style={styles.field}>
            <Text style={styles.label}>{t("frequency", lang)}</Text>
            <View style={styles.freqGrid}>
              {(
                [
                  "daily",
                  "weekly",
                  "biweekly",
                  "monthly",
                  "custom",
                ] as FrequencyType[]
              ).map((f) => (
                <TouchableOpacity
                  key={f}
                  onPress={() => setFrequency(f)}
                  style={[
                    styles.freqChip,
                    frequency === f && styles.freqChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.freqChipText,
                      frequency === f && styles.freqChipTextActive,
                    ]}
                  >
                    {getFrequencyLabel(f, lang)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {frequency === "custom" && (
              <View style={styles.customDaysRow}>
                <Text style={styles.customDaysLabel}>
                  {t("customDaysLabel", lang)}
                </Text>
                <TextInput
                  style={styles.customDaysInput}
                  placeholder={t("customDaysPlaceholder", lang)}
                  placeholderTextColor={Colors.text3}
                  value={customDays}
                  onChangeText={setCustomDays}
                  keyboardType="numeric"
                  maxLength={3}
                />
                <Text style={styles.customDaysSuffix}>{t("days", lang)}</Text>
              </View>
            )}
          </View>

          {/* Auto-calculated results */}
          <Card style={styles.calcCard}>
            <LinearGradient
              colors={["rgba(108,99,255,0.15)", "rgba(108,99,255,0.05)"]}
              style={StyleSheet.absoluteFill}
            />
            <Text style={styles.calcTitle}>{t("autoCalculated", lang)}</Text>
            <View style={styles.calcRow}>
              <CalcItem
                label={`${t("savePerFrequency", lang)} ${getFrequencyLabel(frequency, lang, parseInt(customDays)).toLowerCase()}`}
                value={formatCurrency(calc.perPeriod, settings.currency)}
                highlight
              />
              <CalcItem
                label={t("periods", lang)}
                value={String(calc.periods)}
              />
              <CalcItem
                label={t("daysRemaining", lang)}
                value={String(calc.days)}
              />
            </View>
          </Card>

          {/* Division type */}
          <View style={styles.field}>
            <Text style={styles.label}>{t("divisionType", lang)}</Text>
            <View style={styles.tabBar}>
              {(
                [
                  { value: "equal", label: t("equalForAll", lang) },
                  { value: "custom", label: t("customDivision", lang) },
                ] as { value: DivisionType; label: string }[]
              ).map((d) => (
                <TouchableOpacity
                  key={d.value}
                  onPress={() => setDivisionType(d.value)}
                  style={[
                    styles.tab,
                    divisionType === d.value && styles.tabActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.tabText,
                      divisionType === d.value && styles.tabTextActive,
                    ]}
                  >
                    {d.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.divisionHint}>
              {divisionType === "equal"
                ? t("equalDescription", lang)
                : t("customDescription", lang)}
            </Text>
          </View>

          {/* Summary */}
          <Card style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>{t("goalSummary", lang)}</Text>
            <SummaryRow
              icon="airplane"
              label={t("destination", lang)}
              value={name || "—"}
            />
            <SummaryRow
              icon={selectedIcon.name}
              iconColor={selectedIcon.color}
              label={t("goalPerPersonLabel", lang)}
              value={formatCurrency(
                parseFloat(goalAmount || "0"),
                settings.currency,
              )}
            />
            <SummaryRow
              icon="calendar"
              label={t("deadlineDate", lang)}
              value={deadlineFormatted}
            />
            <SummaryRow
              icon="sync"
              label={t("frequency", lang)}
              value={getFrequencyLabel(
                frequency,
                lang,
                frequency === "custom" ? parseInt(customDays) : undefined,
              )}
            />
            <SummaryRow
              icon="cash"
              label={`${t("savePerFrequency", lang)}/${getFrequencyLabel(frequency, lang, parseInt(customDays)).toLowerCase()}`}
              value={formatCurrency(calc.perPeriod, settings.currency)}
              highlight
            />
          </Card>

          <Button
            title={t("createGroupGoal", lang)}
            onPress={handleCreate}
            isLoading={isLoading}
            style={{ marginTop: Spacing.sm, marginBottom: Spacing.xxl }}
          />
        </View>
      </ScrollView>

      {/* Calendar Modal */}
      <Modal
        visible={showDatePicker}
        animationType="slide"
        transparent
        onRequestClose={() => setShowDatePicker(false)}
      >
        <TouchableOpacity
          style={styles.calendarOverlay}
          activeOpacity={1}
          onPress={() => setShowDatePicker(false)}
        >
          <View
            style={styles.calendarSheet}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.calendarHandle} />
            {/* Month navigation */}
            <View style={styles.calendarNav}>
              <TouchableOpacity
                onPress={() => setCalendarMonth(subMonths(calendarMonth, 1))}
                disabled={isBefore(
                  subMonths(calendarMonth, 1),
                  startOfMonth(minDate),
                )}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="chevron-back" size={24} color={Colors.text} />
              </TouchableOpacity>
              <Text style={styles.calendarMonthLabel}>
                {format(calendarMonth, "MMMM yyyy", { locale: dateLocale })}
              </Text>
              <TouchableOpacity
                onPress={() => setCalendarMonth(addMonths(calendarMonth, 1))}
                disabled={isAfter(
                  addMonths(calendarMonth, 1),
                  startOfMonth(maxDate),
                )}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name="chevron-forward"
                  size={24}
                  color={Colors.text}
                />
              </TouchableOpacity>
            </View>

            {/* Weekday headers */}
            <View style={styles.calendarRow}>
              {weekDayLabels.map((d) => (
                <Text key={d} style={styles.calendarWeekDay}>
                  {d}
                </Text>
              ))}
            </View>

            {/* Day grid */}
            <View style={styles.calendarGrid}>
              {calendarDays.map((day, i) => {
                if (!day)
                  return (
                    <View key={`empty-${i}`} style={styles.calendarDayCell} />
                  );
                const disabled =
                  isBefore(day, minDate) || isAfter(day, maxDate);
                const selected = isSameDay(day, deadlineDate);
                return (
                  <TouchableOpacity
                    key={day.toISOString()}
                    style={[
                      styles.calendarDayCell,
                      selected && styles.calendarDaySelected,
                    ]}
                    onPress={() => !disabled && selectDate(day)}
                    disabled={disabled}
                  >
                    <Text
                      style={[
                        styles.calendarDayText,
                        disabled && { color: Colors.text3, opacity: 0.4 },
                        selected && styles.calendarDayTextSelected,
                      ]}
                    >
                      {day.getDate()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      <AlertModal
        visible={alertModal.visible}
        title={alertModal.title}
        message={alertModal.message}
        icon={alertModal.icon as keyof typeof Ionicons.glyphMap}
        iconColor={alertModal.iconColor}
        onDismiss={dismissAlert}
        buttons={[{ text: "OK", onPress: dismissAlert }]}
      />
    </SafeAreaView>
  );
}

function CalcItem({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View style={{ alignItems: "center", flex: 1 }}>
      <Text style={[styles.calcValue, highlight && { color: Colors.accent2 }]}>
        {value}
      </Text>
      <Text style={styles.calcLabel}>{label}</Text>
    </View>
  );
}

function SummaryRow({
  icon,
  iconColor,
  label,
  value,
  highlight,
}: {
  icon: string;
  iconColor?: string;
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <View style={styles.summaryRow}>
      <Ionicons
        name={icon as any}
        size={16}
        color={iconColor || Colors.text2}
        style={styles.summaryIcon}
      />
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={[styles.summaryValue, highlight && { color: Colors.green }]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { padding: Spacing.xl, paddingBottom: 0 },
  backBtn: {
    color: Colors.accent2,
    fontWeight: "700",
    fontSize: FontSize.base,
    marginBottom: Spacing.lg,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: FontSize.xxxl,
    fontWeight: "900",
    color: Colors.text,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: { fontSize: FontSize.base, color: Colors.text2 },
  form: { padding: Spacing.xl, gap: Spacing.lg },
  field: { gap: Spacing.sm },
  label: { fontSize: FontSize.sm, fontWeight: "700", color: Colors.text2 },
  input: {
    backgroundColor: Colors.surface2,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.surface3,
    paddingHorizontal: Spacing.md,
    paddingVertical: 13,
    fontSize: FontSize.md,
    color: Colors.text,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.surface2,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.surface3,
    paddingHorizontal: Spacing.md,
    paddingVertical: 13,
  },
  dateButtonText: {
    fontSize: FontSize.sm,
    fontWeight: "700",
    color: Colors.text,
  },
  row: { flexDirection: "row", gap: Spacing.md },
  amountWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface2,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.surface3,
    paddingHorizontal: Spacing.md,
  },
  currencySymbol: {
    fontSize: FontSize.xl,
    fontWeight: "900",
    color: Colors.text2,
    marginRight: 4,
  },
  amountInput: {
    flex: 1,
    paddingVertical: 13,
    fontSize: FontSize.xl,
    fontWeight: "900",
    color: Colors.text,
  },
  emojiGrid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  emojiBtn: {
    width: 48,
    height: 48,
    backgroundColor: Colors.surface2,
    borderRadius: Radius.md,
    borderWidth: 2,
    borderColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  emojiBtnActive: { borderColor: Colors.accent },
  tabBar: {
    flexDirection: "row",
    backgroundColor: Colors.surface2,
    borderRadius: Radius.md,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 9,
    alignItems: "center",
    borderRadius: Radius.sm,
  },
  tabActive: { backgroundColor: Colors.surface },
  tabText: { fontSize: FontSize.sm, fontWeight: "700", color: Colors.text2 },
  tabTextActive: { color: Colors.text },
  freqGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  freqChip: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    backgroundColor: Colors.surface2,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  freqChipActive: {
    backgroundColor: Colors.surface,
    borderColor: Colors.accent,
  },
  freqChipText: {
    fontSize: FontSize.sm,
    fontWeight: "700",
    color: Colors.text2,
  },
  freqChipTextActive: { color: Colors.accent },
  customDaysRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  customDaysLabel: {
    fontSize: FontSize.sm,
    fontWeight: "600",
    color: Colors.text2,
  },
  customDaysInput: {
    backgroundColor: Colors.surface2,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.accent,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    fontSize: FontSize.md,
    fontWeight: "800",
    color: Colors.text,
    width: 70,
    textAlign: "center",
  },
  customDaysSuffix: {
    fontSize: FontSize.sm,
    fontWeight: "600",
    color: Colors.text2,
  },
  divisionHint: {
    fontSize: FontSize.xs,
    color: Colors.text3,
    marginTop: Spacing.sm,
    lineHeight: 16,
  },
  calcCard: { overflow: "hidden", borderColor: "rgba(108,99,255,0.3)" },
  calcTitle: {
    fontSize: FontSize.sm,
    fontWeight: "700",
    color: Colors.accent2,
    marginBottom: Spacing.md,
  },
  calcRow: { flexDirection: "row" },
  calcValue: { fontSize: FontSize.xl, fontWeight: "900", color: Colors.text },
  calcLabel: {
    fontSize: FontSize.xs,
    color: Colors.text2,
    textAlign: "center",
    marginTop: 2,
  },
  summaryCard: { gap: Spacing.sm },
  summaryTitle: {
    fontSize: FontSize.base,
    fontWeight: "800",
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  summaryRow: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  summaryIcon: { width: 24, alignItems: "center" },
  summaryLabel: { flex: 1, fontSize: FontSize.base, color: Colors.text2 },
  summaryValue: {
    fontSize: FontSize.base,
    fontWeight: "800",
    color: Colors.text,
  },
  // Calendar modal styles
  calendarOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "flex-end",
  },
  calendarSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    padding: Spacing.xl,
    paddingBottom: 40,
  },
  calendarHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.surface3,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: Spacing.md,
  },
  calendarNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  calendarMonthLabel: {
    fontSize: FontSize.lg,
    fontWeight: "800",
    color: Colors.text,
    textTransform: "capitalize",
  },
  calendarRow: {
    flexDirection: "row",
    marginBottom: Spacing.sm,
  },
  calendarWeekDay: {
    flex: 1,
    textAlign: "center",
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.text3,
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  calendarDayCell: {
    width: "14.28%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  calendarDayText: {
    fontSize: FontSize.base,
    fontWeight: "600",
    color: Colors.text,
  },
  calendarDaySelected: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.full,
  },
  calendarDayTextSelected: {
    color: "#FFFFFF",
    fontWeight: "900",
  },
});
