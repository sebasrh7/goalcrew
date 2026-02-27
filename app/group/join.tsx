import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AlertModal } from "../../src/components/AlertModal";
import { Button } from "../../src/components/UI";
import {
  Colors,
  FontSize,
  Radius,
  Spacing,
  getErrorMessage,
} from "../../src/constants";
import { formatCurrency } from "../../src/lib/currency";
import { t } from "../../src/lib/i18n";
import { peekGroupByCode } from "../../src/lib/supabase";
import { useGroupsStore } from "../../src/store/groupsStore";
import { useSettingsStore } from "../../src/store/settingsStore";

export default function JoinGroupScreen() {
  const router = useRouter();
  const { joinGroup, isLoading } = useGroupsStore();
  const { settings } = useSettingsStore();
  const lang = settings.language;
  const [code, setCode] = useState("");
  const [customGoalStep, setCustomGoalStep] = useState(false);
  const [customGoalAmount, setCustomGoalAmount] = useState("");
  const [groupInfo, setGroupInfo] = useState<{
    name: string;
    goal_amount: number;
  } | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  // Alert modal state
  const [alertModal, setAlertModal] = useState<{
    visible: boolean;
    title: string;
    message?: string;
    icon?: string;
    iconColor?: string;
    buttons?: {
      text: string;
      onPress: () => void;
      style?: "default" | "cancel" | "destructive";
    }[];
  }>({ visible: false, title: "" });

  const showAlert = (
    title: string,
    message?: string,
    options?: {
      icon?: string;
      iconColor?: string;
      buttons?: {
        text: string;
        onPress: () => void;
        style?: "default" | "cancel" | "destructive";
      }[];
    },
  ) => {
    setAlertModal({
      visible: true,
      title,
      message,
      icon: options?.icon,
      iconColor: options?.iconColor,
      buttons: options?.buttons,
    });
  };

  const dismissAlert = () =>
    setAlertModal((prev) => ({ ...prev, visible: false }));

  const handleJoin = async () => {
    const trimmed = code.trim().toUpperCase();
    if (trimmed.length < 6) {
      showAlert(t("invalidCode", lang), t("enterFullCode", lang), {
        icon: "alert-circle",
        iconColor: Colors.yellow,
      });
      return;
    }

    // First check if the group uses custom division
    if (!customGoalStep) {
      setIsChecking(true);
      try {
        const group = await peekGroupByCode(trimmed);

        if (group.division_type === "custom") {
          setGroupInfo({ name: group.name, goal_amount: group.goal_amount });
          setCustomGoalAmount(String(group.goal_amount));
          setCustomGoalStep(true);
          setIsChecking(false);
          return;
        }
      } catch {
        showAlert(t("error", lang), t("invalidCode", lang), {
          icon: "alert-circle",
          iconColor: Colors.red,
        });
        setIsChecking(false);
        return;
      }
      setIsChecking(false);
    }

    try {
      const individualGoal = customGoalStep
        ? parseFloat(customGoalAmount) || undefined
        : undefined;
      await joinGroup(trimmed, individualGoal);
      showAlert(t("welcome", lang), t("joinedGroup", lang), {
        icon: "checkmark-circle",
        iconColor: Colors.accent,
        buttons: [
          {
            text: t("letsGo", lang),
            onPress: () => {
              dismissAlert();
              router.replace("/(tabs)");
            },
          },
        ],
      });
    } catch (error: unknown) {
      const errorMsg = getErrorMessage(error);
      const msg =
        errorMsg === "INVALID_INVITE_CODE"
          ? t("invalidInviteCode", lang)
          : errorMsg === "ALREADY_MEMBER"
            ? t("alreadyMember", lang)
            : (errorMsg ?? t("couldNotJoin", lang));
      showAlert(t("error", lang), msg, {
        icon: "alert-circle",
        iconColor: Colors.red,
      });
    }
  };

  const formatCode = (text: string) => {
    const clean = text
      .replace(/[^A-Za-z0-9]/g, "")
      .toUpperCase()
      .slice(0, 8);
    setCode(clean);
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#1a1555", Colors.bg]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.content}>
        <TouchableOpacity
          onPress={() => router.push("/(tabs)")}
          style={styles.backBtn}
        >
          <Text style={styles.backText}>{t("backToHome", lang)}</Text>
        </TouchableOpacity>

        <View style={styles.iconContainer}>
          <Ionicons name="link" size={48} color={Colors.accent2} />
        </View>
        <Text style={styles.title}>{t("joinGroup", lang)}</Text>
        <Text style={styles.subtitle}>{t("askForCode", lang)}</Text>

        <View style={styles.inputCard}>
          <Text style={styles.label}>{t("inviteCode", lang)}</Text>
          <TextInput
            style={styles.codeInput}
            placeholder="CANC25XK"
            placeholderTextColor={Colors.text3}
            value={code}
            onChangeText={formatCode}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={8}
            textAlign="center"
          />
          <Text style={styles.codeHint}>
            {code.length}/8 {t("characters", lang)}
          </Text>
        </View>

        {/* Custom goal step - shown when group uses custom division */}
        {customGoalStep && groupInfo && (
          <View style={styles.inputCard}>
            <Text style={styles.label}>{t("customGoalJoinTitle", lang)}</Text>
            <Text style={[styles.codeHint, { marginBottom: 8 }]}>
              {t("customGoalJoinDesc", lang)
                .replace("{group}", groupInfo.name)
                .replace(
                  "{amount}",
                  formatCurrency(groupInfo.goal_amount, settings.currency),
                )}
            </Text>
            <TextInput
              style={styles.codeInput}
              placeholder={String(groupInfo.goal_amount)}
              placeholderTextColor={Colors.text3}
              value={customGoalAmount}
              onChangeText={setCustomGoalAmount}
              keyboardType="numeric"
              textAlign="center"
            />
          </View>
        )}

        <Button
          title={
            customGoalStep ? t("joinWithMyGoal", lang) : t("joinMyGroup", lang)
          }
          onPress={handleJoin}
          isLoading={isLoading || isChecking}
          disabled={code.length < 6}
        />

        <Text style={styles.or}>{t("or", lang)}</Text>

        <TouchableOpacity style={styles.scanBtn}>
          <Text style={styles.scanBtnText}>{t("scanQR", lang)}</Text>
          <Text style={styles.scanBtnSub}>{t("comingSoon", lang)}</Text>
        </TouchableOpacity>
      </View>

      <AlertModal
        visible={alertModal.visible}
        title={alertModal.title}
        message={alertModal.message}
        icon={alertModal.icon as keyof typeof Ionicons.glyphMap}
        iconColor={alertModal.iconColor}
        onDismiss={dismissAlert}
        buttons={
          alertModal.buttons ?? [{ text: t("ok", lang), onPress: dismissAlert }]
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { flex: 1, padding: Spacing.xl, paddingTop: Spacing.lg },
  backBtn: { marginBottom: Spacing.xxl },
  backText: {
    color: Colors.accent2,
    fontWeight: "700",
    fontSize: FontSize.base,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSize.xxxl,
    fontWeight: "900",
    color: Colors.text,
    textAlign: "center",
    marginBottom: Spacing.sm,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: FontSize.base,
    color: Colors.text2,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: Spacing.xxl,
  },
  inputCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.surface3,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: "700",
    color: Colors.text2,
    textAlign: "center",
  },
  codeInput: {
    backgroundColor: Colors.surface2,
    borderRadius: Radius.md,
    borderWidth: 2,
    borderColor: Colors.accent,
    paddingVertical: 14,
    fontSize: FontSize.xxl,
    fontWeight: "900",
    color: Colors.text,
    letterSpacing: 4,
  },
  codeHint: { fontSize: FontSize.xs, color: Colors.text3, textAlign: "center" },
  or: {
    textAlign: "center",
    color: Colors.text3,
    fontSize: FontSize.base,
    marginVertical: Spacing.lg,
  },
  scanBtn: {
    backgroundColor: Colors.surface2,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.surface3,
    flexDirection: "row",
    justifyContent: "center",
  },
  scanBtnText: {
    fontSize: FontSize.base,
    fontWeight: "700",
    color: Colors.text,
  },
  scanBtnSub: { fontSize: FontSize.xs, color: Colors.text3, marginTop: 4 },
});
