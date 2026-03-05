import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { Colors, FontSize, Radius } from "../constants";
import { getCurrentLanguage, t } from "../lib/i18n";

// ─── Config: update these with your real URLs ────────────────────────────────
const DOWNLOAD_LINKS = {
  apk: "https://expo.dev/accounts/sebasrh7/projects/goalcrew/builds/495fc1fc-d62c-4ba8-9822-977cd27ebe0f",
  webApp: "/(auth)/welcome", // internal route
};

// ─── Landing page shown to web visitors ──────────────────────────────────────
interface Props {
  onOpenApp: () => void;
}

export function LandingPage({ onOpenApp }: Props) {
  const lang = getCurrentLanguage();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const isBigDesktop = width >= 1100;

  // Animations
  const heroOpacity = useRef(new Animated.Value(0)).current;
  const heroSlide = useRef(new Animated.Value(30)).current;
  const featuresOpacity = useRef(new Animated.Value(0)).current;
  const downloadOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
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
      ]),
      Animated.timing(featuresOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: false,
      }),
      Animated.timing(downloadOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: false,
      }),
    ]).start();
  }, []);

  const features = [
    {
      icon: "people" as const,
      title: t("landingFeature1Title", lang),
      desc: t("landingFeature1Desc", lang),
      gradient: Colors.gradientPrimary,
    },
    {
      icon: "trending-up" as const,
      title: t("landingFeature2Title", lang),
      desc: t("landingFeature2Desc", lang),
      gradient: Colors.gradientSuccess,
    },
    {
      icon: "trophy" as const,
      title: t("landingFeature3Title", lang),
      desc: t("landingFeature3Desc", lang),
      gradient: Colors.gradientWarning,
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
      style={styles.container}
      contentContainerStyle={{ alignItems: "center" }}
      showsVerticalScrollIndicator={false}
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
        <TouchableOpacity
          style={styles.navCta}
          onPress={onOpenApp}
          activeOpacity={0.8}
        >
          <Text style={styles.navCtaText}>{t("landingSignIn", lang)}</Text>
        </TouchableOpacity>
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
          <Ionicons name="sparkles" size={14} color={Colors.accent2} />
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

        <View
          style={[
            styles.heroBtns,
            isDesktop && { flexDirection: "row", gap: 16 },
          ]}
        >
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
              <Ionicons name="globe-outline" size={20} color="#FFF" />
              <Text style={styles.primaryBtnText}>
                {t("landingUseWeb", lang)}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => Linking.openURL(DOWNLOAD_LINKS.apk)}
            activeOpacity={0.85}
          >
            <Ionicons name="logo-android" size={20} color={Colors.green} />
            <Text style={styles.secondaryBtnText}>
              {t("landingDownloadAPK", lang)}
            </Text>
          </TouchableOpacity>
        </View>

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
            color={Colors.yellow}
          />
          <StatBadge
            icon="lock-closed"
            label={t("landingStat2", lang)}
            color={Colors.green}
          />
          <StatBadge
            icon="phone-portrait"
            label={t("landingStat3", lang)}
            color={Colors.accent2}
          />
        </View>
      </Animated.View>

      {/* ─── App Preview ────────────────────────────────────────────── */}
      <View
        style={[
          styles.previewSection,
          { paddingHorizontal: containerPadding, maxWidth: maxContentWidth },
        ]}
      >
        <View style={styles.mockupContainer}>
          <LinearGradient
            colors={["#1a1555", "#0b0f1a"]}
            style={styles.mockupScreen}
          >
            {/* Mini app mockup */}
            <View style={styles.mockupHeader}>
              <View style={styles.mockupAvatar} />
              <View>
                <View
                  style={[styles.mockupLine, { width: 100, marginBottom: 4 }]}
                />
                <View style={[styles.mockupLine, { width: 60, height: 6 }]} />
              </View>
            </View>
            <View style={styles.mockupCard}>
              <View style={styles.mockupCardHeader}>
                <Text style={{ fontSize: 24 }}>✈️</Text>
                <View>
                  <View
                    style={[styles.mockupLine, { width: 90, marginBottom: 4 }]}
                  />
                  <View style={[styles.mockupLine, { width: 50, height: 6 }]} />
                </View>
              </View>
              <View style={styles.mockupProgress}>
                <LinearGradient
                  colors={["#6c63ff", "#a78bfa"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.mockupProgressBar, { width: "65%" }]}
                />
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <View style={[styles.mockupLine, { width: 60, height: 6 }]} />
                <Text
                  style={{
                    fontSize: 11,
                    color: Colors.accent2,
                    fontWeight: "700",
                  }}
                >
                  65%
                </Text>
              </View>
            </View>
            <View style={styles.mockupCard}>
              <View style={styles.mockupCardHeader}>
                <Text style={{ fontSize: 24 }}>🏠</Text>
                <View>
                  <View
                    style={[styles.mockupLine, { width: 80, marginBottom: 4 }]}
                  />
                  <View style={[styles.mockupLine, { width: 40, height: 6 }]} />
                </View>
              </View>
              <View style={styles.mockupProgress}>
                <LinearGradient
                  colors={["#22d3a0", "#059669"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.mockupProgressBar, { width: "42%" }]}
                />
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <View style={[styles.mockupLine, { width: 50, height: 6 }]} />
                <Text
                  style={{
                    fontSize: 11,
                    color: Colors.green,
                    fontWeight: "700",
                  }}
                >
                  42%
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>
      </View>

      {/* ─── Features ───────────────────────────────────────────────── */}
      <Animated.View
        style={[
          styles.featuresSection,
          {
            opacity: featuresOpacity,
            paddingHorizontal: containerPadding,
            maxWidth: maxContentWidth,
          },
        ]}
      >
        <Text style={[styles.sectionTag]}>{t("landingFeaturesTag", lang)}</Text>
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
          {features.map((f, i) => (
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

      {/* ─── Download Section ───────────────────────────────────────── */}
      <Animated.View
        style={[
          styles.downloadSection,
          {
            opacity: downloadOpacity,
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
          {/* Android */}
          <TouchableOpacity
            style={styles.downloadCard}
            onPress={() => Linking.openURL(DOWNLOAD_LINKS.apk)}
            activeOpacity={0.85}
          >
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
            <View style={styles.downloadBtnOutline}>
              <Ionicons
                name="download-outline"
                size={16}
                color={Colors.green}
              />
              <Text style={[styles.downloadBtnText, { color: Colors.green }]}>
                {t("landingDownloadAPK", lang)}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Web / PC */}
          <TouchableOpacity
            style={styles.downloadCard}
            onPress={onOpenApp}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={["#6c63ff", "#a78bfa"]}
              style={styles.downloadIconBg}
            >
              <Ionicons name="desktop-outline" size={28} color="#FFF" />
            </LinearGradient>
            <Text style={styles.downloadPlatform}>Web App</Text>
            <Text style={styles.downloadDesc}>
              {t("landingDownloadWebDesc", lang)}
            </Text>
            <View style={styles.downloadBtnOutline}>
              <Ionicons name="open-outline" size={16} color={Colors.accent2} />
              <Text style={[styles.downloadBtnText, { color: Colors.accent2 }]}>
                {t("landingOpenWebApp", lang)}
              </Text>
            </View>
          </TouchableOpacity>

          {/* iPhone — via web */}
          <TouchableOpacity
            style={styles.downloadCard}
            onPress={onOpenApp}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={["#a78bfa", "#6c63ff"]}
              style={styles.downloadIconBg}
            >
              <Ionicons name="phone-portrait-outline" size={28} color="#FFF" />
            </LinearGradient>
            <Text style={styles.downloadPlatform}>iPhone</Text>
            <Text style={styles.downloadDesc}>
              {t("landingDownloadIphoneDesc", lang)}
            </Text>
            <View style={styles.downloadBtnOutline}>
              <Ionicons name="open-outline" size={16} color={Colors.accent2} />
              <Text style={[styles.downloadBtnText, { color: Colors.accent2 }]}>
                {t("landingOpenWebApp", lang)}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* ─── CTA Section ────────────────────────────────────────────── */}
      <View
        style={[
          styles.ctaSection,
          { paddingHorizontal: containerPadding, maxWidth: maxContentWidth },
        ]}
      >
        <LinearGradient colors={["#1a1555", "#141929"]} style={styles.ctaCard}>
          <Ionicons name="rocket" size={40} color={Colors.accent2} />
          <Text
            style={[
              styles.ctaTitle,
              isDesktop && { fontSize: 28, lineHeight: 36 },
            ]}
          >
            {t("landingCtaTitle", lang)}
          </Text>
          <Text style={styles.ctaSubtitle}>
            {t("landingCtaSubtitle", lang)}
          </Text>
          <TouchableOpacity
            style={styles.ctaBtn}
            onPress={onOpenApp}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={["#6c63ff", "#a78bfa"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.ctaBtnGradient}
            >
              <Text style={styles.ctaBtnText}>
                {t("landingCtaButton", lang)}
              </Text>
              <Ionicons name="arrow-forward" size={18} color="#FFF" />
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      </View>

      {/* ─── Footer ─────────────────────────────────────────────────── */}
      <View
        style={[
          styles.footer,
          { paddingHorizontal: containerPadding, maxWidth: maxContentWidth },
        ]}
      >
        <View style={styles.footerBrand}>
          <View style={styles.navLogoCircle}>
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
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
}) {
  return (
    <View style={styles.statBadge}>
      <Ionicons name={icon} size={16} color={color} />
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },

  // Navbar
  navbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surface3,
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
    backgroundColor: Colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  navTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: Colors.text,
    letterSpacing: -0.3,
  },
  navCta: {
    backgroundColor: Colors.surface2,
    borderRadius: Radius.sm,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.surface3,
  },
  navCtaText: {
    fontSize: FontSize.sm,
    fontWeight: "700",
    color: Colors.text,
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
    color: Colors.accent2,
  },
  heroTitle: {
    fontSize: 38,
    fontWeight: "900",
    color: Colors.text,
    textAlign: "center",
    lineHeight: 46,
    letterSpacing: -1,
    marginBottom: 16,
  },
  heroTitleAccent: {
    color: Colors.accent2,
  },
  heroSubtitle: {
    fontSize: 16,
    color: Colors.text2,
    textAlign: "center",
    lineHeight: 26,
    maxWidth: 480,
    marginBottom: 32,
  },
  heroBtns: {
    gap: 12,
    width: "100%",
    maxWidth: 400,
    marginBottom: 40,
  },
  primaryBtn: {
    borderRadius: Radius.md,
    overflow: "hidden",
  },
  primaryBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: Radius.md,
  },
  primaryBtnText: {
    fontSize: FontSize.md,
    fontWeight: "800",
    color: "#FFF",
  },
  secondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.surface3,
  },
  secondaryBtnText: {
    fontSize: FontSize.md,
    fontWeight: "700",
    color: Colors.text,
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
    backgroundColor: Colors.surface,
    borderRadius: Radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.surface3,
  },
  statLabel: {
    fontSize: FontSize.xs,
    fontWeight: "600",
    color: Colors.text2,
  },

  // Preview
  previewSection: {
    width: "100%",
    alignItems: "center",
    paddingVertical: 20,
  },
  mockupContainer: {
    width: 260,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: Colors.surface3,
    // Shadow
    shadowColor: "#6c63ff",
    shadowOpacity: 0.2,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 10 },
    elevation: 20,
  },
  mockupScreen: {
    padding: 16,
    paddingTop: 24,
    gap: 12,
  },
  mockupHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  mockupAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface3,
  },
  mockupLine: {
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.surface3,
  },
  mockupCard: {
    backgroundColor: Colors.surface2,
    borderRadius: 12,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.surface3,
  },
  mockupCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  mockupProgress: {
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.surface3,
    overflow: "hidden",
  },
  mockupProgressBar: {
    height: "100%",
    borderRadius: 3,
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
    color: Colors.accent2,
    textTransform: "uppercase",
    letterSpacing: 2,
    textAlign: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: Colors.text,
    textAlign: "center",
    lineHeight: 34,
    letterSpacing: -0.5,
    marginBottom: 32,
  },
  featuresGrid: {
    gap: 12,
  },
  featureCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.surface3,
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
    color: Colors.text,
  },
  featureDesc: {
    fontSize: FontSize.sm,
    color: Colors.text2,
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
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: 20,
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.surface3,
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
    color: Colors.text,
  },
  downloadDesc: {
    fontSize: FontSize.sm,
    color: Colors.text2,
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
    borderColor: Colors.surface3,
    marginTop: 4,
  },
  downloadBtnText: {
    fontSize: FontSize.sm,
    fontWeight: "700",
  },

  // CTA
  ctaSection: {
    width: "100%",
    paddingVertical: 20,
  },
  ctaCard: {
    borderRadius: Radius.xl,
    padding: 32,
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.surface3,
  },
  ctaTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: Colors.text,
    textAlign: "center",
    lineHeight: 30,
  },
  ctaSubtitle: {
    fontSize: FontSize.base,
    color: Colors.text2,
    textAlign: "center",
    marginBottom: 8,
  },
  ctaBtn: {
    borderRadius: Radius.md,
    overflow: "hidden",
  },
  ctaBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: Radius.md,
  },
  ctaBtnText: {
    fontSize: FontSize.md,
    fontWeight: "800",
    color: "#FFF",
  },

  // Footer
  footer: {
    width: "100%",
    paddingVertical: 24,
    borderTopWidth: 1,
    borderTopColor: Colors.surface3,
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
    color: Colors.text,
  },
  footerText: {
    fontSize: FontSize.xs,
    color: Colors.text3,
    textAlign: "center",
  },
});
