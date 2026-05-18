# Bark Battle – Asset Guide

## Folder structure

```
assets/
├── dogs/          ← dog sprite sheets (400×400 PNG, transparent)
├── skins/         ← skin thumbnails (300×300 PNG, transparent)
├── backgrounds/   ← full-screen backgrounds (1080×1920 PNG or WebP)
├── ui/            ← buttons, icons, logos (PNG, transparent)
└── fx/            ← effect overlays (PNG or WebP)
```

---

## dogs/

One file per dog per state. All **400×400 px, PNG with transparency**.

| Filename               | When used                        |
|------------------------|----------------------------------|
| samoyed_idle.png       | Home screen, Dogs screen preview |
| samoyed_bark.png       | During BARK button press         |
| samoyed_hit.png        | When receiving damage            |
| samoyed_victory.png    | Reward screen – win              |
| samoyed_defeat.png     | Reward screen – loss             |
| shiba_idle.png         | …same pattern                    |
| shiba_bark.png         |                                  |
| shiba_hit.png          |                                  |
| shiba_victory.png      |                                  |
| shiba_defeat.png       |                                  |
| corgi_idle.png         |                                  |
| corgi_bark.png         |                                  |
| corgi_hit.png          |                                  |
| corgi_victory.png      |                                  |
| corgi_defeat.png       |                                  |

---

## skins/

Skin preview images for the Shop screen. **300×300 px, PNG with transparency**.

| Filename                    | Description         |
|-----------------------------|---------------------|
| samoyed_royal_fluff.png     | Default unlock      |
| samoyed_samurai.png         | Gem unlock          |
| samoyed_astronaut.png       | Gem unlock          |
| samoyed_snow_rider.png      | Coin unlock         |
| samoyed_gentleman.png       | Gem unlock          |
| shiba_*.png                 | …same pattern       |
| corgi_*.png                 | …same pattern       |

---

## backgrounds/

Full-screen backgrounds. **1080×1920 px** (portrait). Use **WebP** for smaller file size.

| Filename           | Screen           |
|--------------------|------------------|
| home_bg.webp       | Home screen      |
| battle_arena.webp  | Battle screen    |
| shop_bg.webp       | Shop screen      |

---

## ui/

UI elements. **PNG with transparency**.

| Filename               | Size       | Used for                     |
|------------------------|------------|------------------------------|
| logo.png               | 600×200    | Home screen logo             |
| bark_button.png        | 300×300    | BARK button normal state     |
| bark_button_active.png | 300×300    | BARK button pressed state    |
| coin_icon.png          | 128×128    | Currency display             |
| gem_icon.png           | 128×128    | Currency display             |
| trophy_icon.png        | 128×128    | Trophies display             |
| chest_icon.png         | 128×128    | Chest progress               |
| speech_woof.png        | 200×120    | Battle speech bubble         |
| speech_waf.png         | 200×120    | Battle speech bubble (enemy) |
| fragment_icon.png      | 128×128    | Dog fragments                |

---

## fx/

Visual effects. **PNG with transparency** or **WebP**.

| Filename              | Size       | Used for                      |
|-----------------------|------------|-------------------------------|
| bark_wave_blue.png    | 800×200    | Player bark wave effect       |
| bark_wave_orange.png  | 800×200    | Enemy bark wave effect        |
| confetti_sheet.png    | 512×512    | Victory screen confetti       |
| clash_fx.png          | 400×400    | Bark clash center effect      |

---

## Expo required assets (already in place)

| File                  | Size        | Notes                        |
|-----------------------|-------------|------------------------------|
| icon.png              | 1024×1024   | App icon (all platforms)     |
| adaptive-icon.png     | 1024×1024   | Android adaptive icon        |
| splash-icon.png       | 1284×2778   | Splash screen                |
| favicon.png           | 48×48       | Web browser tab              |

---

## How to activate images in code

1. Drop your PNG files into the right folder
2. Open `src/data/dogs.ts`
3. Uncomment the import lines for each dog
4. Uncomment the `images:` field in each dog object

That's it — `DogSprite` component will automatically switch from emoji to real art.
