import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? "";
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: number;
}

export default function AssistantScreen() {
  const colors = useColors();
  const router = useRouter();
  const { profile, ageMonths, vaccinations, medicines, growthHistory } = useApp();
  const scrollViewRef = useRef<ScrollView>(null);

  const [messages, setMessages] = useState<Message[]>([{
    id: '1',
    text: `Hello! I'm Lumina — your personalised Montessori & health assistant for ${profile?.name ?? 'your child'}. Ask me anything about activities, milestones, nutrition, sleep, or health!`,
    sender: 'ai',
    timestamp: Date.now(),
  }]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const QUICK_PROMPTS = [
    `Best activities for ${ageMonths} months?`,
    "Sleep tips for toddlers",
    "Iron-rich foods for babies",
    "How to encourage first words?",
  ];

  const sendMessage = async (text?: string) => {
    const msg = (text ?? inputText).trim();
    if (!msg) return;

    if (!ai) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: "AI assistant is not configured. Please add EXPO_PUBLIC_GEMINI_API_KEY to your environment secrets to enable this feature.",
        sender: 'ai',
        timestamp: Date.now(),
      }]);
      return;
    }

    const userMessage: Message = { id: Date.now().toString(), text: msg, sender: 'user', timestamp: Date.now() };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const latestGrowth = growthHistory.length > 0 ? growthHistory[growthHistory.length - 1] : null;
      const healthContext = `
Child Health Data:
- Vaccinations: ${vaccinations.slice(0, 4).map(v => `${v.name} (${v.isCompleted ? 'Done' : 'Due: ' + new Date(v.dueDate).toLocaleDateString()})`).join(', ')}
- Current Medicines: ${medicines.map(m => m.name).join(', ') || 'None'}
- Latest Growth: ${latestGrowth ? `${latestGrowth.weight}kg, ${latestGrowth.height}cm` : 'No data recorded'}
      `.trim();

      const prompt = `You are Lumina — a world-class Montessori educator and paediatrician assistant.
Child: ${profile?.name ?? 'Child'}, Age: ${ageMonths} months old.
${healthContext}

Your role: Give warm, practical, science-backed advice about child development, Montessori activities, nutrition, sleep, and health.
Keep responses concise (3–4 short paragraphs max). Be empathetic, encouraging, and practical. Use bullet points when listing steps.

Parent's question: ${msg}`;

      const response = await ai.models.generateContent({ model: "gemini-2.0-flash", contents: prompt });
      const responseText = response.text ?? "I couldn't generate a response. Please try again.";

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: 'ai',
        timestamp: Date.now(),
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I'm having trouble connecting right now. Please check your connection and try again.",
        sender: 'ai',
        timestamp: Date.now(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{
        title: 'Lumina Assistant',
        headerShown: true,
        headerStyle: { backgroundColor: colors.card },
        headerTitleStyle: { fontFamily: 'Inter_700Bold', color: colors.foreground },
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 4 }}>
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
        ),
      }} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
        >
          {messages.length === 1 && (
            <View style={styles.quickPrompts}>
              <Text style={[styles.quickLabel, { color: colors.mutedForeground }]}>Quick questions</Text>
              <View style={styles.quickGrid}>
                {QUICK_PROMPTS.map((q) => (
                  <TouchableOpacity
                    key={q}
                    style={[styles.quickChip, { backgroundColor: colors.primary + '12', borderColor: colors.primary + '25' }]}
                    onPress={() => sendMessage(q)}
                  >
                    <Text style={[styles.quickChipText, { color: colors.primary }]}>{q}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {messages.map((msg) => (
            <View key={msg.id} style={[styles.messageRow, msg.sender === 'user' ? styles.userRow : styles.aiRow]}>
              {msg.sender === 'ai' && (
                <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                  <Ionicons name="sparkles" size={13} color="white" />
                </View>
              )}
              <View style={[
                styles.messageContainer,
                msg.sender === 'user'
                  ? [styles.userMessage, { backgroundColor: colors.primary }]
                  : [styles.aiMessage, { backgroundColor: colors.card, borderColor: colors.border }],
              ]}>
                <Text style={[styles.messageText, { color: msg.sender === 'user' ? 'white' : colors.foreground }]}>
                  {msg.text}
                </Text>
              </View>
            </View>
          ))}

          {isLoading && (
            <View style={[styles.messageRow, styles.aiRow]}>
              <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                <Ionicons name="sparkles" size={13} color="white" />
              </View>
              <View style={[styles.messageContainer, styles.aiMessage, { backgroundColor: colors.card, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', gap: 10 }]}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={[styles.messageText, { color: colors.mutedForeground, fontStyle: 'italic' }]}>Thinking...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        <View style={[styles.inputContainer, { borderTopColor: colors.border, backgroundColor: colors.card }]}>
          <TextInput
            style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
            placeholder={`Ask about ${profile?.name ?? 'your child'}'s development...`}
            placeholderTextColor={colors.mutedForeground}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, { backgroundColor: inputText.trim() ? colors.primary : colors.border }]}
            onPress={() => sendMessage()}
            disabled={!inputText.trim() || isLoading}
          >
            <Ionicons name="send" size={18} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  messageList: { padding: 16, paddingBottom: 24 },
  quickPrompts: { marginBottom: 20 },
  quickLabel: { fontSize: 12, fontFamily: 'Inter_600SemiBold', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  quickChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  quickChipText: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  messageRow: { flexDirection: 'row', marginBottom: 14, maxWidth: '88%' },
  userRow: { alignSelf: 'flex-end', justifyContent: 'flex-end' },
  aiRow: { alignSelf: 'flex-start' },
  avatar: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 8, marginTop: 4, flexShrink: 0 },
  messageContainer: { padding: 14, borderRadius: 20, borderWidth: 1, borderColor: 'transparent' },
  userMessage: { borderBottomRightRadius: 4 },
  aiMessage: { borderBottomLeftRadius: 4 },
  messageText: { fontSize: 15, fontFamily: 'Inter_400Regular', lineHeight: 22 },
  inputContainer: { flexDirection: 'row', padding: 14, paddingBottom: Platform.OS === 'ios' ? 28 : 14, alignItems: 'center', gap: 10, borderTopWidth: 1 },
  input: { flex: 1, borderWidth: 1, borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, maxHeight: 110, fontFamily: 'Inter_400Regular' },
  sendButton: { width: 46, height: 46, borderRadius: 23, justifyContent: 'center', alignItems: 'center' },
});
