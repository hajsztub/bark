# Bark Battle: Dog Duel

Mobile casual battle game — cute dogs compete in barking duels. React Native + Expo.

## Tech Stack

- **Framework**: Expo SDK 54 + React Native (New Architecture)
- **Language**: TypeScript
- **Rendering**: @shopify/react-native-skia (wave canvas)
- **Gestures**: react-native-gesture-handler
- **State**: Zustand + AsyncStorage
- **Platform**: Android (primary), iOS

## Quick Start

```bash
npm install
npx expo start
# Scan QR with Expo Go app, or press 'a' for Android emulator
```

## Project Structure

```
src/
├── types/          # Shared TypeScript types
├── data/           # Static game data (dogs, skills, bots)
├── store/          # Zustand save store (AsyncStorage)
├── game/
│   ├── battle/     # BattleEngine.ts (pure logic), useBattle.ts (hook)
│   └── bot/        # useBotAI.ts (AI with reaction delay + skill logic)
├── screens/        # HomeScreen, BattleScreen, RewardScreen, DogsScreen
├── components/
│   └── battle/     # WaveCanvas (Skia), SkillButton
└── utils/          # theme.ts
App.tsx             # Root navigator (simple state machine)
```

## Core Gameplay

- **BARK**: Press & hold to charge, release to fire wave
- **HOWL**: Power ×1.8 for 2s (10s cooldown)
- **TREAT**: +40 Stamina instantly (12s cooldown)
- **SHIELD**: −50% damage for 2s (14s cooldown)
- **Win**: Push confidence to 0, or have more confidence when 60s timer ends

## Dogs (MVP)

| Dog | Role | Bark | Stamina | Focus |
|-----|------|------|---------|-------|
| Samoyed | Tank/Power | 8 | 9 | 5 |
| Shiba | Balanced | 7 | 7 | 7 |
| Corgi | Fast/Cute | 5 | 6 | 9 |

## Build for Android

```bash
npx expo run:android      # local build
npx eas build -p android  # cloud build (EAS)
```
