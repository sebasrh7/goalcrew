import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../src/components/UI";
import { Colors, FontSize, Spacing } from "../../src/constants";
import { getCurrentLanguage, t } from "../../src/lib/i18n";
import { supabase } from "../../src/lib/supabase";
import { useAuthStore } from "../../src/store/authStore";

const { width } = Dimensions.get("window");

function getSlides() {
  const lang = getCurrentLanguage();
  return [
    {
      id: "1",
      icon: "airplane",
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
      icon: "trending-up",
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
  const router = useRouter();
  const { signIn } = useAuthStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const lang = getCurrentLanguage();
  const SLIDES = getSlides();

  const goNext = async () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      try {
        await signIn();

        // Give a moment for state to update
        await new Promise((resolve) => setTimeout(resolve, 500));

        router.replace("/(tabs)");
      } catch (error: any) {
        // Check if user was actually created but session failed
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) {
          router.replace("/(tabs)");
          return;
        }

        Alert.alert(
          t("loginError", lang),
          error.message || t("loginErrorMsg", lang),
          [
            { text: t("retry", lang), onPress: goNext },
            { text: t("cancel", lang), style: "cancel" },
          ],
        );
      }
    }
  };

  const renderSlide = ({ item }: { item: (typeof SLIDES)[0] }) => {
    const titleParts = item.title.split(item.highlight);

    return (
      <View style={styles.slide}>
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
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#1a1555", "#0b0f1a"]}
        style={StyleSheet.absoluteFill}
      />

      {/* Logo */}
      <View style={styles.logo}>
        <Text style={styles.logoText}>GoalCrew</Text>
        <View style={styles.logoBadge}>
          <Text style={styles.logoBadgeText}>MVP</Text>
        </View>
      </View>

      {/* Slides */}
      <Animated.FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false },
        )}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        style={{ flexGrow: 0 }}
      />

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
            onPress={() => setCurrentIndex(SLIDES.length - 1)}
          >
            <Text style={styles.skipText}>{t("skip", lang)}</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
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
    color: Colors.text,
  },
  logoBadge: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  logoBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#fff",
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
    color: Colors.text,
    textAlign: "center",
    lineHeight: 40,
    marginBottom: Spacing.lg,
    letterSpacing: -0.5,
  },
  titleHighlight: {
    color: Colors.accent2,
  },
  description: {
    fontSize: FontSize.md,
    color: Colors.text2,
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
    backgroundColor: Colors.accent,
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
    color: Colors.text2,
  },
});
