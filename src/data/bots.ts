import type { BotConfig } from '../types';

export const BOTS: BotConfig[] = [
  {
    id: 'bark_boss',
    name: 'BarkBoss',
    dogId: 'shiba',
    difficulty: 'easy',
    reactionDelay: 1.2,
    aggression: 0.3,
    mistakeRate: 0.4,
    trophies: 800,
    leagueName: 'Bronze I',
  },
  {
    id: 'shiba_challenger',
    name: 'ShibaChallenger',
    dogId: 'shiba',
    difficulty: 'medium',
    reactionDelay: 0.8,
    aggression: 0.6,
    mistakeRate: 0.25,
    trophies: 1180,
    leagueName: 'Bronze III',
  },
  {
    id: 'corgi_king',
    name: 'CorgiKing',
    dogId: 'corgi',
    difficulty: 'medium',
    reactionDelay: 0.7,
    aggression: 0.65,
    mistakeRate: 0.2,
    trophies: 1350,
    leagueName: 'Silver I',
  },
  {
    id: 'fluffy_rival',
    name: 'FluffyRival',
    dogId: 'samoyed',
    difficulty: 'hard',
    reactionDelay: 0.4,
    aggression: 0.85,
    mistakeRate: 0.1,
    trophies: 1800,
    leagueName: 'Gold II',
  },
];

export const getBotForTrophies = (trophies: number): BotConfig => {
  if (trophies < 400) return BOTS[0];
  if (trophies < 800) return BOTS[1];
  if (trophies < 1400) return BOTS[2];
  return BOTS[3];
};
