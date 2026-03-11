import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AlertModal, SelectModal } from "../src/components/AlertModal";
import { FontSize, Radius, Spacing } from "../src/constants";
import { useColors } from "../src/lib/useColors";
import { CURRENCIES } from "../src/lib/currency";
import { t } from "../src/lib/i18n";
import {
    onNotificationSettingChanged,
    registerForPushNotificationsAsync,
    scheduleNotification,
} from "../src/lib/notifications";
import { useAuthStore } from "../src/store/authStore";
import { useSettingsStore } from "../src/store/settingsStore";

export default function SettingsScreen() {
  const router = useRouter();
  const C = useColors();
  const styles = useMemo(() => createStyles(C), [C]);
  const { user, signOut, updateProfile, deleteAccount } = useAuthStore();
  const { settings, isLoading, loadSettings, updateSettings } =
    useSettingsStore();

  const [isSaving, setIsSaving] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [editName, setEditName] = useState(user?.name || "");
  const [isDeleting, setIsDeleting] = useState(false);

  // Alert modal state
  const [alertModal, setAlertModal] = useState<{
    visible: boolean;
    title: string;
    message?: string;
    icon?: string;
    iconColor?: string;
    buttons?: {
      text: string;
      style?: "default" | "cancel" | "destructive";
      onPress?: () => void;
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
        style?: "default" | "cancel" | "destructive";
        onPress?: () => void;
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

  useEffect(() => {
    loadSettings();

    // Register for push if enabled
    if (settings.push_notifications) {
      registerForPushNotificationsAsync().catch(() => {});
    }
  }, []);

  const translate = (key: string) => t(key, settings.language);

  const handleBack = () => {
    router.back();
  };

  const handlePersonalInfo = () => {
    setEditName(user?.name || "");
    setShowProfileModal(true);
  };

  const handleSaveProfile = async () => {
    const trimmedName = editName.trim();
    if (!trimmedName) {
      showAlert(translate("error"), translate("nameRequiredProfile"), {
        icon: "alert-circle",
        iconColor: C.red,
      });
      return;
    }
    try {
      setIsSaving(true);
      await updateProfile({ name: trimmedName });
      setShowProfileModal(false);
      showAlert(translate("success"), translate("profileUpdated"), {
        icon: "checkmark-circle",
        iconColor: C.green,
      });
    } catch (error: unknown) {
      showAlert(translate("error"), translate("profileUpdateError"), {
        icon: "alert-circle",
        iconColor: C.red,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLanguageChange = () => {
    setShowLanguageModal(true);
  };

  const handleLanguageSelect = (value: string) => {
    setShowLanguageModal(false);
    handleSettingUpdate("language", value);
  };

  const languageOptions = [
    { label: "Español", value: "es" },
    { label: "English", value: "en" },
    { label: "Français", value: "fr" },
  ];

  const handleCurrencyChange = () => {
    setShowCurrencyModal(true);
  };

  const handleCurrencySelect = (code: string) => {
    setShowCurrencyModal(false);
    handleSettingUpdate("currency", code);
  };

  const CURRENCY_CODES = Object.keys(CURRENCIES) as string[];

  const handleSettingUpdate = async (
    key: string,
    value: string | boolean | number,
  ) => {
    setIsSaving(true);
    try {
      await updateSettings({ [key]: value });
    } catch (error) {
      showAlert(translate("error"), translate("settingsUpdateError"), {
        icon: "alert-circle",
        iconColor: C.red,
      });
    } finally {
      setIsSaving(false);
    }

    // Handle notification-related toggle changes
    const notifKeys = [
      "push_notifications",
      "contribution_reminders",
      "achievement_notifications",
      "chat_notifications",
      "expense_notifications",
      "group_notifications",
      "contribution_notifications",
    ];
    if (notifKeys.includes(key)) {
      try {
        await onNotificationSettingChanged(
          key,
          value as boolean,
          settings.language,
        );
        if (key === "push_notifications" && value === true) {
          await scheduleNotification(
            `🔔 ${translate("notificationsEnabled")}`,
            translate("notificationsEnabledMsg"),
            3,
          );
        }
      } catch (_e) {
        // Setting was saved, notification setup is best-effort
      }
    }
  };

  const handleToggle = (key: string, value: boolean) => {
    handleSettingUpdate(key, value);
  };

  // Delete account — two-step confirmation via modals
  const [showDeleteStep1, setShowDeleteStep1] = useState(false);
  const [showDeleteStep2, setShowDeleteStep2] = useState(false);

  const handleDeleteAccount = () => {
    setShowDeleteStep1(true);
  };

  const handleDeleteStep1Confirm = () => {
    setShowDeleteStep1(false);
    setShowDeleteStep2(true);
  };

  const handleDeleteStep2Confirm = async () => {
    setShowDeleteStep2(false);
    try {
      setIsDeleting(true);
      await deleteAccount();
    } catch (error: unknown) {
      showAlert(translate("error"), translate("deleteAccountError"), {
        icon: "alert-circle",
        iconColor: C.red,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>{translate("loading")}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentLanguageLabel =
    settings.language === "es"
      ? "Español"
      : settings.language === "en"
        ? "English"
        : "Français";

  const getCurrentCurrencyLabel = () => {
    return translate(`currency_${settings.currency}`) || settings.currency;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={C.text} />
        </TouchableOpacity>
        <Text style={styles.title}>{translate("settings")}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Sección Personal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {translate("personal").toUpperCase()}
          </Text>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={handlePersonalInfo}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="person-outline" size={20} color={C.text} />
              <Text style={styles.settingLabel}>
                {translate("personalInfo")}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={C.text3} />
          </TouchableOpacity>
        </View>

        {/* Sección Apariencia */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {translate("appearance").toUpperCase()}
          </Text>

          <TouchableOpacity
            style={[styles.settingItem, isSaving && styles.settingItemDisabled]}
            onPress={handleLanguageChange}
            disabled={isSaving}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="language-outline" size={20} color={C.text} />
              <Text style={styles.settingLabel}>{translate("language")}</Text>
            </View>
            <View style={styles.settingRight}>
              <Text style={styles.settingValue}>{currentLanguageLabel}</Text>
              <Ionicons name="chevron-forward" size={16} color={C.text3} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingItem, isSaving && styles.settingItemDisabled]}
            onPress={handleCurrencyChange}
            disabled={isSaving}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="card-outline" size={20} color={C.text} />
              <Text style={styles.settingLabel}>{translate("currency")}</Text>
            </View>
            <View style={styles.settingRight}>
              <Text style={styles.settingValue}>
                {getCurrentCurrencyLabel()}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={C.text3} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingItem, isSaving && styles.settingItemDisabled]}
            onPress={() => setShowThemeModal(true)}
            disabled={isSaving}
          >
            <View style={styles.settingLeft}>
              <Ionicons name={settings.theme === "dark" ? "moon-outline" : settings.theme === "light" ? "sunny-outline" : "phone-portrait-outline"} size={20} color={C.text} />
              <Text style={styles.settingLabel}>{translate("theme")}</Text>
            </View>
            <View style={styles.settingRight}>
              <Text style={styles.settingValue}>
                {settings.theme === "dark" ? translate("darkMode") : settings.theme === "light" ? translate("lightMode") : "Auto"}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={C.text3} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Sección Notificaciones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {translate("notifications").toUpperCase()}
          </Text>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons
                name="notifications-outline"
                size={20}
                color={C.text}
              />
              <Text style={styles.settingLabel}>
                {translate("pushNotifications")}
              </Text>
            </View>
            <Switch
              value={settings.push_notifications}
              onValueChange={(value) =>
                handleToggle("push_notifications", value)
              }
              trackColor={{ false: C.surface3, true: C.accent }}
              thumbColor={C.bg}
              disabled={isSaving}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="alarm-outline" size={20} color={C.text} />
              <Text style={styles.settingLabel}>
                {translate("contributionReminders")}
              </Text>
            </View>
            <Switch
              value={settings.contribution_reminders}
              onValueChange={(value) =>
                handleToggle("contribution_reminders", value)
              }
              trackColor={{ false: C.surface3, true: C.accent }}
              thumbColor={C.bg}
              disabled={isSaving}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="trophy-outline" size={20} color={C.text} />
              <Text style={styles.settingLabel}>
                {translate("achievementNotifications")}
              </Text>
            </View>
            <Switch
              value={settings.achievement_notifications}
              onValueChange={(value) =>
                handleToggle("achievement_notifications", value)
              }
              trackColor={{ false: C.surface3, true: C.accent }}
              thumbColor={C.bg}
              disabled={isSaving}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="cash-outline" size={20} color={C.text} />
              <Text style={styles.settingLabel}>
                {translate("contributionNotifications")}
              </Text>
            </View>
            <Switch
              value={settings.contribution_notifications}
              onValueChange={(value) =>
                handleToggle("contribution_notifications", value)
              }
              trackColor={{ false: C.surface3, true: C.accent }}
              thumbColor={C.bg}
              disabled={isSaving}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="chatbubble-outline" size={20} color={C.text} />
              <Text style={styles.settingLabel}>
                {translate("chatNotifications")}
              </Text>
            </View>
            <Switch
              value={settings.chat_notifications}
              onValueChange={(value) =>
                handleToggle("chat_notifications", value)
              }
              trackColor={{ false: C.surface3, true: C.accent }}
              thumbColor={C.bg}
              disabled={isSaving}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="receipt-outline" size={20} color={C.text} />
              <Text style={styles.settingLabel}>
                {translate("expenseNotifications")}
              </Text>
            </View>
            <Switch
              value={settings.expense_notifications}
              onValueChange={(value) =>
                handleToggle("expense_notifications", value)
              }
              trackColor={{ false: C.surface3, true: C.accent }}
              thumbColor={C.bg}
              disabled={isSaving}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="people-outline" size={20} color={C.text} />
              <Text style={styles.settingLabel}>
                {translate("groupNotifications")}
              </Text>
            </View>
            <Switch
              value={settings.group_notifications}
              onValueChange={(value) =>
                handleToggle("group_notifications", value)
              }
              trackColor={{ false: C.surface3, true: C.accent }}
              thumbColor={C.bg}
              disabled={isSaving}
            />
          </View>
        </View>

        {/* Sección Cuenta - Zona Peligrosa */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {translate("account").toUpperCase()}
          </Text>

          <TouchableOpacity
            style={[styles.settingItem, styles.dangerItem]}
            onPress={handleDeleteAccount}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="trash-outline" size={20} color={C.red} />
              <Text style={[styles.settingLabel, { color: C.red }]}>
                {translate("deleteAccount")}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={C.red} />
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            GoalCrew v{Constants.expoConfig?.version ?? "1.0.0"}
          </Text>
          <Text style={styles.footerText}>{translate("madeWithLove")}</Text>
          {isSaving && (
            <Text style={styles.savingText}>{translate("saving")}</Text>
          )}
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={showProfileModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowProfileModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{translate("editProfile")}</Text>
              <TouchableOpacity onPress={() => setShowProfileModal(false)}>
                <Ionicons name="close" size={24} color={C.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>{translate("yourName")}</Text>
              <TextInput
                style={styles.textInput}
                value={editName}
                onChangeText={setEditName}
                placeholder={translate("yourName")}
                placeholderTextColor={C.text3}
                autoFocus
                maxLength={50}
              />

              <Text style={styles.inputLabel}>{translate("email")}</Text>
              <View style={[styles.textInput, styles.textInputDisabled]}>
                <Text style={styles.disabledText}>{user?.email || ""}</Text>
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowProfileModal(false)}
              >
                <Text style={styles.cancelButtonText}>
                  {translate("cancel")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, isSaving && { opacity: 0.6 }]}
                onPress={handleSaveProfile}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color={C.bg} />
                ) : (
                  <Text style={styles.saveButtonText}>{translate("save")}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Currency Selection Modal */}
      <SelectModal
        visible={showCurrencyModal}
        title={translate("selectCurrency")}
        options={CURRENCY_CODES.map((code) => ({
          label: translate(`currency_${code}`),
          sublabel: code,
          value: code,
        }))}
        selectedValue={settings.currency}
        onSelect={handleCurrencySelect}
        onClose={() => setShowCurrencyModal(false)}
      />

      {/* Language Selection Modal */}
      <SelectModal
        visible={showLanguageModal}
        title={translate("selectLanguage")}
        options={languageOptions}
        selectedValue={settings.language}
        onSelect={handleLanguageSelect}
        onClose={() => setShowLanguageModal(false)}
      />

      {/* Theme Selection Modal */}
      <SelectModal
        visible={showThemeModal}
        title={translate("theme")}
        options={[
          { label: translate("darkMode"), value: "dark" },
          { label: translate("lightMode"), value: "light" },
          { label: "Auto", value: "auto" },
        ]}
        selectedValue={settings.theme}
        onSelect={(value) => {
          setShowThemeModal(false);
          handleSettingUpdate("theme", value);
        }}
        onClose={() => setShowThemeModal(false)}
      />

      {/* Generic Alert Modal */}
      <AlertModal
        visible={alertModal.visible}
        title={alertModal.title}
        message={alertModal.message}
        icon={alertModal.icon as any}
        iconColor={alertModal.iconColor}
        buttons={alertModal.buttons}
        onDismiss={dismissAlert}
      />

      {/* Delete Account — Step 1 */}
      <AlertModal
        visible={showDeleteStep1}
        title={translate("deleteAccount")}
        message={translate("deleteAccountConfirm")}
        icon="warning"
        iconColor={C.red}
        onDismiss={() => setShowDeleteStep1(false)}
        buttons={[
          {
            text: translate("cancel"),
            style: "cancel",
            onPress: () => setShowDeleteStep1(false),
          },
          {
            text: translate("deleteBtn"),
            style: "destructive",
            onPress: handleDeleteStep1Confirm,
          },
        ]}
      />

      {/* Delete Account — Step 2 */}
      <AlertModal
        visible={showDeleteStep2}
        title={translate("finalConfirmation")}
        message={translate("typeDeleteConfirm")}
        icon="trash"
        iconColor={C.red}
        onDismiss={() => setShowDeleteStep2(false)}
        buttons={[
          {
            text: translate("cancel"),
            style: "cancel",
            onPress: () => setShowDeleteStep2(false),
          },
          {
            text: translate("deletePermanently"),
            style: "destructive",
            onPress: handleDeleteStep2Confirm,
          },
        ]}
      />

      {/* Deleting Account Overlay */}
      {isDeleting && (
        <View style={styles.deletingOverlay}>
          <ActivityIndicator size="large" color={C.red} />
          <Text style={styles.deletingText}>
            {translate("deletingAccount")}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const createStyles = (C: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: FontSize.base,
    color: C.text2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: C.surface3,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: "900",
    color: C.text,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: "700",
    color: C.text2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: Spacing.md,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    backgroundColor: C.surface,
    borderRadius: Radius.lg,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: C.surface3,
  },
  settingItemDisabled: {
    opacity: 0.6,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  settingLabel: {
    fontSize: FontSize.base,
    color: C.text,
    marginLeft: Spacing.md,
    fontWeight: "500",
  },
  settingValue: {
    fontSize: FontSize.sm,
    color: C.text2,
    fontWeight: "500",
  },
  dangerItem: {
    borderColor: "rgba(248, 113, 113, 0.2)",
    backgroundColor: "rgba(248, 113, 113, 0.05)",
  },
  footer: {
    alignItems: "center",
    paddingVertical: Spacing.xxl,
    gap: Spacing.xs,
  },
  footerText: {
    fontSize: FontSize.xs,
    color: C.text3,
  },
  savingText: {
    fontSize: FontSize.xs,
    color: C.accent2,
    fontWeight: "600",
    marginTop: Spacing.sm,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
  },
  modalContent: {
    width: "100%",
    backgroundColor: C.surface,
    borderRadius: Radius.xl,
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.xl,
    borderWidth: 1,
    borderColor: C.surface3,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  modalTitle: {
    fontSize: FontSize.xl,
    fontWeight: "800",
    color: C.text,
  },
  modalBody: {
    marginBottom: Spacing.xl,
  },
  inputLabel: {
    fontSize: FontSize.sm,
    fontWeight: "600",
    color: C.text2,
    marginBottom: Spacing.xs,
    marginTop: Spacing.md,
  },
  textInput: {
    backgroundColor: C.bg,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    fontSize: FontSize.base,
    color: C.text,
    borderWidth: 1,
    borderColor: C.surface3,
  },
  textInputDisabled: {
    opacity: 0.5,
  },
  disabledText: {
    fontSize: FontSize.base,
    color: C.text3,
  },
  modalFooter: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    alignItems: "center",
    backgroundColor: C.surface3,
  },
  cancelButtonText: {
    fontSize: FontSize.base,
    fontWeight: "600",
    color: C.text2,
  },
  saveButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    alignItems: "center",
    backgroundColor: C.accent,
  },
  saveButtonText: {
    fontSize: FontSize.base,
    fontWeight: "700",
    color: C.bg,
  },
  deletingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.lg,
  },
  deletingText: {
    fontSize: FontSize.lg,
    fontWeight: "700",
    color: C.red,
  },
  // Currency modal styles — now handled by SelectModal component
});
