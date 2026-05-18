import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import DogSprite from '../DogSprite';
import type { Dog } from '../../types';
import type { DogImages } from '../../types';

// Swap this const to change the battle background image
const BATTLE_BG = require('../../../assets/backgrounds/battle_arena.png');

export const DOG_SIZE = 240;

interface Props {
  playerDog: Dog;
  playerVariant: keyof DogImages;
  botVariant: keyof DogImages;
  isPlayerCharging: boolean;
  isPlayerOverheated: boolean;
  isBotAttacking: boolean;
  chargeAmount: number;
}

export default function BattleArena({
  playerDog, playerVariant, botVariant,
  isPlayerCharging, isPlayerOverheated, isBotAttacking, chargeAmount,
}: Props) {

  const clashOpacity = isPlayerCharging
    ? 0.5 + chargeAmount * 0.5
    : isBotAttacking ? 0.6 : 0;

  return (
    <View style={styles.arena}>
      {/* ── Background — swap Image source here ── */}
      <Image source={BATTLE_BG} style={styles.bg} resizeMode="cover" />
      <View style={styles.bgTint} />

      {/* ── Clash effect — replace View with animated sprite ── */}
      {clashOpacity > 0 && (
        <View style={[styles.clashLine, { opacity: clashOpacity }]} pointerEvents="none" />
      )}

      {/* ── Speech bubbles — swap View+Text with Image bubble sprites ── */}
      {isPlayerCharging && (
        <View style={styles.woofBubble}>
          <Text style={styles.woofText}>WOOF!</Text>
        </View>
      )}
      {isBotAttacking && (
        <View style={styles.wafBubble}>
          <Text style={styles.wafText}>WAF!</Text>
        </View>
      )}

      {/* ── Dogs row — swap DogSprite for Image when art is ready ── */}
      <View style={styles.dogsRow}>
        <View style={styles.dogLeft}>
          <DogSprite dog={playerDog} variant={playerVariant} size={DOG_SIZE} />
          {isPlayerOverheated && (
            <Text style={styles.tiredText}>💨 TIRED</Text>
          )}
        </View>

        <View style={styles.dogRight}>
          {/* Bot = player dog mirrored — replace transform+DogSprite with bot's own sprite */}
          <View style={{ transform: [{ scaleX: -1 }] }}>
            <DogSprite dog={playerDog} variant={botVariant} size={DOG_SIZE} />
          </View>
        </View>
      </View>

      {/* ── VS badge — swap with graphic ── */}
      <View style={styles.vsFloat} pointerEvents="none">
        <Text style={styles.vsText}>VS</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  arena: { flex: 1, overflow: 'hidden' },

  // Background — absoluteFill so it fills the arena exactly
  bg:     { ...StyleSheet.absoluteFillObject },
  bgTint: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(4,8,20,0.18)' },

  // Clash — thin vertical spark in center
  clashLine: {
    position: 'absolute', top: '5%', bottom: '5%',
    left: '50%', width: 6, marginLeft: -3,
    borderRadius: 3, backgroundColor: '#FFD700',
    shadowColor: '#FFD700', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 14, elevation: 8,
  },

  // Speech bubbles
  woofBubble: {
    position: 'absolute', bottom: DOG_SIZE + 16, left: 14, zIndex: 10,
    backgroundColor: '#1166EE', borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 7,
    shadowColor: '#4A9EFF', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 12, elevation: 9,
  },
  woofText: { color: '#FFF', fontSize: 22, fontWeight: '900', letterSpacing: 1 },
  wafBubble: {
    position: 'absolute', bottom: DOG_SIZE + 16, right: 14, zIndex: 10,
    backgroundColor: '#BB2200', borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 7,
    shadowColor: '#FF4422', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 12, elevation: 9,
  },
  wafText: { color: '#FFF', fontSize: 22, fontWeight: '900', letterSpacing: 1 },

  // Dogs
  dogsRow: {
    position: 'absolute', bottom: 0, left: -10, right: -10,
    flexDirection: 'row', alignItems: 'flex-end',
  },
  dogLeft:  { flex: 1, alignItems: 'flex-start' },
  dogRight: { flex: 1, alignItems: 'flex-end' },

  tiredText: { color: '#FF8800', fontWeight: '700', fontSize: 10, textAlign: 'center' },

  // VS
  vsFloat: {
    position: 'absolute', bottom: DOG_SIZE * 0.18,
    left: 0, right: 0, alignItems: 'center',
  },
  vsText: {
    color: '#FFD700', fontSize: 28, fontWeight: '900',
    textShadowColor: '#000', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 8,
  },
});
