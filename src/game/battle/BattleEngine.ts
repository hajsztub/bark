import type { BotConfig, BattleEndResult, Dog } from '../../types';

export const BATTLE_DURATION = 60;
export const MAX_CONFIDENCE = 100;
export const MAX_STAMINA = 100;
export const STAMINA_REGEN = 18; // per second
export const TAP_COST = 8;
export const HOLD_COST_PER_S = 3;
export const OVERHEAT_THRESHOLD = 95;
export const OVERHEAT_COOLDOWN = 2;
export const WAVE_BOUNDARY = 100;
export const WAVE_DRIFT_SPEED = 2; // passive drift back to center per second
export const WAVE_HIT_DAMAGE = 15;

export interface BattleState {
  timeRemaining: number;
  playerConfidence: number;
  botConfidence: number;
  playerStamina: number;
  botStamina: number;
  wavePosition: number;       // -100 (player loses) to +100 (bot loses)
  isPlayerCharging: boolean;
  playerChargeAmount: number; // 0-1
  isPlayerOverheated: boolean;
  overheatTimer: number;
  isShieldActive: boolean;
  shieldTimer: number;
  isHowlActive: boolean;
  howlTimer: number;
  skillCooldowns: Record<string, number>; // seconds remaining
  botSkillCooldowns: Record<string, number>;
  active: boolean;
  ended: boolean;
}

export const createInitialState = (playerDog: Dog): BattleState => ({
  timeRemaining: BATTLE_DURATION,
  playerConfidence: MAX_CONFIDENCE,
  botConfidence: MAX_CONFIDENCE,
  playerStamina: MAX_STAMINA,
  botStamina: playerDog.stats.stamina * 10,
  wavePosition: 0,
  isPlayerCharging: false,
  playerChargeAmount: 0,
  isPlayerOverheated: false,
  overheatTimer: 0,
  isShieldActive: false,
  shieldTimer: 0,
  isHowlActive: false,
  howlTimer: 0,
  skillCooldowns: { HOWL: 0, TREAT: 0, SHIELD: 0 },
  botSkillCooldowns: { HOWL: 0, TREAT: 0, SHIELD: 0 },
  active: false,
  ended: false,
});

export function tickBattle(
  state: BattleState,
  dt: number,
  playerDog: Dog,
  bot: BotConfig,
): Partial<BattleState> {
  if (!state.active || state.ended) return {};

  const patch: Partial<BattleState> = {};

  // Timer
  const newTime = Math.max(0, state.timeRemaining - dt);
  patch.timeRemaining = newTime;

  // Stamina regen
  const maxStamina = playerDog.stats.stamina * 10;
  patch.playerStamina = Math.min(maxStamina, state.playerStamina + STAMINA_REGEN * dt);

  // Overheat cooldown
  if (state.isPlayerOverheated) {
    const newOH = Math.max(0, state.overheatTimer - dt);
    patch.overheatTimer = newOH;
    if (newOH === 0) patch.isPlayerOverheated = false;
  }

  // Skill timers
  const newHowlTimer = Math.max(0, state.howlTimer - dt);
  const newShieldTimer = Math.max(0, state.shieldTimer - dt);
  patch.howlTimer = newHowlTimer;
  patch.shieldTimer = newShieldTimer;
  if (newHowlTimer === 0 && state.isHowlActive) patch.isHowlActive = false;
  if (newShieldTimer === 0 && state.isShieldActive) patch.isShieldActive = false;

  // Skill cooldowns
  const newCD: Record<string, number> = {};
  const newBotCD: Record<string, number> = {};
  for (const k of ['HOWL', 'TREAT', 'SHIELD']) {
    newCD[k] = Math.max(0, state.skillCooldowns[k] - dt);
    newBotCD[k] = Math.max(0, state.botSkillCooldowns[k] - dt);
  }
  patch.skillCooldowns = newCD;
  patch.botSkillCooldowns = newBotCD;

  // Wave drift back to center
  const drift = WAVE_DRIFT_SPEED * dt;
  let newWave = state.wavePosition;
  if (Math.abs(newWave) < drift) {
    newWave = 0;
  } else {
    newWave -= Math.sign(newWave) * drift;
  }

  // Charge pushes wave
  if (state.isPlayerCharging) {
    const pushPower = 0.5 + state.playerChargeAmount * 2;
    const howlMult = state.isHowlActive ? 1.8 : 1;
    newWave += pushPower * howlMult * playerDog.stats.barkPower * 0.3 * dt;
  }

  // Check boundaries
  let newPlayerConf = state.playerConfidence;
  let newBotConf = state.botConfidence;

  if (newWave >= WAVE_BOUNDARY) {
    const dmg = WAVE_HIT_DAMAGE * (state.isShieldActive ? 0 : 1);
    newBotConf = Math.max(0, state.botConfidence - dmg);
    newWave = 0;
    patch.botConfidence = newBotConf;
  } else if (newWave <= -WAVE_BOUNDARY) {
    const dmg = WAVE_HIT_DAMAGE * (state.isShieldActive ? 0.5 : 1);
    newPlayerConf = Math.max(0, state.playerConfidence - dmg);
    newWave = 0;
    patch.playerConfidence = newPlayerConf;
  }

  patch.wavePosition = Math.max(-WAVE_BOUNDARY, Math.min(WAVE_BOUNDARY, newWave));

  // End conditions
  if (newPlayerConf <= 0 || newBotConf <= 0 || newTime === 0) {
    patch.ended = true;
    patch.active = false;
  }

  return patch;
}

export function buildBattleResult(state: BattleState): BattleEndResult {
  let result: BattleEndResult['result'];
  if (state.playerConfidence > state.botConfidence) result = 'victory';
  else if (state.botConfidence > state.playerConfidence) result = 'defeat';
  else result = 'draw';

  const won = result === 'victory';
  return {
    result,
    playerConfidence: state.playerConfidence,
    botConfidence: state.botConfidence,
    duration: BATTLE_DURATION - state.timeRemaining,
    coinsEarned: won ? 1250 : 500,
    gemsEarned: won ? 50 : 10,
    trophyDelta: won ? 20 : -10,
    fragmentsEarned: won ? 10 : 3,
    chestProgressAdded: won ? 0.1 : 0,
  };
}
