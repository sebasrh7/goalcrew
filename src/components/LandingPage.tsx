import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { FontSize, Radius } from "../constants";
import {
  Language,
  changeLanguage,
  getCurrentLanguage,
  t,
} from "../lib/i18n";
import { useColors } from "../lib/useColors";

// ─── Config ──────────────────────────────────────────────────────────────────
const APK_DOWNLOAD_URL =
  process.env.EXPO_PUBLIC_APK_URL ??
  "https://expo.dev/accounts/sebasrh7/projects/goalcrew/builds/aae04129-e692-4162-93d6-b038b56f444a";

const LANGUAGES: { code: Language; label: string }[] = [
  { code: "es", label: "ES" },
  { code: "en", label: "EN" },
  { code: "fr", label: "FR" },
];

// ─── Scroll-based fade-in hook ───────────────────────────────────────────────
function useScrollFadeIn() {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(24)).current;
  const hasAnimated = useRef(false);

  const trigger = useCallback(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: false,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 500,
        useNativeDriver: false,
      }),
    ]).start();
  }, [opacity, translateY]);

  return { opacity, translateY, trigger };
}

// ─── Landing page shown to web visitors ──────────────────────────────────────
interface Props {
  onOpenApp: () => void;
}

export function LandingPage({ onOpenApp }: Props) {
  const C = useColors();
  const styles = useMemo(() => createStyles(C), [C]);
  const [lang, setLang] = useState<Language>(getCurrentLanguage());
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const isBigDesktop = width >= 1100;
  const scrollRef = useRef<ScrollView>(null);

  // Hero always animates on mount
  const heroOpacity = useRef(new Animated.Value(0)).current;
  const heroSlide = useRef(new Animated.Value(30)).current;

  // Scroll-triggered sections
  const previewAnim = useScrollFadeIn();
  const featuresAnim = useScrollFadeIn();
  const downloadAnim = useScrollFadeIn();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(heroOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: false,
      }),
      Animated.timing(heroSlide, {
        toValue: 0,
        duration: 600,
        useNativeDriver: false,
      }),
    ]).start();
  }, []);

  const handleLanguageChange = (newLang: Language) => {
    changeLanguage(newLang);
    setLang(newLang);
  };

  // Track section Y positions for scroll-triggered animations
  const sectionPositions = useRef<Record<string, number>>({});
  const handleScroll = useCallback(
    (event: { nativeEvent: { contentOffset: { y: number }; layoutMeasurement: { height: number } } }) => {
      const scrollY = event.nativeEvent.contentOffset.y;
      const viewportH = event.nativeEvent.layoutMeasurement.height;
      const triggerPoint = scrollY + viewportH * 0.8;

      if (sectionPositions.current.preview && triggerPoint >= sectionPositions.current.preview) {
        previewAnim.trigger();
      }
      if (sectionPositions.current.features && triggerPoint >= sectionPositions.current.features) {
        featuresAnim.trigger();
      }
      if (sectionPositions.current.download && triggerPoint >= sectionPositions.current.download) {
        downloadAnim.trigger();
      }
    },
    [previewAnim, featuresAnim, downloadAnim],
  );

  const featureItems = [
    {
      icon: "people" as const,
      title: t("landingFeature1Title", lang),
      desc: t("landingFeature1Desc", lang),
      gradient: C.gradientPrimary,
    },
    {
      icon: "trending-up" as const,
      title: t("landingFeature2Title", lang),
      desc: t("landingFeature2Desc", lang),
      gradient: C.gradientSuccess,
    },
    {
      icon: "trophy" as const,
      title: t("landingFeature3Title", lang),
      desc: t("landingFeature3Desc", lang),
      gradient: C.gradientWarning,
    },
    {
      icon: "shield-checkmark" as const,
      title: t("landingFeature4Title", lang),
      desc: t("landingFeature4Desc", lang),
      gradient: ["#6c63ff", "#22d3a0"] as const,
    },
  ];

  const containerPadding = isBigDesktop ? 80 : isDesktop ? 40 : 20;
  const maxContentWidth = 1200;

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.container}
      contentContainerStyle={{ alignItems: "center" }}
      showsVerticalScrollIndicator={false}
      scrollEventThrottle={16}
      onScroll={handleScroll}
    >
      {/* ─── Navbar ─────────────────────────────────────────────────── */}
      <View
        style={[
          styles.navbar,
          { paddingHorizontal: containerPadding, maxWidth: maxContentWidth },
        ]}
      >
        <View style={styles.navBrand}>
          <View style={styles.navLogoCircle}>
            <Ionicons name="rocket" size={18} color="#FFFFFF" />
          </View>
          <Text style={styles.navTitle}>GoalCrew</Text>
        </View>

        <View style={styles.navRight}>
          {/* Language Selector */}
          <View style={styles.langSelector}>
            {LANGUAGES.map((l) => (
              <TouchableOpacity
                key={l.code}
                style={[
                  styles.langBtn,
                  lang === l.code && styles.langBtnActive,
                ]}
                onPress={() => handleLanguageChange(l.code)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.langBtnText,
                    lang === l.code && styles.langBtnTextActive,
                  ]}
                >
                  {l.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.navCta}
            onPress={onOpenApp}
            activeOpacity={0.8}
          >
            <Text style={styles.navCtaText}>{t("landingSignIn", lang)}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ─── Hero ───────────────────────────────────────────────────── */}
      <Animated.View
        style={[
          styles.hero,
          {
            opacity: heroOpacity,
            transform: [{ translateY: heroSlide }],
            paddingHorizontal: containerPadding,
            maxWidth: maxContentWidth,
          },
        ]}
      >
        <View style={styles.heroBadge}>
          <Ionicons name="sparkles" size={14} color={C.accent2} />
          <Text style={styles.heroBadgeText}>{t("landingBadge", lang)}</Text>
        </View>

        <Text
          style={[
            styles.heroTitle,
            isDesktop && { fontSize: 56, lineHeight: 64 },
          ]}
        >
          {t("landingHeroTitle1", lang)}
          {"\n"}
          <Text style={styles.heroTitleAccent}>
            {t("landingHeroTitle2", lang)}
          </Text>
        </Text>

        <Text
          style={[
            styles.heroSubtitle,
            isDesktop && { fontSize: 18, maxWidth: 600 },
          ]}
        >
          {t("landingHeroSubtitle", lang)}
        </Text>

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={onOpenApp}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={["#6c63ff", "#a78bfa"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.primaryBtnGradient}
          >
            <Text style={styles.primaryBtnText}>
              {t("landingCtaButton", lang)}
            </Text>
            <Ionicons name="arrow-forward" size={18} color="#FFF" />
          </LinearGradient>
        </TouchableOpacity>

        {/* Floating stats */}
        <View
          style={[
            styles.statsRow,
            isDesktop && { flexDirection: "row", gap: 32 },
          ]}
        >
          <StatBadge
            icon="flash"
            label={t("landingStat1", lang)}
            color={C.yellow}
            styles={styles}
          />
          <StatBadge
            icon="lock-closed"
            label={t("landingStat2", lang)}
            color={C.green}
            styles={styles}
          />
          <StatBadge
            icon="phone-portrait"
            label={t("landingStat3", lang)}
            color={C.accent2}
            styles={styles}
          />
        </View>
      </Animated.View>

      {/* ─── App Preview (realistic mockup) ───────────────────────── */}
      <Animated.View
        onLayout={(e) => {
          sectionPositions.current.preview = e.nativeEvent.layout.y;
        }}
        style={[
          styles.previewSection,
          {
            opacity: previewAnim.opacity,
            transform: [{ translateY: previewAnim.translateY }],
            paddingHorizontal: containerPadding,
            maxWidth: maxContentWidth,
          },
        ]}
      >
        <View style={styles.mockupContainer}>
          <LinearGradient
            colors={["#1a1555", "#0b0f1a"]}
            style={styles.mockupScreen}
          >
            {/* Header */}
            <View style={styles.mockupHeader}>
              <View style={styles.mockupAvatar}>
                <Ionicons name="person" size={16} color={C.text3} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.mockupGreeting}>
                  {lang === "en" ? "Hi, Alex" : lang === "fr" ? "Salut, Alex" : "Hola, Alex"} 👋
                </Text>
                <Text style={styles.mockupSubGreeting}>
                  {lang === "en"
                    ? "2 active groups"
                    : lang === "fr"
                      ? "2 groupes actifs"
                      : "2 grupos activos"}
                </Text>
              </View>
            </View>

            {/* Card 1 */}
            <View style={styles.mockupCard}>
              <View style={styles.mockupCardHeader}>
                <Text style={{ fontSize: 20 }}>✈️</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.mockupCardTitle}>
                    {lang === "en"
                      ? "Trip to Europe"
                      : lang === "fr"
                        ? "Voyage en Europe"
                        : "Viaje a Europa"}
                  </Text>
                  <Text style={styles.mockupCardSub}>
                    4 {lang === "fr" ? "membres" : lang === "en" ? "members" : "miembros"}
                  </Text>
                </View>
                <Text style={[styles.mockupPercent, { color: C.accent2 }]}>
                  65%
                </Text>
              </View>
              <View style={styles.mockupProgress}>
                <LinearGradient
                  colors={["#6c63ff", "#a78bfa"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.mockupProgressBar, { width: "65%" }]}
                />
              </View>
              <View style={styles.mockupCardFooter}>
                <Text style={styles.mockupCardAmount}>$2,600</Text>
                <Text style={styles.mockupCardGoal}>/ $4,000</Text>
              </View>
            </View>

            {/* Card 2 */}
            <View style={styles.mockupCard}>
              <View style={styles.mockupCardHeader}>
                <Text style={{ fontSize: 20 }}>🏠</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.mockupCardTitle}>
                    {lang === "en"
                      ? "New Apartment"
                      : lang === "fr"
                        ? "Nouvel Appart"
                        : "Depa Nuevo"}
                  </Text>
                  <Text style={styles.mockupCardSub}>
                    3 {lang === "fr" ? "membres" : lang === "en" ? "members" : "miembros"}
                  </Text>
                </View>
                <Text style={[styles.mockupPercent, { color: C.green }]}>
                  42%
                </Text>
              </View>
              <View style={styles.mockupProgress}>
                <LinearGradient
                  colors={["#22d3a0", "#059669"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.mockupProgressBar, { width: "42%" }]}
                />
              </View>
              <View style={styles.mockupCardFooter}>
                <Text style={styles.mockupCardAmount}>$4,200</Text>
                <Text style={styles.mockupCardGoal}>/ $10,000</Text>
              </View>
            </View>

            {/* Bottom nav mockup */}
            <View style={styles.mockupNav}>
              <View style={styles.mockupNavItem}>
                <Ionicons name="home" size={16} color={C.accent2} />
                <View style={styles.mockupNavDot} />
              </View>
              <View style={styles.mockupNavAdd}>
                <Ionicons name="add" size={18} color="#FFF" />
              </View>
              <View style={styles.mockupNavItem}>
                <Ionicons name="person-outline" size={16} color={C.text3} />
              </View>
            </View>
          </LinearGradient>
        </View>
      </Animated.View>

      {/* ─── Features ───────────────────────────────────────────────── */}
      <Animated.View
        onLayout={(e) => {
          sectionPositions.current.features = e.nativeEvent.layout.y;
        }}
        style={[
          styles.featuresSection,
          {
            opacity: featuresAnim.opacity,
            transform: [{ translateY: featuresAnim.translateY }],
            paddingHorizontal: containerPadding,
            maxWidth: maxContentWidth,
          },
        ]}
      >
        <Text style={styles.sectionTag}>{t("landingFeaturesTag", lang)}</Text>
        <Text
          style={[
            styles.sectionTitle,
            isDesktop && { fontSize: 36, lineHeight: 44 },
          ]}
        >
          {t("landingFeaturesTitle", lang)}
        </Text>

        <View
          style={[
            styles.featuresGrid,
            isDesktop && {
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 16,
            },
          ]}
        >
          {featureItems.map((f, i) => (
            <View
              key={i}
              style={[
                styles.featureCard,
                isDesktop && { flex: 1, minWidth: 240, maxWidth: "48%" },
              ]}
            >
              <LinearGradient
                colors={[...f.gradient]}
                style={styles.featureIcon}
              >
                <Ionicons name={f.icon} size={22} color="#FFF" />
              </LinearGradient>
              <Text style={styles.featureTitle}>{f.title}</Text>
              <Text style={styles.featureDesc}>{f.desc}</Text>
            </View>
          ))}
        </View>
      </Animated.View>

      {/* ─── Download Section (simplified: 2 cards) ───────────────── */}
      <Animated.View
        onLayout={(e) => {
          sectionPositions.current.download = e.nativeEvent.layout.y;
        }}
        style={[
          styles.downloadSection,
          {
            opacity: downloadAnim.opacity,
            transform: [{ translateY: downloadAnim.translateY }],
            paddingHorizontal: containerPadding,
            maxWidth: maxContentWidth,
          },
        ]}
      >
        <Text style={styles.sectionTag}>{t("landingDownloadTag", lang)}</Text>
        <Text
          style={[
            styles.sectionTitle,
            isDesktop && { fontSize: 36, lineHeight: 44 },
          ]}
        >
          {t("landingDownloadTitle", lang)}
        </Text>

        <View
          style={[
            styles.downloadGrid,
            isDesktop && { flexDirection: "row", gap: 16 },
          ]}
        >
          {/* Android — native <a> tag for proper download behavior */}
          <a
            href={APK_DOWNLOAD_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "none", flex: 1 }}
          >
            <View style={styles.downloadCard}>
              <LinearGradient
                colors={["#22d3a0", "#059669"]}
                style={styles.downloadIconBg}
              >
                <Ionicons name="logo-android" size={28} color="#FFF" />
              </LinearGradient>
              <Text style={styles.downloadPlatform}>Android</Text>
              <Text style={styles.downloadDesc}>
                {t("landingDownloadAndroidDesc", lang)}
              </Text>
              <View style={[styles.downloadBtnOutline, { borderColor: "rgba(34,211,160,0.3)" }]}>
                <Ionicons
                  name="download-outline"
                  size={16}
                  color={C.green}
                />
                <Text style={[styles.downloadBtnText, { color: C.green }]}>
                  {t("landingDownloadAPK", lang)}
                </Text>
              </View>
            </View>
          </a>

          {/* Web & iPhone — single card */}
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={onOpenApp}
            activeOpacity={0.85}
          >
            <View style={styles.downloadCard}>
              <LinearGradient
                colors={["#6c63ff", "#a78bfa"]}
                style={styles.downloadIconBg}
              >
                <Ionicons name="globe-outline" size={28} color="#FFF" />
              </LinearGradient>
              <Text style={styles.downloadPlatform}>Web & iPhone</Text>
              <Text style={styles.downloadDesc}>
                {t("landingDownloadWebDesc", lang)}
              </Text>
              <View style={[styles.downloadBtnOutline, { borderColor: "rgba(108,99,255,0.3)" }]}>
                <Ionicons name="open-outline" size={16} color={C.accent2} />
                <Text style={[styles.downloadBtnText, { color: C.accent2 }]}>
                  {t("landingOpenWebApp", lang)}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* ─── Footer ─────────────────────────────────────────────────── */}
      <View
        style={[
          styles.footer,
          { paddingHorizontal: containerPadding, maxWidth: maxContentWidth },
        ]}
      >
        <View style={styles.footerBrand}>
          <View style={[styles.navLogoCircle, { width: 28, height: 28 }]}>
            <Ionicons name="rocket" size={14} color="#FFFFFF" />
          </View>
          <Text style={styles.footerTitle}>GoalCrew</Text>
        </View>
        <Text style={styles.footerText}>
          © {new Date().getFullYear()} GoalCrew. {t("landingFooter", lang)}
        </Text>
      </View>
    </ScrollView>
  );
}

// ─── Stat Badge ──────────────────────────────────────────────────────────────
function StatBadge({
  icon,
  label,
  color,
  styles,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={styles.statBadge}>
      <Ionicons name={icon} size={16} color={color} />
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const createStyles = (C: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },

  // Navbar
  navbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.surface3,
  },
  navBrand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  navLogoCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: C.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  navTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: C.text,
    letterSpacing: -0.3,
  },
  navRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  langSelector: {
    flexDirection: "row",
    backgroundColor: C.surface2,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: C.surface3,
    overflow: "hidden",
  },
  langBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  langBtnActive: {
    backgroundColor: C.accent,
  },
  langBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: C.text3,
  },
  langBtnTextActive: {
    color: "#FFF",
  },
  navCta: {
    backgroundColor: C.surface2,
    borderRadius: Radius.sm,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: C.surface3,
  },
  navCtaText: {
    fontSize: FontSize.sm,
    fontWeight: "700",
    color: C.text,
  },

  // Hero
  hero: {
    width: "100%",
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 40,
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(108,99,255,0.15)",
    borderRadius: Radius.full,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(108,99,255,0.3)",
    marginBottom: 24,
  },
  heroBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: C.accent2,
  },
  heroTitle: {
    fontSize: 38,
    fontWeight: "900",
    color: C.text,
    textAlign: "center",
    lineHeight: 46,
    letterSpacing: -1,
    marginBottom: 16,
  },
  heroTitleAccent: {
    color: C.accent2,
  },
  heroSubtitle: {
    fontSize: 16,
    color: C.text2,
    textAlign: "center",
    lineHeight: 26,
    maxWidth: 480,
    marginBottom: 32,
  },
  primaryBtn: {
    borderRadius: Radius.md,
    overflow: "hidden",
    marginBottom: 40,
  },
  primaryBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: Radius.md,
  },
  primaryBtnText: {
    fontSize: FontSize.md,
    fontWeight: "800",
    color: "#FFF",
  },

  // Stats
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 16,
  },
  statBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: C.surface,
    borderRadius: Radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: C.surface3,
  },
  statLabel: {
    fontSize: FontSize.xs,
    fontWeight: "600",
    color: C.text2,
  },

  // Preview
  previewSection: {
    width: "100%",
    alignItems: "center",
    paddingVertical: 20,
  },
  mockupContainer: {
    width: 280,
    borderRadius: 28,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: C.surface3,
    shadowColor: "#6c63ff",
    shadowOpacity: 0.25,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 12 },
    elevation: 20,
  },
  mockupScreen: {
    padding: 16,
    paddingTop: 20,
    paddingBottom: 12,
    gap: 10,
  },
  mockupHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 6,
  },
  mockupAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.surface3,
    alignItems: "center",
    justifyContent: "center",
  },
  mockupGreeting: {
    fontSize: 14,
    fontWeight: "800",
    color: C.text,
  },
  mockupSubGreeting: {
    fontSize: 10,
    color: C.text3,
    marginTop: 1,
  },
  mockupCard: {
    backgroundColor: C.surface2,
    borderRadius: 12,
    padding: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: C.surface3,
  },
  mockupCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  mockupCardTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: C.text,
  },
  mockupCardSub: {
    fontSize: 9,
    color: C.text3,
    marginTop: 1,
  },
  mockupPercent: {
    fontSize: 16,
    fontWeight: "900",
  },
  mockupProgress: {
    height: 5,
    borderRadius: 3,
    backgroundColor: C.surface3,
    overflow: "hidden",
  },
  mockupProgressBar: {
    height: "100%",
    borderRadius: 3,
  },
  mockupCardFooter: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 2,
  },
  mockupCardAmount: {
    fontSize: 11,
    fontWeight: "800",
    color: C.text,
  },
  mockupCardGoal: {
    fontSize: 9,
    color: C.text3,
  },
  mockupNav: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 28,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: C.surface3,
    marginTop: 4,
  },
  mockupNavItem: {
    alignItems: "center",
    gap: 3,
  },
  mockupNavDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.accent2,
  },
  mockupNavAdd: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.accent,
    alignItems: "center",
    justifyContent: "center",
  },

  // Features
  featuresSection: {
    width: "100%",
    paddingTop: 60,
    paddingBottom: 40,
  },
  sectionTag: {
    fontSize: FontSize.xs,
    fontWeight: "800",
    color: C.accent2,
    textTransform: "uppercase",
    letterSpacing: 2,
    textAlign: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: C.text,
    textAlign: "center",
    lineHeight: 34,
    letterSpacing: -0.5,
    marginBottom: 32,
  },
  featuresGrid: {
    gap: 12,
  },
  featureCard: {
    backgroundColor: C.surface,
    borderRadius: Radius.lg,
    padding: 20,
    borderWidth: 1,
    borderColor: C.surface3,
    gap: 10,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  featureTitle: {
    fontSize: FontSize.md,
    fontWeight: "800",
    color: C.text,
  },
  featureDesc: {
    fontSize: FontSize.sm,
    color: C.text2,
    lineHeight: 20,
  },

  // Download
  downloadSection: {
    width: "100%",
    paddingTop: 40,
    paddingBottom: 40,
  },
  downloadGrid: {
    gap: 12,
  },
  downloadCard: {
    flex: 1,
    backgroundColor: C.surface,
    borderRadius: Radius.lg,
    padding: 20,
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: C.surface3,
  },
  downloadIconBg: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  downloadPlatform: {
    fontSize: FontSize.lg,
    fontWeight: "900",
    color: C.text,
  },
  downloadDesc: {
    fontSize: FontSize.sm,
    color: C.text2,
    textAlign: "center",
    lineHeight: 20,
  },
  downloadBtnOutline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: Radius.sm,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: C.surface3,
    marginTop: 4,
  },
  downloadBtnText: {
    fontSize: FontSize.sm,
    fontWeight: "700",
  },

  // Footer
  footer: {
    width: "100%",
    paddingVertical: 24,
    borderTopWidth: 1,
    borderTopColor: C.surface3,
    alignItems: "center",
    gap: 10,
    marginTop: 20,
  },
  footerBrand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  footerTitle: {
    fontSize: FontSize.base,
    fontWeight: "800",
    color: C.text,
  },
  footerText: {
    fontSize: FontSize.xs,
    color: C.text3,
    textAlign: "center",
  },
});
