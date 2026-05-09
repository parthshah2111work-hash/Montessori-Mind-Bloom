import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, View, useColorScheme } from "react-native";
import { useColors } from "@/hooks/useColors";

export default function TabLayout() {
  const colors = useColors();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          // Floating Island Graphics
          bottom: Platform.OS === 'android' ? 15 : 25,
          left: 15,
          right: 15,
          borderRadius: 25,
          height: 65,
          // Glass-morphism logic
          backgroundColor: isDark ? "rgba(20,20,20,0.75)" : "rgba(255,255,255,0.75)",
          borderTopWidth: 0,
          elevation: 12, // Deep shadow for Android
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          paddingBottom: 0,
        },
        tabBarBackground: () => (
          <BlurView
            intensity={90}
            tint={isDark ? "dark" : "light"}
            style={{ 
              ...StyleSheet.absoluteFillObject, 
              borderRadius: 25, 
              overflow: 'hidden' 
            }}
          />
        ),
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: "Inter_600SemiBold",
          marginBottom: 8,
        },
        tabBarIconStyle: {
          marginTop: 8,
        }
      }}
    >
      {/* 1. HOME */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "home" : "home-outline"} size={22} color={color} />
          ),
        }}
      />

      {/* 2. MILESTONES (Promoted to Main Bar) */}
      <Tabs.Screen
        name="milestones"
        options={{
          title: "Milestones",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "star" : "star-outline"} size={22} color={color} />
          ),
        }}
      />

      {/* 3. ACTIVITIES */}
      <Tabs.Screen
        name="activities"
        options={{
          title: "Play",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "extension-puzzle" : "extension-puzzle-outline"} size={22} color={color} />
          ),
        }}
      />

      {/* 4. HEALTH */}
      <Tabs.Screen
        name="health"
        options={{
          title: "Health",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "heart-half" : "heart-outline"} size={22} color={color} />
          ),
        }}
      />

      {/* 5. MORE (The Hub for Journal, Nutrition, Trends, and Profile) */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "More",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "apps" : "apps-outline"} size={22} color={color} />
          ),
        }}
      />

      {/* --- HIDDEN FROM NAV BAR --- */}
      <Tabs.Screen name="nutrition" options={{ href: null }} />
      <Tabs.Screen name="journal" options={{ href: null }} />
      <Tabs.Screen name="trends" options={{ href: null }} />
    </Tabs>
  );
}