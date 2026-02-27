import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
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
import { Colors, FontSize, Radius, Spacing } from "../src/constants";
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
  const { user, signOut, updateProfile, deleteAccount } = useAuthStore();
  const { settings, isLoading, loadSettings, updateSettings } =
    useSettingsStore();

  const [isSaving, setIsSaving] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
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
        iconColor: Colors.red,
      });
      return;
    }
    try {
      setIsSaving(true);
      await updateProfile({ name: trimmedName });
      setShowProfileModal(false);
      showAlert(translate("success"), translate("profileUpdated"), {
        icon: "checkmark-circle",
        iconColor: Colors.green,
      });
    } catch (error: unknown) {
      showAlert(translate("error"), translate("profileUpdateError"), {
        icon: "alert-circle",
        iconColor: Colors.red,
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
        iconColor: Colors.red,
      });
    } finally {
      setIsSaving(false);
    }

    // Handle notification-related toggle changes
    const notifKeys = [
      "push_notifications",
      "contribution_reminders",
      "achievement_notifications",
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
        iconColor: Colors.red,
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
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
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
              <Ionicons name="person-outline" size={20} color={Colors.text} />
              <Text style={styles.settingLabel}>
                {translate("personalInfo")}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.text3} />
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
              <Ionicons name="language-outline" size={20} color={Colors.text} />
              <Text style={styles.settingLabel}>{translate("language")}</Text>
            </View>
            <View style={styles.settingRight}>
              <Text style={styles.settingValue}>{currentLanguageLabel}</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.text3} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingItem, isSaving && styles.settingItemDisabled]}
            onPress={handleCurrencyChange}
            disabled={isSaving}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="card-outline" size={20} color={Colors.text} />
              <Text style={styles.settingLabel}>{translate("currency")}</Text>
            </View>
            <View style={styles.settingRight}>
              <Text style={styles.settingValue}>
                {getCurrentCurrencyLabel()}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.text3} />
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
                color={Colors.text}
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
              trackColor={{ false: Colors.surface3, true: Colors.accent }}
              thumbColor={Colors.bg}
              disabled={isSaving}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="alarm-outline" size={20} color={Colors.text} />
              <Text style={styles.settingLabel}>
                {translate("contributionReminders")}
              </Text>
            </View>
            <Switch
              value={settings.contribution_reminders}
              onValueChange={(value) =>
                handleToggle("contribution_reminders", value)
              }
              trackColor={{ false: Colors.surface3, true: Colors.accent }}
              thumbColor={Colors.bg}
              disabled={isSaving}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="trophy-outline" size={20} color={Colors.text} />
              <Text style={styles.settingLabel}>
                {translate("achievementNotifications")}
              </Text>
            </View>
            <Switch
              value={settings.achievement_notifications}
              onValueChange={(value) =>
                handleToggle("achievement_notifications", value)
              }
              trackColor={{ false: Colors.surface3, true: Colors.accent }}
              thumbColor={Colors.bg}
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
              <Ionicons name="trash-outline" size={20} color={Colors.red} />
              <Text style={[styles.settingLabel, { color: Colors.red }]}>
                {translate("deleteAccount")}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.red} />
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
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>{translate("yourName")}</Text>
              <TextInput
                style={styles.textInput}
                value={editName}
                onChangeText={setEditName}
                placeholder={translate("yourName")}
                placeholderTextColor={Colors.text3}
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
                  <ActivityIndicator size="small" color={Colors.bg} />
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
        iconColor={Colors.red}
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
        iconColor={Colors.red}
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
          <ActivityIndicator size="large" color={Colors.red} />
          <Text style={styles.deletingText}>
            {translate("deletingAccount")}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: FontSize.base,
    color: Colors.text2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surface3,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: "900",
    color: Colors.text,
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
    color: Colors.text2,
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
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.surface3,
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
    color: Colors.text,
    marginLeft: Spacing.md,
    fontWeight: "500",
  },
  settingValue: {
    fontSize: FontSize.sm,
    color: Colors.text2,
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
    color: Colors.text3,
  },
  savingText: {
    fontSize: FontSize.xs,
    color: Colors.accent2,
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
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.surface3,
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
    color: Colors.text,
  },
  modalBody: {
    marginBottom: Spacing.xl,
  },
  inputLabel: {
    fontSize: FontSize.sm,
    fontWeight: "600",
    color: Colors.text2,
    marginBottom: Spacing.xs,
    marginTop: Spacing.md,
  },
  textInput: {
    backgroundColor: Colors.bg,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    fontSize: FontSize.base,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.surface3,
  },
  textInputDisabled: {
    opacity: 0.5,
  },
  disabledText: {
    fontSize: FontSize.base,
    color: Colors.text3,
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
    backgroundColor: Colors.surface3,
  },
  cancelButtonText: {
    fontSize: FontSize.base,
    fontWeight: "600",
    color: Colors.text2,
  },
  saveButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    alignItems: "center",
    backgroundColor: Colors.accent,
  },
  saveButtonText: {
    fontSize: FontSize.base,
    fontWeight: "700",
    color: Colors.bg,
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
    color: Colors.red,
  },
  // Currency modal styles — now handled by SelectModal component
});
