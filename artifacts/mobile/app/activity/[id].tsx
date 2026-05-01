import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
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

import { PillarBadge } from "@/components/PillarBadge";
import { ACTIVITIES } from "@/constants/data";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

export default function ActivityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { completedActivityIds, toggleActivityComplete, favoriteActivityIds, toggleFavorite } = useApp();
  const [expandedSection, setExpandedSection] = useState<string | null>("steps");

  const activity = ACTIVITIES.find((a) => a.id === id);

  if (!activity) {
    return (
      <View style={[styles.notFound, { backgroundColor: colors.background }]}>
        <Text style={[styles.notFoundText, { color: colors.mutedForeground }]}>Activity not found</Text>
      </View>
    );
  }

  const isCompleted = completedActivityIds.includes(activity.id);
  const isFavorite = favoriteActivityIds.includes(activity.id);

  const handleComplete = () => {
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    toggleActivityComplete(activity.id);
  };

  const handleFavorite = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleFavorite(activity.id);
  };

  const DIFFICULTY_LABELS: Record<string, string> = {
    gentle: "Gentle Introduction",
    moderate: "Moderate Engagement",
    engaging: "Deeply Engaging",
  };

  const DIFFICULTY_COLORS: Record<string, string> = {
    gentle: colors.cognitive,
    moderate: colors.physical,
    engaging: colors.language,
  };

  const diffColor = DIFFICULTY_COLORS[activity.difficulty] ?? colors.primary;

  function SectionToggle({ id: sId, title, icon, children }: { id: string; title: string; icon: string; children: React.ReactNode }) {
    const open = expandedSection === sId;
    return (
      <View style={[styles.section, { borderColor: colors.border }]}>
        <Pressable
          onPress={() => setExpandedSection(open ? null : sId)}
          style={[styles.sectionHeader, { backgroundColor: colors.secondary }]}
        >
          <View style={styles.sectionTitleRow}>
            <Ionicons name={icon as any} size={16} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{title}</Text>
          </View>
          <Ionicons
            name={open ? "chevron-up" : "chevron-down"}
            size={16}
            color={colors.mutedForeground}
          />
        </Pressable>
        {open && <View style={styles.sectionBody}>{children}</View>}
      </View>
    );
  }

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.navBar, { paddingTop: topPad + 8, borderBottomColor: colors.border, backgroundColor: colors.background }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color={colors.foreground} />
        </Pressable>
        <View style={styles.navActions}>
          <Pressable onPress={handleFavorite} hitSlop={8} style={styles.navActionBtn}>
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={22}
              color={isFavorite ? colors.socialEmotional : colors.mutedForeground}
            />
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: Platform.OS === "web" ? 100 : insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleArea}>
          <View style={styles.metaRow}>
            <View style={[styles.diffBadge, { backgroundColor: diffColor + "20" }]}>
              <Text style={[styles.diffText, { color: diffColor }]}>
                {DIFFICULTY_LABELS[activity.difficulty]}
              </Text>
            </View>
            <Text style={[styles.ageRange, { color: colors.mutedForeground }]}>
              {activity.ageRange} · {activity.duration}
            </Text>
          </View>
          <Text style={[styles.title, { color: colors.foreground }]}>{activity.title}</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{activity.subtitle}</Text>

          <View style={styles.pillars}>
            {activity.pillars.map((p) => <PillarBadge key={p} pillar={p} />)}
          </View>
        </View>

        <View style={[styles.brainHighlight, { backgroundColor: colors.primary + "0d", borderColor: colors.primary + "20" }]}>
          <View style={styles.brainHighlightHeader}>
            <Ionicons name="flash" size={16} color={colors.primary} />
            <Text style={[styles.brainHighlightTitle, { color: colors.primary }]}>Right-Brain Focus</Text>
          </View>
          <Text style={[styles.brainHighlightText, { color: colors.foreground }]}>
            {activity.rightBrainFocus}
          </Text>
        </View>

        <SectionToggle id="steps" title="Step-by-Step Guide" icon="list-outline">
          {activity.steps.map((step, i) => (
            <View key={i} style={styles.stepRow}>
              <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                <Text style={styles.stepNumberText}>{i + 1}</Text>
              </View>
              <Text style={[styles.stepText, { color: colors.foreground }]}>{step}</Text>
            </View>
          ))}
        </SectionToggle>

        <SectionToggle id="materials" title="What You Need" icon="cube-outline">
          {activity.materials.map((mat, i) => (
            <View key={i} style={styles.materialRow}>
              <View style={[styles.bullet, { backgroundColor: colors.primary }]} />
              <Text style={[styles.materialText, { color: colors.foreground }]}>{mat}</Text>
            </View>
          ))}
        </SectionToggle>

        <SectionToggle id="montessori" title="The Montessori Principle" icon="school-outline">
          <Text style={[styles.bodyText, { color: colors.foreground }]}>{activity.montessoriPrinciple}</Text>
        </SectionToggle>

        <SectionToggle id="brain" title="Brain Development Benefit" icon="brain-outline">
          <Text style={[styles.bodyText, { color: colors.foreground }]}>{activity.brainBenefit}</Text>
        </SectionToggle>

        <SectionToggle id="tip" title="Coach's Tip for You" icon="sparkles-outline">
          <View style={[styles.tipBox, { backgroundColor: colors.accent + "15", borderColor: colors.accent + "30" }]}>
            <Text style={[styles.tipText, { color: colors.foreground }]}>{activity.tipForParent}</Text>
          </View>
        </SectionToggle>

        <Pressable
          onPress={handleComplete}
          style={[
            styles.completeButton,
            {
              backgroundColor: isCompleted ? colors.secondary : colors.primary,
              borderColor: isCompleted ? colors.border : colors.primary,
            },
          ]}
        >
          <Ionicons
            name={isCompleted ? "checkmark-circle" : "checkmark-circle-outline"}
            size={20}
            color={isCompleted ? colors.primary : "#fff"}
          />
          <Text
            style={[
              styles.completeButtonText,
              { color: isCompleted ? colors.primary : "#fff" },
            ]}
          >
            {isCompleted ? "Completed Today" : "Mark Complete"}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  notFound: { flex: 1, alignItems: "center", justifyContent: "center" },
  notFoundText: { fontSize: 16, fontFamily: "Inter_400Regular" },
  navBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4 },
  navActions: { flexDirection: "row", gap: 4 },
  navActionBtn: { padding: 6 },
  scroll: { paddingHorizontal: 20, paddingTop: 20 },
  titleArea: { marginBottom: 16 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  diffBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  diffText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  ageRange: { fontSize: 12, fontFamily: "Inter_400Regular" },
  title: { fontSize: 26, fontFamily: "Inter_700Bold", letterSpacing: -0.7, marginBottom: 6 },
  subtitle: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20, marginBottom: 14 },
  pillars: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  brainHighlight: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  brainHighlightHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 },
  brainHighlightTitle: { fontSize: 12, fontFamily: "Inter_700Bold", letterSpacing: 0.5, textTransform: "uppercase" },
  brainHighlightText: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 21 },
  section: {
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
    overflow: "hidden",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
  },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  sectionTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  sectionBody: { padding: 16, gap: 12 },
  stepRow: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  stepNumberText: { color: "#fff", fontSize: 12, fontFamily: "Inter_700Bold" },
  stepText: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 21 },
  materialRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  bullet: { width: 6, height: 6, borderRadius: 3, marginTop: 7 },
  materialText: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 21 },
  bodyText: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 22 },
  tipBox: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  tipText: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 22, fontStyle: "italic" },
  completeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    marginTop: 8,
    marginBottom: 20,
  },
  completeButtonText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
