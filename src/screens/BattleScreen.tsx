import React, { useEffect, useRef, useCallback, useState } from 'react';
import {
  View, View as SafeAreaView, Text, StyleSheet, Pressable, Image,
} from 'react-native';
import { useBattle } from '../game/battle/useBattle';
import { useSaveStore } from '../store/saveStore';
import type { BattleEndResult } from '../types';
import DogSprite from '../components/DogSprite';

const BATTLE_BG = require('../../assets/backgrounds/battle_arena.png');
const DOG_SIZE  = 190;

interface Props {
  onBattleEnd: (result: BattleEndResult) => void;
}

export default function BattleScreen({ onBattleEnd }: Props) {
  const { state, playerDog, bot, startBattle, tapBark, startCharge, updateCharge, releaseCharge, useSkill } = useBattle(onBattleEnd);
  const chargeInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Detect bot attacks: when wavePosition drops, bot pushed the wave
  const prevWave = useRef(0);
  const botAttackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isBotAttacking, setIsBotAttacking] = useState(false);

  useEffect(() => {
    if (state.wavePosition < prevWave.current - 1.5) {
      setIsBotAttacking(true);
      if (botAttackTimer.current) clearTimeout(botAttackTimer.current);
      botAttackTimer.current = setTimeout(() => setIsBotAttacking(false), 700);
    }
    prevWave.current = state.wavePosition;
  }, [state.wavePosition]);

  useEffect(() => { startBattle(); }, []);

  const handleBarkPressIn = useCallback(() => {
    startCharge();
    chargeInterval.current = setInterval(updateCharge, 16);
  }, [startCharge, updateCharge]);

  const handleBarkPressOut = useCallback(() => {
    if (chargeInterval.current) { clearInterval(chargeInterval.current); chargeInterval.current = null; }
    if (state.isPlayerCharging) releaseCharge(); else tapBark();
  }, [state.isPlayerCharging, releaseCharge, tapBark]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;

  const playerConfPct = Math.ceil(state.playerConfidence);
  const botConfPct    = Math.ceil(state.botConfidence);
  const staminaPct    = (state.playerStamina / (playerDog.stats.stamina * 10)) * 100;
  const timeUrgent    = state.timeRemaining <= 10;
  const coins = useSaveStore(s => s.data.coins);
  const gems  = useSaveStore(s => s.data.gems);
  const trophies = useSaveStore(s => s.data.trophies);

  const playerVariant = state.isPlayerCharging ? 'bark' : state.isPlayerOverheated ? 'hit' : 'idle';
  const botVariant    = isBotAttacking ? 'bark' : 'idle';

  const clashVisible  = state.isPlayerCharging || isBotAttacking;

  return (
    <SafeAreaView style={styles.container}>
      {/* Background */}
      <Image source={BATTLE_BG} style={styles.bgImage} resizeMode="cover" />
      <View style={styles.bgOverlay} />

      {/* ── HUD row ── */}
      <View style={styles.topHUD}>
        <View style={styles.playerCard}>
          <View style={[styles.avatarRing, { borderColor: '#4A9EFF' }]}>
            <DogSprite dog={playerDog} variant="idle" size={38} />
          </View>
          <View style={styles.hudMeta}>
            <Text style={styles.hudName} numberOfLines={1}>{playerDog.name}</Text>
            <Text style={styles.hudTrophies}>🏆 {trophies}</Text>
          </View>
          <View style={styles.badge1P}><Text style={styles.badgeText}>1P</Text></View>
        </View>

        <View style={styles.timerBox}>
          <Text style={styles.timeLabel}>TIME LEFT</Text>
          <Text style={[styles.timer, timeUrgent && styles.timerUrgent]}>{formatTime(state.timeRemaining)}</Text>
        </View>

        <View style={[styles.playerCard, { flexDirection: 'row-reverse' }]}>
          <View style={[styles.avatarRing, { borderColor: '#FF4422' }]}>
            <View style={{ transform: [{ scaleX: -1 }] }}>
              <DogSprite dog={playerDog} variant="idle" size={38} />
            </View>
          </View>
          <View style={[styles.hudMeta, { alignItems: 'flex-end' }]}>
            <Text style={styles.hudName} numberOfLines={1}>{bot.name}</Text>
            <Text style={styles.hudTrophies}>🏆 {bot.trophies}</Text>
          </View>
          <View style={styles.badge2P}><Text style={styles.badgeText}>2P</Text></View>
        </View>
      </View>

      {/* ── Bark power bars ── */}
      <View style={styles.barsRow}>
        <View style={styles.barSection}>
          <View style={styles.barTrack}>
            <View style={[styles.barFill, { width: `${playerConfPct}%`, backgroundColor: '#2E7FCC' }]} />
            <Text style={styles.barPct}>{playerConfPct}%</Text>
          </View>
          <Text style={[styles.barLabel, { color: '#4A9EFF' }]}>BARK POWER</Text>
        </View>

        <Text style={styles.vsLabel}>VS</Text>

        <View style={[styles.barSection, { alignItems: 'flex-end' }]}>
          <View style={[styles.barTrack, { transform: [{ scaleX: -1 }] }]}>
            <View style={[styles.barFill, { width: `${botConfPct}%`, backgroundColor: '#BB2200' }]} />
            <Text style={[styles.barPct, { transform: [{ scaleX: -1 }] }]}>{botConfPct}%</Text>
          </View>
          <Text style={[styles.barLabel, { color: '#FF4422' }]}>BARK POWER</Text>
        </View>
      </View>

      {/* ── Tug-of-war bar ── */}
      <View style={styles.tugRow}>
        <View style={styles.tugTrack}>
          <View style={[styles.tugBlue, { flex: 50 + (state.wavePosition / 100) * 35 }]} />
          <View style={[styles.tugRed,  { flex: 50 - (state.wavePosition / 100) * 35 }]} />
          <View style={styles.tugDot} />
        </View>
      </View>

      {/* ── Arena ── */}
      <View style={styles.arena}>
        {/* Clash energy between dogs */}
        {clashVisible && (
          <View style={styles.clashZone} pointerEvents="none">
            <View style={[styles.clashLine, { opacity: 0.5 + (state.isPlayerCharging ? state.playerChargeAmount * 0.5 : 0.3) }]} />
          </View>
        )}

        {/* WOOF bubble */}
        {state.isPlayerCharging && (
          <View style={styles.woofBubble}><Text style={styles.woofText}>WOOF!</Text></View>
        )}
        {/* WAF bubble */}
        {isBotAttacking && (
          <View style={styles.wafBubble}><Text style={styles.wafText}>WAF!</Text></View>
        )}

        {/* Dogs — edge to edge */}
        <View style={styles.dogsRow}>
          <View style={styles.dogLeft}>
            <DogSprite dog={playerDog} variant={playerVariant} size={DOG_SIZE} />
            {state.isPlayerOverheated && <Text style={styles.tiredText}>💨 TIRED</Text>}
          </View>
          <View style={styles.dogRight}>
            <View style={{ transform: [{ scaleX: -1 }] }}>
              <DogSprite dog={playerDog} variant={botVariant} size={DOG_SIZE} />
            </View>
          </View>
        </View>

        {/* VS floats above dogs in center */}
        <View style={styles.vsFloat} pointerEvents="none">
          <Text style={styles.vsFloatText}>VS</Text>
        </View>
      </View>

      {/* ── Stamina ── */}
      <View style={styles.staminaRow}>
        <View style={styles.staminaTrack}>
          <View style={[styles.staminaFill, { width: `${staminaPct}%` }, staminaPct < 25 && styles.staminaLow]} />
        </View>
      </View>

      {/* ── Controls ── */}
      <View style={styles.controls}>
        <View style={styles.skillsLeft}>
          <SkillBtn label="HOWL"  emoji="🎵" color="#4A9EFF" cooldown={state.skillCooldowns['HOWL']}  max={10} active={state.isHowlActive}   onPress={() => useSkill('HOWL')} />
          <SkillBtn label="TREAT" emoji="🦴" color="#44BB44" cooldown={state.skillCooldowns['TREAT']} max={12}                                 onPress={() => useSkill('TREAT')} />
        </View>

        <Pressable
          style={[styles.barkBtn, (state.isPlayerOverheated || !state.active) && styles.barkOff]}
          onPressIn={handleBarkPressIn}
          onPressOut={handleBarkPressOut}
          disabled={state.isPlayerOverheated || !state.active}
        >
          <View style={[
            styles.barkInner,
            state.isPlayerCharging && {
              transform: [{ scale: 1 + state.playerChargeAmount * 0.1 }],
              backgroundColor: `rgba(220,40,0,${0.9 + state.playerChargeAmount * 0.1})`,
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

      {/* ── Currency ── */}
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
    width: 66, height: 66, borderRadius: 33, backgroundColor: 'rgba(8,18,40,0.90)',
    borderWidth: 2, alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.6, shadowRadius: 4, elevation: 5,
  },
  active: { borderWidth: 3 },
  emoji: { fontSize: 22 },
  label: { fontSize: 9, fontWeight: '700', marginTop: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.68)', alignItems: 'center', justifyContent: 'center', borderRadius: 33,
  },
  cd: { color: '#FFF', fontSize: 20, fontWeight: '900' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#060E22', overflow: 'hidden' },
  bgImage:   { ...StyleSheet.absoluteFillObject },
  bgOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(4,8,20,0.20)' },

  /* HUD */
  topHUD: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingTop: 8, paddingBottom: 6,
    backgroundColor: 'rgba(6,14,34,0.90)',
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  playerCard: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 5 },
  avatarRing: {
    width: 46, height: 46, borderRadius: 23, borderWidth: 2,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  hudMeta:    { flex: 1 },
  hudName:    { color: '#FFF', fontWeight: '800', fontSize: 11 },
  hudTrophies:{ color: '#FFD700', fontSize: 10, fontWeight: '700' },
  badge1P: { backgroundColor: '#2E7FCC', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  badge2P: { backgroundColor: '#BB2200', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  badgeText: { color: '#FFF', fontSize: 9, fontWeight: '900' },
  timerBox: {
    alignItems: 'center', minWidth: 74,
    backgroundColor: 'rgba(10,20,50,0.95)', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 3,
    borderWidth: 1, borderColor: 'rgba(74,158,255,0.3)',
  },
  timeLabel:   { color: '#AAA', fontSize: 8, fontWeight: '700' },
  timer:       { color: '#FFF', fontSize: 24, fontWeight: '900' },
  timerUrgent: { color: '#FF4422' },

  /* Bark power bars */
  barsRow: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingBottom: 3,
    backgroundColor: 'rgba(6,14,34,0.82)', gap: 6,
  },
  barSection: { flex: 1 },
  barTrack: {
    height: 16, backgroundColor: 'rgba(255,255,255,0.10)', borderRadius: 8,
    overflow: 'hidden', justifyContent: 'center',
  },
  barFill:  { position: 'absolute', top: 0, left: 0, bottom: 0, borderRadius: 8 },
  barPct:   { color: '#FFF', fontSize: 10, fontWeight: '900', textAlign: 'center', zIndex: 1 },
  barLabel: { fontSize: 8, fontWeight: '800', marginTop: 1 },
  vsLabel:  {
    color: '#FFD700', fontSize: 18, fontWeight: '900',
    textShadowColor: '#AA7700', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2,
  },

  /* Tug bar */
  tugRow: { paddingHorizontal: 8, paddingBottom: 2, backgroundColor: 'rgba(6,14,34,0.6)' },
  tugTrack: { height: 6, flexDirection: 'row', borderRadius: 3, overflow: 'hidden', position: 'relative' },
  tugBlue: { backgroundColor: '#2E7FCC' },
  tugRed:  { backgroundColor: '#BB2200' },
  tugDot: {
    position: 'absolute', top: -3, left: '50%', marginLeft: -5,
    width: 10, height: 10, borderRadius: 5, backgroundColor: '#FFD700',
    shadowColor: '#FFD700', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 4, elevation: 4,
  },

  /* Arena */
  arena: { flex: 1, position: 'relative' },

  clashZone: { position: 'absolute', top: '10%', bottom: '5%', left: '45%', right: '45%', alignItems: 'center' },
  clashLine: { flex: 1, width: 6, borderRadius: 3, backgroundColor: '#FFD700',
    shadowColor: '#FFD700', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 12, elevation: 8 },

  /* Speech bubbles */
  woofBubble: {
    position: 'absolute', bottom: DOG_SIZE + 10, left: 12,
    backgroundColor: '#1166EE', borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 6,
    shadowColor: '#4A9EFF', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 12, elevation: 9,
  },
  woofText: { color: '#FFF', fontSize: 20, fontWeight: '900', letterSpacing: 1 },
  wafBubble: {
    position: 'absolute', bottom: DOG_SIZE + 10, right: 12,
    backgroundColor: '#BB2200', borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 6,
    shadowColor: '#FF4422', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 12, elevation: 9,
  },
  wafText: { color: '#FFF', fontSize: 20, fontWeight: '900', letterSpacing: 1 },

  /* Dogs row — edge to edge */
  dogsRow: {
    position: 'absolute', bottom: 0, left: -8, right: -8,
    flexDirection: 'row', alignItems: 'flex-end',
  },
  dogLeft:  { flex: 1, alignItems: 'flex-start' },
  dogRight: { flex: 1, alignItems: 'flex-end' },

  vsFloat: { position: 'absolute', bottom: DOG_SIZE * 0.2, left: 0, right: 0, alignItems: 'center' },
  vsFloatText: {
    color: '#FFD700', fontSize: 26, fontWeight: '900',
    textShadowColor: '#000', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 8,
  },

  tiredText: { color: '#FF8800', fontWeight: '700', fontSize: 10, textAlign: 'center' },

  /* Stamina */
  staminaRow: { paddingHorizontal: 50, paddingBottom: 3 },
  staminaTrack: { height: 5, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 3, overflow: 'hidden' },
  staminaFill: { height: '100%', backgroundColor: '#FFD700', borderRadius: 3 },
  staminaLow:  { backgroundColor: '#FF4422' },

  /* Controls */
  controls: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 12, paddingBottom: 8,
  },
  skillsLeft:  { gap: 8, width: 70 },
  skillsRight: { gap: 8, width: 70 },

  barkBtn: { width: 136, height: 136, borderRadius: 68, alignItems: 'center', justifyContent: 'center' },
  barkOff: { opacity: 0.4 },
  barkInner: {
    width: 126, height: 126, borderRadius: 63,
    backgroundColor: '#CC2200', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#FF4422', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.95, shadowRadius: 22, elevation: 15,
    borderWidth: 3, borderColor: 'rgba(255,130,90,0.45)',
  },
  barkPaw:   { fontSize: 30 },
  barkLabel: { color: '#FFF', fontSize: 20, fontWeight: '900', letterSpacing: 1 },
  barkSub:   { color: 'rgba(255,255,200,0.75)', fontSize: 9, fontWeight: '600' },

  /* Currency */
  currencyBar: {
    flexDirection: 'row', justifyContent: 'center', gap: 24,
    backgroundColor: 'rgba(6,14,34,0.94)', paddingVertical: 6,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)',
  },
  currencyText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
});
