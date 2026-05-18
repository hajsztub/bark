import type { Dog } from '../types';

import samoyedIdle    from '../../assets/dogs/samoyed_idle.png';
import samoyedBark    from '../../assets/dogs/samoyed_bark.png';
import samoyedHit     from '../../assets/dogs/samoyed_hit.png';

// import samoyedVictory from '../../assets/dogs/samoyed_victory.png';
// import samoyedDefeat  from '../../assets/dogs/samoyed_defeat.png';
//
// import shibaIdle      from '../../assets/dogs/shiba_idle.png';
// import shibaBark      from '../../assets/dogs/shiba_bark.png';
// import shibaHit       from '../../assets/dogs/shiba_hit.png';
// import shibaVictory   from '../../assets/dogs/shiba_victory.png';
// import shibaDefeat    from '../../assets/dogs/shiba_defeat.png';
//
// import corgiIdle      from '../../assets/dogs/corgi_idle.png';
// import corgiBark      from '../../assets/dogs/corgi_bark.png';
// import corgiHit       from '../../assets/dogs/corgi_hit.png';
// import corgiVictory   from '../../assets/dogs/corgi_victory.png';
// import corgiDefeat    from '../../assets/dogs/corgi_defeat.png';

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
    images: {
      idle:    samoyedIdle,
      bark:    samoyedBark,
      hit:     samoyedHit,
      victory: samoyedIdle,  // replace when samoyed_victory.png is ready
      defeat:  samoyedHit,   // replace when samoyed_defeat.png is ready
    },
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
    // images: { idle: shibaIdle, bark: shibaBark, hit: shibaHit, victory: shibaVictory, defeat: shibaDefeat },
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
    // images: { idle: corgiIdle, bark: corgiBark, hit: corgiHit, victory: corgiVictory, defeat: corgiDefeat },
  },
];

export const getDog = (id: string): Dog | undefined => DOGS.find(d => d.id === id);
