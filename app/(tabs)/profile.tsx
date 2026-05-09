import React from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  SafeAreaView, Platform, useColorScheme 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { useColors } from '@/hooks/useColors';
import { useProfile } from '@/context/ProfileContext';

export default function MoreHubScreen() {
  const colors = useColors();
  const router = useRouter();
  const { profile } = useProfile();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const HubCard = ({ title, subtitle, icon, route, color }: any) => (
    <TouchableOpacity 
      onPress={() => router.push(route)}
      style={[styles.cardWrapper, { shadowColor: color }]}
    >
      <BlurView intensity={isDark ? 20 : 40} tint={isDark ? 'dark' : 'light'} style={styles.cardInner}>
        <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon} size={28} color={color} />
        </View>
        <View style={styles.cardText}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
      </BlurView>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* Profile Header */}
        <View style={styles.header}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>{profile?.name?.charAt(0) || 'P'}</Text>
          </View>
          <View>
            <Text style={[styles.userName, { color: colors.text }]}>{profile?.name || 'Parth Shah'}</Text>
            <Text style={[styles.userRole, { color: colors.textSecondary }]}>Parent & Guide</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Growth Hub</Text>

        {/* The Three Main Hub Entry Points */}
        <HubCard 
          title="Daily Journal" 
          subtitle="Capture memories & milestones" 
          icon="book" 
          route="/journal" 
          color="#FF6B6B" 
        />

        <HubCard 
          title="Nutrition Guide" 
          subtitle="Brain-fuel recipes & schedules" 
          icon="restaurant" 
          route="/nutrition" 
          color="#4ECDC4" 
        />

        <HubCard 
          title="Insights & Trends" 
          subtitle="Latest in neuroscience & play" 
          icon="newspaper" 
          route="/trends" 
          color="#45B7D1" 
        />

        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 30 }]}>Account & Support</Text>

        {/* Settings / Profile items */}
        <TouchableOpacity style={styles.settingItem}>
          <Ionicons name="person-outline" size={22} color={colors.text} />
          <Text style={[styles.settingText, { color: colors.text }]}>Edit Child Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <Ionicons name="notifications-outline" size={22} color={colors.text} />
          <Text style={[styles.settingText, { color: colors.text }]}>Reminders & Alerts</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <Ionicons name="shield-checkmark-outline" size={22} color={colors.text} />
          <Text style={[styles.settingText, { color: colors.text }]}>Privacy & Data</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 100 },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 40, 
    marginTop: 20 
  },
  avatar: { 
    width: 65, 
    height: 65, 
    borderRadius: 32.5, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  avatarText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  userName: { fontSize: 22, fontWeight: 'bold' },
  userRole: { fontSize: 14 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 15, marginLeft: 5 },
  cardWrapper: {
    marginBottom: 15,
    borderRadius: 20,
    elevation: 8,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
  },
  cardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 17, fontWeight: '600' },
  cardSubtitle: { fontSize: 13, marginTop: 2 },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  settingText: { fontSize: 16, marginLeft: 15 },
});