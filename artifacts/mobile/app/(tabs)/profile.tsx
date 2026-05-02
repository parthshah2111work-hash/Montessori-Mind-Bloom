import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/context/AppContext";
import { getPhaseForAge, PHASE_INFO } from "@/constants/data";
import { useColors } from "@/hooks/useColors";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function formatAge(ageMonths: number): string {
  if (ageMonths < 12) return `${ageMonths} month${ageMonths === 1 ? "" : "s"}`;
  const y = Math.floor(ageMonths / 12);
  const m = ageMonths % 12;
  if (m === 0) return `${y} year${y === 1 ? "" : "s"}`;
  return `${y} year${y === 1 ? "" : "s"} ${m} month${m === 1 ? "" : "s"}`;
}

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { profile, ageMonths, updateProfile, completedActivityIds, masteredMilestones, journalEntries } = useApp();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile?.name ?? "");
  const [parentNames, setParentNames] = useState(profile?.parentNames ?? "");

  const dob = profile?.dateOfBirth ? new Date(profile.dateOfBirth) : null;
  const dobStr = dob
    ? `${dob.getDate()} ${MONTHS[dob.getMonth()]} ${dob.getFullYear()}`
    : "Not set";

  const phase = getPhaseForAge(ageMonths);
  const phaseInfo = PHASE_INFO[phase];

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  function saveProfile() {
    if (!name.trim()) { Alert.alert("Name required"); return; }
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    updateProfile({ name: name.trim(), parentNames: parentNames.trim() });
    setEditing(false);
  }

  const stats = [
    { label: "Activities Done", value: completedActivityIds.length, icon: "checkmark-circle", color: colors.primary },
    { label: "Milestones", value: masteredMilestones.length, icon: "star", color: colors.cognitive },
    { label: "Journal Entries", value: journalEntries.length, icon: "book", color: colors.accent },
  ];

  const coachNotes = [
    "Your child does not require a 'perfect' parent — she requires a 'present' one.",
    "15 minutes of uninterrupted, floor-level engagement is more developmentally significant than hours of supervised activity.",
    "The 30-second rule: before intervening, wait. That moment of struggle is where the brain grows.",
    "Talk-aloud parenting: narrate your life. 'I am peeling the orange. It feels bumpy and smells sweet.'",
    "Mess is evidence of learning. Allow it.",
    "Your phone-free presence is the greatest developmental stimulant in existence.",
    "The right-brain develops through art, music, stories, and nature — not screens. One hour of nature is worth ten hours of content.",
    "She is watching how you handle frustration, patience, and kindness more carefully than any lesson you teach.",
  ];
  const todayNote = coachNotes[new Date().getDate() % coachNotes.length];

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 100 : insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.heroArea, { paddingTop: topPad + 16, backgroundColor: colors.primary + "10" }]}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>{profile?.name?.charAt(0) ?? "?"}</Text>
          </View>
          <Text style={[styles.childName, { color: colors.foreground }]}>{profile?.name ?? "Your Child"}</Text>
          <Text style={[styles.childAge, { color: colors.primary }]}>{formatAge(ageMonths)}</Text>
          <Text style={[styles.phaseLabel, { color: colors.mutedForeground }]}>{phaseInfo.label} · {phaseInfo.range}</Text>
          {profile?.parentNames && (
            <Text style={[styles.parents, { color: colors.mutedForeground }]}>{profile.parentNames}</Text>
          )}
          <View style={[styles.dobRow, { backgroundColor: colors.primary + "15" }]}>
            <Ionicons name="calendar-outline" size={13} color={colors.primary} />
            <Text style={[styles.dobText, { color: colors.primary }]}>Born {dobStr}</Text>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.statsRow}>
            {stats.map((s) => (
              <View key={s.label} style={[styles.statCard, { backgroundColor: s.color + "12", borderColor: s.color + "25" }]}>
                <Ionicons name={s.icon as any} size={20} color={s.color} />
                <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
              </View>
            ))}
          </View>

          <View style={[styles.coachCard, { backgroundColor: colors.accent + "15", borderColor: colors.accent + "30" }]}>
            <View style={styles.coachHeader}>
              <Ionicons name="sparkles" size={14} color={colors.accent} />
              <Text style={[styles.coachLabel, { color: colors.accent }]}>Coach's Note Today</Text>
            </View>
            <Text style={[styles.coachNote, { color: colors.foreground }]}>"{todayNote}"</Text>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Profile</Text>
            <Pressable
              onPress={() => editing ? saveProfile() : setEditing(true)}
              style={[styles.editButton, { backgroundColor: editing ? colors.primary : colors.secondary, borderColor: editing ? colors.primary : colors.border }]}
            >
              <Ionicons name={editing ? "checkmark" : "pencil"} size={14} color={editing ? "#fff" : colors.mutedForeground} />
              <Text style={[styles.editButtonText, { color: editing ? "#fff" : colors.mutedForeground }]}>
                {editing ? "Save" : "Edit"}
              </Text>
            </Pressable>
          </View>

          <View style={[styles.profileForm, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.formField}>
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Child's Name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                editable={editing}
                style={[styles.fieldInput, { color: colors.foreground, borderBottomColor: editing ? colors.primary : colors.border }]}
              />
            </View>
            <View style={styles.formField}>
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Date of Birth</Text>
              <Text style={[styles.fieldReadOnly, { color: colors.foreground }]}>{dobStr}</Text>
              <Text style={[styles.fieldNote, { color: colors.mutedForeground }]}>
                Age is calculated automatically · {formatAge(ageMonths)}
              </Text>
            </View>
            <View style={[styles.formField, { borderBottomWidth: 0 }]}>
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Parents</Text>
              <TextInput
                value={parentNames}
                onChangeText={setParentNames}
                editable={editing}
                style={[styles.fieldInput, { color: colors.foreground, borderBottomColor: editing ? colors.primary : colors.border }]}
              />
            </View>
          </View>

          <Pressable
            onPress={() => {
              Alert.alert(
                "Update Date of Birth?",
                "To change the date of birth, you'll go through the profile setup again.",
                [
                  { text: "Cancel", style: "cancel" },
                  { text: "Update DOB", onPress: () => router.replace("/onboarding") },
                ]
              );
            }}
            style={[styles.dobUpdateBtn, { borderColor: colors.border }]}
          >
            <Ionicons name="calendar-outline" size={15} color={colors.mutedForeground} />
            <Text style={[styles.dobUpdateText, { color: colors.mutedForeground }]}>Update date of birth</Text>
          </Pressable>

          <View style={[styles.infoCard, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
            <Ionicons name="lock-closed-outline" size={16} color={colors.mutedForeground} />
            <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
              All data stays on your device. Your family's journey is completely private.
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  heroArea: { paddingHorizontal: 20, paddingBottom: 24, alignItems: "center" },
  avatar: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  avatarText: { fontSize: 32, fontFamily: "Inter_700Bold", color: "#fff" },
  childName: { fontSize: 24, fontFamily: "Inter_700Bold", letterSpacing: -0.5, marginBottom: 4 },
  childAge: { fontSize: 16, fontFamily: "Inter_700Bold", marginBottom: 2 },
  phaseLabel: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 4 },
  parents: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 8 },
  dobRow: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, marginTop: 4 },
  dobText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  content: { paddingHorizontal: 20, paddingTop: 20 },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  statCard: { flex: 1, padding: 14, borderRadius: 16, borderWidth: 1, alignItems: "center", gap: 4 },
  statValue: { fontSize: 26, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  statLabel: { fontSize: 10, fontFamily: "Inter_600SemiBold", textAlign: "center" },
  coachCard: { padding: 16, borderRadius: 14, borderWidth: 1, marginBottom: 20 },
  coachHeader: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 8 },
  coachLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 0.5, textTransform: "uppercase" },
  coachNote: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 21, fontStyle: "italic" },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontFamily: "Inter_700Bold", letterSpacing: -0.3 },
  editButton: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, borderWidth: 1 },
  editButtonText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  profileForm: { borderRadius: 16, borderWidth: 1, overflow: "hidden", marginBottom: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  formField: { padding: 16, borderBottomWidth: 1 },
  fieldLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 0.3, textTransform: "uppercase", marginBottom: 6 },
  fieldInput: { fontSize: 16, fontFamily: "Inter_400Regular", borderBottomWidth: 1, paddingBottom: 4 },
  fieldReadOnly: { fontSize: 16, fontFamily: "Inter_400Regular", marginBottom: 2 },
  fieldNote: { fontSize: 11, fontFamily: "Inter_400Regular" },
  dobUpdateBtn: { flexDirection: "row", alignItems: "center", gap: 7, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, marginBottom: 12 },
  dobUpdateText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  infoCard: { flexDirection: "row", gap: 10, padding: 14, borderRadius: 12, borderWidth: 1, alignItems: "flex-start" },
  infoText: { flex: 1, fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18 },
});
