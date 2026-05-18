import type { Dog } from '../types';

export const DOGS: Dog[] = [
  {
    id: 'samoyed',
    name: 'Samoyed',
    rarity: 'Epic',
    role: 'Tank / Power',
    description: 'Big, fluffy, strong. Slow but hits like a truck.',
    stats: { barkPower: 8, stamina: 9, focus: 5 },
    maxLevel: 15,
    fragmentsRequired: 0,
    emoji: '🐾',
    color: '#4A9EFF',
  },
  {
    id: 'shiba',
    name: 'Shiba',
    rarity: 'Epic',
    role: 'Balanced / Agile',
    description: 'Energetic, competitive. Great all-rounder.',
    stats: { barkPower: 7, stamina: 7, focus: 7 },
    maxLevel: 15,
    fragmentsRequired: 500,
    emoji: '🦊',
    color: '#FF6B35',
  },
  {
    id: 'corgi',
    name: 'Corgi',
    rarity: 'Rare',
    role: 'Fast / Cute',
    description: 'Quick Perfect Bark timing. High charm, high skill.',
    stats: { barkPower: 5, stamina: 6, focus: 9 },
    maxLevel: 12,
    fragmentsRequired: 300,
    emoji: '🐕',
    color: '#FFB347',
  },
];

export const getDog = (id: string): Dog | undefined => DOGS.find(d => d.id === id);
