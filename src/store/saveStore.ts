import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PlayerSave } from '../types';

const SAVE_KEY = 'bark_battle_save_v1';

const DEFAULT_SAVE: PlayerSave = {
  playerName: 'FluffySam',
  coins: 500,
  gems: 100,
  trophies: 0,
  selectedDogId: 'samoyed',
  selectedSkinId: 'samoyed_default',
  battleCount: 0,
  totalWins: 0,
  totalLosses: 0,
  dogLevels: { samoyed: 1, shiba: 1, corgi: 1 },
  unlockedDogs: ['samoyed'],
  unlockedSkins: ['samoyed_default'],
  dogFragments: { samoyed: 0, shiba: 0, corgi: 0 },
  chestProgress: 0,
  lastDailyReward: 0,
  tutorialCompleted: false,
  hasRemovedAds: false,
};

interface SaveStore {
  data: PlayerSave;
  loaded: boolean;
  load: () => Promise<void>;
  save: () => Promise<void>;
  reset: () => Promise<void>;
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  addGems: (amount: number) => void;
  spendGems: (amount: number) => boolean;
  addTrophies: (delta: number) => void;
  getDogLevel: (dogId: string) => number;
  setDogLevel: (dogId: string, level: number) => void;
  isDailyRewardAvailable: () => boolean;
  claimDailyReward: () => void;
  addChestProgress: (amount: number) => void;
  unlockSkin: (skinId: string) => void;
  unlockDog: (dogId: string) => void;
  addFragments: (dogId: string, amount: number) => void;
  recordBattle: (won: boolean) => void;
  getLeagueName: () => string;
}

export const useSaveStore = create<SaveStore>((set, get) => ({
  data: { ...DEFAULT_SAVE },
  loaded: false,

  load: async () => {
    try {
      const raw = await AsyncStorage.getItem(SAVE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as PlayerSave;
        set({ data: { ...DEFAULT_SAVE, ...parsed }, loaded: true });
      } else {
        set({ loaded: true });
      }
    } catch {
      set({ loaded: true });
    }
  },

  save: async () => {
    try {
      await AsyncStorage.setItem(SAVE_KEY, JSON.stringify(get().data));
    } catch {}
  },

  reset: async () => {
    set({ data: { ...DEFAULT_SAVE } });
    await AsyncStorage.removeItem(SAVE_KEY);
  },

  addCoins: (amount) => {
    set(s => ({ data: { ...s.data, coins: s.data.coins + amount } }));
    get().save();
  },

  spendCoins: (amount) => {
    if (get().data.coins < amount) return false;
    set(s => ({ data: { ...s.data, coins: s.data.coins - amount } }));
    get().save();
    return true;
  },

  addGems: (amount) => {
    set(s => ({ data: { ...s.data, gems: s.data.gems + amount } }));
    get().save();
  },

  spendGems: (amount) => {
    if (get().data.gems < amount) return false;
    set(s => ({ data: { ...s.data, gems: s.data.gems - amount } }));
    get().save();
    return true;
  },

  addTrophies: (delta) => {
    set(s => ({ data: { ...s.data, trophies: Math.max(0, s.data.trophies + delta) } }));
    get().save();
  },

  getDogLevel: (dogId) => get().data.dogLevels[dogId] ?? 1,

  setDogLevel: (dogId, level) => {
    set(s => ({
      data: { ...s.data, dogLevels: { ...s.data.dogLevels, [dogId]: level } },
    }));
    get().save();
  },

  isDailyRewardAvailable: () => {
    const last = get().data.lastDailyReward;
    if (!last) return true;
    return Date.now() - last > 24 * 60 * 60 * 1000;
  },

  claimDailyReward: () => {
    set(s => ({ data: { ...s.data, lastDailyReward: Date.now() } }));
    get().save();
  },

  addChestProgress: (amount) => {
    set(s => ({
      data: { ...s.data, chestProgress: Math.min(1, s.data.chestProgress + amount) },
    }));
    get().save();
  },

  unlockSkin: (skinId) => {
    const { unlockedSkins } = get().data;
    if (!unlockedSkins.includes(skinId)) {
      set(s => ({ data: { ...s.data, unlockedSkins: [...s.data.unlockedSkins, skinId] } }));
      get().save();
    }
  },

  unlockDog: (dogId) => {
    const { unlockedDogs } = get().data;
    if (!unlockedDogs.includes(dogId)) {
      set(s => ({ data: { ...s.data, unlockedDogs: [...s.data.unlockedDogs, dogId] } }));
      get().save();
    }
  },

  addFragments: (dogId, amount) => {
    set(s => ({
      data: {
        ...s.data,
        dogFragments: {
          ...s.data.dogFragments,
          [dogId]: (s.data.dogFragments[dogId] ?? 0) + amount,
        },
      },
    }));
    get().save();
  },

  recordBattle: (won) => {
    set(s => ({
      data: {
        ...s.data,
        battleCount: s.data.battleCount + 1,
        totalWins: won ? s.data.totalWins + 1 : s.data.totalWins,
        totalLosses: won ? s.data.totalLosses : s.data.totalLosses + 1,
      },
    }));
    get().save();
  },

  getLeagueName: () => {
    const t = get().data.trophies;
    if (t < 200) return 'Bronze I';
    if (t < 400) return 'Bronze II';
    if (t < 600) return 'Bronze III';
    if (t < 800) return 'Silver I';
    if (t < 1000) return 'Silver II';
    if (t < 1200) return 'Silver III';
    if (t < 1500) return 'Gold I';
    if (t < 1800) return 'Gold II';
    if (t < 2100) return 'Gold III';
    if (t < 2500) return 'Platinum I';
    return 'Diamond';
  },
}));
