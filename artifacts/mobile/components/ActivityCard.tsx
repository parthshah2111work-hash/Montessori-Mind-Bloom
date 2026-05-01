import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useRef } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { MontessoriActivity } from "@/constants/data";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

import { PillarBadge } from "./PillarBadge";

interface Props {
  activity: MontessoriActivity;
  showComplete?: boolean;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  gentle: "#7aaa88",
  moderate: "#e8a87c",
  engaging: "#b8a9d4",
};

export function ActivityCard({ activity, showComplete }: Props) {
  const colors = useColors();
  const { completedActivityIds, toggleActivityComplete, favoriteActivityIds, toggleFavorite } = useApp();
  const router = useRouter();
  const scale = useRef(new Animated.Value(1)).current;

  const isCompleted = completedActivityIds.includes(activity.id);
  const isFavorite = favoriteActivityIds.includes(activity.id);

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.97, duration: 80, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
    router.push({ pathname: "/activity/[id]", params: { id: activity.id } });
  };

  const handleComplete = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleActivityComplete(activity.id);
  };

  const handleFavorite = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleFavorite(activity.id);
  };

  const difficultyColor = DIFFICULTY_COLORS[activity.difficulty] ?? colors.primary;

  return (
    <Pressable onPress={handlePress}>
      <Animated.View
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: isCompleted ? colors.primary + "40" : colors.border,
            borderRadius: colors.radius,
            transform: [{ scale }],
          },
        ]}
      >
        {isCompleted && (
          <View style={[styles.completedBanner, { backgroundColor: colors.primary }]}>
            <Text style={styles.completedText}>Completed</Text>
          </View>
        )}

        <View style={styles.header}>
          <View style={styles.meta}>
            <View style={[styles.difficultyDot, { backgroundColor: difficultyColor }]} />
            <Text style={[styles.ageRange, { color: colors.mutedForeground }]}>
              {activity.ageRange}
            </Text>
            <Text style={[styles.dot, { color: colors.mutedForeground }]}>·</Text>
            <Text style={[styles.duration, { color: colors.mutedForeground }]}>
              {activity.duration}
            </Text>
          </View>
          <View style={styles.actions}>
            <Pressable onPress={handleFavorite} hitSlop={8} style={styles.iconBtn}>
              <Ionicons
                name={isFavorite ? "heart" : "heart-outline"}
                size={18}
                color={isFavorite ? colors.socialEmotional : colors.mutedForeground}
              />
            </Pressable>
            {showComplete && (
              <Pressable onPress={handleComplete} hitSlop={8} style={styles.iconBtn}>
                <Ionicons
                  name={isCompleted ? "checkmark-circle" : "checkmark-circle-outline"}
                  size={22}
                  color={isCompleted ? colors.primary : colors.mutedForeground}
                />
              </Pressable>
            )}
          </View>
        </View>

        <Text style={[styles.title, { color: colors.foreground }]}>{activity.title}</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]} numberOfLines={2}>
          {activity.subtitle}
        </Text>

        <View style={styles.pillars}>
          {activity.pillars.slice(0, 3).map((p) => (
            <PillarBadge key={p} pillar={p} small />
          ))}
        </View>

        <View style={[styles.brainBox, { backgroundColor: colors.primary + "0d" }]}>
          <Ionicons name="flash" size={12} color={colors.primary} />
          <Text style={[styles.brainText, { color: colors.primary }]} numberOfLines={2}>
            {activity.rightBrainFocus.split("—")[0].trim()}
          </Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: "hidden",
  },
  completedBanner: {
    position: "absolute",
    top: 0,
    right: 0,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderBottomLeftRadius: 10,
  },
  completedText: {
    color: "#fff",
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  difficultyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  ageRange: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  dot: {
    fontSize: 11,
  },
  duration: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  actions: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  iconBtn: {
    padding: 2,
  },
  title: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
    marginBottom: 12,
  },
  pillars: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 10,
  },
  brainBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 5,
    padding: 8,
    borderRadius: 8,
  },
  brainText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    flex: 1,
    lineHeight: 15,
  },
});
