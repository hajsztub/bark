import { useEffect, useRef, useCallback, useState } from 'react';
import { getDog } from '../../data/dogs';
import { getBotForTrophies } from '../../data/bots';
import { useSaveStore } from '../../store/saveStore';
import {
  createInitialState,
  tickBattle,
  buildBattleResult,
  HOLD_COST_PER_S,
  OVERHEAT_THRESHOLD,
  OVERHEAT_COOLDOWN,
  TAP_COST,
  MAX_STAMINA,
} from './BattleEngine';
import type { BattleState } from './BattleEngine';
import type { BattleEndResult } from '../../types';
import { useBotAI } from '../bot/useBotAI';

export function useBattle(onBattleEnd: (result: BattleEndResult) => void) {
  const save = useSaveStore();
  const playerDog = getDog(save.data.selectedDogId) ?? getDog('samoyed')!;
  const bot = getBotForTrophies(save.data.trophies);

  const [state, setStateRaw] = useState<BattleState>(() => createInitialState(playerDog));
  const stateRef = useRef(state);

  const setState = useCallback((patch: Partial<BattleState>) => {
    setStateRaw(prev => {
      const next = { ...prev, ...patch };
      stateRef.current = next;
      return next;
    });
  }, []);

  const chargeStartRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(Date.now());
  const endFiredRef = useRef(false);

  // Bot AI
  const botAI = useBotAI(bot, {
    getBattleState: () => stateRef.current,
    pushWave: (force: number) => {
      setState({ wavePosition: Math.max(-100, stateRef.current.wavePosition - force) });
    },
    useBotSkill: (skill: string) => {
      const cd = stateRef.current.botSkillCooldowns;
      if (cd[skill] > 0) return;
      if (skill === 'HOWL') {
        setState({ botSkillCooldowns: { ...cd, HOWL: 10 } });
        // Bot howl: push wave hard
        setState({ wavePosition: Math.max(-100, stateRef.current.wavePosition - 20) });
      }
      if (skill === 'TREAT') {
        const botStamina = Math.min(MAX_STAMINA, stateRef.current.botStamina + 40);
        setState({ botStamina, botSkillCooldowns: { ...cd, TREAT: 12 } });
      }
      if (skill === 'SHIELD') {
        setState({ botSkillCooldowns: { ...cd, SHIELD: 14 } });
      }
    },
  });

  // Game loop
  useEffect(() => {
    if (!state.active || state.ended) return;

    const tick = () => {
      const now = Date.now();
      const dt = Math.min((now - lastTickRef.current) / 1000, 0.1);
      lastTickRef.current = now;

      const current = stateRef.current;
      const patch = tickBattle(current, dt, playerDog, bot);
      setState(patch);

      if (patch.ended) {
        const finalState = { ...current, ...patch };
        if (!endFiredRef.current) {
          endFiredRef.current = true;
          const result = buildBattleResult(finalState);
          save.recordBattle(result.result === 'victory');
          save.addCoins(result.coinsEarned);
          save.addGems(result.gemsEarned);
          save.addTrophies(result.trophyDelta);
          save.addFragments(playerDog.id, result.fragmentsEarned);
          save.addChestProgress(result.chestProgressAdded);
          onBattleEnd(result);
        }
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    lastTickRef.current = Date.now();
    rafRef.current = requestAnimationFrame(tick);
    botAI.start();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      botAI.stop();
    };
  }, [state.active]);

  // Actions
  const startBattle = useCallback(() => {
    endFiredRef.current = false;
    const initialState = createInitialState(playerDog);
    setState({ ...initialState, active: true });
  }, [playerDog]);

  const tapBark = useCallback(() => {
    const s = stateRef.current;
    if (!s.active || s.isPlayerOverheated || s.playerStamina < TAP_COST) return;
    const howlMult = s.isHowlActive ? 1.8 : 1;
    const push = playerDog.stats.barkPower * 1.5 * howlMult;
    setState({
      wavePosition: Math.min(100, s.wavePosition + push),
      playerStamina: s.playerStamina - TAP_COST,
    });
  }, [playerDog]);

  const startCharge = useCallback(() => {
    const s = stateRef.current;
    if (!s.active || s.isPlayerOverheated) return;
    chargeStartRef.current = Date.now();
    setState({ isPlayerCharging: true, playerChargeAmount: 0 });
  }, []);

  const updateCharge = useCallback(() => {
    const s = stateRef.current;
    if (!s.isPlayerCharging || !chargeStartRef.current) return;
    const elapsed = (Date.now() - chargeStartRef.current) / 1000;
    const charge = Math.min(1, elapsed / 2);

    const staminaCost = HOLD_COST_PER_S / 60;
    if (s.playerStamina <= 0 || s.playerChargeAmount >= OVERHEAT_THRESHOLD / 100) {
      setState({
        isPlayerOverheated: true,
        overheatTimer: OVERHEAT_COOLDOWN,
        isPlayerCharging: false,
        playerChargeAmount: 0,
      });
      chargeStartRef.current = null;
      return;
    }

    setState({ playerChargeAmount: charge, playerStamina: Math.max(0, s.playerStamina - staminaCost) });
  }, []);

  const releaseCharge = useCallback(() => {
    const s = stateRef.current;
    if (!s.isPlayerCharging) return;

    const charge = s.playerChargeAmount;
    const isPerfect = charge >= 0.7 && charge <= 0.85;
    const howlMult = s.isHowlActive ? 1.8 : 1;
    const perfectMult = isPerfect ? 1.5 : 1;
    const push = charge * playerDog.stats.barkPower * 3 * howlMult * perfectMult;

    setState({
      wavePosition: Math.min(100, s.wavePosition + push),
      isPlayerCharging: false,
      playerChargeAmount: 0,
    });
    chargeStartRef.current = null;
    return isPerfect;
  }, [playerDog]);

  const useSkill = useCallback((skill: 'HOWL' | 'TREAT' | 'SHIELD') => {
    const s = stateRef.current;
    if (s.skillCooldowns[skill] > 0) return;

    if (skill === 'HOWL') {
      setState({
        isHowlActive: true,
        howlTimer: 2,
        skillCooldowns: { ...s.skillCooldowns, HOWL: 10 },
      });
    } else if (skill === 'TREAT') {
      const maxStamina = playerDog.stats.stamina * 10;
      setState({
        playerStamina: Math.min(maxStamina, s.playerStamina + 40),
        skillCooldowns: { ...s.skillCooldowns, TREAT: 12 },
      });
    } else if (skill === 'SHIELD') {
      setState({
        isShieldActive: true,
        shieldTimer: 2,
        skillCooldowns: { ...s.skillCooldowns, SHIELD: 14 },
      });
    }
  }, [playerDog]);

  return {
    state,
    playerDog,
    bot,
    startBattle,
    tapBark,
    startCharge,
    updateCharge,
    releaseCharge,
    useSkill,
  };
}
