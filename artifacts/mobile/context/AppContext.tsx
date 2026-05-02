import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { ACTIVITIES, getActivitiesForAge, getPhaseForAge, MontessoriActivity } from "@/constants/data";

export interface ChildProfile {
  name: string;
  dateOfBirth: string; // ISO date string
  parentNames: string;
}

interface AppContextType {
  profile: ChildProfile | null;
  ageMonths: number;
  updateProfile: (updates: Partial<ChildProfile>) => void;
  completedActivityIds: string[];
  toggleActivityComplete: (id: string) => void;
  todayQuests: MontessoriActivity[];
  favoriteActivityIds: string[];
  toggleFavorite: (id: string) => void;
  masteredMilestones: string[];
  toggleMilestone: (id: string) => void;
  isOnboardingDone: boolean;
  completeOnboarding: (profile: ChildProfile) => void;
  journalEntries: JournalEntry[];
  addJournalEntry: (entry: Omit<JournalEntry, "id" | "createdAt">) => void;
  deleteJournalEntry: (id: string) => void;
}

export interface JournalEntry {
  id: string;
  createdAt: string;
  ageMonths: number;
  newWord?: string;
  newSkill?: string;
  funnyMoment?: string;
  milestone?: string;
  mood: "wonderful" | "good" | "tired" | "challenging";
  photoUri?: string;
}

function calcAgeMonths(dob: string): number {
  const birth = new Date(dob);
  const now = new Date();
  const months =
    (now.getFullYear() - birth.getFullYear()) * 12 +
    (now.getMonth() - birth.getMonth()) -
    (now.getDate() < birth.getDate() ? 1 : 0);
  return Math.max(0, Math.min(60, months));
}

function getDailyQuests(ageMonths: number): MontessoriActivity[] {
  const eligible = getActivitiesForAge(ageMonths);
  const dayOfYear = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  const seeded = [...eligible].sort((a, b) => {
    const ha = (a.id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) + dayOfYear) % eligible.length;
    const hb = (b.id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) + dayOfYear) % eligible.length;
    return ha - hb;
  });
  return seeded.slice(0, 3);
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<ChildProfile | null>(null);
  const [isOnboardingDone, setOnboardingDone] = useState(false);
  const [completedActivityIds, setCompleted] = useState<string[]>([]);
  const [favoriteActivityIds, setFavorites] = useState<string[]>([]);
  const [masteredMilestones, setMastered] = useState<string[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [p, c, f, m, j, ob] = await Promise.all([
          AsyncStorage.getItem("profile_v2"),
          AsyncStorage.getItem("completed"),
          AsyncStorage.getItem("favorites"),
          AsyncStorage.getItem("milestones"),
          AsyncStorage.getItem("journal"),
          AsyncStorage.getItem("onboarding_done"),
        ]);
        if (p) setProfile(JSON.parse(p));
        if (c) setCompleted(JSON.parse(c));
        if (f) setFavorites(JSON.parse(f));
        if (m) setMastered(JSON.parse(m));
        if (j) setJournalEntries(JSON.parse(j));
        if (ob) setOnboardingDone(true);
      } catch {}
    })();
  }, []);

  const ageMonths = profile ? calcAgeMonths(profile.dateOfBirth) : 0;

  const completeOnboarding = useCallback((p: ChildProfile) => {
    setProfile(p);
    setOnboardingDone(true);
    AsyncStorage.setItem("profile_v2", JSON.stringify(p));
    AsyncStorage.setItem("onboarding_done", "1");
  }, []);

  const updateProfile = useCallback((updates: Partial<ChildProfile>) => {
    setProfile((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...updates };
      AsyncStorage.setItem("profile_v2", JSON.stringify(next));
      return next;
    });
  }, []);

  const toggleActivityComplete = useCallback((id: string) => {
    setCompleted((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      AsyncStorage.setItem("completed", JSON.stringify(next));
      return next;
    });
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      AsyncStorage.setItem("favorites", JSON.stringify(next));
      return next;
    });
  }, []);

  const toggleMilestone = useCallback((id: string) => {
    setMastered((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      AsyncStorage.setItem("milestones", JSON.stringify(next));
      return next;
    });
  }, []);

  const addJournalEntry = useCallback((entry: Omit<JournalEntry, "id" | "createdAt">) => {
    const newEntry: JournalEntry = {
      ...entry,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      createdAt: new Date().toISOString(),
    };
    setJournalEntries((prev) => {
      const next = [newEntry, ...prev];
      AsyncStorage.setItem("journal", JSON.stringify(next));
      return next;
    });
  }, []);

  const deleteJournalEntry = useCallback((id: string) => {
    setJournalEntries((prev) => {
      const next = prev.filter((e) => e.id !== id);
      AsyncStorage.setItem("journal", JSON.stringify(next));
      return next;
    });
  }, []);

  const todayQuests = getDailyQuests(ageMonths);

  return (
    <AppContext.Provider
      value={{
        profile,
        ageMonths,
        updateProfile,
        completedActivityIds,
        toggleActivityComplete,
        todayQuests,
        favoriteActivityIds,
        toggleFavorite,
        masteredMilestones,
        toggleMilestone,
        isOnboardingDone,
        completeOnboarding,
        journalEntries,
        addJournalEntry,
        deleteJournalEntry,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
