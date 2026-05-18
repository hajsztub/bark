import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import DogSprite from '../DogSprite';
import type { Dog, BotConfig } from '../../types';

interface Props {
  playerDog: Dog;
  playerName: string;
  playerTrophies: number;
  bot: BotConfig;
  timeRemaining: number;
  timeUrgent: boolean;
}

export default function BattleHUD({ playerDog, playerName, playerTrophies, bot, timeRemaining, timeUrgent }: Props) {
  const formatTime = (s: number) => `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;

  return (
    <View style={styles.row}>
      {/* Player */}
      <View style={styles.card}>
        {/* Swap DogSprite for a custom avatar image by replacing the View below */}
        <View style={[styles.avatar, { borderColor: '#2E7FCC' }]}>
          <DogSprite dog={playerDog} variant="idle" size={38} />
        </View>
        <View style={styles.meta}>
          <Text style={styles.name} numberOfLines={1}>{playerName}</Text>
          <Text style={styles.trophies}>🏆 {playerTrophies}</Text>
        </View>
        <View style={[styles.badge, styles.badge1P]}><Text style={styles.badgeText}>1P</Text></View>
      </View>

      {/* Timer — swap background/style here */}
      <View style={styles.timerBox}>
        <Text style={styles.timerLabel}>TIME LEFT</Text>
        <Text style={[styles.timer, timeUrgent && styles.timerUrgent]}>{formatTime(timeRemaining)}</Text>
      </View>

      {/* Bot */}
      <View style={[styles.card, { flexDirection: 'row-reverse' }]}>
        {/* Swap bot avatar here */}
        <View style={[styles.avatar, { borderColor: '#BB2200' }]}>
          <View style={{ transform: [{ scaleX: -1 }] }}>
            <DogSprite dog={playerDog} variant="idle" size={38} />
          </View>
        </View>
        <View style={[styles.meta, { alignItems: 'flex-end' }]}>
          <Text style={styles.name} numberOfLines={1}>{bot.name}</Text>
          <Text style={styles.trophies}>🏆 {bot.trophies}</Text>
        </View>
        <View style={[styles.badge, styles.badge2P]}><Text style={styles.badgeText}>2P</Text></View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingTop: 8, paddingBottom: 6,
    backgroundColor: 'rgba(6,14,34,0.92)',
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  card: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 5 },
  avatar: {
    width: 46, height: 46, borderRadius: 23, borderWidth: 2,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  meta: { flex: 1 },
  name: { color: '#FFF', fontWeight: '800', fontSize: 11 },
  trophies: { color: '#FFD700', fontSize: 10, fontWeight: '700' },
  badge: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  badge1P: { backgroundColor: '#2E7FCC' },
  badge2P: { backgroundColor: '#BB2200' },
  badgeText: { color: '#FFF', fontSize: 9, fontWeight: '900' },
  timerBox: {
    alignItems: 'center', minWidth: 74,
    backgroundColor: 'rgba(10,20,50,0.96)', borderRadius: 10,
    paddingHorizontal: 6, paddingVertical: 3,
    borderWidth: 1, borderColor: 'rgba(74,158,255,0.25)',
  },
  timerLabel: { color: '#AAA', fontSize: 8, fontWeight: '700' },
  timer: { color: '#FFF', fontSize: 24, fontWeight: '900' },
  timerUrgent: { color: '#FF4422' },
});
