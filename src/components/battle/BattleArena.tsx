import React from 'react';
import { View, Text, StyleSheet, Image, Animated } from 'react-native';
import DogSprite from '../DogSprite';
import type { Dog } from '../../types';
import type { DogImages } from '../../types';
import type { HitResult } from '../../game/battle/BattleEngine';
import { COMBO_FURY_THRESHOLD } from '../../game/battle/BattleEngine';

const BATTLE_BG = require('../../../assets/backgrounds/battle_arena.png');
export const DOG_SIZE = 220;

interface Props {
  playerDog:          Dog;
  playerVariant:      keyof DogImages;
  botVariant:         keyof DogImages;
  isFuryMode:         boolean;
  isBotAttacking:     boolean;
  isPlayerCharging:   boolean;
  lastHitResult:      HitResult;
  playerCombo:        number;
  botGrowlProgress:   number;
}

export default function BattleArena({
  playerDog, playerVariant, botVariant,
  isFuryMode, isBotAttacking, lastHitResult,
  playerCombo, botGrowlProgress,
}: Props) {

  const showCombo   = playerCombo >= 2;
  const comboMult   = playerCombo >= 4 ? '×2.0' : playerCombo >= 2 ? '×1.5' : '';
  const nearFury    = playerCombo >= COMBO_FURY_THRESHOLD - 1 && !isFuryMode;

  const hitColor: Record<NonNullable<HitResult>, string> = {
    perfect: '#FFD700',
    good:    '#44EE88',
    parry:   '#FF44FF',
    block:   '#4A9EFF',
    miss:    '#FF4422',
  };

  return (
    <View style={styles.arena}>
      {/* Background */}
      <Image source={BATTLE_BG} style={styles.bg} resizeMode="cover" />
      <View style={[styles.bgTint, isFuryMode && styles.furyTint]} />

      {/* Hit result popup */}
      {lastHitResult && (
        <View style={[styles.hitPopup, { backgroundColor: hitColor[lastHitResult] + '22', borderColor: hitColor[lastHitResult] }]}>
          <Text style={[styles.hitText, { color: hitColor[lastHitResult] }]}>
            {lastHitResult === 'perfect' ? '⭐ PERFECT!' :
             lastHitResult === 'parry'   ? '🛡️ PARRY!' :
             lastHitResult === 'block'   ? '🛡️ BLOCKED!' :
             lastHitResult === 'good'    ? 'GOOD!' : 'MISS!'}
          </Text>
        </View>
      )}

      {/* Combo counter */}
      {showCombo && !isFuryMode && (
        <View style={[styles.comboBox, nearFury && styles.comboNearFury]}>
          <Text style={styles.comboCount}>{playerCombo}</Text>
          <Text style={styles.comboMult}>{comboMult}</Text>
          <Text style={styles.comboLabel}>COMBO</Text>
        </View>
      )}

      {/* FURY MODE banner */}
      {isFuryMode && (
        <View style={styles.furyBanner}>
          <Text style={styles.furyText}>🔥 FURY! 🔥</Text>
        </View>
      )}

      {/* Bot growl telegraph */}
      <View style={styles.botGrowlWrap}>
        <View style={styles.botGrowlTrack}>
          <View style={[
            styles.botGrowlFill,
            { width: `${botGrowlProgress * 100}%` as any },
            botGrowlProgress > 0.75 && styles.botGrowlDanger,
          ]} />
        </View>
        {botGrowlProgress > 0.75 && (
          <Text style={styles.botGrowlLabel}>⚠️ PARRY NOW!</Text>
        )}
      </View>

      {/* WOOF bubble */}
      {(playerVariant === 'bark' || isFuryMode) && (
        <View style={styles.woofBubble}>
          <Text style={styles.woofText}>{isFuryMode ? '💥 WOOF!' : 'WOOF!'}</Text>
        </View>
      )}

      {/* WAF bubble */}
      {isBotAttacking && (
        <View style={styles.wafBubble}>
          <Text style={styles.wafText}>WAF!</Text>
        </View>
      )}

      {/* Dogs */}
      <View style={styles.dogsRow}>
        <View style={styles.dogLeft}>
          <DogSprite dog={playerDog} variant={playerVariant} size={DOG_SIZE} />
        </View>
        <View style={styles.dogRight}>
          <View style={{ transform: [{ scaleX: -1 }] }}>
            <DogSprite dog={playerDog} variant={botVariant} size={DOG_SIZE} />
          </View>
        </View>
      </View>

      {/* VS center */}
      <View style={styles.vsFloat} pointerEvents="none">
        <Text style={styles.vsText}>VS</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  arena:    { flex: 1, overflow: 'hidden' },
  bg:       { ...StyleSheet.absoluteFillObject },
  bgTint:   { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(4,8,20,0.18)' },
  furyTint: { backgroundColor: 'rgba(180,60,0,0.22)' },

  // Hit popup
  hitPopup: {
    position: 'absolute', top: '18%', alignSelf: 'center', left: '20%', right: '20%',
    borderRadius: 12, borderWidth: 2, paddingVertical: 6, alignItems: 'center', zIndex: 20,
  },
  hitText: { fontSize: 20, fontWeight: '900', letterSpacing: 1 },

  // Combo
  comboBox: {
    position: 'absolute', top: '8%', left: 16,
    alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 12, padding: 8,
    borderWidth: 1, borderColor: 'rgba(255,215,0,0.4)',
  },
  comboNearFury: { borderColor: '#FF6600', borderWidth: 2 },
  comboCount: { color: '#FFD700', fontSize: 32, fontWeight: '900', lineHeight: 32 },
  comboMult:  { color: '#FFF', fontSize: 12, fontWeight: '800' },
  comboLabel: { color: '#AAA', fontSize: 9, fontWeight: '700' },

  // Fury banner
  furyBanner: {
    position: 'absolute', top: '8%', alignSelf: 'center', left: '15%', right: '15%',
    backgroundColor: 'rgba(200,50,0,0.85)', borderRadius: 12, paddingVertical: 6, alignItems: 'center',
    borderWidth: 2, borderColor: '#FF8800',
  },
  furyText: { color: '#FFF', fontSize: 22, fontWeight: '900', letterSpacing: 2 },

  // Bot growl telegraph — right side
  botGrowlWrap: {
    position: 'absolute', top: '8%', right: 12, width: 80, alignItems: 'flex-end',
  },
  botGrowlTrack: {
    width: 72, height: 8, backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 4, overflow: 'hidden',
  },
  botGrowlFill:   { height: '100%', backgroundColor: '#FF8800', borderRadius: 4 },
  botGrowlDanger: { backgroundColor: '#FF2200' },
  botGrowlLabel:  { color: '#FF4422', fontSize: 8, fontWeight: '800', marginTop: 2 },

  // Speech bubbles
  woofBubble: {
    position: 'absolute', bottom: DOG_SIZE + 20, left: 10, zIndex: 10,
    backgroundColor: '#1166EE', borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 7,
    shadowColor: '#4A9EFF', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 12, elevation: 9,
  },
  woofText: { color: '#FFF', fontSize: 20, fontWeight: '900', letterSpacing: 1 },
  wafBubble: {
    position: 'absolute', bottom: DOG_SIZE + 20, right: 10, zIndex: 10,
    backgroundColor: '#BB2200', borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 7,
    shadowColor: '#FF4422', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 12, elevation: 9,
  },
  wafText: { color: '#FFF', fontSize: 20, fontWeight: '900', letterSpacing: 1 },

  // Dogs
  dogsRow:  { position: 'absolute', bottom: 0, left: -10, right: -10, flexDirection: 'row', alignItems: 'flex-end' },
  dogLeft:  { flex: 1, alignItems: 'flex-start' },
  dogRight: { flex: 1, alignItems: 'flex-end' },

  vsFloat: { position: 'absolute', bottom: DOG_SIZE * 0.15, left: 0, right: 0, alignItems: 'center' },
  vsText: {
    color: '#FFD700', fontSize: 26, fontWeight: '900',
    textShadowColor: '#000', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 8,
  },
});
