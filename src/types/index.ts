export type DogRarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
export type SkillType = 'HOWL' | 'TREAT' | 'SHIELD';
export type BattleResult = 'victory' | 'defeat' | 'draw';
export type Screen = 'home' | 'dogs' | 'battle' | 'rewards' | 'shop' | 'leagues';

export interface DogStats {
  barkPower: number; // 1-10
  stamina: number;   // 1-10
  focus: number;     // 1-10
}

export interface Dog {
  id: string;
  name: string;
  rarity: DogRarity;
  role: string;
  description: string;
  stats: DogStats;
  maxLevel: number;
  fragmentsRequired: number;
  emoji: string; // placeholder art
  color: string; // accent color
}

export interface Skin {
  id: string;
  name: string;
  dogId: string;
  rarity: DogRarity;
  unlockType: 'default' | 'coins' | 'gems' | 'fragments';
  unlockCost: number;
  vfxColor: string;
  isDefault: boolean;
}

export interface Skill {
  id: SkillType;
  name: string;
  cooldown: number;
  effectValue: number;
  duration: number;
  description: string;
  color: string;
  emoji: string;
}

export interface BotConfig {
  id: string;
  name: string;
  dogId: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  reactionDelay: number;
  aggression: number;  // 0-1
  mistakeRate: number; // 0-1
  trophies: number;
  leagueName: string;
}

export interface BattleEndResult {
  result: BattleResult;
  playerConfidence: number;
  botConfidence: number;
  duration: number;
  coinsEarned: number;
  gemsEarned: number;
  trophyDelta: number;
  fragmentsEarned: number;
  chestProgressAdded: number;
}

export interface PlayerSave {
  playerName: string;
  coins: number;
  gems: number;
  trophies: number;
  selectedDogId: string;
  selectedSkinId: string;
  battleCount: number;
  totalWins: number;
  totalLosses: number;
  dogLevels: Record<string, number>;
  unlockedDogs: string[];
  unlockedSkins: string[];
  dogFragments: Record<string, number>;
  chestProgress: number;
  lastDailyReward: number; // timestamp
  tutorialCompleted: boolean;
  hasRemovedAds: boolean;
}
