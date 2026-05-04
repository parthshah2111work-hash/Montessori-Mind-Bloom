import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ActivityCard } from "@/components/ActivityCard";
import { ACTIVITIES, ActivityPhase, CATEGORY_LABELS, MontessoriActivity, PHASE_INFO, getActivitiesForAge, getPhaseForAge } from "@/constants/data";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const ALL_PHASES = Object.entries(PHASE_INFO).map(([k, v]) => ({
  label: v.label,
  value: k as ActivityPhase,
  range: v.range,
}));

const CATEGORY_FILTERS = Object.entries(CATEGORY_LABELS).map(([k, v]) => ({ label: v, value: k }));

export default function ActivitiesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { ageMonths } = useApp();
  const [search, setSearch] = useState("");
  const [phaseFilter, setPhaseFilter] = useState<ActivityPhase | "current" | "all">("current");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const currentPhase = getPhaseForAge(ageMonths);
  const currentPhaseInfo = PHASE_INFO[currentPhase];

  const filtered = useMemo<MontessoriActivity[]>(() => {
    let result = ACTIVITIES;
    if (phaseFilter === "current") {
      result = getActivitiesForAge(ageMonths);
    } else if (phaseFilter !== "all") {
      result = ACTIVITIES.filter((a) => a.phase === phaseFilter);
    }
    if (categoryFilter !== "all") result = result.filter((a) => a.category === categoryFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.subtitle.toLowerCase().includes(q) ||
          a.rightBrainFocus.toLowerCase().includes(q) ||
          a.montessoriPrinciple.toLowerCase().includes(q)
      );
    }
    return result;
  }, [phaseFilter, categoryFilter, search, ageMonths]);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Activities</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          {filtered.length} right-brain Montessori activities
        </Text>

        <View style={[styles.searchBar, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
          <Ionicons name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search activities..."
            placeholderTextColor={colors.mutedForeground}
            style={[styles.searchInput, { color: colors.foreground }]}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={16} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>

        <FlatList
          horizontal
          data={[
            { label: `For ${currentPhaseInfo.label}`, value: "current" as const, range: currentPhaseInfo.range },
            { label: "All Ages", value: "all" as const, range: "0–5 years" },
            ...ALL_PHASES,
          ]}
          keyExtractor={(i) => i.value}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
          renderItem={({ item }) => {
            const active = phaseFilter === item.value;
            return (
              <Pressable
                onPress={() => setPhaseFilter(item.value as any)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: active ? colors.primary : colors.secondary,
                    borderColor: active ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text style={[styles.filterText, { color: active ? "#fff" : colors.mutedForeground }]}>
                  {item.label}
                </Text>
                {item.range && !active && (
                  <Text style={[styles.filterRange, { color: colors.mutedForeground }]}>{item.range}</Text>
                )}
              </Pressable>
            );
          }}
        />

        <FlatList
          horizontal
          data={[{ label: "All Types", value: "all" }, ...CATEGORY_FILTERS]}
          keyExtractor={(i) => i.value}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
          renderItem={({ item }) => {
            const active = categoryFilter === item.value;
            return (
              <Pressable
                onPress={() => setCategoryFilter(item.value)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: active ? colors.accent : colors.secondary,
                    borderColor: active ? colors.accent : colors.border,
                  },
                ]}
              >
                <Text style={[styles.filterText, { color: active ? "#fff" : colors.mutedForeground }]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(a) => a.id}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <ActivityCard activity={item} showComplete />
          </View>
        )}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: Platform.OS === "web" ? 100 : insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Ionicons name="leaf-outline" size={48} color={colors.border} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No activities found</Text>
            <Text style={[styles.emptySubtext, { color: colors.mutedForeground }]}>Try a different filter or search term</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 8, borderBottomWidth: 1 },
  title: { fontSize: 28, fontFamily: "Inter_700Bold", letterSpacing: -0.8, marginBottom: 2 },
  subtitle: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 12 },
  searchBar: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, borderWidth: 1, marginBottom: 10 },
  searchInput: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },
  filters: { gap: 8, paddingVertical: 4 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  filterText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  filterRange: { fontSize: 10, fontFamily: "Inter_400Regular", marginTop: 1 },
  list: { paddingHorizontal: 20, paddingTop: 16 },
  cardWrapper: {},
  empty: { alignItems: "center", justifyContent: "center", paddingTop: 80, gap: 8 },
  emptyText: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  emptySubtext: { fontSize: 13, fontFamily: "Inter_400Regular" },
});
