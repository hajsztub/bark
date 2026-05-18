# Bark Battle: Dog Duel

A casual mobile battler where cute dogs compete in barking duels. Portrait 9:16, Android first.

## Tech Stack

- **Engine**: Unity 2022.3 LTS (2D)
- **Platform**: Android (primary), iOS (after validation)
- **Target SDK**: Android 23+ / iOS 12+
- **Orientation**: Portrait only (9:16)

## Quick Start

1. Open in Unity Hub using Unity 2022.3.20f1
2. Load scene `Assets/Scenes/Home.unity`
3. Press Play

## Project Structure

```
Assets/
├── Scripts/
│   ├── Battle/         # BattleController, BarkSystem, StaminaSystem, WaveSystem, VFXManager
│   ├── Skills/         # SkillController, SkillConfig (ScriptableObject)
│   ├── Dogs/           # DogConfig, SkinConfig (ScriptableObjects)
│   ├── Bot/            # BotController, BotConfig (ScriptableObject)
│   ├── Economy/        # EconomyManager, RewardConfig
│   ├── Save/           # SaveManager, PlayerSaveData
│   ├── UI/             # HomeScreen, DogCollectionScreen, BattleHUD, RewardScreen
│   ├── Analytics/      # AnalyticsManager
│   ├── Ads/            # AdManager (placeholder)
│   └── Core/           # GameManager, AudioManager
├── Data/
│   ├── Dogs/           # dogs_data.json
│   ├── Skills/         # skills_data.json
│   ├── Bots/           # bots_data.json
│   ├── Economy/        # economy_config.json
│   ├── Leagues/        # leagues_data.json
│   └── Skins/          # skins_data.json
├── Scenes/             # Home, Battle, DogCollection
├── Sprites/            # Dogs, UI, VFX (art assets)
├── Audio/              # SFX, Music
├── VFX/                # Particle prefabs
└── Prefabs/            # UI, Battle, Dogs
```

## Core Gameplay

- **BARK**: Tap (weak) / Hold+Release (charged) — main attack
- **HOWL**: Power boost for 2s (10s cooldown)
- **TREAT**: +40 Stamina instantly (12s cooldown)
- **SHIELD**: 50% damage reduction for 2s (14s cooldown)
- Win by reducing opponent Confidence to 0, or having more Confidence when timer ends

## MVP Dogs

| Dog | Role | Bark Power | Stamina | Focus |
|-----|------|-----------|---------|-------|
| Samoyed | Tank/Power | 8/10 | 9/10 | 5/10 |
| Shiba | Balanced | 7/10 | 7/10 | 7/10 |
| Corgi | Fast/Cute | 5/10 | 6/10 | 9/10 |

## Production Roadmap

| Sprint | Scope |
|--------|-------|
| Sprint 1 | Battle engine, 1 dog vs bot, BARK/stamina/confidence/timer |
| Sprint 2 | 3 dogs, 3 skills, bot difficulty, VFX, SFX placeholder |
| Sprint 3 | Home, Dog Collection, upgrades, rewards, local save |
| Sprint 4 | Rewarded ads, interstitial, shop placeholder/IAP |
| Sprint 5 | Tutorial, balancing, analytics, Android AAB build |

## Analytics Events

All events defined in `AnalyticsManager.cs`:
`tutorial_start`, `tutorial_complete`, `battle_start`, `battle_end`, `reward_claim`,
`ad_offer_show`, `ad_start`, `ad_complete`, `interstitial_show`, `upgrade`, `skin_equip`, `shop_open`

## Monetization

- **Rewarded Ads**: x2 rewards after battle (most important placement)
- **Interstitial**: After every 3 battles (never first battle, never mid-battle)
- **IAP**: Remove Ads (9.99 PLN), Starter Pack with Royal Fluff Samoyed ($1.99), Gem Packs
