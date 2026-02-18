import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { differenceInDays, addDays, format } from 'date-fns';
import { useGroupsStore } from '../../src/store/groupsStore';
import { Button, Card } from '../../src/components/UI';
import { Colors, Spacing, FontSize, Radius, TRIP_EMOJIS, FREQUENCY_LABELS } from '../../src/constants';
import { FrequencyType, DivisionType, CreateGroupInput } from '../../src/types';

export default function CreateScreen() {
  const router = useRouter();
  const { createGroup, isLoading } = useGroupsStore();

  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🏖️');
  const [goalAmount, setGoalAmount] = useState('250');
  const [deadline, setDeadline] = useState(() => {
    return format(addDays(new Date(), 90), 'yyyy-MM-dd');
  });
  const [frequency, setFrequency] = useState<FrequencyType>('weekly');
  const [divisionType, setDivisionType] = useState<DivisionType>('equal');

  // Auto-calculate savings needed
  const calc = useMemo(() => {
    const amount = parseFloat(goalAmount) || 0;
    const days = Math.max(1, differenceInDays(new Date(deadline), new Date()));
    const periods =
      frequency === 'daily' ? days :
      frequency === 'weekly' ? Math.ceil(days / 7) :
      Math.ceil(days / 30);
    const perPeriod = periods > 0 ? (amount / periods) : 0;

    return { days, periods, perPeriod };
  }, [goalAmount, deadline, frequency]);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Nombre requerido', 'Dale un nombre a tu meta');
      return;
    }
    if (!goalAmount || parseFloat(goalAmount) <= 0) {
      Alert.alert('Monto inválido', 'Ingresa una meta mayor a $0');
      return;
    }
    if (calc.days < 7) {
      Alert.alert('Fecha muy cercana', 'La fecha límite debe ser al menos en 7 días');
      return;
    }

    try {
      const input: CreateGroupInput = {
        name: name.trim(),
        emoji,
        deadline,
        goal_amount: parseFloat(goalAmount),
        frequency,
        division_type: divisionType,
      };
      const group = await createGroup(input);
      router.replace(`/group/${group.id}`);
    } catch (error: any) {
      Alert.alert('Error', error.message ?? 'No se pudo crear la meta');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backBtn}>← Atrás</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Nueva meta ✈️</Text>
          <Text style={styles.subtitle}>Configura tu viaje grupal</Text>
        </View>

        <View style={styles.form}>

          {/* Trip name */}
          <View style={styles.field}>
            <Text style={styles.label}>¿A dónde van?</Text>
            <TextInput
              style={styles.input}
              placeholder="ej. Cancún, París, NYC…"
              placeholderTextColor={Colors.text3}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>

          {/* Emoji picker */}
          <View style={styles.field}>
            <Text style={styles.label}>Emoji del viaje</Text>
            <View style={styles.emojiGrid}>
              {TRIP_EMOJIS.map(e => (
                <TouchableOpacity
                  key={e}
                  onPress={() => setEmoji(e)}
                  style={[styles.emojiBtn, e === emoji && styles.emojiBtnActive]}
                >
                  <Text style={styles.emojiText}>{e}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Goal + Deadline row */}
          <View style={styles.row}>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>Meta por persona ($)</Text>
              <View style={styles.amountWrap}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={styles.amountInput}
                  placeholder="250"
                  placeholderTextColor={Colors.text3}
                  value={goalAmount}
                  onChangeText={setGoalAmount}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>Fecha límite</Text>
              <TextInput
                style={styles.input}
                placeholder="2025-05-23"
                placeholderTextColor={Colors.text3}
                value={deadline}
                onChangeText={setDeadline}
              />
            </View>
          </View>

          {/* Frequency */}
          <View style={styles.field}>
            <Text style={styles.label}>Frecuencia de ahorro</Text>
            <View style={styles.tabBar}>
              {(['daily', 'weekly', 'monthly'] as FrequencyType[]).map(f => (
                <TouchableOpacity
                  key={f}
                  onPress={() => setFrequency(f)}
                  style={[styles.tab, frequency === f && styles.tabActive]}
                >
                  <Text style={[styles.tabText, frequency === f && styles.tabTextActive]}>
                    {FREQUENCY_LABELS[f]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Auto-calculated results */}
          <Card style={styles.calcCard}>
            <LinearGradient
              colors={['rgba(108,99,255,0.15)', 'rgba(108,99,255,0.05)']}
              style={StyleSheet.absoluteFill}
            />
            <Text style={styles.calcTitle}>📊 Calculado automáticamente</Text>
            <View style={styles.calcRow}>
              <CalcItem
                label={`Ahorrar por ${FREQUENCY_LABELS[frequency].toLowerCase()}`}
                value={`$${calc.perPeriod.toFixed(2)}`}
                highlight
              />
              <CalcItem label={`${FREQUENCY_LABELS[frequency]}s`} value={String(calc.periods)} />
              <CalcItem label="Días restantes" value={String(calc.days)} />
            </View>
          </Card>

          {/* Division type */}
          <View style={styles.field}>
            <Text style={styles.label}>Tipo de división</Text>
            <View style={styles.tabBar}>
              {([
                { value: 'equal', label: '🤝 Igual para todos' },
                { value: 'custom', label: '⚖️ Personalizada' },
              ] as { value: DivisionType; label: string }[]).map(d => (
                <TouchableOpacity
                  key={d.value}
                  onPress={() => setDivisionType(d.value)}
                  style={[styles.tab, divisionType === d.value && styles.tabActive]}
                >
                  <Text style={[styles.tabText, divisionType === d.value && styles.tabTextActive]}>
                    {d.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Summary */}
          <Card style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Resumen de tu meta</Text>
            <SummaryRow icon="✈️" label="Destino" value={name || '—'} />
            <SummaryRow icon={emoji} label="Meta/persona" value={`$${parseFloat(goalAmount || '0').toFixed(2)}`} />
            <SummaryRow icon="📅" label="Fecha límite" value={deadline} />
            <SummaryRow icon="🔄" label="Frecuencia" value={FREQUENCY_LABELS[frequency]} />
            <SummaryRow icon="💰" label={`Ahorrar/${FREQUENCY_LABELS[frequency].toLowerCase()}`} value={`$${calc.perPeriod.toFixed(2)}`} highlight />
          </Card>

          <Button
            title="🚀 Crear meta grupal"
            onPress={handleCreate}
            isLoading={isLoading}
            style={{ marginTop: Spacing.sm, marginBottom: Spacing.xxl }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function CalcItem({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <Text style={[styles.calcValue, highlight && { color: Colors.accent2 }]}>{value}</Text>
      <Text style={styles.calcLabel}>{label}</Text>
    </View>
  );
}

function SummaryRow({ icon, label, value, highlight }: any) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryIcon}>{icon}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={[styles.summaryValue, highlight && { color: Colors.green }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { padding: Spacing.xl, paddingBottom: 0 },
  backBtn: { color: Colors.accent2, fontWeight: '700', fontSize: FontSize.base, marginBottom: Spacing.lg },
  title: { fontSize: FontSize.xxxl, fontWeight: '900', color: Colors.text, marginBottom: 4, letterSpacing: -0.5 },
  subtitle: { fontSize: FontSize.base, color: Colors.text2 },
  form: { padding: Spacing.xl, gap: Spacing.lg },
  field: { gap: Spacing.sm },
  label: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.text2 },
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
  row: { flexDirection: 'row', gap: Spacing.md },
  amountWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface2,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.surface3,
    paddingHorizontal: Spacing.md,
  },
  currencySymbol: { fontSize: FontSize.xl, fontWeight: '900', color: Colors.text2, marginRight: 4 },
  amountInput: { flex: 1, paddingVertical: 13, fontSize: FontSize.xl, fontWeight: '900', color: Colors.text },
  emojiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  emojiBtn: {
    width: 48, height: 48,
    backgroundColor: Colors.surface2,
    borderRadius: Radius.md,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiBtnActive: { borderColor: Colors.accent },
  emojiText: { fontSize: 24 },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.surface2,
    borderRadius: Radius.md,
    padding: 4,
  },
  tab: { flex: 1, paddingVertical: 9, alignItems: 'center', borderRadius: Radius.sm },
  tabActive: { backgroundColor: Colors.surface },
  tabText: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.text2 },
  tabTextActive: { color: Colors.text },
  calcCard: { overflow: 'hidden', borderColor: 'rgba(108,99,255,0.3)' },
  calcTitle: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.accent2, marginBottom: Spacing.md },
  calcRow: { flexDirection: 'row' },
  calcValue: { fontSize: FontSize.xl, fontWeight: '900', color: Colors.text },
  calcLabel: { fontSize: FontSize.xs, color: Colors.text2, textAlign: 'center', marginTop: 2 },
  summaryCard: { gap: Spacing.sm },
  summaryTitle: { fontSize: FontSize.base, fontWeight: '800', color: Colors.text, marginBottom: Spacing.sm },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  summaryIcon: { fontSize: 16, width: 24 },
  summaryLabel: { flex: 1, fontSize: FontSize.base, color: Colors.text2 },
  summaryValue: { fontSize: FontSize.base, fontWeight: '800', color: Colors.text },
});
