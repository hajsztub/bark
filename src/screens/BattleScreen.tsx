import React, { useEffect, useRef, useCallback, useState } from 'react';
import { View, View as SafeAreaView, StyleSheet } from 'react-native';
import { useBattle } from '../game/battle/useBattle';
import { useSaveStore } from '../store/saveStore';
import type { BattleEndResult } from '../types';

import BattleHUD      from '../components/battle/BattleHUD';
import BattlePowerBars from '../components/battle/BattlePowerBars';
import BattleArena    from '../components/battle/BattleArena';
import BattleControls from '../components/battle/BattleControls';

interface Props {
  onBattleEnd: (result: BattleEndResult) => void;
}

export default function BattleScreen({ onBattleEnd }: Props) {
  const {
    state, playerDog, bot,
    startBattle, tapBark, startCharge, updateCharge, releaseCharge, useSkill,
  } = useBattle(onBattleEnd);

  const chargeInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Bot attack detection ──────────────────────────────────────────────────
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

  // ── Input handlers ────────────────────────────────────────────────────────
  const handlePressIn = useCallback(() => {
    startCharge();
    chargeInterval.current = setInterval(updateCharge, 16);
  }, [startCharge, updateCharge]);

  const handlePressOut = useCallback(() => {
    if (chargeInterval.current) { clearInterval(chargeInterval.current); chargeInterval.current = null; }
    if (state.isPlayerCharging) releaseCharge(); else tapBark();
  }, [state.isPlayerCharging, releaseCharge, tapBark]);

  // ── Derived values ────────────────────────────────────────────────────────
  const playerConfPct = Math.ceil(state.playerConfidence);
  const botConfPct    = Math.ceil(state.botConfidence);
  const staminaPct    = (state.playerStamina / (playerDog.stats.stamina * 10)) * 100;
  const timeUrgent    = state.timeRemaining <= 10;

  const playerVariant = state.isPlayerCharging ? 'bark' : state.isPlayerOverheated ? 'hit' : 'idle';
  const botVariant    = isBotAttacking ? 'bark' : 'idle';

  const coins    = useSaveStore(s => s.data.coins);
  const gems     = useSaveStore(s => s.data.gems);
  const trophies = useSaveStore(s => s.data.trophies);
  const name     = useSaveStore(s => s.data.playerName);

  return (
    <SafeAreaView style={styles.container}>

      {/* ① HUD — names, avatars, timer */}
      <BattleHUD
        playerDog={playerDog}
        playerName={name}
        playerTrophies={trophies}
        bot={bot}
        timeRemaining={state.timeRemaining}
        timeUrgent={timeUrgent}
      />

      {/* ② Bark power bars + tug-of-war */}
      <BattlePowerBars
        playerConfPct={playerConfPct}
        botConfPct={botConfPct}
        wavePosition={state.wavePosition}
        playerColor={playerDog.color}
      />

      {/* ③ Arena — background + dogs + bubbles + clash */}
      <BattleArena
        playerDog={playerDog}
        playerVariant={playerVariant as any}
        botVariant={botVariant as any}
        isPlayerCharging={state.isPlayerCharging}
        isPlayerOverheated={state.isPlayerOverheated}
        isBotAttacking={isBotAttacking}
        chargeAmount={state.playerChargeAmount}
      />

      {/* ④ Controls — stamina, skills, BARK button, currency */}
      <BattleControls
        skills={{
          cooldowns:    state.skillCooldowns,
          isHowlActive:   state.isHowlActive,
          isShieldActive: state.isShieldActive,
        }}
        staminaPct={staminaPct}
        isCharging={state.isPlayerCharging}
        chargeAmount={state.playerChargeAmount}
        isOverheated={state.isPlayerOverheated}
        isActive={state.active}
        coins={coins}
        gems={gems}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onSkill={useSkill}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#060E22', overflow: 'hidden' },
});
