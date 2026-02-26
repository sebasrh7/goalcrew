import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
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
import { Colors, FontSize, Radius, Spacing } from "../src/constants";
import { Language, t } from "../src/lib/i18n";
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
  const [editName, setEditName] = useState(user?.name || "");
  const [isDeleting, setIsDeleting] = useState(false);

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
      Alert.alert(translate("error"), translate("nameRequiredProfile"));
      return;
    }
    try {
      setIsSaving(true);
      await updateProfile({ name: trimmedName });
      setShowProfileModal(false);
      Alert.alert(translate("success"), translate("profileUpdated"));
    } catch (error: any) {
      console.error("❌ Error updating profile:", error);
      Alert.alert(translate("error"), translate("profileUpdateError"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleLanguageChange = () => {
    const languages: { label: string; value: Language }[] = [
      { label: "Español", value: "es" },
      { label: "English", value: "en" },
      { label: "Français", value: "fr" },
    ];

    Alert.alert(translate("language"), translate("selectLanguage"), [
      { text: translate("cancel"), style: "cancel" },
      ...languages.map((lang) => ({
        text: lang.label,
        onPress: () => handleSettingUpdate("language", lang.value),
      })),
    ]);
  };

  const handleCurrencyChange = () => {
    Alert.alert(translate("currency"), translate("selectCurrency"), [
      {
        text: "US Dollar ($)",
        onPress: () => handleSettingUpdate("currency", "USD"),
      },
      {
        text: "Euro (€)",
        onPress: () => handleSettingUpdate("currency", "EUR"),
      },
      {
        text: "British Pound (£)",
        onPress: () => handleSettingUpdate("currency", "GBP"),
      },
      {
        text: "Peso Colombiano ($)",
        onPress: () => handleSettingUpdate("currency", "COP"),
      },
      {
        text: "Peso Mexicano ($)",
        onPress: () => handleSettingUpdate("currency", "MXN"),
      },
      { text: translate("cancel"), style: "cancel" },
    ]);
  };

  const handleCurrencyChangeMore = () => {
    Alert.alert(translate("currency"), translate("moreCurrencies"), [
      {
        text: "Peso Argentino ($)",
        onPress: () => handleSettingUpdate("currency", "ARS"),
      },
      {
        text: "Peso Chileno ($)",
        onPress: () => handleSettingUpdate("currency", "CLP"),
      },
      {
        text: "Sol Peruano (S/)",
        onPress: () => handleSettingUpdate("currency", "PEN"),
      },
      {
        text: "Real Brasileño (R$)",
        onPress: () => handleSettingUpdate("currency", "BRL"),
      },
      { text: translate("cancel"), style: "cancel" },
    ]);
  };

  const handleSettingUpdate = async (key: string, value: any) => {
    setIsSaving(true);
    await updateSettings({ [key]: value });
    setIsSaving(false);

    // Handle notification-related toggle changes
    const notifKeys = [
      "push_notifications",
      "contribution_reminders",
      "achievement_notifications",
    ];
    if (notifKeys.includes(key)) {
      try {
        await onNotificationSettingChanged(key, value, settings.language);
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

  const handleToggle = (key: string, currentValue: boolean) => {
    handleSettingUpdate(key, !currentValue);
  };

  const handleExportData = () => {
    Alert.alert(translate("exportData"), translate("exportDataConfirm"), [
      { text: translate("cancel"), style: "cancel" },
      {
        text: translate("exportBtn"),
        onPress: () =>
          Alert.alert(translate("success"), translate("exportSuccess")),
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(translate("deleteAccount"), translate("deleteAccountConfirm"), [
      { text: translate("cancel"), style: "cancel" },
      {
        text: translate("deleteBtn"),
        style: "destructive",
        onPress: () => {
          Alert.alert(
            translate("finalConfirmation"),
            translate("typeDeleteConfirm"),
            [
              { text: translate("cancel"), style: "cancel" },
              {
                text: translate("deletePermanently"),
                style: "destructive",
                onPress: async () => {
                  try {
                    setIsDeleting(true);
                    await deleteAccount();
                    // deleteAccount already signs out and clears state
                    // Router will redirect to auth screen automatically
                  } catch (error: any) {
                    console.error("❌ Error deleting account:", error);
                    Alert.alert(
                      translate("error"),
                      translate("deleteAccountError"),
                    );
                  } finally {
                    setIsDeleting(false);
                  }
                },
              },
            ],
          );
        },
      },
    ]);
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
    switch (settings.currency) {
      case "USD":
        return "US Dollar ($)";
      case "EUR":
        return "Euro (€)";
      case "GBP":
        return "British Pound (£)";
      case "COP":
        return "Peso Colombiano ($)";
      case "MXN":
        return "Peso Mexicano ($)";
      case "ARS":
        return "Peso Argentino ($)";
      case "CLP":
        return "Peso Chileno ($)";
      case "PEN":
        return "Sol Peruano (S/)";
      case "BRL":
        return "Real Brasileño (R$)";
      default:
        return "US Dollar ($)";
    }
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

          <TouchableOpacity
            style={[styles.settingItem, isSaving && styles.settingItemDisabled]}
            onPress={handleCurrencyChangeMore}
            disabled={isSaving}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="earth-outline" size={20} color={Colors.text} />
              <Text style={styles.settingLabel}>
                {translate("moreCurrencies")}
              </Text>
            </View>
            <View style={styles.settingRight}>
              <Ionicons name="chevron-forward" size={16} color={Colors.text3} />
            </View>
          </TouchableOpacity>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="moon-outline" size={20} color={Colors.text} />
              <Text style={styles.settingLabel}>{translate("darkMode")}</Text>
            </View>
            <Switch
              value={settings.theme === "dark"}
              onValueChange={(value) =>
                handleSettingUpdate("theme", value ? "dark" : "light")
              }
              trackColor={{ false: Colors.surface3, true: Colors.accent }}
              thumbColor={Colors.bg}
              disabled={isSaving}
            />
          </View>
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
                handleToggle("push_notifications", settings.push_notifications)
              }
              trackColor={{ false: Colors.surface3, true: Colors.accent }}
              thumbColor={Colors.bg}
              disabled={isSaving}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="mail-outline" size={20} color={Colors.text} />
              <Text style={styles.settingLabel}>
                {translate("emailNotifications")}
              </Text>
            </View>
            <Switch
              value={settings.email_notifications}
              onValueChange={(value) =>
                handleToggle(
                  "email_notifications",
                  settings.email_notifications,
                )
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
                handleToggle(
                  "contribution_reminders",
                  settings.contribution_reminders,
                )
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
                handleToggle(
                  "achievement_notifications",
                  settings.achievement_notifications,
                )
              }
              trackColor={{ false: Colors.surface3, true: Colors.accent }}
              thumbColor={Colors.bg}
              disabled={isSaving}
            />
          </View>
        </View>

        {/* Sección Privacidad */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {translate("privacySecurity").toUpperCase()}
          </Text>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="eye-outline" size={20} color={Colors.text} />
              <Text style={styles.settingLabel}>
                {translate("publicProfile")}
              </Text>
            </View>
            <Switch
              value={settings.public_profile}
              onValueChange={(value) =>
                handleToggle("public_profile", settings.public_profile)
              }
              trackColor={{ false: Colors.surface3, true: Colors.accent }}
              thumbColor={Colors.bg}
              disabled={isSaving}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons
                name="stats-chart-outline"
                size={20}
                color={Colors.text}
              />
              <Text style={styles.settingLabel}>
                {translate("showStatistics")}
              </Text>
            </View>
            <Switch
              value={settings.show_stats}
              onValueChange={(value) =>
                handleToggle("show_stats", settings.show_stats)
              }
              trackColor={{ false: Colors.surface3, true: Colors.accent }}
              thumbColor={Colors.bg}
              disabled={isSaving}
            />
          </View>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={handleExportData}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="download-outline" size={20} color={Colors.text} />
              <Text style={styles.settingLabel}>{translate("exportData")}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.text3} />
          </TouchableOpacity>
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
          <Text style={styles.footerText}>GoalCrew v1.0.0</Text>
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
});
