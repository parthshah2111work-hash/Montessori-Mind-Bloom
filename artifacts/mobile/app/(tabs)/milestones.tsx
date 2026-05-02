import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MILESTONES, Pillar, PILLAR_LABELS } from "@/constants/data";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

type Domain = "physical" | "language" | "cognitive" | "socialEmotional" | "creative";

const DOMAIN_CONFIG: { key: Domain; label: string; pillar: Pillar; icon: string }[] = [
  { key: "physical", label: "Physical", pillar: "physical", icon: "barbell-outline" },
  { key: "language", label: "Language", pillar: "language", icon: "chatbubble-outline" },
  { key: "cognitive", label: "Cognitive", pillar: "cognitive", icon: "bulb-outline" },
  { key: "socialEmotional", label: "Social-Emotional", pillar: "socialEmotional", icon: "heart-outline" },
  { key: "creative", label: "Creative", pillar: "creative", icon: "color-palette-outline" },
];

function MilestoneItem({ text, milestoneKey }: { text: string; milestoneKey: string }) {
  const colors = useColors();
  const { masteredMilestones, toggleMilestone } = useApp();
  const mastered = masteredMilestones.includes(milestoneKey);

  const handlePress = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleMilestone(milestoneKey);
  };

  return (
    <Pressable onPress={handlePress} style={styles.milestoneItem}>
      <View
        style={[
          styles.checkbox,
          {
            borderColor: mastered ? colors.primary : colors.border,
            backgroundColor: mastered ? colors.primary : "transparent",
          },
        ]}
      >
        {mastered && <Ionicons name="checkmark" size={12} color="#fff" />}
      </View>
      <Text
        style={[
          styles.milestoneText,
          { color: mastered ? colors.mutedForeground : colors.foreground, textDecorationLine: mastered ? "line-through" : "none" },
        ]}
      >
        {text}
      </Text>
    </Pressable>
  );
}

export default function MilestonesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { profile, ageMonths, masteredMilestones } = useApp();
  const [activeDomain, setActiveDomain] = useState<Domain>("physical");

  const closestIdx = useMemo(() => {
    let best = 0;
    let bestDist = Infinity;
    MILESTONES.forEach((m, i) => {
      const d = Math.abs(m.month - ageMonths);
      if (d < bestDist) { bestDist = d; best = i; }
    });
    return best;
  }, [ageMonths]);

  const [selectedMonthIdx, setSelectedMonthIdx] = useState(closestIdx);

  useEffect(() => { setSelectedMonthIdx(closestIdx); }, [closestIdx]);

  const milestone = MILESTONES[selectedMonthIdx];
  const domainItems = (milestone as any)[activeDomain] as string[];

  const totalForMonth = DOMAIN_CONFIG.flatMap((d) => (milestone as any)[d.key] as string[]).length;
  const masteredForMonth = DOMAIN_CONFIG.flatMap((d) =>
    ((milestone as any)[d.key] as string[]).map((_: string, i: number) => `${milestone.id}-${d.key}-${i}`)
  ).filter((k) => masteredMilestones.includes(k)).length;

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const isCurrent = selectedMonthIdx === closestIdx;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Milestones</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Track {profile?.name ?? "your child"}'s developmental journey · 0–5 years
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 100 : insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.monthPicker}
        >
          {MILESTONES.map((m, idx) => {
            const isCurrent = idx === closestIdx;
            const isSelected = idx === selectedMonthIdx;
            return (
              <Pressable
                key={m.id}
                onPress={() => setSelectedMonthIdx(idx)}
                style={[
                  styles.monthChip,
                  {
                    backgroundColor: isSelected ? colors.primary : isCurrent ? colors.primary + "20" : colors.secondary,
                    borderColor: isSelected ? colors.primary : isCurrent ? colors.primary + "60" : colors.border,
                  },
                ]}
              >
                <Text style={[styles.monthChipText, { color: isSelected ? "#fff" : isCurrent ? colors.primary : colors.mutedForeground }]}>
                  {m.age}
                </Text>
                {isCurrent && !isSelected && (
                  <View style={[styles.currentDot, { backgroundColor: colors.primary }]} />
                )}
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.content}>
          {isCurrent && (
            <View style={[styles.currentBanner, { backgroundColor: colors.primary + "12", borderColor: colors.primary + "30" }]}>
              <Ionicons name="star" size={13} color={colors.primary} />
              <Text style={[styles.currentBannerText, { color: colors.primary }]}>
                This is {profile?.name ?? "your child"}'s current phase at {ageMonths} months
              </Text>
            </View>
          )}

          <View style={[styles.progressCard, { backgroundColor: colors.primary + "12", borderColor: colors.primary + "30" }]}>
            <Text style={[styles.progressTitle, { color: colors.primary }]}>
              {milestone.age} Progress
            </Text>
            <View style={styles.progressNumbers}>
              <Text style={[styles.progressMain, { color: colors.primary }]}>{masteredForMonth}</Text>
              <Text style={[styles.progressTotal, { color: colors.primary + "80" }]}>/{totalForMonth}</Text>
            </View>
            <Text style={[styles.progressLabel, { color: colors.primary }]}>milestones mastered</Text>
            <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: colors.primary,
                    width: totalForMonth > 0 ? `${(masteredForMonth / totalForMonth) * 100}%` : "0%",
                  },
                ]}
              />
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.domainTabs}>
            {DOMAIN_CONFIG.map((d) => {
              const isActive = activeDomain === d.key;
              const colorMap: Record<Pillar, string> = {
                cognitive: colors.cognitive,
                language: colors.language,
                physical: colors.physical,
                socialEmotional: colors.socialEmotional,
                creative: colors.creative,
              };
              const color = colorMap[d.pillar];
              return (
                <Pressable
                  key={d.key}
                  onPress={() => setActiveDomain(d.key)}
                  style={[
                    styles.domainTab,
                    {
                      backgroundColor: isActive ? color + "20" : colors.secondary,
                      borderColor: isActive ? color : colors.border,
                    },
                  ]}
                >
                  <Ionicons name={d.icon as any} size={14} color={isActive ? color : colors.mutedForeground} />
                  <Text style={[styles.domainTabText, { color: isActive ? color : colors.mutedForeground }]}>{d.label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={[styles.milestoneList, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {domainItems.map((item, i) => {
              const key = `${milestone.id}-${activeDomain}-${i}`;
              return <MilestoneItem key={key} text={item} milestoneKey={key} />;
            })}
          </View>

          <View style={[styles.redFlagCard, { backgroundColor: colors.destructive + "0d", borderColor: colors.destructive + "25" }]}>
            <View style={styles.redFlagHeader}>
              <Ionicons name="alert-circle-outline" size={16} color={colors.destructive} />
              <Text style={[styles.redFlagTitle, { color: colors.destructive }]}>When to Consult</Text>
            </View>
            <Text style={[styles.redFlagText, { color: colors.mutedForeground }]}>
              If you notice a cluster of delays across multiple domains at {milestone.age}, speak with your developmental paediatrician. Early intervention is always the right choice — never too early, never overreacting.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, marginBottom: 4 },
  title: { fontSize: 28, fontFamily: "Inter_700Bold", letterSpacing: -0.8, marginBottom: 2 },
  subtitle: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 12 },
  monthPicker: { paddingHorizontal: 20, paddingBottom: 12, gap: 8 },
  monthChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, flexDirection: "row", alignItems: "center", gap: 4 },
  monthChipText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  currentDot: { width: 5, height: 5, borderRadius: 3 },
  content: { paddingHorizontal: 20 },
  currentBanner: { flexDirection: "row", alignItems: "center", gap: 6, padding: 10, borderRadius: 10, borderWidth: 1, marginBottom: 12 },
  currentBannerText: { fontSize: 12, fontFamily: "Inter_600SemiBold", flex: 1 },
  progressCard: { padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 16 },
  progressTitle: { fontSize: 12, fontFamily: "Inter_600SemiBold", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 4 },
  progressNumbers: { flexDirection: "row", alignItems: "baseline", gap: 2 },
  progressMain: { fontSize: 40, fontFamily: "Inter_700Bold", letterSpacing: -1 },
  progressTotal: { fontSize: 20, fontFamily: "Inter_400Regular" },
  progressLabel: { fontSize: 12, fontFamily: "Inter_400Regular", marginBottom: 10 },
  progressTrack: { height: 6, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: 6, borderRadius: 3 },
  domainTabs: { gap: 8, paddingBottom: 12 },
  domainTab: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  domainTabText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  milestoneList: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 12, marginBottom: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  milestoneItem: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, alignItems: "center", justifyContent: "center", marginTop: 1 },
  milestoneText: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
  redFlagCard: { padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 12 },
  redFlagHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 },
  redFlagTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  redFlagText: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18 },
});
