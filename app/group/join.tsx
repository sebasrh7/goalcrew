import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Modal,
  Platform,
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
  extractInviteCode,
  getErrorMessage,
} from "../../src/constants";
import { formatCurrency } from "../../src/lib/currency";
import { t } from "../../src/lib/i18n";
import { peekGroupByCode } from "../../src/lib/supabase";
import { useGroupsStore } from "../../src/store/groupsStore";
import { useSettingsStore } from "../../src/store/settingsStore";

export default function JoinGroupScreen() {
  const router = useRouter();
  const { code: codeParam } = useLocalSearchParams<{ code?: string }>();
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
  const [showScanner, setShowScanner] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  // Pre-fill code from URL query param (?code=ABC123)
  useEffect(() => {
    if (codeParam) {
      const clean = codeParam
        .replace(/[^A-Za-z0-9]/g, "")
        .toUpperCase()
        .slice(0, 8);
      if (clean.length >= 6) setCode(clean);
    }
  }, [codeParam]);

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

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    const extracted = extractInviteCode(data);
    if (extracted) {
      setCode(extracted);
      setShowScanner(false);
      setScanned(false);
    } else {
      showAlert(t("invalidCode", lang), t("qrInvalidCode", lang), {
        icon: "alert-circle",
        iconColor: Colors.yellow,
      });
      // Allow re-scan after 2 seconds
      setTimeout(() => setScanned(false), 2000);
    }
  };

  const openScanner = async () => {
    if (Platform.OS === "web") {
      showAlert(t("scanQR", lang), t("qrNotAvailableWeb", lang), {
        icon: "information-circle",
        iconColor: Colors.accent,
      });
      return;
    }
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        showAlert(
          t("cameraPermission", lang),
          t("cameraPermissionDesc", lang),
          {
            icon: "camera-outline",
            iconColor: Colors.accent2,
          },
        );
        return;
      }
    }
    setScanned(false);
    setShowScanner(true);
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

        <TouchableOpacity
          style={styles.scanBtn}
          onPress={openScanner}
          activeOpacity={0.7}
        >
          <Ionicons
            name="qr-code-outline"
            size={22}
            color={Colors.accent2}
            style={{ marginRight: Spacing.sm }}
          />
          <Text style={styles.scanBtnText}>{t("scanQR", lang)}</Text>
        </TouchableOpacity>
      </View>

      {/* QR Scanner Modal */}
      <Modal
        visible={showScanner}
        animationType="slide"
        onRequestClose={() => setShowScanner(false)}
      >
        <View style={styles.scannerContainer}>
          <CameraView
            style={StyleSheet.absoluteFill}
            barcodeScannerSettings={{
              barcodeTypes: ["qr"],
            }}
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          />
          {/* Overlay */}
          <View style={styles.scannerOverlay}>
            <View style={styles.scannerHeader}>
              <TouchableOpacity
                onPress={() => setShowScanner(false)}
                style={styles.scannerCloseBtn}
              >
                <Ionicons name="close" size={28} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.scannerTitle}>{t("scanQR", lang)}</Text>
              <View style={{ width: 36 }} />
            </View>

            <View style={styles.scannerFrame}>
              {/* Corner decorations */}
              <View style={[styles.corner, styles.cornerTL]} />
              <View style={[styles.corner, styles.cornerTR]} />
              <View style={[styles.corner, styles.cornerBL]} />
              <View style={[styles.corner, styles.cornerBR]} />
            </View>

            <Text style={styles.scannerHint}>{t("pointCameraAtQR", lang)}</Text>
          </View>
        </View>
      </Modal>

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
  scannerContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  scannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 60,
  },
  scannerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: Spacing.xl,
  },
  scannerCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  scannerTitle: {
    fontSize: FontSize.lg,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  scannerFrame: {
    width: 240,
    height: 240,
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: 40,
    height: 40,
    borderColor: Colors.accent,
    borderWidth: 3,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 12,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 12,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 12,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 12,
  },
  scannerHint: {
    fontSize: FontSize.base,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    fontWeight: "600",
  },
});
