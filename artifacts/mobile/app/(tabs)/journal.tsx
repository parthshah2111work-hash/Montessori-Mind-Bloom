import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { JournalEntry, useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const MOOD_OPTIONS: { key: JournalEntry["mood"]; label: string; emoji: string; color: string }[] = [
  { key: "wonderful", label: "Wonderful", emoji: "🌟", color: "#4a7c59" },
  { key: "good", label: "Good", emoji: "😊", color: "#5b9bd5" },
  { key: "tired", label: "Tired", emoji: "😴", color: "#8b7db5" },
  { key: "challenging", label: "Challenging", emoji: "🌧️", color: "#e8a87c" },
];

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

function formatAgeStr(months: number): string {
  if (months < 12) return `${months}m`;
  const y = Math.floor(months / 12);
  const m = months % 12;
  return m === 0 ? `${y}y` : `${y}y ${m}m`;
}

function JournalCard({ entry, onDelete }: { entry: JournalEntry; onDelete: (id: string) => void }) {
  const colors = useColors();
  const mood = MOOD_OPTIONS.find((m) => m.key === entry.mood) ?? MOOD_OPTIONS[0];

  return (
    <View style={[styles.entryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.entryHeader}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.entryDate, { color: colors.mutedForeground }]}>{formatDate(entry.createdAt)}</Text>
          <View style={styles.entryMeta}>
            <Text style={[styles.entryMood, { color: mood.color }]}>{mood.emoji} {mood.label}</Text>
            <View style={[styles.agePill, { backgroundColor: colors.primary + "18" }]}>
              <Text style={[styles.agePillText, { color: colors.primary }]}>{formatAgeStr(entry.ageMonths)}</Text>
            </View>
          </View>
        </View>
        <Pressable onPress={() => onDelete(entry.id)} style={[styles.deleteBtn, { backgroundColor: colors.destructive + "12" }]}>
          <Ionicons name="trash-outline" size={14} color={colors.destructive} />
        </Pressable>
      </View>

      {entry.newWord && (
        <View style={styles.entryField}>
          <View style={[styles.entryFieldIcon, { backgroundColor: "#5b9bd5" + "20" }]}>
            <Ionicons name="chatbubble-outline" size={13} color="#5b9bd5" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.entryFieldLabel, { color: colors.mutedForeground }]}>New Word</Text>
            <Text style={[styles.entryFieldValue, { color: colors.foreground }]}>"{entry.newWord}"</Text>
          </View>
        </View>
      )}

      {entry.newSkill && (
        <View style={styles.entryField}>
          <View style={[styles.entryFieldIcon, { backgroundColor: "#4a7c59" + "20" }]}>
            <Ionicons name="star-outline" size={13} color="#4a7c59" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.entryFieldLabel, { color: colors.mutedForeground }]}>New Skill</Text>
            <Text style={[styles.entryFieldValue, { color: colors.foreground }]}>{entry.newSkill}</Text>
          </View>
        </View>
      )}

      {entry.funnyMoment && (
        <View style={styles.entryField}>
          <View style={[styles.entryFieldIcon, { backgroundColor: "#e8a87c" + "25" }]}>
            <Ionicons name="happy-outline" size={13} color="#e8a87c" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.entryFieldLabel, { color: colors.mutedForeground }]}>Funny Moment</Text>
            <Text style={[styles.entryFieldValue, { color: colors.foreground }]}>{entry.funnyMoment}</Text>
          </View>
        </View>
      )}

      {entry.milestone && (
        <View style={styles.entryField}>
          <View style={[styles.entryFieldIcon, { backgroundColor: "#8b7db5" + "20" }]}>
            <Ionicons name="ribbon-outline" size={13} color="#8b7db5" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.entryFieldLabel, { color: colors.mutedForeground }]}>Milestone</Text>
            <Text style={[styles.entryFieldValue, { color: colors.foreground }]}>{entry.milestone}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

export default function JournalScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { ageMonths, journalEntries, addJournalEntry, deleteJournalEntry, profile } = useApp();

  const [showModal, setShowModal] = useState(false);
  const [newWord, setNewWord] = useState("");
  const [newSkill, setNewSkill] = useState("");
  const [funnyMoment, setFunnyMoment] = useState("");
  const [milestone, setMilestone] = useState("");
  const [mood, setMood] = useState<JournalEntry["mood"]>("wonderful");

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  function handleSave() {
    if (!newWord && !newSkill && !funnyMoment && !milestone) {
      Alert.alert("Add something", "Please fill in at least one field before saving.");
      return;
    }
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addJournalEntry({ ageMonths, newWord, newSkill, funnyMoment, milestone, mood });
    setNewWord(""); setNewSkill(""); setFunnyMoment(""); setMilestone(""); setMood("wonderful");
    setShowModal(false);
  }

  function handleDelete(id: string) {
    Alert.alert("Delete entry?", "This memory will be gone forever.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteJournalEntry(id) },
    ]);
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.title, { color: colors.foreground }]}>Growth Journal</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              {journalEntries.length} {journalEntries.length === 1 ? "memory" : "memories"} captured
            </Text>
          </View>
          <Pressable
            onPress={() => setShowModal(true)}
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
          >
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.addBtnText}>Add</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.list,
          { paddingBottom: Platform.OS === "web" ? 100 : insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {journalEntries.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={styles.emptyEmoji}>📔</Text>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Your journal is empty</Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Capture {profile?.name ?? "your child"}'s first words, new skills, and the funny moments that make you laugh.{"\n\n"}These memories are irreplaceable.
            </Text>
            <Pressable
              onPress={() => setShowModal(true)}
              style={[styles.emptyBtn, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.emptyBtnText}>Write your first entry</Text>
            </Pressable>
          </View>
        ) : (
          journalEntries.map((entry) => (
            <JournalCard key={entry.id} entry={entry} onDelete={handleDelete} />
          ))
        )}
      </ScrollView>

      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowModal(false)}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View style={[styles.modal, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Pressable onPress={() => setShowModal(false)}>
                <Text style={[styles.modalCancel, { color: colors.mutedForeground }]}>Cancel</Text>
              </Pressable>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>Today's Memory</Text>
              <Pressable onPress={handleSave}>
                <Text style={[styles.modalSave, { color: colors.primary }]}>Save</Text>
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
              <Text style={[styles.modalSubtitle, { color: colors.mutedForeground }]}>
                How was today? · {ageMonths} months old
              </Text>

              <Text style={[styles.fieldLabel, { color: colors.text }]}>How was the day?</Text>
              <View style={styles.moodRow}>
                {MOOD_OPTIONS.map((m) => (
                  <Pressable
                    key={m.key}
                    onPress={() => setMood(m.key)}
                    style={[
                      styles.moodChip,
                      {
                        backgroundColor: mood === m.key ? m.color + "20" : colors.secondary,
                        borderColor: mood === m.key ? m.color : colors.border,
                      },
                    ]}
                  >
                    <Text style={styles.moodEmoji}>{m.emoji}</Text>
                    <Text style={[styles.moodLabel, { color: mood === m.key ? m.color : colors.mutedForeground }]}>{m.label}</Text>
                  </Pressable>
                ))}
              </View>

              {[
                { label: "New word said 💬", value: newWord, setter: setNewWord, placeholder: 'e.g. "Mango", "Dada", "More"', multiline: false },
                { label: "New skill learned ⭐", value: newSkill, setter: setNewSkill, placeholder: "e.g. Climbed the stairs alone", multiline: false },
                { label: "Funny / precious moment 😄", value: funnyMoment, setter: setFunnyMoment, placeholder: "The story of today...", multiline: true },
                { label: "Milestone reached 🎉", value: milestone, setter: setMilestone, placeholder: "e.g. First step, first hug given", multiline: false },
              ].map((field) => (
                <View key={field.label} style={styles.fieldGroup}>
                  <Text style={[styles.fieldLabel, { color: colors.text }]}>{field.label}</Text>
                  <TextInput
                    style={[
                      styles.fieldInput,
                      field.multiline && styles.fieldInputMulti,
                      { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.card },
                    ]}
                    placeholder={field.placeholder}
                    placeholderTextColor={colors.mutedForeground}
                    value={field.value}
                    onChangeText={field.setter}
                    multiline={field.multiline}
                    textAlignVertical={field.multiline ? "top" : "center"}
                  />
                </View>
              ))}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 12 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  title: { fontSize: 28, fontFamily: "Inter_700Bold", letterSpacing: -0.8, marginBottom: 2 },
  subtitle: { fontSize: 13, fontFamily: "Inter_400Regular" },
  addBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
  addBtnText: { color: "#fff", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  list: { paddingHorizontal: 20, paddingTop: 8, gap: 14 },
  emptyState: { borderRadius: 20, borderWidth: 1, padding: 32, alignItems: "center", gap: 8, marginTop: 20 },
  emptyEmoji: { fontSize: 48, marginBottom: 8 },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_700Bold", textAlign: "center" },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 21 },
  emptyBtn: { marginTop: 12, paddingHorizontal: 24, paddingVertical: 13, borderRadius: 14 },
  emptyBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
  entryCard: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  entryHeader: { flexDirection: "row", alignItems: "flex-start" },
  entryDate: { fontSize: 12, fontFamily: "Inter_400Regular", marginBottom: 4 },
  entryMeta: { flexDirection: "row", alignItems: "center", gap: 8 },
  entryMood: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  agePill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  agePillText: { fontSize: 11, fontFamily: "Inter_700Bold" },
  deleteBtn: { padding: 8, borderRadius: 8, marginLeft: 8 },
  entryField: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  entryFieldIcon: { width: 30, height: 30, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  entryFieldLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 0.3, textTransform: "uppercase", marginBottom: 2 },
  entryFieldValue: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
  modal: { flex: 1 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1 },
  modalTitle: { fontSize: 16, fontFamily: "Inter_700Bold" },
  modalCancel: { fontSize: 15, fontFamily: "Inter_400Regular" },
  modalSave: { fontSize: 15, fontFamily: "Inter_700Bold" },
  modalContent: { padding: 20, gap: 12 },
  modalSubtitle: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 4 },
  moodRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 4 },
  moodChip: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5 },
  moodEmoji: { fontSize: 16 },
  moodLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  fieldGroup: { gap: 6 },
  fieldLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  fieldInput: { borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, fontFamily: "Inter_400Regular" },
  fieldInputMulti: { minHeight: 100 },
  text: { color: "#1a1a1a" },
});
