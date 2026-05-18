import React, { useEffect, useRef, useCallback } from 'react';
import {
  View, View as SafeAreaView, Text, StyleSheet, Pressable, Image,
} from 'react-native';
import { useBattle } from '../game/battle/useBattle';
import { useSaveStore } from '../store/saveStore';
import type { BattleEndResult } from '../types';
import { WAVE_BOUNDARY } from '../game/battle/BattleEngine';
import WaveView from '../components/battle/WaveView';
import DogSprite from '../components/DogSprite';

const BATTLE_BG = require('../../assets/backgrounds/battle_arena.png');
const DOG_SIZE  = 155;

interface Props {
  onBattleEnd: (result: BattleEndResult) => void;
}

export default function BattleScreen({ onBattleEnd }: Props) {
  const { state, playerDog, bot, startBattle, tapBark, startCharge, updateCharge, releaseCharge, useSkill } = useBattle(onBattleEnd);

  const chargeInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { startBattle(); }, []);

  const handleBarkPressIn = useCallback(() => {
    startCharge();
    chargeInterval.current = setInterval(updateCharge, 16);
  }, [startCharge, updateCharge]);

  const handleBarkPressOut = useCallback(() => {
    if (chargeInterval.current) { clearInterval(chargeInterval.current); chargeInterval.current = null; }
    if (state.isPlayerCharging) { releaseCharge(); } else { tapBark(); }
  }, [state.isPlayerCharging, releaseCharge, tapBark]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;

  const playerConfPct = Math.ceil(state.playerConfidence);
  const botConfPct    = Math.ceil(state.botConfidence);
  const staminaPct    = (state.playerStamina / (playerDog.stats.stamina * 10)) * 100;
  const timeUrgent    = state.timeRemaining <= 10;

  const coins = useSaveStore(s => s.data.coins);
  const gems  = useSaveStore(s => s.data.gems);

  const playerVariant = state.isPlayerCharging ? 'bark' : state.isPlayerOverheated ? 'hit' : 'idle';

  return (
    <SafeAreaView style={styles.container}>
      {/* Background */}
      <Image source={BATTLE_BG} style={styles.bgImage} resizeMode="cover" />
      <View style={styles.bgOverlay} />

      {/* ── Top HUD ── */}
      <View style={styles.topHUD}>
        {/* Player */}
        <View style={styles.playerCard}>
          <View style={[styles.avatarRing, { borderColor: '#4A9EFF' }]}>
            <DogSprite dog={playerDog} variant="idle" size={36} />
          </View>
          <View style={styles.hudTexts}>
            <Text style={styles.hudName} numberOfLines={1}>{playerDog.name}</Text>
            <Text style={styles.hudTrophies}>🏆 {useSaveStore.getState().data.trophies}</Text>
          </View>
          <View style={styles.hudBadge}><Text style={styles.hudBadgeText}>1P</Text></View>
        </View>

        {/* Timer */}
        <View style={styles.timerBox}>
          <Text style={styles.timeLabel}>TIME LEFT</Text>
          <Text style={[styles.timer, timeUrgent && styles.timerUrgent]}>{formatTime(state.timeRemaining)}</Text>
        </View>

        {/* Bot */}
        <View style={[styles.playerCard, { flexDirection: 'row-reverse' }]}>
          <View style={[styles.avatarRing, { borderColor: '#FF4422' }]}>
            <Text style={{ fontSize: 28 }}>🦊</Text>
          </View>
          <View style={[styles.hudTexts, { alignItems: 'flex-end' }]}>
            <Text style={styles.hudName} numberOfLines={1}>{bot.name}</Text>
            <Text style={styles.hudTrophies}>🏆 {bot.trophies}</Text>
          </View>
          <View style={[styles.hudBadge, { backgroundColor: '#FF4422' }]}>
            <Text style={styles.hudBadgeText}>2P</Text>
          </View>
        </View>
      </View>

      {/* ── Confidence bars ── */}
      <View style={styles.barsRow}>
        <View style={styles.barWrap}>
          <View style={styles.barTrack}>
            <View style={[styles.barFill, { width: `${playerConfPct}%`, backgroundColor: '#4A9EFF' }]} />
          </View>
          <Text style={[styles.barLabel, { color: '#4A9EFF' }]}>{playerConfPct}%  BARK POWER</Text>
        </View>
        <View style={[styles.barWrap, { alignItems: 'flex-end' }]}>
          <View style={styles.barTrack}>
            <View style={[styles.barFill, { width: `${botConfPct}%`, backgroundColor: '#FF4422', alignSelf: 'flex-end' }]} />
          </View>
          <Text style={[styles.barLabel, { color: '#FF4422' }]}>BARK POWER  {botConfPct}%</Text>
        </View>
      </View>

      {/* ── Arena ── */}
      <View style={styles.arena}>
        <WaveView
          wavePosition={state.wavePosition}
          playerCharging={state.isPlayerCharging}
          chargeAmount={state.playerChargeAmount}
          playerColor={playerDog.color}
        />

        {/* Dogs row */}
        <View style={styles.dogsRow}>
          {/* Player side */}
          <View style={styles.dogSide}>
            <DogSprite dog={playerDog} variant={playerVariant} size={DOG_SIZE} />
            {state.isPlayerOverheated && <Text style={styles.tiredText}>💨 TIRED</Text>}
          </View>

          {/* VS */}
          <View style={styles.vsCol}>
            <Text style={styles.vsText}>VS</Text>
          </View>

          {/* Bot side — samoyed mirrored */}
          <View style={[styles.dogSide, { alignItems: 'flex-end' }]}>
            <View style={{ transform: [{ scaleX: -1 }] }}>
              <DogSprite dog={playerDog} variant="idle" size={DOG_SIZE} />
            </View>
          </View>
        </View>

        {/* Speech bubbles float over arena */}
        {state.isPlayerCharging && (
          <View style={styles.woofBubble}><Text style={styles.woofText}>WOOF!</Text></View>
        )}
        <View style={styles.wafBubble}><Text style={styles.wafText}>WAF!</Text></View>
      </View>

      {/* ── Stamina bar ── */}
      <View style={styles.staminaRow}>
        <View style={styles.staminaTrack}>
          <View style={[styles.staminaFill, { width: `${staminaPct}%` }, staminaPct < 25 && styles.staminaLow]} />
        </View>
      </View>

      {/* ── Controls ── */}
      <View style={styles.controls}>
        <View style={styles.skillsLeft}>
          <SkillBtn label="HOWL" emoji="🎵" color="#4A9EFF" cooldown={state.skillCooldowns['HOWL']} max={10} active={state.isHowlActive} onPress={() => useSkill('HOWL')} />
          <SkillBtn label="TREAT" emoji="🦴" color="#44BB44" cooldown={state.skillCooldowns['TREAT']} max={12} onPress={() => useSkill('TREAT')} />
        </View>

        <Pressable
          style={[styles.barkBtn, (state.isPlayerOverheated || !state.active) && styles.barkBtnOff]}
          onPressIn={handleBarkPressIn}
          onPressOut={handleBarkPressOut}
          disabled={state.isPlayerOverheated || !state.active}
        >
          <View style={[
            styles.barkInner,
            state.isPlayerCharging && {
              transform: [{ scale: 1 + state.playerChargeAmount * 0.12 }],
              backgroundColor: `rgba(220, 40, 0, ${0.85 + state.playerChargeAmount * 0.15})`,
            },
          ]}>
            <Text style={styles.barkPaw}>🐾</Text>
            <Text style={styles.barkLabel}>BARK</Text>
            <Text style={styles.barkSub}>HOLD TO BARK!</Text>
          </View>
        </Pressable>

        <View style={styles.skillsRight}>
          <SkillBtn label="SHIELD" emoji="🛡️" color="#9944DD" cooldown={state.skillCooldowns['SHIELD']} max={14} active={state.isShieldActive} onPress={() => useSkill('SHIELD')} />
        </View>
      </View>

      {/* ── Currency bar ── */}
      <View style={styles.currencyBar}>
        <Text style={styles.currencyText}>🪙 {coins.toLocaleString()}</Text>
        <Text style={styles.currencyText}>💎 {gems}</Text>
      </View>
    </SafeAreaView>
  );
}

function SkillBtn({ label, emoji, color, cooldown, max, active, onPress }: {
  label: string; emoji: string; color: string;
  cooldown: number; max: number; active?: boolean; onPress: () => void;
}) {
  const ready = cooldown === 0;
  return (
    <Pressable onPress={onPress} style={[skillS.btn, { borderColor: color }, active && skillS.active]}>
      <Text style={skillS.emoji}>{emoji}</Text>
      <Text style={[skillS.label, { color }]}>{label}</Text>
      {!ready && (
        <View style={skillS.overlay}>
          <Text style={skillS.cd}>{Math.ceil(cooldown)}</Text>
        </View>
      )}
    </Pressable>
  );
}

const skillS = StyleSheet.create({
  btn: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(10,22,40,0.85)',
    borderWidth: 2, alignItems: 'center', justifyContent: 'center',
    position: 'relative', overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.5, shadowRadius: 4,
    elevation: 4,
  },
  active: { borderWidth: 3 },
  emoji: { fontSize: 22 },
  label: { fontSize: 9, fontWeight: '700', marginTop: 1 },
  overlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.65)', alignItems: 'center', justifyContent: 'center', borderRadius: 32,
  },
  cd: { color: '#FFF', fontSize: 18, fontWeight: '900' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A1628', overflow: 'hidden' },

  bgImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  bgOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(4,10,24,0.22)' },

  // HUD
  topHUD: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingTop: 8, paddingBottom: 4,
    backgroundColor: 'rgba(6,14,34,0.88)',
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.07)',
    gap: 4,
  },
  playerCard: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 5 },
  avatarRing: {
    width: 46, height: 46, borderRadius: 23, borderWidth: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  hudTexts: { flex: 1 },
  hudName: { color: '#FFF', fontWeight: '700', fontSize: 11 },
  hudTrophies: { color: '#FFD700', fontSize: 10, fontWeight: '700' },
  hudBadge: {
    backgroundColor: '#4A9EFF', borderRadius: 6, paddingHorizontal: 5, paddingVertical: 2,
  },
  hudBadgeText: { color: '#FFF', fontSize: 9, fontWeight: '800' },
  timerBox: { alignItems: 'center', minWidth: 70, backgroundColor: 'rgba(10,22,50,0.9)', borderRadius: 10, padding: 4 },
  timeLabel: { color: '#AAA', fontSize: 8, fontWeight: '700' },
  timer: { color: '#FFF', fontSize: 22, fontWeight: '900' },
  timerUrgent: { color: '#FF4422' },

  // Bars
  barsRow: {
    flexDirection: 'row', paddingHorizontal: 8, gap: 8, paddingBottom: 4,
    backgroundColor: 'rgba(6,14,34,0.75)',
  },
  barWrap: { flex: 1 },
  barTrack: { height: 12, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 6, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 6 },
  barLabel: { fontSize: 8, fontWeight: '700', marginTop: 2 },

  // Arena
  arena: { flex: 1, position: 'relative' },
  dogsRow: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 0,
  },
  dogSide: { flex: 1, alignItems: 'flex-start', position: 'relative' },
  vsCol: { width: 44, alignItems: 'center', paddingBottom: 30 },
  vsText: { color: '#FFD700', fontSize: 22, fontWeight: '900', textShadowColor: '#000', textShadowRadius: 6 },

  // Speech bubbles — absolute, float above dogs
  woofBubble: {
    position: 'absolute', bottom: DOG_SIZE - 10, left: 8,
    backgroundColor: '#1166EE', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 5,
    shadowColor: '#4A9EFF', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 10,
    elevation: 8, zIndex: 10,
  },
  woofText: { color: '#FFF', fontSize: 18, fontWeight: '900', letterSpacing: 1 },
  wafBubble: {
    position: 'absolute', bottom: DOG_SIZE - 10, right: 8,
    backgroundColor: '#BB2200', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 5,
    shadowColor: '#FF4422', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 10,
    elevation: 8, zIndex: 10,
  },
  wafText: { color: '#FFF', fontSize: 18, fontWeight: '900', letterSpacing: 1 },

  tiredText: { color: '#FF8800', fontWeight: '700', fontSize: 11 },

  // Stamina
  staminaRow: { paddingHorizontal: 40, paddingBottom: 4 },
  staminaTrack: { height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' },
  staminaFill: { height: '100%', backgroundColor: '#FFD700', borderRadius: 3 },
  staminaLow: { backgroundColor: '#FF4422' },

  // Controls
  controls: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 12, paddingBottom: 8, gap: 8,
  },
  skillsLeft: { gap: 8, width: 66 },
  skillsRight: { gap: 8, width: 66 },

  barkBtn: { width: 130, height: 130, borderRadius: 65, alignItems: 'center', justifyContent: 'center' },
  barkBtnOff: { opacity: 0.45 },
  barkInner: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: '#CC2200', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#FF4422', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.9, shadowRadius: 20,
    elevation: 14,
    borderWidth: 3, borderColor: 'rgba(255,120,80,0.5)',
  },
  barkPaw: { fontSize: 28 },
  barkLabel: { color: '#FFF', fontSize: 18, fontWeight: '900', letterSpacing: 1 },
  barkSub: { color: 'rgba(255,255,200,0.8)', fontSize: 9, fontWeight: '600' },

  // Currency
  currencyBar: {
    flexDirection: 'row', justifyContent: 'center', gap: 24,
    backgroundColor: 'rgba(6,14,34,0.92)', paddingVertical: 6,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.07)',
  },
  currencyText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
});
