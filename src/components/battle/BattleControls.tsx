import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import type { SkillType } from '../../types';

interface SkillState {
  cooldowns: Record<string, number>;
  isHowlActive: boolean;
  isShieldActive: boolean;
}

interface Props {
  skills: SkillState;
  staminaPct: number;
  isCharging: boolean;
  chargeAmount: number;
  isOverheated: boolean;
  isActive: boolean;
  coins: number;
  gems: number;
  onPressIn: () => void;
  onPressOut: () => void;
  onSkill: (skill: SkillType) => void;
}

export default function BattleControls({
  skills, staminaPct, isCharging, chargeAmount, isOverheated, isActive,
  coins, gems, onPressIn, onPressOut, onSkill,
}: Props) {
  return (
    <>
      {/* Stamina bar — swap track/fill with sprite */}
      <View style={styles.staminaRow}>
        <View style={styles.staminaTrack}>
          <View style={[styles.staminaFill, { width: `${staminaPct}%` as any }, staminaPct < 25 && styles.staminaLow]} />
        </View>
      </View>

      {/* Skills + BARK button */}
      <View style={styles.controls}>
        <View style={styles.skillsLeft}>
          <SkillBtn label="HOWL"  emoji="🎵" color="#4A9EFF" cooldown={skills.cooldowns['HOWL']}  max={10} active={skills.isHowlActive}   onPress={() => onSkill('HOWL')} />
          <SkillBtn label="TREAT" emoji="🦴" color="#44BB44" cooldown={skills.cooldowns['TREAT']} max={12}                                 onPress={() => onSkill('TREAT')} />
        </View>

        {/* BARK button — swap inner View for a custom button image */}
        <Pressable
          style={[styles.barkBtn, (isOverheated || !isActive) && styles.barkOff]}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          disabled={isOverheated || !isActive}
        >
          <View style={[
            styles.barkInner,
            isCharging && {
              transform: [{ scale: 1 + chargeAmount * 0.1 }],
              backgroundColor: `rgba(220,40,0,${0.9 + chargeAmount * 0.1})`,
            },
          ]}>
            <Text style={styles.barkPaw}>🐾</Text>
            <Text style={styles.barkLabel}>BARK</Text>
            <Text style={styles.barkSub}>HOLD TO BARK!</Text>
          </View>
        </Pressable>

        <View style={styles.skillsRight}>
          <SkillBtn label="SHIELD" emoji="🛡️" color="#9944DD" cooldown={skills.cooldowns['SHIELD']} max={14} active={skills.isShieldActive} onPress={() => onSkill('SHIELD')} />
        </View>
      </View>

      {/* Currency bar */}
      <View style={styles.currencyBar}>
        <Text style={styles.currencyText}>🪙 {coins.toLocaleString()}</Text>
        <Text style={styles.currencyText}>💎 {gems}</Text>
      </View>
    </>
  );
}

function SkillBtn({ label, emoji, color, cooldown, active, onPress }: {
  label: string; emoji: string; color: string;
  cooldown: number; max: number; active?: boolean; onPress: () => void;
}) {
  return (
    // Swap the Pressable content with an Image-based button here
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
    width: 66, height: 66, borderRadius: 33,
    backgroundColor: 'rgba(8,18,40,0.90)',
    borderWidth: 2, alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.6, shadowRadius: 4, elevation: 5,
  },
  active:  { borderWidth: 3 },
  emoji:   { fontSize: 22 },
  label:   { fontSize: 9, fontWeight: '700', marginTop: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.68)', alignItems: 'center', justifyContent: 'center', borderRadius: 33,
  },
  cd: { color: '#FFF', fontSize: 20, fontWeight: '900' },
});

const styles = StyleSheet.create({
  staminaRow: { paddingHorizontal: 50, paddingBottom: 3 },
  staminaTrack: { height: 5, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 3, overflow: 'hidden' },
  staminaFill:  { height: '100%', backgroundColor: '#FFD700', borderRadius: 3 },
  staminaLow:   { backgroundColor: '#FF4422' },

  controls: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 12, paddingBottom: 8,
  },
  skillsLeft:  { gap: 8, width: 70 },
  skillsRight: { gap: 8, width: 70 },

  barkBtn:   { width: 140, height: 140, borderRadius: 70, alignItems: 'center', justifyContent: 'center' },
  barkOff:   { opacity: 0.4 },
  barkInner: {
    width: 130, height: 130, borderRadius: 65,
    backgroundColor: '#CC2200', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#FF4422', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.95, shadowRadius: 24, elevation: 16,
    borderWidth: 3, borderColor: 'rgba(255,130,90,0.4)',
  },
  barkPaw:   { fontSize: 32 },
  barkLabel: { color: '#FFF', fontSize: 22, fontWeight: '900', letterSpacing: 1 },
  barkSub:   { color: 'rgba(255,255,200,0.75)', fontSize: 9, fontWeight: '600' },

  currencyBar: {
    flexDirection: 'row', justifyContent: 'center', gap: 24,
    backgroundColor: 'rgba(6,14,34,0.94)', paddingVertical: 6,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)',
  },
  currencyText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
});
