import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Platform, Alert, KeyboardAvoidingView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useApp } from "@/context/AppContext";
import Colors from "@/constants/colors";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function OnboardingScreen() {
  const { completeOnboarding } = useApp();
  const [step, setStep] = useState(0);
  const [childName, setChildName] = useState("");
  const [parentName, setParentName] = useState("");
  const [dobDay, setDobDay] = useState("");
  const [dobMonth, setDobMonth] = useState(0);
  const [dobYear, setDobYear] = useState("");

  const colors = Colors.light;

  function calcPreviewAge() {
    if (!dobDay || !dobYear || dobYear.length < 4) return null;
    const d = parseInt(dobDay, 10);
    const y = parseInt(dobYear, 10);
    if (isNaN(d) || isNaN(y)) return null;
    const birth = new Date(y, dobMonth, d);
    const now = new Date();
    if (birth > now) return null;
    const months = (now.getFullYear() - birth.getFullYear()) * 12
      + (now.getMonth() - birth.getMonth())
      - (now.getDate() < birth.getDate() ? 1 : 0);
    const m = Math.max(0, Math.min(60, months));
    if (m < 12) return `${m} month${m === 1 ? "" : "s"} old`;
    const years = Math.floor(m / 12);
    const rem = m % 12;
    return rem === 0 ? `${years} year${years === 1 ? "" : "s"} old` : `${years}y ${rem}m old`;
  }

  function handleFinish() {
    if (!childName.trim()) { Alert.alert("Please enter your child's name."); return; }
    if (!dobDay || !dobYear || dobYear.length < 4) { Alert.alert("Please enter a complete date of birth."); return; }
    const d = parseInt(dobDay, 10);
    const y = parseInt(dobYear, 10);
    if (isNaN(d) || isNaN(y) || d < 1 || d > 31 || y < 2018 || y > new Date().getFullYear()) {
      Alert.alert("Please check the date of birth."); return;
    }
    const dob = new Date(y, dobMonth, d);
    if (dob > new Date()) { Alert.alert("Date of birth cannot be in the future."); return; }
    completeOnboarding({
      name: childName.trim(),
      dateOfBirth: dob.toISOString(),
      parentNames: parentName.trim() || "Parent",
    });
    router.replace("/(tabs)/");
  }

  const previewAge = calcPreviewAge();

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <LinearGradient colors={["#f7f3ee", "#e8f0e9"]} style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* Logo / Header */}
          <View style={styles.header}>
            <View style={[styles.logoCircle, { backgroundColor: colors.primary }]}>
              <Text style={styles.logoEmoji}>🌱</Text>
            </View>
            <Text style={[styles.appName, { color: colors.primary }]}>Lumina Growth</Text>
            <Text style={[styles.tagline, { color: colors.textLight }]}>Every child is a genius in bloom</Text>
          </View>

          {/* Card */}
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Let's set up your profile</Text>
            <Text style={[styles.cardSub, { color: colors.textLight }]}>
              This takes 30 seconds. Everything will be personalised to your child's exact age.
            </Text>

            {/* Child Name */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Your child's name</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.background }]}
                placeholder="e.g. Aarav, Diya, Kavya..."
                placeholderTextColor={colors.textLight}
                value={childName}
                onChangeText={setChildName}
                autoCapitalize="words"
              />
            </View>

            {/* Parent Name */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Your name (parent)</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.background }]}
                placeholder="e.g. Priya, Rahul..."
                placeholderTextColor={colors.textLight}
                value={parentName}
                onChangeText={setParentName}
                autoCapitalize="words"
              />
            </View>

            {/* Date of Birth */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.text }]}>
                {childName ? `${childName}'s date of birth` : "Child's date of birth"}
              </Text>
              <Text style={[styles.fieldHint, { color: colors.textLight }]}>
                Age is calculated automatically — all content will adapt to your child.
              </Text>

              <View style={styles.dobRow}>
                <TextInput
                  style={[styles.dobInput, styles.dobDay, { borderColor: colors.border, color: colors.text, backgroundColor: colors.background }]}
                  placeholder="DD"
                  placeholderTextColor={colors.textLight}
                  value={dobDay}
                  onChangeText={(t) => setDobDay(t.replace(/[^0-9]/g, "").slice(0, 2))}
                  keyboardType="numeric"
                  maxLength={2}
                />

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.monthScroll}>
                  {MONTHS.map((m, i) => (
                    <TouchableOpacity
                      key={m}
                      onPress={() => setDobMonth(i)}
                      style={[
                        styles.monthPill,
                        {
                          backgroundColor: dobMonth === i ? colors.primary : colors.background,
                          borderColor: dobMonth === i ? colors.primary : colors.border,
                        },
                      ]}
                    >
                      <Text style={[styles.monthText, { color: dobMonth === i ? "#fff" : colors.text }]}>{m}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <TextInput
                  style={[styles.dobInput, styles.dobYear, { borderColor: colors.border, color: colors.text, backgroundColor: colors.background }]}
                  placeholder="YYYY"
                  placeholderTextColor={colors.textLight}
                  value={dobYear}
                  onChangeText={(t) => setDobYear(t.replace(/[^0-9]/g, "").slice(0, 4))}
                  keyboardType="numeric"
                  maxLength={4}
                />
              </View>

              {previewAge && (
                <View style={[styles.ageBadge, { backgroundColor: colors.primary + "18" }]}>
                  <Text style={[styles.ageBadgeText, { color: colors.primary }]}>
                    🎂 {childName || "Your child"} is {previewAge}
                  </Text>
                </View>
              )}
            </View>

            {/* Age Range Info */}
            <View style={[styles.infoBox, { backgroundColor: colors.accent + "20", borderColor: colors.accent + "40" }]}>
              <Text style={[styles.infoTitle, { color: colors.text }]}>What gets personalised?</Text>
              {[
                "🎯 Activities filtered for your child's exact phase",
                "🥗 Nutrition guide matched to current age",
                "📊 Milestones relevant to upcoming months",
                "📔 Growth Journal to capture every moment",
              ].map((item) => (
                <Text key={item} style={[styles.infoItem, { color: colors.textLight }]}>{item}</Text>
              ))}
            </View>
          </View>

          {/* CTA */}
          <TouchableOpacity
            onPress={handleFinish}
            style={[styles.cta, { backgroundColor: childName && previewAge ? colors.primary : colors.border }]}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaText}>
              {childName && previewAge ? `Begin ${childName}'s journey →` : "Begin the journey →"}
            </Text>
          </TouchableOpacity>

          <Text style={[styles.privacy, { color: colors.textLight }]}>
            All data stays on your device. Nothing is sent to any server.
          </Text>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 24, paddingTop: 60, paddingBottom: 48 },
  header: { alignItems: "center", marginBottom: 32 },
  logoCircle: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  logoEmoji: { fontSize: 34 },
  appName: { fontSize: 28, fontFamily: "Inter_700Bold", letterSpacing: -0.5, marginBottom: 4 },
  tagline: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
  card: { borderRadius: 20, padding: 24, marginBottom: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 },
  cardTitle: { fontSize: 20, fontFamily: "Inter_700Bold", marginBottom: 6 },
  cardSub: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20, marginBottom: 24 },
  fieldGroup: { marginBottom: 20 },
  label: { fontSize: 13, fontFamily: "Inter_600SemiBold", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 },
  fieldHint: { fontSize: 12, fontFamily: "Inter_400Regular", marginBottom: 10, lineHeight: 17 },
  input: { borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 13, fontSize: 16, fontFamily: "Inter_400Regular" },
  dobRow: { gap: 8 },
  dobInput: { borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 13, fontSize: 16, fontFamily: "Inter_400Regular", textAlign: "center" },
  dobDay: { width: 64 },
  dobYear: { width: 72 },
  monthScroll: { flex: 1, marginVertical: 4 },
  monthPill: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, marginRight: 6, height: 38 },
  monthText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  ageBadge: { marginTop: 12, padding: 12, borderRadius: 10 },
  ageBadgeText: { fontSize: 15, fontFamily: "Inter_600SemiBold", textAlign: "center" },
  infoBox: { borderRadius: 12, padding: 16, borderWidth: 1, marginTop: 4 },
  infoTitle: { fontSize: 14, fontFamily: "Inter_700Bold", marginBottom: 10 },
  infoItem: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 22 },
  cta: { paddingVertical: 18, borderRadius: 16, alignItems: "center", marginBottom: 16 },
  ctaText: { color: "#fff", fontSize: 17, fontFamily: "Inter_700Bold" },
  privacy: { fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "center" },
});
