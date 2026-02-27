import { Ionicons } from "@expo/vector-icons";
import React, { Component, ErrorInfo, ReactNode } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors, FontSize, Radius, Spacing } from "../constants";
import type { Language } from "../lib/i18n";
import { t } from "../lib/i18n";
import { useSettingsStore } from "../store/settingsStore";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // In production you could send this to a crash reporting service
    // For now we just swallow it so the app doesn't hard-crash
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return <ErrorFallback onRetry={this.handleRetry} />;
    }
    return this.props.children;
  }
}

// Functional component so we can read Zustand store for language
function ErrorFallback({ onRetry }: { onRetry: () => void }) {
  const lang = (useSettingsStore.getState().settings?.language ??
    "es") as Language;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Ionicons name="warning-outline" size={56} color={Colors.yellow} />
        <Text style={styles.title}>{t("errorBoundaryTitle", lang)}</Text>
        <Text style={styles.message}>{t("errorBoundaryMessage", lang)}</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={onRetry}
          activeOpacity={0.8}
        >
          <Ionicons
            name="refresh"
            size={20}
            color="#fff"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.buttonText}>{t("errorBoundaryRetry", lang)}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.xxxl,
    alignItems: "center",
    width: "100%",
    maxWidth: 340,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: "700",
    color: Colors.text,
    marginTop: Spacing.lg,
    textAlign: "center",
  },
  message: {
    fontSize: FontSize.md,
    color: Colors.text2,
    marginTop: Spacing.sm,
    textAlign: "center",
    lineHeight: 22,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    marginTop: Spacing.xxl,
  },
  buttonText: {
    fontSize: FontSize.md,
    fontWeight: "600",
    color: "#fff",
  },
});
