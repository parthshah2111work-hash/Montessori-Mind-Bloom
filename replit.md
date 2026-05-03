# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Lumina Growth Mobile App (`artifacts/mobile`)

**Purpose**: Apple-esque Expo mobile app for parents tracking toddler development from 0–5 years.

**Stack**: Expo SDK 54, expo-router (file-based), React Native, AsyncStorage, @expo/vector-icons (Ionicons), expo-linear-gradient, expo-haptics, Inter font family (400/600/700), @google/genai (Gemini AI).

### Color Tokens (`constants/colors.ts`)
- `primary` = "#4a7c59" (sage green)
- `background` = "#faf8f5" (warm white)
- `accent` = "#e8a87c" (peach)
- `lavender` = "#b8a9d4"
- `muted` = "#f0ebe3"
- `destructive` = "#d4614e"
- `foreground` / `text` = "#1a1a1a"

### Tab Structure (8 tabs)
`Home → Activities → Trends → Milestones → Nutrition → Health → Journal → Profile`

### Key Files
- `constants/data.ts` — 70+ Montessori activities (10 phases, 0–60m), 14 milestone entries, 6 nutrition entries, health types (Vaccination/Prescription/Medicine/GrowthRecord), 14 TRENDS articles, DEFAULT_VACCINATIONS (6 entries), helpers: `getActivitiesForAge()`, `getMilestonesForAge()`, `getNutritionForAge()`, `getPhaseForAge()`, `getTrendsForAge()`, `PHASE_INFO`, `TREND_CATEGORIES`, `CATEGORY_LABELS`
- `context/AppContext.tsx` — DOB-based age calc, journal entries, onboarding state, completed/favorites, health state (vaccinations/prescriptions/medicines/growthHistory) with all CRUD methods
- `app/onboarding.tsx` — onboarding screen with name + DOB picker + live age preview
- `app/_layout.tsx` — onboarding redirect logic using `useSegments`
- `app/(tabs)/_layout.tsx` — 8-tab layout: Home, Activities, Trends, Milestones, Nutrition, Health, Journal, Profile
- `app/(tabs)/index.tsx` — Home screen with daily quests, streak calendar, 5-pillars progress, AI assistant banner
- `app/(tabs)/health.tsx` — Health Library: vaccinations (with DEFAULT_VACCINATIONS), prescriptions (photo), medicines, growth tracking
- `app/(tabs)/trends.tsx` — Trends & Study: 14 curated research articles/videos, age filter, Real-time AI fetch via Gemini
- `app/assistant.tsx` — Lumina AI chat: Gemini-powered parenting assistant with child health context
- `app/(tabs)/journal.tsx` — Growth Journal with modal entry form, mood picker, card display
- `app/activity/[id].tsx` — activity detail screen with expandable sections
- `components/ActivityCard.tsx` — card component using `PHASE_INFO` for age label

### AsyncStorage Keys
- `profile_v2` (ChildProfile with dateOfBirth)
- `completed`, `favorites`, `milestones`, `journal`, `onboarding_done`
- `activity_completions` (ActivityCompletion[] for streak tracking)
- `vaccinations`, `prescriptions`, `medicines`, `growthHistory` (health data)

### Environment Variables / Secrets
- `EXPO_PUBLIC_GEMINI_API_KEY` — Google Gemini API key for AI Assistant chat and Real-time AI Trends. Get free key at https://aistudio.google.com/apikey

### Important Notes
- `Inter_500Medium` is NOT loaded — use `Inter_400Regular`, `Inter_600SemiBold`, or `Inter_700Bold`
- `MontessoriActivity` has `minMonths`, `maxMonths`, `phase` — NO `ageRange` field; derive labels from `PHASE_INFO[activity.phase].range`
- `NUTRITION_BY_AGE` replaces old `NUTRITION` export; use `getNutritionForAge(months)` helper
- Gemini model used: `gemini-2.0-flash` (both assistant.tsx and trends.tsx)
- Health Library seeds DEFAULT_VACCINATIONS (BCG, Hep B-1, DTP-1, IPV-1, MMR-1, Varicella) on first load
