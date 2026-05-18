import React, { useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBattle } from '../game/battle/useBattle';
import { useSaveStore } from '../store/saveStore';
import type { BattleEndResult } from '../types';
import { WAVE_BOUNDARY } from '../game/battle/BattleEngine';
import WaveCanvas from '../components/battle/WaveCanvas';

interface Props {
  onBattleEnd: (result: BattleEndResult) => void;
}

export default function BattleScreen({ onBattleEnd }: Props) {
  const { state, playerDog, bot, startBattle, tapBark, startCharge, updateCharge, releaseCharge, useSkill } = useBattle(onBattleEnd);

  const chargeInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    startBattle();
  }, []);

  const handleBarkPressIn = useCallback(() => {
    startCharge();
    chargeInterval.current = setInterval(updateCharge, 16);
  }, [startCharge, updateCharge]);

  const handleBarkPressOut = useCallback(() => {
    if (chargeInterval.current) {
      clearInterval(chargeInterval.current);
      chargeInterval.current = null;
    }
    if (state.isPlayerCharging) {
      releaseCharge();
    } else {
      tapBark();
    }
  }, [state.isPlayerCharging, releaseCharge, tapBark]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const playerConfPct = (state.playerConfidence / 100) * 100;
  const botConfPct = (state.botConfidence / 100) * 100;
  const staminaPct = (state.playerStamina / (playerDog.stats.stamina * 10)) * 100;
  const waveNorm = (state.wavePosition + WAVE_BOUNDARY) / (WAVE_BOUNDARY * 2); // 0-1

  const timeUrgent = state.timeRemaining <= 10;

  return (
    <SafeAreaView style={styles.container}>
      {/* Top HUD */}
      <View style={styles.topHUD}>
        {/* Player Info */}
        <View style={styles.playerHUD}>
          <View style={styles.avatarBox}>
            <Text style={styles.avatarEmoji}>{playerDog.emoji}</Text>
            <Text style={styles.hudLabel}>1P</Text>
          </View>
          <View style={styles.hudInfo}>
            <Text style={styles.hudName}>{playerDog.name}</Text>
            <View style={styles.confBar}>
              <View style={[styles.confFill, { width: `${playerConfPct}%`, backgroundColor: '#4A9EFF' }]} />
            </View>
            <Text style={styles.confText}>{Math.ceil(state.playerConfidence)}%</Text>
          </View>
        </View>

        {/* Timer */}
        <View style={styles.timerBox}>
          <Text style={[styles.timer, timeUrgent && styles.timerUrgent]}>
            {formatTime(state.timeRemaining)}
          </Text>
          <Text style={styles.vsText}>VS</Text>
        </View>

        {/* Bot Info */}
        <View style={[styles.playerHUD, { flexDirection: 'row-reverse' }]}>
          <View style={styles.avatarBox}>
            <Text style={styles.avatarEmoji}>🦊</Text>
            <Text style={styles.hudLabel}>2P</Text>
          </View>
          <View style={[styles.hudInfo, { alignItems: 'flex-end' }]}>
            <Text style={styles.hudName}>{bot.name}</Text>
            <View style={styles.confBar}>
              <View style={[styles.confFill, { width: `${botConfPct}%`, backgroundColor: '#FF4422', alignSelf: 'flex-end' }]} />
            </View>
            <Text style={styles.confText}>{Math.ceil(state.botConfidence)}%</Text>
          </View>
        </View>
      </View>

      {/* Wave indicator */}
      <View style={styles.waveIndicatorRow}>
        <View style={styles.waveTrack}>
          <View style={[styles.waveHandle, { left: `${waveNorm * 100}%` }]} />
        </View>
      </View>

      {/* Arena */}
      <View style={styles.arena}>
        <WaveCanvas
          wavePosition={state.wavePosition}
          playerCharging={state.isPlayerCharging}
          chargeAmount={state.playerChargeAmount}
          playerColor={playerDog.color}
        />

        {/* Dogs */}
        <View style={styles.dogsRow}>
          <View style={[styles.dogSide, state.isHowlActive && styles.dogGlow]}>
            <Text style={styles.dogFight}>{playerDog.emoji}</Text>
            {state.isPlayerCharging && (
              <Text style={styles.chargingIndicator}>⚡ {Math.round(state.playerChargeAmount * 100)}%</Text>
            )}
            {state.isPlayerOverheated && <Text style={styles.overheatText}>💨 TIRED</Text>}
          </View>
          <Text style={styles.vsCenter}>VS</Text>
          <View style={styles.dogSide}>
            <Text style={styles.dogFight}>🦊</Text>
          </View>
        </View>
      </View>

      {/* Stamina Bar */}
      <View style={styles.staminaRow}>
        <View style={styles.staminaTrack}>
          <View style={[
            styles.staminaFill,
            { width: `${staminaPct}%` },
            staminaPct < 25 && styles.staminaLow,
          ]} />
        </View>
      </View>

      {/* Bottom Controls */}
      <View style={styles.controls}>
        {/* Left Skills */}
        <View style={styles.skillsLeft}>
          <SkillButton
            label="HOWL" emoji="🎵"
            color="#4A9EFF"
            cooldown={state.skillCooldowns['HOWL']}
            maxCooldown={10}
            active={state.isHowlActive}
            onPress={() => useSkill('HOWL')}
          />
          <SkillButton
            label="TREAT" emoji="🦴"
            color="#44BB44"
            cooldown={state.skillCooldowns['TREAT']}
            maxCooldown={12}
            onPress={() => useSkill('TREAT')}
          />
        </View>

        {/* BARK Button */}
        <Pressable
          style={[styles.barkBtn, state.isPlayerOverheated && styles.barkBtnDisabled]}
          onPressIn={handleBarkPressIn}
          onPressOut={handleBarkPressOut}
          disabled={state.isPlayerOverheated || !state.active}
        >
          <View style={[
            styles.barkBtnInner,
            state.isPlayerCharging && {
              transform: [{ scale: 1 + state.playerChargeAmount * 0.15 }],
              backgroundColor: `rgba(255, 100, 30, ${0.8 + state.playerChargeAmount * 0.2})`,
            },
          ]}>
            <Text style={styles.barkIcon}>🐾</Text>
            <Text style={styles.barkLabel}>BARK</Text>
            {!state.isPlayerCharging && <Text style={styles.barkSub}>HOLD TO BARK!</Text>}
          </View>
        </Pressable>

        {/* Right Skills */}
        <View style={styles.skillsRight}>
          <SkillButton
            label="SHIELD" emoji="🛡️"
            color="#9944DD"
            cooldown={state.skillCooldowns['SHIELD']}
            maxCooldown={14}
            active={state.isShieldActive}
            onPress={() => useSkill('SHIELD')}
          />
        </View>
      </View>

      {/* Currency bar */}
      <View style={styles.currencyBar}>
        <Text style={styles.currencyText}>🪙 {useSaveStore().data.coins.toLocaleString()}</Text>
        <Text style={styles.currencyText}>💎 {useSaveStore().data.gems}</Text>
      </View>
    </SafeAreaView>
  );
}

function SkillButton({
  label, emoji, color, cooldown, maxCooldown, active, onPress,
}: {
  label: string; emoji: string; color: string;
  cooldown: number; maxCooldown: number;
  active?: boolean; onPress: () => void;
}) {
  const ready = cooldown === 0;
  const progress = 1 - cooldown / maxCooldown;

  return (
    <Pressable onPress={onPress} style={[styles.skillBtn, { borderColor: color }, active && styles.skillActive]}>
      <Text style={styles.skillEmoji}>{emoji}</Text>
      <Text style={[styles.skillLabel, { color }]}>{label}</Text>
      {!ready && (
        <View style={styles.cooldownOverlay}>
          <Text style={styles.cooldownText}>{Math.ceil(cooldown)}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A1628' },
  topHUD: { flexDirection: 'row', padding: 8, gap: 4 },
  playerHUD: { flex: 1, flexDirection: 'row', gap: 6, alignItems: 'center' },
  avatarBox: { alignItems: 'center' },
  avatarEmoji: { fontSize: 32, backgroundColor: '#1A2E4A', borderRadius: 20, padding: 2 },
  hudLabel: { color: '#4A9EFF', fontSize: 10, fontWeight: '700' },
  hudInfo: { flex: 1 },
  hudName: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  confBar: { height: 10, backgroundColor: '#1A2E4A', borderRadius: 5, overflow: 'hidden', marginTop: 2 },
  confFill: { height: '100%', borderRadius: 5 },
  confText: { color: '#FFF', fontSize: 11, fontWeight: '700', marginTop: 2 },
  timerBox: { alignItems: 'center', minWidth: 60 },
  timer: { color: '#FFF', fontSize: 22, fontWeight: '900' },
  timerUrgent: { color: '#FF4422' },
  vsText: { color: '#FFD700', fontSize: 14, fontWeight: '900' },
  waveIndicatorRow: { paddingHorizontal: 16, marginBottom: 4 },
  waveTrack: {
    height: 8, backgroundColor: '#1A2E4A', borderRadius: 4, position: 'relative',
  },
  waveHandle: {
    position: 'absolute', top: -4, width: 16, height: 16,
    backgroundColor: '#FFD700', borderRadius: 8, marginLeft: -8,
  },
  arena: { flex: 1, position: 'relative' },
  dogsRow: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16,
  },
  dogSide: { flex: 1, alignItems: 'center' },
  dogGlow: { opacity: 0.9 },
  dogFight: { fontSize: 80 },
  chargingIndicator: { color: '#FFD700', fontWeight: '700', fontSize: 12 },
  overheatText: { color: '#FF8800', fontWeight: '700' },
  vsCenter: { color: '#FFD700', fontSize: 28, fontWeight: '900', marginBottom: 20 },
  staminaRow: { paddingHorizontal: 60, marginBottom: 4 },
  staminaTrack: { height: 6, backgroundColor: '#1A2E4A', borderRadius: 3, overflow: 'hidden' },
  staminaFill: { height: '100%', backgroundColor: '#FFD700', borderRadius: 3 },
  staminaLow: { backgroundColor: '#FF4422' },
  controls: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 8,
  },
  skillsLeft: { gap: 8, width: 70 },
  skillsRight: { gap: 8, width: 70 },
  skillBtn: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: '#1A2E4A',
    borderWidth: 2, alignItems: 'center', justifyContent: 'center',
    position: 'relative', overflow: 'hidden',
  },
  skillActive: { borderWidth: 3 },
  skillEmoji: { fontSize: 22 },
  skillLabel: { fontSize: 9, fontWeight: '700', marginTop: 2 },
  cooldownOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.65)', alignItems: 'center', justifyContent: 'center',
    borderRadius: 32,
  },
  cooldownText: { color: '#FFF', fontSize: 16, fontWeight: '900' },
  barkBtn: { width: 120, height: 120, borderRadius: 60, alignItems: 'center', justifyContent: 'center' },
  barkBtnDisabled: { opacity: 0.5 },
  barkBtnInner: {
    width: 110, height: 110, borderRadius: 55,
    backgroundColor: '#CC2200', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#FF4422', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 16,
    elevation: 12,
  },
  barkIcon: { fontSize: 28 },
  barkLabel: { color: '#FFF', fontSize: 16, fontWeight: '900', letterSpacing: 1 },
  barkSub: { color: '#FFB', fontSize: 9, fontWeight: '600' },
  currencyBar: {
    flexDirection: 'row', justifyContent: 'center', gap: 24,
    backgroundColor: '#0D1E33', paddingVertical: 6,
  },
  currencyText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
});
