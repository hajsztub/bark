import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { PERFECT_START, PERFECT_END, SUPER_COST } from '../../game/battle/BattleEngine';

interface Props {
  pulsePhase:    number;   // 0-1 from engine
  superMeter:    number;   // 0-100
  isFuryMode:    boolean;
  isShieldActive:boolean;
  shieldCD:      number;
  treatCD:       number;
  isActive:      boolean;
  onBark:        () => void;
  onSuper:       () => void;
  onSkill:       (skill: 'SHIELD' | 'TREAT') => void;
}

export default function BattleControls({
  pulsePhase, superMeter, isFuryMode, isShieldActive,
  shieldCD, treatCD, isActive, onBark, onSuper, onSkill,
}: Props) {

  const superReady = superMeter >= SUPER_COST;

  // Animate pulse ring size based on pulsePhase from engine
  const ringScale = useRef(new Animated.Value(0.3)).current;
  const ringOpacity = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Perfect window: phase 0.70-0.88
    const isInPerfect = pulsePhase >= PERFECT_START && pulsePhase <= PERFECT_END;
    const scale   = 0.3 + pulsePhase * 0.7;
    const opacity = isInPerfect ? 0.95 : 0.3 + (1 - pulsePhase) * 0.5;
    ringScale.setValue(scale);
    ringOpacity.setValue(opacity);
  }, [pulsePhase]);

  const ringColor = (() => {
    if (isFuryMode)  return '#FF6600';
    const inPerfect = pulsePhase >= PERFECT_START && pulsePhase <= PERFECT_END;
    return inPerfect ? '#FFD700' : '#4A9EFF';
  })();

  return (
    <View style={styles.wrapper}>
      {/* Skills left */}
      <View style={styles.skillsLeft}>
        <SkillBtn
          label="TREAT" emoji="🦴" color="#44BB44"
          cooldown={treatCD} maxCD={12}
          onPress={() => onSkill('TREAT')}
        />
        <SkillBtn
          label="SHIELD" emoji="🛡️" color="#9944DD"
          cooldown={shieldCD} maxCD={14}
          active={isShieldActive}
          onPress={() => onSkill('SHIELD')}
        />
      </View>

      {/* BARK + pulse ring */}
      <View style={styles.barkWrap}>
        {/* Pulse ring — visual timing guide */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.pulseRing,
            {
              borderColor: ringColor,
              transform: [{ scale: ringScale }],
              opacity: ringOpacity,
            },
          ]}
        />

        <Pressable
          onPress={isActive ? onBark : undefined}
          disabled={!isActive}
          style={[styles.barkBtn, isFuryMode && styles.barkBtnFury]}
        >
          <View style={[styles.barkInner, isFuryMode && styles.barkInnerFury]}>
            <Text style={styles.barkPaw}>🐾</Text>
            <Text style={styles.barkLabel}>{isFuryMode ? 'FURY!' : 'BARK'}</Text>
            {!isFuryMode && <Text style={styles.barkSub}>TAP TO BARK!</Text>}
          </View>
        </Pressable>
      </View>

      {/* SUPER button */}
      <View style={styles.skillsRight}>
        <Pressable
          onPress={superReady && isActive ? onSuper : undefined}
          disabled={!superReady || !isActive}
          style={[styles.superBtn, superReady && styles.superBtnReady]}
        >
          <Text style={styles.superEmoji}>⚡</Text>
          <Text style={[styles.superLabel, superReady && styles.superLabelReady]}>
            {superReady ? 'SUPER!' : 'SUPER'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function SkillBtn({ label, emoji, color, cooldown, maxCD, active, onPress }: {
  label: string; emoji: string; color: string;
  cooldown: number; maxCD: number; active?: boolean; onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[skillS.btn, { borderColor: color }, active && skillS.active]}>
      <Text style={skillS.emoji}>{emoji}</Text>
      <Text style={[skillS.label, { color }]}>{label}</Text>
      {cooldown > 0 && (
        <View style={skillS.overlay}>
          <Text style={skillS.cd}>{Math.ceil(cooldown)}</Text>
        </View>
      )}
    </Pressable>
  );
}

const skillS = StyleSheet.create({
  btn: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(8,18,40,0.90)',
    borderWidth: 2, alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.6, shadowRadius: 4, elevation: 5,
  },
  active:  { borderWidth: 3 },
  emoji:   { fontSize: 22 },
  label:   { fontSize: 9, fontWeight: '700', marginTop: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.68)', alignItems: 'center', justifyContent: 'center', borderRadius: 32 },
  cd:      { color: '#FFF', fontSize: 20, fontWeight: '900' },
});

const BARK_SIZE = 140;

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 12, paddingVertical: 8,
  },
  skillsLeft:  { gap: 8, width: 68 },
  skillsRight: { width: 68, alignItems: 'center' },

  barkWrap: { width: BARK_SIZE + 30, height: BARK_SIZE + 30, alignItems: 'center', justifyContent: 'center' },

  // Pulse ring — expands to show timing window
  pulseRing: {
    position: 'absolute',
    width: BARK_SIZE + 24,
    height: BARK_SIZE + 24,
    borderRadius: (BARK_SIZE + 24) / 2,
    borderWidth: 4,
  },

  barkBtn:     { width: BARK_SIZE, height: BARK_SIZE, borderRadius: BARK_SIZE / 2, alignItems: 'center', justifyContent: 'center' },
  barkBtnFury: { shadowColor: '#FF6600', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 20, elevation: 16 },

  barkInner: {
    width: BARK_SIZE - 10, height: BARK_SIZE - 10, borderRadius: (BARK_SIZE - 10) / 2,
    backgroundColor: '#CC2200', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#FF4422', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.9, shadowRadius: 20, elevation: 14,
    borderWidth: 3, borderColor: 'rgba(255,130,90,0.4)',
  },
  barkInnerFury: {
    backgroundColor: '#FF4400',
    borderColor: '#FF8800',
  },
  barkPaw:   { fontSize: 30 },
  barkLabel: { color: '#FFF', fontSize: 20, fontWeight: '900', letterSpacing: 1 },
  barkSub:   { color: 'rgba(255,255,200,0.7)', fontSize: 8, fontWeight: '600' },

  superBtn: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: 'rgba(8,18,40,0.90)',
    borderWidth: 2, borderColor: '#555',
    alignItems: 'center', justifyContent: 'center',
  },
  superBtnReady: {
    borderColor: '#FFD700', borderWidth: 3,
    shadowColor: '#FFD700', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.9, shadowRadius: 12, elevation: 10,
    backgroundColor: 'rgba(80,60,0,0.85)',
  },
  superEmoji: { fontSize: 22 },
  superLabel: { color: '#777', fontSize: 9, fontWeight: '800' },
  superLabelReady: { color: '#FFD700' },
});
