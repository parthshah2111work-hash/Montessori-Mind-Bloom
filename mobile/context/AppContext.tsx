import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ACTIVITIES,
  getActivitiesForAge,
  MontessoriActivity,
  Vaccination,
  Prescription,
  Medicine,
  GrowthRecord,
  DEFAULT_VACCINATIONS,
} from "@/constants/data";

export interface ChildProfile {
  name: string;
  dateOfBirth: string;
  parentNames: string;
}

export interface ActivityCompletion {
  activityId: string;
  completedAt: string;
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
  activityCompletions: ActivityCompletion[];
  activeDaysSet: ReadonlySet<string>;
  currentStreak: number;
  longestStreak: number;
  activeDaysThisWeek: number;
  vaccinations: Vaccination[];
  addVaccination: (v: Omit<Vaccination, "id">) => void;
  deleteVaccination: (id: string) => void;
  updateVaccination: (id: string, updates: Partial<Vaccination>) => void;
  prescriptions: Prescription[];
  addPrescription: (p: Omit<Prescription, "id">) => void;
  deletePrescription: (id: string) => void;
  medicines: Medicine[];
  addMedicine: (m: Omit<Medicine, "id">) => void;
  deleteMedicine: (id: string) => void;
  growthHistory: GrowthRecord[];
  addGrowthRecord: (r: Omit<GrowthRecord, "id">) => void;
  deleteGrowthRecord: (id: string) => void;
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

function toDateKey(iso: string): string {
  return iso.slice(0, 10);
}

function computeStreaks(activeDays: ReadonlySet<string>): { current: number; longest: number; thisWeek: number } {
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  const todayKey = todayDate.toISOString().slice(0, 10);

  let current = 0;
  const cursor = new Date(todayDate);
  if (!activeDays.has(todayKey)) cursor.setDate(cursor.getDate() - 1);
  while (true) {
    const key = cursor.toISOString().slice(0, 10);
    if (activeDays.has(key)) { current++; cursor.setDate(cursor.getDate() - 1); }
    else break;
  }

  const sorted = Array.from(activeDays).sort();
  let longest = 0, run = 0;
  let prev: string | null = null;
  for (const d of sorted) {
    if (prev) {
      const diff = (new Date(d).getTime() - new Date(prev).getTime()) / 86400000;
      run = diff === 1 ? run + 1 : 1;
    } else { run = 1; }
    if (run > longest) longest = run;
    prev = d;
  }

  const weekStart = new Date(todayDate);
  weekStart.setDate(todayDate.getDate() - ((todayDate.getDay() + 6) % 7));
  let thisWeek = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    if (activeDays.has(d.toISOString().slice(0, 10))) thisWeek++;
  }
  return { current, longest, thisWeek };
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<ChildProfile | null>(null);
  const [isOnboardingDone, setOnboardingDone] = useState(false);
  const [completedActivityIds, setCompleted] = useState<string[]>([]);
  const [favoriteActivityIds, setFavorites] = useState<string[]>([]);
  const [masteredMilestones, setMastered] = useState<string[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [activityCompletions, setActivityCompletions] = useState<ActivityCompletion[]>([]);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>(DEFAULT_VACCINATIONS);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [growthHistory, setGrowthHistory] = useState<GrowthRecord[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [p, c, f, m, j, ob, ac, v, pr, med, gh] = await Promise.all([
          AsyncStorage.getItem("profile_v2"),
          AsyncStorage.getItem("completed"),
          AsyncStorage.getItem("favorites"),
          AsyncStorage.getItem("milestones"),
          AsyncStorage.getItem("journal"),
          AsyncStorage.getItem("onboarding_done"),
          AsyncStorage.getItem("activity_completions"),
          AsyncStorage.getItem("vaccinations"),
          AsyncStorage.getItem("prescriptions"),
          AsyncStorage.getItem("medicines"),
          AsyncStorage.getItem("growthHistory"),
        ]);
        if (p) setProfile(JSON.parse(p));
        if (c) setCompleted(JSON.parse(c));
        if (f) setFavorites(JSON.parse(f));
        if (m) setMastered(JSON.parse(m));
        if (j) setJournalEntries(JSON.parse(j));
        if (ob) setOnboardingDone(true);
        if (ac) setActivityCompletions(JSON.parse(ac));
        if (v) setVaccinations(JSON.parse(v));
        if (pr) setPrescriptions(JSON.parse(pr));
        if (med) setMedicines(JSON.parse(med));
        if (gh) setGrowthHistory(JSON.parse(gh));
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
    setActivityCompletions((prev) => {
      const already = prev.some((c) => c.activityId === id);
      const next = already
        ? prev.filter((c) => c.activityId !== id)
        : [...prev, { activityId: id, completedAt: new Date().toISOString() }];
      AsyncStorage.setItem("activity_completions", JSON.stringify(next));
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

  const activeDaysSet = useMemo<ReadonlySet<string>>(() => {
    const set = new Set<string>();
    activityCompletions.forEach((c) => set.add(toDateKey(c.completedAt)));
    return set;
  }, [activityCompletions]);

  const { current: currentStreak, longest: longestStreak, thisWeek: activeDaysThisWeek } =
    useMemo(() => computeStreaks(activeDaysSet), [activeDaysSet]);

  const todayQuests = useMemo(() => getDailyQuests(ageMonths), [ageMonths]);

  const addVaccination = useCallback((v: Omit<Vaccination, "id">) => {
    const newV: Vaccination = { ...v, id: Date.now().toString() };
    setVaccinations((prev) => {
      const next = [...prev, newV].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
      AsyncStorage.setItem("vaccinations", JSON.stringify(next));
      return next;
    });
  }, []);

  const deleteVaccination = useCallback((id: string) => {
    setVaccinations((prev) => {
      const next = prev.filter((v) => v.id !== id);
      AsyncStorage.setItem("vaccinations", JSON.stringify(next));
      return next;
    });
  }, []);

  const updateVaccination = useCallback((id: string, updates: Partial<Vaccination>) => {
    setVaccinations((prev) => {
      const next = prev.map((v) => (v.id === id ? { ...v, ...updates } : v));
      AsyncStorage.setItem("vaccinations", JSON.stringify(next));
      return next;
    });
  }, []);

  const addPrescription = useCallback((p: Omit<Prescription, "id">) => {
    const newP: Prescription = { ...p, id: Date.now().toString() };
    setPrescriptions((prev) => {
      const next = [newP, ...prev];
      AsyncStorage.setItem("prescriptions", JSON.stringify(next));
      return next;
    });
  }, []);

  const deletePrescription = useCallback((id: string) => {
    setPrescriptions((prev) => {
      const next = prev.filter((p) => p.id !== id);
      AsyncStorage.setItem("prescriptions", JSON.stringify(next));
      return next;
    });
  }, []);

  const addMedicine = useCallback((m: Omit<Medicine, "id">) => {
    const newM: Medicine = { ...m, id: Date.now().toString() };
    setMedicines((prev) => {
      const next = [newM, ...prev];
      AsyncStorage.setItem("medicines", JSON.stringify(next));
      return next;
    });
  }, []);

  const deleteMedicine = useCallback((id: string) => {
    setMedicines((prev) => {
      const next = prev.filter((m) => m.id !== id);
      AsyncStorage.setItem("medicines", JSON.stringify(next));
      return next;
    });
  }, []);

  const addGrowthRecord = useCallback((r: Omit<GrowthRecord, "id">) => {
    const newR: GrowthRecord = { ...r, id: Date.now().toString() };
    setGrowthHistory((prev) => {
      const next = [...prev, newR].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      AsyncStorage.setItem("growthHistory", JSON.stringify(next));
      return next;
    });
  }, []);

  const deleteGrowthRecord = useCallback((id: string) => {
    setGrowthHistory((prev) => {
      const next = prev.filter((r) => r.id !== id);
      AsyncStorage.setItem("growthHistory", JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <AppContext.Provider
      value={{
        profile, ageMonths, updateProfile,
        completedActivityIds, toggleActivityComplete,
        todayQuests,
        favoriteActivityIds, toggleFavorite,
        masteredMilestones, toggleMilestone,
        isOnboardingDone, completeOnboarding,
        journalEntries, addJournalEntry, deleteJournalEntry,
        activityCompletions, activeDaysSet,
        currentStreak, longestStreak, activeDaysThisWeek,
        vaccinations, addVaccination, deleteVaccination, updateVaccination,
        prescriptions, addPrescription, deletePrescription,
        medicines, addMedicine, deleteMedicine,
        growthHistory, addGrowthRecord, deleteGrowthRecord,
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
