import { useEffect, useRef, useCallback, useState } from 'react';
import { getDog } from '../../data/dogs';
import { getBotForTrophies } from '../../data/bots';
import { useSaveStore } from '../../store/saveStore';
import {
  createInitialState, tickBattle, buildBattleResult,
  applyPlayerBark, applySuper, applySkill,
} from './BattleEngine';
import type { BattleState } from './BattleEngine';
import type { BattleEndResult } from '../../types';

export function useBattle(onBattleEnd: (result: BattleEndResult) => void) {
  const save      = useSaveStore();
  const playerDog = getDog(save.data.selectedDogId) ?? getDog('samoyed')!;
  const bot       = getBotForTrophies(save.data.trophies);

  const [state, setStateRaw] = useState<BattleState>(() => createInitialState(playerDog, bot));
  const stateRef  = useRef(state);

  const setState = useCallback((patch: Partial<BattleState>) => {
    setStateRaw(prev => {
      const next = { ...prev, ...patch };
      stateRef.current = next;
      return next;
    });
  }, []);

  const rafRef       = useRef<number | null>(null);
  const lastTickRef  = useRef<number>(Date.now());
  const endFiredRef  = useRef(false);

  // Game loop
  useEffect(() => {
    if (!state.active || state.ended) return;

    const tick = () => {
      const now = Date.now();
      const dt  = Math.min((now - lastTickRef.current) / 1000, 0.1);
      lastTickRef.current = now;

      const patch = tickBattle(stateRef.current, dt, playerDog, bot);
      setState(patch);

      if (patch.ended) {
        if (!endFiredRef.current) {
          endFiredRef.current = true;
          const final  = { ...stateRef.current, ...patch };
          const result = buildBattleResult(final);
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
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [state.active]);

  const startBattle = useCallback(() => {
    endFiredRef.current = false;
    setState({ ...createInitialState(playerDog, bot), active: true });
  }, [playerDog, bot]);

  const bark = useCallback(() => {
    const s = stateRef.current;
    if (!s.active || s.ended || s.isFuryMode) return;
    setState(applyPlayerBark(s));
  }, []);

  const activateSuper = useCallback(() => {
    const s = stateRef.current;
    if (!s.active || s.ended) return;
    setState(applySuper(s));
  }, []);

  const useSkill = useCallback((skill: 'SHIELD' | 'TREAT') => {
    const s = stateRef.current;
    if (!s.active || s.ended) return;
    setState(applySkill(s, skill, playerDog));
  }, [playerDog]);

  return { state, playerDog, bot, startBattle, bark, activateSuper, useSkill };
}
