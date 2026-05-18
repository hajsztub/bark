import type { Skill } from '../types';

export const SKILLS: Skill[] = [
  {
    id: 'HOWL',
    name: 'HOWL',
    cooldown: 10,
    effectValue: 1.8,
    duration: 2,
    description: 'Bark power ×1.8 for 2 seconds',
    color: '#4A9EFF',
    emoji: '🎵',
  },
  {
    id: 'TREAT',
    name: 'TREAT',
    cooldown: 12,
    effectValue: 40,
    duration: 0,
    description: '+40 Stamina instantly',
    color: '#44BB44',
    emoji: '🦴',
  },
  {
    id: 'SHIELD',
    name: 'SHIELD',
    cooldown: 14,
    effectValue: 0.5,
    duration: 2,
    description: '−50% damage for 2 seconds',
    color: '#9944DD',
    emoji: '🛡️',
  },
];

export const getSkill = (id: string) => SKILLS.find(s => s.id === id);
