import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../src/components/UI";
import { Colors, FontSize, Radius, Spacing } from "../../src/constants";
import { useGroupsStore } from "../../src/store/groupsStore";

export default function JoinGroupScreen() {
  const router = useRouter();
  const { joinGroup, isLoading } = useGroupsStore();
  const [code, setCode] = useState("");

  const handleJoin = async () => {
    const trimmed = code.trim().toUpperCase();
    if (trimmed.length < 6) {
      Alert.alert(
        "Código inválido",
        "Ingresa el código completo de invitación.",
      );
      return;
    }
    try {
      await joinGroup(trimmed);
      Alert.alert(
        "¡Bienvenido! 🎉",
        "Te uniste al grupo. ¡Empieza a ahorrar!",
        [{ text: "¡Vamos!", onPress: () => router.replace("/(tabs)") }],
      );
    } catch (error: any) {
      Alert.alert("Error", error.message ?? "No se pudo unir al grupo.");
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
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Atrás</Text>
        </TouchableOpacity>

        <Text style={styles.emoji}>🔗</Text>
        <Text style={styles.title}>Unirse a un grupo</Text>
        <Text style={styles.subtitle}>
          Pídele el código de invitación a quien creó el grupo
        </Text>

        <View style={styles.inputCard}>
          <Text style={styles.label}>Código de invitación</Text>
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
          <Text style={styles.codeHint}>{code.length}/8 caracteres</Text>
        </View>

        <Button
          title={
            <>
              <Ionicons
                name="rocket"
                size={20}
                color="#fff"
                style={{ marginRight: 8 }}
              />
              Unirme al grupo
            </>
          }
          onPress={handleJoin}
          isLoading={isLoading}
          disabled={code.length < 6}
        />

        <Text style={styles.or}>— o —</Text>

        <TouchableOpacity style={styles.scanBtn}>
          <Text style={styles.scanBtnText}>📷 Escanear código QR</Text>
          <Text style={styles.scanBtnSub}>Próximamente</Text>
        </TouchableOpacity>
      </View>
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
  emoji: { fontSize: 64, textAlign: "center", marginBottom: Spacing.lg },
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
  },
  scanBtnText: {
    fontSize: FontSize.base,
    fontWeight: "700",
    color: Colors.text,
  },
  scanBtnSub: { fontSize: FontSize.xs, color: Colors.text3, marginTop: 4 },
});
