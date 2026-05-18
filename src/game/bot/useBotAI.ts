import { useRef, useCallback } from 'react';
import type { BotConfig } from '../../types';
import type { BattleState } from '../battle/BattleEngine';

interface BotActions {
  getBattleState: () => BattleState;
  pushWave: (force: number) => void;
  useBotSkill: (skill: string) => void;
}

export function useBotAI(bot: BotConfig, actions: BotActions) {
  const activeRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleDecision = useCallback(() => {
    if (!activeRef.current) return;

    const delay = bot.reactionDelay * 1000 + Math.random() * 300;
    timeoutRef.current = setTimeout(() => {
      if (!activeRef.current) return;
      decide();
      scheduleDecision();
    }, delay);
  }, [bot]);

  const decide = useCallback(() => {
    const s = actions.getBattleState();
    if (!s.active || s.ended) return;

    const isMistake = Math.random() < bot.mistakeRate;
    if (isMistake) return;

    // Shield vs incoming wave
    if (s.wavePosition > 50 && s.botSkillCooldowns['SHIELD'] === 0) {
      actions.useBotSkill('SHIELD');
      return;
    }

    // Treat when bot stamina is low
    if (s.botStamina < 30 && s.botSkillCooldowns['TREAT'] === 0) {
      actions.useBotSkill('TREAT');
      return;
    }

    // Howl aggressively
    if (Math.random() < bot.aggression * 0.15 && s.botSkillCooldowns['HOWL'] === 0) {
      actions.useBotSkill('HOWL');
    }

    // Bark
    const barkForce = bot.aggression * 8 + Math.random() * 4;
    const doHold = Math.random() < bot.aggression;
    actions.pushWave(doHold ? barkForce * 1.5 : barkForce);
  }, [bot, actions]);

  const start = useCallback(() => {
    activeRef.current = true;
    scheduleDecision();
  }, [scheduleDecision]);

  const stop = useCallback(() => {
    activeRef.current = false;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  return { start, stop };
}
