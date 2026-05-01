import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { ACTIVITIES, MontessoriActivity } from "@/constants/data";

interface ChildProfile {
  name: string;
  birthMonth: number; // age in months
  parentNames: string;
}

interface AppContextType {
  profile: ChildProfile;
  updateProfile: (updates: Partial<ChildProfile>) => void;
  completedActivityIds: string[];
  toggleActivityComplete: (id: string) => void;
  todayQuests: MontessoriActivity[];
  favoriteActivityIds: string[];
  toggleFavorite: (id: string) => void;
  masteredMilestones: string[];
  toggleMilestone: (id: string) => void;
}

const DEFAULT_PROFILE: ChildProfile = {
  name: "Jashvi",
  birthMonth: 16,
  parentNames: "Parth & Radha",
};

const AppContext = createContext<AppContextType | null>(null);

function getDailyQuests(ageMonths: number): MontessoriActivity[] {
  const phase =
    ageMonths <= 20 ? "explorer" : ageMonths <= 24 ? "communicator" : "builder";
  const phaseActivities = ACTIVITIES.filter((a) => a.phase === phase);
  // Pick 3 deterministic quests based on day of year
  const dayOfYear = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  const shuffled = [...phaseActivities].sort((a, b) => {
    const ha =
      (a.id.charCodeAt(0) + dayOfYear) % phaseActivities.length;
    const hb =
      (b.id.charCodeAt(0) + dayOfYear) % phaseActivities.length;
    return ha - hb;
  });
  return shuffled.slice(0, 3);
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<ChildProfile>(DEFAULT_PROFILE);
  const [completedActivityIds, setCompleted] = useState<string[]>([]);
  const [favoriteActivityIds, setFavorites] = useState<string[]>([]);
  const [masteredMilestones, setMastered] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [p, c, f, m] = await Promise.all([
          AsyncStorage.getItem("profile"),
          AsyncStorage.getItem("completed"),
          AsyncStorage.getItem("favorites"),
          AsyncStorage.getItem("milestones"),
        ]);
        if (p) setProfile(JSON.parse(p));
        if (c) setCompleted(JSON.parse(c));
        if (f) setFavorites(JSON.parse(f));
        if (m) setMastered(JSON.parse(m));
      } catch {}
    })();
  }, []);

  const updateProfile = useCallback((updates: Partial<ChildProfile>) => {
    setProfile((prev) => {
      const next = { ...prev, ...updates };
      AsyncStorage.setItem("profile", JSON.stringify(next));
      return next;
    });
  }, []);

  const toggleActivityComplete = useCallback((id: string) => {
    setCompleted((prev) => {
      const next = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id];
      AsyncStorage.setItem("completed", JSON.stringify(next));
      return next;
    });
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id];
      AsyncStorage.setItem("favorites", JSON.stringify(next));
      return next;
    });
  }, []);

  const toggleMilestone = useCallback((id: string) => {
    setMastered((prev) => {
      const next = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id];
      AsyncStorage.setItem("milestones", JSON.stringify(next));
      return next;
    });
  }, []);

  const todayQuests = getDailyQuests(profile.birthMonth);

  return (
    <AppContext.Provider
      value={{
        profile,
        updateProfile,
        completedActivityIds,
        toggleActivityComplete,
        todayQuests,
        favoriteActivityIds,
        toggleFavorite,
        masteredMilestones,
        toggleMilestone,
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
