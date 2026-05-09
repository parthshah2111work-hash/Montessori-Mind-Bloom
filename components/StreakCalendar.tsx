import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

interface Props {
  activeDaysSet: ReadonlySet<string>;
  currentStreak: number;
  longestStreak: number;
  activeDaysThisWeek: number;
}

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];
const WEEKS = 4;

function toKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function getIntensity(count: number): 0 | 1 | 2 | 3 {
  if (count === 0) return 0;
  if (count === 1) return 1;
  if (count === 2) return 2;
  return 3;
}

export function StreakCalendar({
  activeDaysSet,
  currentStreak,
  longestStreak,
  activeDaysThisWeek,
}: Props) {
  const colors = useColors();

  // Build completion count per day
  const countPerDay = useMemo<Map<string, number>>(() => {
    const map = new Map<string, number>();
    activeDaysSet.forEach((key) => {
      map.set(key, (map.get(key) ?? 0) + 1);
    });
    return map;
  }, [activeDaysSet]);

  // Build 4-week grid (Mon-start), newest week last row
  const grid = useMemo<{ key: string; date: Date; count: number; isToday: boolean; isFuture: boolean }[][]>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayKey = toKey(today);

    // Find the Monday of the current week
    const dayOfWeek = (today.getDay() + 6) % 7; // 0=Mon
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - dayOfWeek);

    // Go back (WEEKS-1) weeks from current week start
    const gridStart = new Date(weekStart);
    gridStart.setDate(weekStart.getDate() - (WEEKS - 1) * 7);

    const weeks: { key: string; date: Date; count: number; isToday: boolean; isFuture: boolean }[][] = [];
    for (let w = 0; w < WEEKS; w++) {
      const week: { key: string; date: Date; count: number; isToday: boolean; isFuture: boolean }[] = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date(gridStart);
        date.setDate(gridStart.getDate() + w * 7 + d);
        const key = toKey(date);
        week.push({
          key,
          date,
          count: countPerDay.get(key) ?? 0,
          isToday: key === todayKey,
          isFuture: date > today,
        });
      }
      weeks.push(week);
    }
    return weeks;
  }, [countPerDay]);

  const intensityColor = (intensity: 0 | 1 | 2 | 3): string => {
    if (intensity === 0) return colors.border;
    const alpha = intensity === 1 ? "55" : intensity === 2 ? "99" : "ff";
    return colors.primary + alpha;
  };

  const weekGoal = 5;
  const weekGoalPct = Math.min(1, activeDaysThisWeek / weekGoal);

  const streakMsg =
    currentStreak === 0
      ? "Start your streak today!"
      : currentStreak < 3
      ? "Keep it going!"
      : currentStreak < 7
      ? "You're on a roll!"
      : currentStreak < 14
      ? "Amazing consistency!"
      : "Legendary habit!";

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.cardHeader}>
        <View style={styles.titleRow}>
          <Ionicons name="flame" size={18} color="#e8713c" />
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Activity Streak</Text>
        </View>
        <Text style={[styles.streakMsg, { color: colors.mutedForeground }]}>{streakMsg}</Text>
      </View>

      {/* Stat chips */}
      <View style={styles.stats}>
        <View style={[styles.statChip, { backgroundColor: "#e8713c18" }]}>
          <Ionicons name="flame" size={16} color="#e8713c" />
          <Text style={[styles.statValue, { color: "#e8713c" }]}>{currentStreak}</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
            {currentStreak === 1 ? "day" : "days"}
          </Text>
        </View>
        <View style={[styles.statChip, { backgroundColor: colors.primary + "15" }]}>
          <Ionicons name="trophy" size={15} color={colors.primary} />
          <Text style={[styles.statValue, { color: colors.primary }]}>{longestStreak}</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>best</Text>
        </View>
        <View style={[styles.statChip, { backgroundColor: colors.cognitive + "15" }]}>
          <Ionicons name="calendar" size={15} color={colors.cognitive} />
          <Text style={[styles.statValue, { color: colors.cognitive }]}>{activeDaysThisWeek}/{weekGoal}</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>this week</Text>
        </View>
      </View>

      {/* Weekly goal bar */}
      <View style={styles.goalRow}>
        <Text style={[styles.goalLabel, { color: colors.mutedForeground }]}>
          Weekly goal: {activeDaysThisWeek} of {weekGoal} days
        </Text>
        <Text style={[styles.goalPct, { color: colors.primary }]}>
          {Math.round(weekGoalPct * 100)}%
        </Text>
      </View>
      <View style={[styles.goalTrack, { backgroundColor: colors.border }]}>
        <View
          style={[
            styles.goalFill,
            {
              backgroundColor: weekGoalPct >= 1 ? "#7aaa88" : colors.primary,
              width: `${weekGoalPct * 100}%`,
            },
          ]}
        />
      </View>

      {/* Day labels */}
      <View style={styles.dayLabels}>
        {DAY_LABELS.map((label, i) => (
          <View key={i} style={styles.dayLabelCell}>
            <Text style={[styles.dayLabel, { color: colors.mutedForeground }]}>{label}</Text>
          </View>
        ))}
      </View>

      {/* Grid */}
      {grid.map((week, wi) => (
        <View key={wi} style={styles.gridRow}>
          {week.map((cell) => {
            const intensity = cell.isFuture ? 0 : getIntensity(cell.count);
            const bg = intensityColor(intensity);
            return (
              <View
                key={cell.key}
                style={[
                  styles.cell,
                  { backgroundColor: bg },
                  cell.isToday && {
                    borderWidth: 2,
                    borderColor: colors.primary,
                  },
                ]}
              />
            );
          })}
        </View>
      ))}

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={[styles.legendLabel, { color: colors.mutedForeground }]}>Less</Text>
        {([0, 1, 2, 3] as const).map((lvl) => (
          <View
            key={lvl}
            style={[styles.legendCell, { backgroundColor: intensityColor(lvl) }]}
          />
        ))}
        <Text style={[styles.legendLabel, { color: colors.mutedForeground }]}>More</Text>
      </View>
    </View>
  );
}

const CELL_SIZE = 32;

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 20,
  },
  cardHeader: { marginBottom: 14 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 3 },
  cardTitle: { fontSize: 17, fontFamily: "Inter_700Bold", letterSpacing: -0.3 },
  streakMsg: { fontSize: 12, fontFamily: "Inter_400Regular", fontStyle: "italic" },
  stats: { flexDirection: "row", gap: 8, marginBottom: 14 },
  statChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 8,
    borderRadius: 10,
  },
  statValue: { fontSize: 16, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  goalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  goalLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  goalPct: { fontSize: 12, fontFamily: "Inter_700Bold" },
  goalTrack: { height: 5, borderRadius: 3, overflow: "hidden", marginBottom: 16 },
  goalFill: { height: 5, borderRadius: 3 },
  dayLabels: {
    flexDirection: "row",
    marginBottom: 4,
  },
  dayLabelCell: {
    flex: 1,
    alignItems: "center",
  },
  dayLabel: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  gridRow: {
    flexDirection: "row",
    marginBottom: 4,
    gap: 4,
  },
  cell: {
    flex: 1,
    height: CELL_SIZE - 12,
    borderRadius: 5,
  },
  legend: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
    marginTop: 8,
  },
  legendLabel: { fontSize: 10, fontFamily: "Inter_400Regular" },
  legendCell: { width: 10, height: 10, borderRadius: 2 },
});
