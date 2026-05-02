import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ActivityCard } from "@/components/ActivityCard";
import { DAILY_RHYTHM, Pillar, PHASE_INFO, getPhaseForAge, PILLAR_LABELS } from "@/constants/data";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

function PillarProgress({ pillar, value }: { pillar: Pillar; value: number }) {
  const colors = useColors();
  const colorMap: Record<Pillar, string> = {
    cognitive: colors.cognitive,
    language: colors.language,
    physical: colors.physical,
    socialEmotional: colors.socialEmotional,
    creative: colors.creative,
  };
  const color = colorMap[pillar];
  return (
    <View style={styles.pillarRow}>
      <View style={[styles.pillarDot, { backgroundColor: color }]} />
      <View style={styles.pillarLabelContainer}>
        <Text style={[styles.pillarLabel, { color: colors.foreground }]}>{PILLAR_LABELS[pillar]}</Text>
      </View>
      <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
        <View style={[styles.progressFill, { backgroundColor: color, width: `${value}%` }]} />
      </View>
    </View>
  );
}

function formatAge(ageMonths: number): string {
  if (ageMonths < 12) return `${ageMonths} month${ageMonths === 1 ? "" : "s"}`;
  const y = Math.floor(ageMonths / 12);
  const m = ageMonths % 12;
  if (m === 0) return `${y} year${y === 1 ? "" : "s"}`;
  return `${y}y ${m}m`;
}

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { profile, ageMonths, todayQuests, completedActivityIds, journalEntries } = useApp();
  const router = useRouter();

  const completedToday = todayQuests.filter((a) => completedActivityIds.includes(a.id)).length;
  const progressPct = todayQuests.length > 0 ? (completedToday / todayQuests.length) * 100 : 0;

  const phase = getPhaseForAge(ageMonths);
  const phaseInfo = PHASE_INFO[phase];

  const now = new Date();
  const currentHour = now.getHours();
  const currentActivity = DAILY_RHYTHM.find((r, i) => {
    const [h] = r.time.split(":").map(Number);
    const next = DAILY_RHYTHM[i + 1];
    const nextH = next ? parseInt(next.time.split(":")[0]) : 24;
    return currentHour >= h && currentHour < nextH;
  });

  const greeting = currentHour < 12 ? "Good morning" : currentHour < 17 ? "Good afternoon" : "Good evening";
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const pillarValues: Record<Pillar, number> = {
    cognitive: Math.min(100, completedActivityIds.filter((id) => {
      const q = todayQuests.find((a) => a.id === id);
      return q?.pillars.includes("cognitive");
    }).length * 25 + 40),
    language: Math.min(100, completedActivityIds.length * 8 + 35),
    physical: Math.min(100, completedActivityIds.length * 10 + 30),
    socialEmotional: Math.min(100, journalEntries.length * 15 + 25),
    creative: Math.min(100, completedActivityIds.length * 7 + 20),
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 100 : insets.bottom + 100 }}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={[colors.primary + "18", colors.background]}
        style={[styles.header, { paddingTop: topPad + 16 }]}
      >
        <View style={styles.headerContent}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.greeting, { color: colors.mutedForeground }]}>{greeting}</Text>
            <Text style={[styles.childName, { color: colors.foreground }]}>
              {profile?.name ?? "Welcome"}'s Day
            </Text>
            <Text style={[styles.ageTag, { color: colors.primary }]}>
              {formatAge(ageMonths)} · {phaseInfo.label}
            </Text>
          </View>
          <Pressable
            onPress={() => router.push("/(tabs)/profile")}
            style={[styles.profileButton, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.profileInitial}>{profile?.name?.charAt(0) ?? "?"}</Text>
          </Pressable>
        </View>

        <View style={[styles.phaseCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.phaseCardHeader}>
            <View style={[styles.phaseDot, { backgroundColor: colors.primary }]} />
            <Text style={[styles.phaseLabel, { color: colors.mutedForeground }]}>Current Phase · {phaseInfo.range}</Text>
          </View>
          <Text style={[styles.phaseName, { color: colors.foreground }]}>{phaseInfo.label}</Text>
          <Text style={[styles.phaseDesc, { color: colors.mutedForeground }]}>{phaseInfo.theme}</Text>
          <View style={[styles.phaseProgress, { backgroundColor: colors.border }]}>
            <View
              style={[
                styles.phaseProgressFill,
                {
                  backgroundColor: colors.primary,
                  width: `${Math.min(100, ((ageMonths - phaseInfo.minMonths) / (phaseInfo.maxMonths - phaseInfo.minMonths)) * 100)}%`,
                },
              ]}
            />
          </View>
          <Text style={[styles.phaseProgressLabel, { color: colors.mutedForeground }]}>
            {Math.max(0, phaseInfo.maxMonths - ageMonths)} months remaining in this phase
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {currentActivity && (
          <View style={[styles.nowCard, { backgroundColor: colors.accent + "1a", borderColor: colors.accent + "40" }]}>
            <View style={styles.nowHeader}>
              <Ionicons name="time" size={14} color={colors.accent} />
              <Text style={[styles.nowLabel, { color: colors.accent }]}>Right Now · {currentActivity.time}</Text>
            </View>
            <Text style={[styles.nowActivity, { color: colors.foreground }]}>{currentActivity.activity}</Text>
            <Text style={[styles.nowNote, { color: colors.mutedForeground }]}>{currentActivity.note}</Text>
          </View>
        )}

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Today's Bonding Quests</Text>
          <View style={[styles.questBadge, { backgroundColor: colors.primary + "1a" }]}>
            <Text style={[styles.questCount, { color: colors.primary }]}>{completedToday}/{todayQuests.length}</Text>
          </View>
        </View>

        <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
          <View style={[styles.progressFill, { backgroundColor: colors.primary, width: `${progressPct}%` }]} />
        </View>

        {todayQuests.length > 0 ? (
          todayQuests.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} showComplete />
          ))
        ) : (
          <View style={[styles.emptyQuests, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.emptyQuestsText, { color: colors.mutedForeground }]}>
              Activities are loading for {phaseInfo.label}...
            </Text>
          </View>
        )}

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>5 Pillars Progress</Text>
        </View>

        <View style={[styles.pillarsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {(["cognitive", "language", "physical", "socialEmotional", "creative"] as Pillar[]).map((p) => (
            <PillarProgress key={p} pillar={p} value={pillarValues[p]} />
          ))}
        </View>

        <View style={styles.quickActions}>
          <Pressable
            onPress={() => router.push("/(tabs)/activities")}
            style={[styles.actionCard, { backgroundColor: colors.primary + "12", borderColor: colors.primary + "25" }]}
          >
            <Ionicons name="leaf-outline" size={20} color={colors.primary} />
            <Text style={[styles.actionText, { color: colors.primary }]}>All Activities</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push("/(tabs)/journal")}
            style={[styles.actionCard, { backgroundColor: colors.accent + "15", borderColor: colors.accent + "30" }]}
          >
            <Ionicons name="book-outline" size={20} color={colors.accent} />
            <Text style={[styles.actionText, { color: colors.accent }]}>Growth Journal</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push("/(tabs)/milestones")}
            style={[styles.actionCard, { backgroundColor: colors.cognitive + "12", borderColor: colors.cognitive + "25" }]}
          >
            <Ionicons name="checkmark-circle-outline" size={20} color={colors.cognitive} />
            <Text style={[styles.actionText, { color: colors.cognitive }]}>Milestones</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 16 },
  headerContent: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  greeting: { fontSize: 14, fontFamily: "Inter_400Regular", marginBottom: 2 },
  childName: { fontSize: 28, fontFamily: "Inter_700Bold", letterSpacing: -0.8, marginBottom: 4 },
  ageTag: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  profileButton: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  profileInitial: { color: "#fff", fontSize: 18, fontFamily: "Inter_700Bold" },
  phaseCard: { padding: 14, borderRadius: 14, borderWidth: 1, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  phaseCardHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  phaseDot: { width: 6, height: 6, borderRadius: 3 },
  phaseLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 0.5, textTransform: "uppercase" },
  phaseName: { fontSize: 18, fontFamily: "Inter_700Bold", letterSpacing: -0.3, marginBottom: 2 },
  phaseDesc: { fontSize: 13, fontFamily: "Inter_400Regular", fontStyle: "italic", marginBottom: 10 },
  phaseProgress: { height: 4, borderRadius: 2, overflow: "hidden", marginBottom: 6 },
  phaseProgressFill: { height: 4, borderRadius: 2 },
  phaseProgressLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  content: { paddingHorizontal: 20 },
  nowCard: { padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 20 },
  nowHeader: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 4 },
  nowLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 0.5, textTransform: "uppercase" },
  nowActivity: { fontSize: 15, fontFamily: "Inter_700Bold", marginBottom: 4, letterSpacing: -0.2 },
  nowNote: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 17, fontStyle: "italic" },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12, marginTop: 4 },
  sectionTitle: { fontSize: 20, fontFamily: "Inter_700Bold", letterSpacing: -0.4 },
  questBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  questCount: { fontSize: 12, fontFamily: "Inter_700Bold" },
  progressBar: { height: 4, borderRadius: 2, marginBottom: 16, overflow: "hidden" },
  progressFill: { height: 4, borderRadius: 2 },
  emptyQuests: { padding: 20, borderRadius: 14, borderWidth: 1, alignItems: "center", marginBottom: 16 },
  emptyQuestsText: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center" },
  pillarsCard: { padding: 16, borderRadius: 16, borderWidth: 1, gap: 12, marginBottom: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  pillarRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  pillarDot: { width: 8, height: 8, borderRadius: 4 },
  pillarLabelContainer: { width: 115 },
  pillarLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  progressTrack: { flex: 1, height: 5, borderRadius: 3, overflow: "hidden" },
  quickActions: { flexDirection: "row", gap: 10, marginBottom: 8 },
  actionCard: { flex: 1, padding: 14, borderRadius: 14, borderWidth: 1, alignItems: "center", gap: 6 },
  actionText: { fontSize: 11, fontFamily: "Inter_600SemiBold", textAlign: "center" },
});
