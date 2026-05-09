import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Platform, FlatList, ActivityIndicator, Alert,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import { TRENDS, TrendItem, CATEGORY_LABELS, TREND_CATEGORIES } from '@/constants/data';
import { LinearGradient } from 'expo-linear-gradient';
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? "";
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export default function TrendsScreen() {
  const colors = useColors();
  const { profile, ageMonths } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [useChildAge, setUseChildAge] = useState(true);
  const [aiTrends, setAiTrends] = useState<TrendItem[]>([]);
  const [isFetchingAi, setIsFetchingAi] = useState(false);

  const filteredTrends = useMemo(() => {
    let list = [...TRENDS, ...aiTrends];
    if (useChildAge) list = list.filter(item => ageMonths >= item.minAgeMonths - 6 && ageMonths <= item.maxAgeMonths + 6);
    if (selectedCategory !== 'all') list = list.filter(item => item.category === selectedCategory);
    return list;
  }, [selectedCategory, useChildAge, ageMonths, aiTrends]);

  const fetchAiTrends = async () => {
    if (!ai) {
      Alert.alert("AI Not Configured", "Add your EXPO_PUBLIC_GEMINI_API_KEY to enable AI-powered trend discovery.");
      return;
    }
    setIsFetchingAi(true);
    try {
      const prompt = `Act as a childcare and developmental expert. Generate 3 trending topics/advice for a parent with a child who is ${ageMonths} months old.
For each topic provide: a catchy title, a 2-sentence summary, a category (one of: health, development, education, parenting, nutrition), and a realistic URL from a reputable source (healthline.com, mayoclinic.org, or aap.org).
Format as JSON array with fields: id (unique "ai-" prefix string), title, description, category, url, source, type (fixed as "article"), minAgeMonths (${Math.max(0, ageMonths - 3)}), maxAgeMonths (${ageMonths + 6}).
Only return the JSON array.`;

      const response = await ai.models.generateContent({ model: "gemini-2.0-flash", contents: prompt });
      const text = response.text ?? "[]";
      const cleanedJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed: TrendItem[] = JSON.parse(cleanedJson);
      setAiTrends(prev => [...parsed, ...prev]);
      Alert.alert("AI Insight ✨", `Found ${parsed.length} new relevant trends for ${profile?.name ?? 'you'}!`);
    } catch (error) {
      console.error("Gemini Error:", error);
      Alert.alert("Error", "Could not fetch AI trends at this moment. Try again later.");
    } finally {
      setIsFetchingAi(false);
    }
  };

  const handleOpenLink = async (url: string) => {
    try { await WebBrowser.openBrowserAsync(url); }
    catch { Alert.alert("Error", "Could not open the link."); }
  };

  const TYPE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
    video: 'play-circle', article: 'document-text', study: 'analytics', material: 'library',
  };

  const renderTrendItem = ({ item }: { item: TrendItem }) => {
    const isAi = item.id.startsWith('ai-');
    return (
      <TouchableOpacity
        style={[styles.itemCard, { backgroundColor: colors.card, borderColor: isAi ? colors.accent + '80' : colors.border }]}
        onPress={() => handleOpenLink(item.url)}
        activeOpacity={0.75}
      >
        <View style={styles.itemHeader}>
          <View style={[styles.typeBadge, { backgroundColor: (isAi ? colors.accent : colors.primary) + '18' }]}>
            <Ionicons name={isAi ? 'sparkles' : (TYPE_ICONS[item.type] ?? 'document-text')} size={13} color={isAi ? colors.accent : colors.primary} />
            <Text style={[styles.typeText, { color: isAi ? colors.accent : colors.primary }]}>
              {isAi ? 'AI INSIGHT' : item.type.toUpperCase()}
            </Text>
          </View>
          <Text style={[styles.sourceText, { color: colors.mutedForeground }]}>{item.source}</Text>
        </View>
        <Text style={[styles.itemTitle, { color: colors.foreground }]}>{item.title}</Text>
        <Text style={[styles.itemDescription, { color: colors.mutedForeground }]} numberOfLines={3}>{item.description}</Text>
        <View style={styles.itemFooter}>
          <View style={[styles.categoryBadge, { backgroundColor: colors.primary + '12' }]}>
            <Text style={[styles.categoryText, { color: colors.primary }]}>{CATEGORY_LABELS[item.category] ?? item.category}</Text>
          </View>
          <View style={styles.goButton}>
            <Text style={[styles.goButtonText, { color: colors.primary }]}>Explore</Text>
            <Ionicons name="arrow-forward" size={15} color={colors.primary} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <LinearGradient colors={[colors.primary + '30', colors.background]} style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>Trend & Study</Text>
            <Text style={[styles.headerSubtitle, { color: colors.mutedForeground }]}>
              Curated for {profile?.name ?? 'your child'}'s growth
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.aiFetchBtn, { backgroundColor: colors.accent }]}
            onPress={fetchAiTrends}
            disabled={isFetchingAi}
          >
            {isFetchingAi ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <>
                <Ionicons name="sparkles" size={16} color="white" />
                <Text style={styles.aiFetchText}>Real-time AI</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.filterSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryList}>
          {['all', ...TREND_CATEGORIES].map(cat => (
            <TouchableOpacity
              key={cat}
              onPress={() => setSelectedCategory(cat)}
              style={[
                styles.categoryChip,
                {
                  backgroundColor: selectedCategory === cat ? colors.primary : colors.card,
                  borderColor: selectedCategory === cat ? colors.primary : colors.border,
                },
              ]}
            >
              <Text style={[styles.categoryChipText, { color: selectedCategory === cat ? 'white' : colors.foreground }]}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.ageToggleContainer}>
          <TouchableOpacity
            style={[styles.toggleBtn, useChildAge && { backgroundColor: colors.primary + '12' }]}
            onPress={() => setUseChildAge(!useChildAge)}
          >
            <Ionicons name={useChildAge ? 'checkmark-circle' : 'ellipse-outline'} size={20} color={useChildAge ? colors.primary : colors.mutedForeground} />
            <Text style={[styles.toggleText, { color: colors.foreground }]}>
              Age-relevant for {profile?.name ?? 'Child'} ({ageMonths}m)
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={filteredTrends}
        renderItem={renderTrendItem}
        keyExtractor={(item, index) => item.id + index}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              No trends found. Try "Real-time AI" above!
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingTop: 10 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 28, fontFamily: 'Inter_700Bold' },
  headerSubtitle: { fontSize: 13, marginTop: 4, fontFamily: 'Inter_400Regular' },
  aiFetchBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 9, borderRadius: 22, gap: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 4, elevation: 2 },
  aiFetchText: { color: 'white', fontSize: 12, fontFamily: 'Inter_700Bold' },
  filterSection: { marginBottom: 6 },
  categoryList: { paddingHorizontal: 20, paddingBottom: 14, gap: 8 },
  categoryChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  categoryChipText: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  ageToggleContainer: { paddingHorizontal: 20, marginBottom: 8 },
  toggleBtn: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 12, alignSelf: 'flex-start' },
  toggleText: { marginLeft: 8, fontSize: 14, fontFamily: 'Inter_400Regular' },
  listContent: { padding: 20, paddingBottom: 100 },
  itemCard: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 },
      android: { elevation: 3 },
      web: { boxShadow: '0 4px 12px rgba(0,0,0,0.05)' },
    }),
  },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  typeBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  typeText: { fontSize: 10, fontFamily: 'Inter_700Bold', marginLeft: 4 },
  sourceText: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  itemTitle: { fontSize: 17, fontFamily: 'Inter_700Bold', marginBottom: 7, letterSpacing: -0.2 },
  itemDescription: { fontSize: 14, lineHeight: 20, marginBottom: 12, fontFamily: 'Inter_400Regular' },
  itemFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 },
  categoryBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  categoryText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  goButton: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  goButtonText: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyText: { marginTop: 12, fontSize: 15, fontFamily: 'Inter_400Regular', textAlign: 'center' },
});
