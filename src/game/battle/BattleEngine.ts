import type { BotConfig, BattleEndResult, Dog } from '../../types';

// ── Tuning constants ───────────────────────────────────────────────────────
export const BATTLE_DURATION     = 45;
export const MAX_HP              = 100;

export const PULSE_CYCLE         = 2.0;  // seconds per timing ring loop
export const PERFECT_START       = 0.70; // timing window: 70-88% of cycle
export const PERFECT_END         = 0.88;

export const GOOD_DAMAGE         = 7;
export const PERFECT_DAMAGE      = 22;
export const PARRY_COUNTER_DAMAGE= 18;   // damage dealt on successful parry
export const BOT_DAMAGE          = 12;
export const SUPER_DAMAGE        = 50;
export const FURY_AUTO_DAMAGE    = 10;   // damage per auto-bark in fury

export const SUPER_FILL_PERFECT  = 22;   // super meter points per perfect hit
export const SUPER_FILL_GOOD     = 7;
export const SUPER_COST          = 100;

export const COMBO_FURY_THRESHOLD = 5;   // combo hits to enter FURY
export const FURY_DURATION        = 2.5;
export const FURY_BARK_INTERVAL   = 0.35; // auto-bark every 0.35s in fury

export const PARRY_WINDOW         = 0.25; // last 25% of bot growl is parry window

// ── State ─────────────────────────────────────────────────────────────────
export type HitResult = 'perfect' | 'good' | 'parry' | 'block' | 'miss' | null;

export interface BattleState {
  timeRemaining:   number;
  playerHP:        number;
  botHP:           number;

  // Timing ring
  pulsePhase:      number;  // 0→1 advances continuously

  // Combo & super
  playerCombo:     number;
  superMeter:      number;  // 0-100

  // Fury
  isFuryMode:      boolean;
  furyTimer:       number;
  furyBarkTimer:   number;

  // Bot growl telegraph
  botGrowlProgress: number;  // 0→1, when 1.0 bot attacks and resets
  botGrowlSpeed:    number;  // fills per second (set from bot config)

  // Hit feedback (cleared after 0.5s)
  lastHitResult:   HitResult;
  hitResultTimer:  number;

  // Shield skill
  isShieldActive:  boolean;
  shieldTimer:     number;
  skillCooldowns:  Record<string, number>;

  active: boolean;
  ended:  boolean;
}

export const createInitialState = (_playerDog: Dog, bot: BotConfig): BattleState => ({
  timeRemaining:    BATTLE_DURATION,
  playerHP:         MAX_HP,
  botHP:            MAX_HP,
  pulsePhase:       0,
  playerCombo:      0,
  superMeter:       0,
  isFuryMode:       false,
  furyTimer:        0,
  furyBarkTimer:    0,
  botGrowlProgress: 0,
  botGrowlSpeed:    0.18 + bot.aggression * 0.24, // easy: ~0.2/s, hard: ~0.42/s
  lastHitResult:    null,
  hitResultTimer:   0,
  isShieldActive:   false,
  shieldTimer:      0,
  skillCooldowns:   { SHIELD: 0, TREAT: 0 },
  active:           false,
  ended:            false,
});

// ── Tick ──────────────────────────────────────────────────────────────────
export function tickBattle(
  state: BattleState,
  dt: number,
  _playerDog: Dog,
  _bot: BotConfig,
): Partial<BattleState> {
  if (!state.active || state.ended) return {};

  const p: Partial<BattleState> = {};

  // Timer
  p.timeRemaining = Math.max(0, state.timeRemaining - dt);

  // Pulse phase (timing ring)
  p.pulsePhase = (state.pulsePhase + dt / PULSE_CYCLE) % 1;

  // Skill cooldowns
  const cd: Record<string, number> = {};
  for (const k of ['SHIELD', 'TREAT']) cd[k] = Math.max(0, state.skillCooldowns[k] - dt);
  p.skillCooldowns = cd;

  // Shield timer
  if (state.isShieldActive) {
    const t = Math.max(0, state.shieldTimer - dt);
    p.shieldTimer = t;
    if (t === 0) p.isShieldActive = false;
  }

  // Hit result flash
  if (state.lastHitResult && state.hitResultTimer > 0) {
    const t = Math.max(0, state.hitResultTimer - dt);
    p.hitResultTimer = t;
    if (t === 0) p.lastHitResult = null;
  }

  // Fury mode
  let playerHP = state.playerHP;
  let botHP    = state.botHP;

  if (state.isFuryMode) {
    const t = Math.max(0, state.furyTimer - dt);
    p.furyTimer = t;
    if (t === 0) { p.isFuryMode = false; p.furyBarkTimer = 0; }

    // Auto-barks in fury
    const newFuryBarkTimer = state.furyBarkTimer - dt;
    if (newFuryBarkTimer <= 0) {
      botHP = Math.max(0, botHP - FURY_AUTO_DAMAGE);
      p.furyBarkTimer = FURY_BARK_INTERVAL;
    } else {
      p.furyBarkTimer = newFuryBarkTimer;
    }
  }

  // Bot growl (telegraph)
  const newGrowl = state.botGrowlProgress + state.botGrowlSpeed * dt;
  if (newGrowl >= 1) {
    // Bot attacks!
    const dmg = state.isShieldActive ? 0 : BOT_DAMAGE;
    playerHP = Math.max(0, playerHP - dmg);
    p.botGrowlProgress = 0; // reset growl
    if (state.isShieldActive) {
      p.lastHitResult = 'block';
      p.hitResultTimer = 0.6;
    }
  } else {
    p.botGrowlProgress = newGrowl;
  }

  p.playerHP = playerHP;
  p.botHP    = botHP;

  // End conditions
  if (playerHP <= 0 || botHP <= 0 || p.timeRemaining === 0) {
    p.ended = true;
    p.active = false;
  }

  return p;
}

// ── Player actions ────────────────────────────────────────────────────────
export function applyPlayerBark(state: BattleState): Partial<BattleState> {
  const phase = state.pulsePhase;
  const isPerfect = phase >= PERFECT_START && phase <= PERFECT_END;

  // Parry: bark while bot is in final 25% of growl
  const isParry = state.botGrowlProgress >= (1 - PARRY_WINDOW);

  let botHP    = state.botHP;
  let playerHP = state.playerHP;
  let combo    = state.playerCombo;
  let super_   = state.superMeter;
  let fury     = state.isFuryMode;
  let furyT    = state.furyTimer;
  let furyBark = state.furyBarkTimer;
  let hit: HitResult;

  if (isParry) {
    // Parry: interrupt bot attack, deal counter damage
    botHP = Math.max(0, botHP - PARRY_COUNTER_DAMAGE);
    combo += 1;
    super_ = Math.min(SUPER_COST, super_ + SUPER_FILL_PERFECT);
    hit = 'parry';
  } else if (isPerfect) {
    const multi = comboMultiplier(combo);
    botHP = Math.max(0, botHP - PERFECT_DAMAGE * multi);
    combo += 1;
    super_ = Math.min(SUPER_COST, super_ + SUPER_FILL_PERFECT);
    hit = 'perfect';
  } else {
    const multi = comboMultiplier(combo);
    botHP = Math.max(0, botHP - GOOD_DAMAGE * multi);
    combo += 1;
    super_ = Math.min(SUPER_COST, super_ + SUPER_FILL_GOOD);
    hit = 'good';
  }

  // Trigger FURY
  if (!fury && combo >= COMBO_FURY_THRESHOLD) {
    fury   = true;
    furyT  = FURY_DURATION;
    furyBark = 0;
    combo  = 0;
  }

  return {
    botHP, playerHP,
    playerCombo: combo,
    superMeter: super_,
    isFuryMode: fury,
    furyTimer: furyT,
    furyBarkTimer: furyBark,
    botGrowlProgress: isParry ? 0 : state.botGrowlProgress, // parry resets growl
    lastHitResult: hit,
    hitResultTimer: 0.7,
  };
}

export function applySuper(state: BattleState): Partial<BattleState> {
  if (state.superMeter < SUPER_COST) return {};
  return {
    botHP:       Math.max(0, state.botHP - SUPER_DAMAGE),
    superMeter:  0,
    lastHitResult: 'perfect',
    hitResultTimer: 1.2,
    playerCombo: 0,
  };
}

export function applySkill(state: BattleState, skill: string, playerDog: Dog): Partial<BattleState> {
  if (state.skillCooldowns[skill] > 0) return {};

  if (skill === 'SHIELD') {
    return {
      isShieldActive: true,
      shieldTimer: 3,
      skillCooldowns: { ...state.skillCooldowns, SHIELD: 14 },
    };
  }
  if (skill === 'TREAT') {
    return {
      playerHP: Math.min(MAX_HP, state.playerHP + 20),
      skillCooldowns: { ...state.skillCooldowns, TREAT: 12 },
    };
  }
  return {};
}

export function buildBattleResult(state: BattleState): BattleEndResult {
  const won = state.playerHP > state.botHP || state.botHP <= 0;
  const draw = !won && state.playerHP === state.botHP;
  const result = draw ? 'draw' : won ? 'victory' : 'defeat';
  return {
    result,
    playerConfidence: state.playerHP,
    botConfidence: state.botHP,
    duration: BATTLE_DURATION - state.timeRemaining,
    coinsEarned:      won ? 1250 : 500,
    gemsEarned:       won ? 50 : 10,
    trophyDelta:      won ? 20 : -10,
    fragmentsEarned:  won ? 10 : 3,
    chestProgressAdded: won ? 0.1 : 0,
  };
}

function comboMultiplier(combo: number): number {
  if (combo >= 4) return 2.0;
  if (combo >= 2) return 1.5;
  return 1.0;
}
