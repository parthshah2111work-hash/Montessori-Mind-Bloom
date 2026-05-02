import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BRAIN_FOODS, DAILY_RHYTHM, getNutritionForAge } from "@/constants/data";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

type Tab = "meals" | "brainfoods" | "rhythm";

export default function NutritionScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { ageMonths, profile } = useApp();
  const [tab, setTab] = useState<Tab>("meals");

  const nutrition = getNutritionForAge(ageMonths);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Nourishment</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Personalised for {profile?.name ?? "your child"} · {nutrition.ageRange}
        </Text>

        <View style={[styles.tabBar, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
          {([
            { key: "meals", label: "Meal Plan" },
            { key: "brainfoods", label: "Brain Foods" },
            { key: "rhythm", label: "Daily Rhythm" },
          ] as { key: Tab; label: string }[]).map((t) => (
            <Pressable
              key={t.key}
              onPress={() => setTab(t.key)}
              style={[
                styles.tabItem,
                tab === t.key && { backgroundColor: colors.card, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
              ]}
            >
              <Text style={[styles.tabText, { color: tab === t.key ? colors.foreground : colors.mutedForeground }]}>
                {t.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: Platform.OS === "web" ? 100 : insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {tab === "meals" && (
          <>
            <View style={[styles.ageBanner, { backgroundColor: colors.primary + "12", borderColor: colors.primary + "30" }]}>
              <Ionicons name="nutrition-outline" size={16} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.ageBannerTitle, { color: colors.primary }]}>{nutrition.title}</Text>
                <Text style={[styles.ageBannerNote, { color: colors.primary + "cc" }]}>{nutrition.note}</Text>
              </View>
            </View>

            {nutrition.meals.map((meal, i) => (
              <View key={i} style={[styles.mealCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.mealHeader}>
                  <View style={[styles.timeBadge, { backgroundColor: colors.primary + "18" }]}>
                    <Text style={[styles.mealTime, { color: colors.primary }]}>{meal.time}</Text>
                  </View>
                  <Text style={[styles.mealType, { color: colors.mutedForeground }]}>{meal.focus}</Text>
                </View>
                <Text style={[styles.mealName, { color: colors.foreground }]}>{meal.meal}</Text>
                <View style={styles.mealOptions}>
                  {meal.options.map((opt, j) => (
                    <View key={j} style={[styles.mealOption, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                      <Text style={[styles.mealOptionText, { color: colors.foreground }]}>{opt}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}

            {nutrition.avoids && nutrition.avoids.length > 0 && (
              <View style={[styles.avoidCard, { backgroundColor: colors.destructive + "0d", borderColor: colors.destructive + "20" }]}>
                <View style={styles.avoidHeader}>
                  <Ionicons name="warning-outline" size={14} color={colors.destructive} />
                  <Text style={[styles.avoidTitle, { color: colors.destructive }]}>Avoid at This Stage</Text>
                </View>
                <Text style={[styles.avoidText, { color: colors.mutedForeground }]}>
                  {nutrition.avoids.join(" · ")}
                </Text>
              </View>
            )}
          </>
        )}

        {tab === "brainfoods" && (
          <>
            <View style={[styles.infoCard, { backgroundColor: colors.cognitive + "15", borderColor: colors.cognitive + "30" }]}>
              <Ionicons name="flash-outline" size={16} color={colors.cognitive} />
              <Text style={[styles.infoText, { color: colors.cognitive }]}>
                These nutrients directly support brain development at {ageMonths} months. Prioritise them every single day.
              </Text>
            </View>

            {(nutrition.brainFoods ?? []).map((bf, i) => (
              <View key={i} style={[styles.brainFoodItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Ionicons name="leaf" size={14} color={colors.primary} />
                <Text style={[styles.brainFoodText, { color: colors.foreground }]}>{bf}</Text>
              </View>
            ))}

            <View style={styles.sectionDivider}>
              <Text style={[styles.sectionDividerText, { color: colors.mutedForeground }]}>All age brain nutrients</Text>
            </View>

            {BRAIN_FOODS.map((bf, i) => (
              <View key={i} style={[styles.brainFoodCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.brainFoodHeader}>
                  <View style={[styles.nutrientBadge, { backgroundColor: colors.cognitive + "20" }]}>
                    <Text style={[styles.nutrientName, { color: colors.cognitive }]}>{bf.nutrient}</Text>
                  </View>
                  <Text style={[styles.nutrientBenefit, { color: colors.mutedForeground }]}>{bf.benefit}</Text>
                </View>
                <View style={styles.sourcesList}>
                  {bf.sources.map((s, j) => (
                    <View key={j} style={[styles.source, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                      <Text style={[styles.sourceText, { color: colors.foreground }]}>{s}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}

            <View style={[styles.gheeCard, { backgroundColor: colors.accent + "15", borderColor: colors.accent + "30" }]}>
              <Text style={[styles.gheeTitle, { color: colors.accent }]}>The Ghee Rule</Text>
              <Text style={[styles.gheeText, { color: colors.mutedForeground }]}>
                1–2 teaspoons of ghee daily provides essential brain fats for myelination — the coating of neural pathways that enables faster thinking. It is not optional; it is architecture.
              </Text>
            </View>
          </>
        )}

        {tab === "rhythm" && (
          <>
            <View style={[styles.infoCard, { backgroundColor: colors.lavender + "20", borderColor: colors.lavender + "35" }]}>
              <Ionicons name="time-outline" size={16} color={colors.lavender} />
              <Text style={[styles.infoText, { color: colors.lavender }]}>
                Predictability reduces toddler anxiety and facilitates deep learning. Consistency in rhythm is emotional security.
              </Text>
            </View>
            {DAILY_RHYTHM.map((r, i) => (
              <View key={i} style={[styles.rhythmCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.rhythmTime, { backgroundColor: colors.primary + "12" }]}>
                  <Text style={[styles.rhythmTimeText, { color: colors.primary }]}>{r.time}</Text>
                </View>
                <View style={styles.rhythmContent}>
                  <Text style={[styles.rhythmActivity, { color: colors.foreground }]}>{r.activity}</Text>
                  <Text style={[styles.rhythmNote, { color: colors.mutedForeground }]}>{r.note}</Text>
                </View>
              </View>
            ))}
            <View style={[styles.sleepCard, { backgroundColor: colors.lavender + "15", borderColor: colors.lavender + "30" }]}>
              <Text style={[styles.sleepTitle, { color: colors.lavender }]}>The Sacred Nap</Text>
              <Text style={[styles.sleepText, { color: colors.mutedForeground }]}>
                11–14 hours of total sleep (including nap) is non-negotiable. Growth hormones release primarily during deep sleep. The nap is not optional — it is when the brain processes and consolidates the morning's learning.
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 8 },
  title: { fontSize: 28, fontFamily: "Inter_700Bold", letterSpacing: -0.8, marginBottom: 2 },
  subtitle: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 14 },
  tabBar: { flexDirection: "row", borderRadius: 12, padding: 4, borderWidth: 1, marginBottom: 4 },
  tabItem: { flex: 1, paddingVertical: 8, alignItems: "center", borderRadius: 9 },
  tabText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  content: { paddingHorizontal: 20, paddingTop: 12, gap: 12 },
  ageBanner: { flexDirection: "row", gap: 10, padding: 14, borderRadius: 12, borderWidth: 1, alignItems: "flex-start" },
  ageBannerTitle: { fontSize: 14, fontFamily: "Inter_700Bold", marginBottom: 3 },
  ageBannerNote: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 17 },
  infoCard: { flexDirection: "row", gap: 10, padding: 14, borderRadius: 12, borderWidth: 1, alignItems: "flex-start" },
  infoText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19, fontStyle: "italic" },
  mealCard: { padding: 16, borderRadius: 16, borderWidth: 1, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  mealHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 6 },
  timeBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
  mealTime: { fontSize: 12, fontFamily: "Inter_700Bold" },
  mealType: { fontSize: 11, fontFamily: "Inter_400Regular", flex: 1 },
  mealName: { fontSize: 16, fontFamily: "Inter_700Bold", marginBottom: 10, letterSpacing: -0.2 },
  mealOptions: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  mealOption: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  mealOptionText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  avoidCard: { padding: 14, borderRadius: 12, borderWidth: 1 },
  avoidHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 },
  avoidTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  avoidText: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18 },
  brainFoodItem: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 10, borderWidth: 1 },
  brainFoodText: { fontSize: 14, fontFamily: "Inter_400Regular", flex: 1 },
  sectionDivider: { alignItems: "center", paddingVertical: 4 },
  sectionDividerText: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 0.5, textTransform: "uppercase" },
  brainFoodCard: { padding: 16, borderRadius: 16, borderWidth: 1, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  brainFoodHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  nutrientBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  nutrientName: { fontSize: 12, fontFamily: "Inter_700Bold", letterSpacing: 0.2 },
  nutrientBenefit: { fontSize: 12, fontFamily: "Inter_400Regular", flex: 1 },
  sourcesList: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  source: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  sourceText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  gheeCard: { padding: 16, borderRadius: 14, borderWidth: 1 },
  gheeTitle: { fontSize: 15, fontFamily: "Inter_700Bold", marginBottom: 6 },
  gheeText: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19, fontStyle: "italic" },
  rhythmCard: { flexDirection: "row", gap: 12, padding: 14, borderRadius: 14, borderWidth: 1, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  rhythmTime: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, alignSelf: "flex-start", minWidth: 72, alignItems: "center" },
  rhythmTimeText: { fontSize: 12, fontFamily: "Inter_700Bold" },
  rhythmContent: { flex: 1 },
  rhythmActivity: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 3 },
  rhythmNote: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 17, fontStyle: "italic" },
  sleepCard: { padding: 16, borderRadius: 14, borderWidth: 1 },
  sleepTitle: { fontSize: 15, fontFamily: "Inter_700Bold", marginBottom: 6 },
  sleepText: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19 },
  lavender: { color: "#8b7db5" },
});
