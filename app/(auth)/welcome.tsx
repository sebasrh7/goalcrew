import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AlertModal } from "../../src/components/AlertModal";
import { LandingPage } from "../../src/components/LandingPage";
import { Button } from "../../src/components/UI";
import {
  FontSize,
  Spacing,
  getErrorMessage,
} from "../../src/constants";
import { getCurrentLanguage, t } from "../../src/lib/i18n";
import { useColors } from "../../src/lib/useColors";
import { supabase } from "../../src/lib/supabase";
import { useAuthStore } from "../../src/store/authStore";

const { width } = Dimensions.get("window");

function getSlides() {
  const lang = getCurrentLanguage();
  return [
    {
      id: "1",
      icon: "people",
      title: t("welcomeTitle1", lang),
      description: t("welcomeDesc1", lang),
      highlight:
        lang === "en"
          ? "your crew"
          : lang === "fr"
            ? "votre équipe"
            : "tu crew",
    },
    {
      id: "2",
      icon: "wallet",
      title: t("welcomeTitle2", lang),
      description: t("welcomeDesc2", lang),
      highlight:
        lang === "en" ? "together" : lang === "fr" ? "ensemble" : "juntos",
    },
    {
      id: "3",
      icon: "trophy",
      title: t("welcomeTitle3", lang),
      description: t("welcomeDesc3", lang),
      highlight:
        lang === "en" ? "achievement" : lang === "fr" ? "réussite" : "logro",
    },
  ];
}

export default function WelcomeScreen() {
  const C = useColors();
  const router = useRouter();
  const { signIn } = useAuthStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const lang = getCurrentLanguage();
  const SLIDES = getSlides();
  const [showLanding, setShowLanding] = useState(Platform.OS === "web");
  const styles = useMemo(() => createStyles(C), [C]);

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

  const dismissAlert = () =>
    setAlertModal((prev) => ({ ...prev, visible: false }));

  const scrollToSlide = useCallback((index: number, animated = true) => {
    scrollRef.current?.scrollTo({ x: index * width, animated });
    setCurrentIndex(index);
  }, []);

  const goNext = async () => {
    if (currentIndex < SLIDES.length - 1) {
      scrollToSlide(currentIndex + 1);
    } else {
      try {
        await signIn();

        // On web, signInWithOAuth redirects the browser to Google.
        // Navigation is handled by initAuthListener when the user returns.
        if (Platform.OS !== "web") {
          await new Promise((resolve) => setTimeout(resolve, 500));
          router.replace("/(tabs)");
        }
      } catch (error: unknown) {
        // Check if user was actually created but session failed
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) {
          router.replace("/(tabs)");
          return;
        }

        setAlertModal({
          visible: true,
          title: t("loginError", lang),
          message: getErrorMessage(error) || t("loginErrorMsg", lang),
          icon: "alert-circle",
          iconColor: C.red,
          buttons: [
            {
              text: t("retry", lang),
              onPress: () => {
                dismissAlert();
                goNext();
              },
            },
            { text: t("cancel", lang), onPress: dismissAlert, style: "cancel" },
          ],
        });
      }
    }
  };

  return (
    <>
      {showLanding && Platform.OS === "web" ? (
        <LandingPage onOpenApp={() => setShowLanding(false)} />
      ) : (
        <SafeAreaView style={styles.container}>
          <LinearGradient
            colors={C.gradientHero as any}
            style={StyleSheet.absoluteFill}
          />

          {/* Logo */}
          <View style={styles.logo}>
            <Text style={styles.logoText}>GoalCrew</Text>
          </View>

          {/* Slides */}
          <Animated.ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: false },
            )}
            onMomentumScrollEnd={(e: any) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setCurrentIndex(index);
            }}
            style={{ flexGrow: 0 }}
          >
            {SLIDES.map((item) => {
              const titleParts = item.title.split(item.highlight);
              return (
                <View key={item.id} style={styles.slide}>
                  <Ionicons
                    name={item.icon as any}
                    size={64}
                    color="#6c63ff"
                    style={styles.icon}
                  />
                  <Text style={styles.title}>
                    {titleParts[0]}
                    <Text style={styles.titleHighlight}>{item.highlight}</Text>
                    {titleParts[1]}
                  </Text>
                  <Text style={styles.description}>{item.description}</Text>
                </View>
              );
            })}
          </Animated.ScrollView>

          {/* Dots */}
          <View style={styles.dots}>
            {SLIDES.map((_, i) => {
              const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
              const dotWidth = scrollX.interpolate({
                inputRange,
                outputRange: [8, 24, 8],
                extrapolate: "clamp",
              });
              const opacity = scrollX.interpolate({
                inputRange,
                outputRange: [0.4, 1, 0.4],
                extrapolate: "clamp",
              });

              return (
                <Animated.View
                  key={i}
                  style={[styles.dot, { width: dotWidth, opacity }]}
                />
              );
            })}
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <Button
              title={
                currentIndex === SLIDES.length - 1
                  ? t("continueWithGoogle", lang)
                  : t("continueBtn", lang)
              }
              onPress={goNext}
            />
            {currentIndex < SLIDES.length - 1 && (
              <TouchableOpacity
                style={styles.skipBtn}
                onPress={() => {
                  scrollToSlide(SLIDES.length - 1);
                }}
              >
                <Text style={styles.skipText}>{t("skip", lang)}</Text>
              </TouchableOpacity>
            )}
          </View>

          <AlertModal
            visible={alertModal.visible}
            title={alertModal.title}
            message={alertModal.message}
            icon={alertModal.icon as keyof typeof Ionicons.glyphMap}
            iconColor={alertModal.iconColor}
            onDismiss={dismissAlert}
            buttons={
              alertModal.buttons ?? [
                { text: t("ok", lang), onPress: dismissAlert },
              ]
            }
          />
        </SafeAreaView>
      )}
    </>
  );
}

const createStyles = (C: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  logo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  logoText: {
    fontSize: 20,
    fontWeight: "900",
    color: C.text,
  },
  slide: {
    width,
    paddingHorizontal: Spacing.xxl,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: Spacing.xl,
  },
  icon: {
    marginBottom: Spacing.xxl,
  },
  title: {
    fontSize: FontSize.display,
    fontWeight: "900",
    color: C.text,
    textAlign: "center",
    lineHeight: 40,
    marginBottom: Spacing.lg,
    letterSpacing: -0.5,
  },
  titleHighlight: {
    color: C.accent2,
  },
  description: {
    fontSize: FontSize.md,
    color: C.text2,
    textAlign: "center",
    lineHeight: 24,
  },
  dots: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    marginVertical: Spacing.xl,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: C.accent,
  },
  actions: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxl,
    gap: Spacing.md,
  },
  skipBtn: {
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  skipText: {
    fontSize: FontSize.base,
    color: C.text2,
  },
});
