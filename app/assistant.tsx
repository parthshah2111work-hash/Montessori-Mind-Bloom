import React, { useState, useRef, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TextInput, 
  TouchableOpacity, KeyboardAvoidingView, Platform, 
  ActivityIndicator, SafeAreaView, Keyboard 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useProfile, useHealth } from '../context/AppContext';
import { GoogleGenerativeAI } from "@google/genai";

// Initialize AI
const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? "";
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: number;
}

export default function AssistantScreen() {
  const colors = useColors();
  const { profile, ageMonths } = useProfile();
  const { vaccinations, growthHistory } = useHealth();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `Hi! I'm Lumina, your Montessori and health assistant. How can I help you and ${profile?.name || 'your little one'} today?`,
      sender: 'ai',
      timestamp: Date.now(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const sendMessage = async () => {
    if (!inputText.trim() || !genAI) return;

    const msg = inputText.trim();
    const userMessage: Message = {
      id: Date.now().toString(),
      text: msg,
      sender: 'user',
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    Keyboard.dismiss(); // Closes keyboard to ensure the input area resets correctly

    try {
      const latestGrowth = growthHistory.length > 0 ? growthHistory[growthHistory.length - 1] : null;
      const context = `Child: ${profile?.name}, Age: ${ageMonths} months. Growth: ${latestGrowth ? latestGrowth.weight + 'kg' : 'Unknown'}.`;

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `${context}\nUser: ${msg}\nAssistant: Give short, empathetic Montessori advice.`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: 'ai',
        timestamp: Date.now(),
      }]);

    } catch (error: any) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: `Error: ${error.message || "Connection failed. Please check your internet."}`,
        sender: 'ai',
        timestamp: Date.now(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Auto-scroll to bottom when messages change
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 150);
  }, [messages]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Lumina Assistant</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Empowering Right-Brain Growth</Text>
        </View>

        <ScrollView 
          ref={scrollViewRef}
          style={styles.chatContainer}
          contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 15 }}
        >
          {messages.map((m) => (
            <View 
              key={m.id} 
              style={[
                styles.messageBubble, 
                m.sender === 'user' ? [styles.userBubble, { backgroundColor: colors.primary }] : [styles.aiBubble, { backgroundColor: colors.card }]
              ]}
            >
              <Text style={[styles.messageText, { color: m.sender === 'user' ? '#fff' : colors.text }]}>
                {m.text}
              </Text>
            </View>
          ))}
          {isLoading && (
            <ActivityIndicator color={colors.primary} style={{ alignSelf: 'flex-start', marginVertical: 10 }} />
          )}
        </ScrollView>

        {/* Input Bar is now inside the KeyboardAvoidingView for stability */}
        <View style={[styles.inputContainer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <TextInput
            style={[styles.input, { color: colors.text, backgroundColor: colors.background }]}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            placeholderTextColor={colors.textSecondary}
            multiline
          />
          <TouchableOpacity 
            onPress={sendMessage}
            style={[styles.sendButton, { backgroundColor: colors.primary }]}
            disabled={isLoading || !inputText.trim()}
          >
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  title: { fontSize: 20, fontWeight: 'bold' },
  subtitle: { fontSize: 12 },
  chatContainer: { flex: 1 },
  messageBubble: { padding: 12, borderRadius: 16, marginVertical: 5, maxWidth: '85%' },
  userBubble: { alignSelf: 'flex-end', borderBottomRightRadius: 2 },
  aiBubble: { alignSelf: 'flex-start', borderBottomLeftRadius: 2 },
  messageText: { fontSize: 15, lineHeight: 20 },
  inputContainer: { 
    flexDirection: 'row', 
    padding: 12, 
    alignItems: 'center', 
    paddingBottom: Platform.OS === 'ios' ? 25 : 12 
  },
  input: { 
    flex: 1, 
    borderRadius: 20, 
    paddingHorizontal: 15, 
    paddingVertical: 8, 
    marginRight: 10, 
    fontSize: 16, 
    maxHeight: 100 
  },
  sendButton: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' }
});