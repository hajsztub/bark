import React, { useEffect, useRef, useState } from 'react';
import { View, View as SafeAreaView, StyleSheet } from 'react-native';
import { useBattle } from '../game/battle/useBattle';
import { useSaveStore } from '../store/saveStore';
import type { BattleEndResult } from '../types';

import BattleHUD       from '../components/battle/BattleHUD';
import BattlePowerBars from '../components/battle/BattlePowerBars';
import BattleArena     from '../components/battle/BattleArena';
import BattleControls  from '../components/battle/BattleControls';

interface Props { onBattleEnd: (result: BattleEndResult) => void; }

export default function BattleScreen({ onBattleEnd }: Props) {
  const { state, playerDog, bot, startBattle, bark, activateSuper, useSkill } = useBattle(onBattleEnd);

  useEffect(() => { startBattle(); }, []);

  const trophies = useSaveStore(s => s.data.trophies);
  const name     = useSaveStore(s => s.data.playerName);
  const coins    = useSaveStore(s => s.data.coins);
  const gems     = useSaveStore(s => s.data.gems);

  const timeUrgent    = state.timeRemaining <= 10;
  const staminaPct    = 100; // stamina removed, kept for BattleControls compat
  const playerVariant = state.isFuryMode ? 'bark' : state.lastHitResult === 'good' || state.lastHitResult === 'perfect' ? 'bark' : 'idle';
  const botVariant    = state.botGrowlProgress > 0.75 ? 'bark' : 'idle';
  const isBotAttacking= state.botGrowlProgress > 0.75;

  return (
    <SafeAreaView style={styles.container}>

      <BattleHUD
        playerDog={playerDog}
        playerName={name}
        playerTrophies={trophies}
        bot={bot}
        timeRemaining={state.timeRemaining}
        timeUrgent={timeUrgent}
      />

      <BattlePowerBars
        playerHP={state.playerHP}
        botHP={state.botHP}
        superMeter={state.superMeter}
        playerColor={playerDog.color}
      />

      <BattleArena
        playerDog={playerDog}
        playerVariant={playerVariant as any}
        botVariant={botVariant as any}
        isFuryMode={state.isFuryMode}
        isBotAttacking={isBotAttacking}
        isPlayerCharging={false}
        lastHitResult={state.lastHitResult}
        playerCombo={state.playerCombo}
        botGrowlProgress={state.botGrowlProgress}
      />

      <BattleControls
        pulsePhase={state.pulsePhase}
        superMeter={state.superMeter}
        isFuryMode={state.isFuryMode}
        isShieldActive={state.isShieldActive}
        shieldCD={state.skillCooldowns['SHIELD'] ?? 0}
        treatCD={state.skillCooldowns['TREAT'] ?? 0}
        isActive={state.active}
        onBark={bark}
        onSuper={activateSuper}
        onSkill={useSkill}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#060E22', overflow: 'hidden' },
});
