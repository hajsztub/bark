using System.Collections;
using UnityEngine;

namespace BarkBattle
{
    /// <summary>
    /// Simulates a player-like opponent using BotConfig parameters.
    /// Pushes the wave, uses skills, and makes intentional mistakes.
    /// </summary>
    public class BotController : MonoBehaviour
    {
        // ─── Inspector ────────────────────────────────────────────────────────────
        [Header("Config")]
        [SerializeField] private BotConfig      _config;
        [SerializeField] private WaveSystem     _waveSystem;
        [SerializeField] private SkillController _botSkills;   // separate SkillController for bot

        // ─── State ────────────────────────────────────────────────────────────────
        private bool  _active;
        private float _botStamina;
        private float _barkChargeTime;    // seconds currently held
        private bool  _isCharging;
        private float _nextActionTimer;
        private bool  _shieldUsedThisCycle;

        // Cooldown buckets (mirrored from skill configs)
        private float _howlCooldown;
        private float _treatCooldown;
        private float _shieldCooldown;

        private const float BOT_REGEN_RATE = StaminaSystem.REGEN_RATE;
        private const float MIN_ACTION_INTERVAL = 0.3f;

        // ─── Lifecycle ────────────────────────────────────────────────────────────
        private void Awake()
        {
            if (_waveSystem == null) _waveSystem = FindObjectOfType<WaveSystem>();
        }

        private void Update()
        {
            if (!_active || _config == null) return;

            float dt = Time.deltaTime;

            // Regen bot stamina
            _botStamina = Mathf.Min(_config.stamina, _botStamina + BOT_REGEN_RATE * dt);

            // Tick skill cooldowns
            _howlCooldown   = Mathf.Max(0f, _howlCooldown   - dt);
            _treatCooldown  = Mathf.Max(0f, _treatCooldown  - dt);
            _shieldCooldown = Mathf.Max(0f, _shieldCooldown - dt);

            // Action decision timer
            _nextActionTimer -= dt;
            if (_nextActionTimer > 0f) return;
            _nextActionTimer = Random.Range(MIN_ACTION_INTERVAL, 0.6f / Mathf.Max(0.1f, _config.aggression));

            EvaluateAndAct();
        }

        // ─── Public API ──────────────────────────────────────────────────────────
        public void BeginBotBattle()
        {
            if (_config == null) return;
            _active           = true;
            _botStamina       = _config.stamina;
            _howlCooldown     = 0f;
            _treatCooldown    = 0f;
            _shieldCooldown   = 0f;
            _isCharging       = false;
            _barkChargeTime   = 0f;
            _shieldUsedThisCycle = false;
        }

        public void StopBotBattle()
        {
            _active     = false;
            _isCharging = false;
            StopAllCoroutines();
        }

        public void SetConfig(BotConfig config)
        {
            _config = config;
        }

        // ─── Decision Logic ───────────────────────────────────────────────────────
        private void EvaluateAndAct()
        {
            float wavePos = _waveSystem != null ? _waveSystem.Position : 0f;

            // --- Shield: react when wave is pushing hard toward bot ---
            if (wavePos <= _config.shieldWaveThreshold && _shieldCooldown <= 0f)
            {
                if (!ShouldMistake())
                {
                    StartCoroutine(DelayedAction(_config.reactionDelay, () => BotUseShield()));
                    return;
                }
            }

            // --- Treat: recover stamina when low ---
            float staminaRatio = _botStamina / Mathf.Max(1f, _config.stamina);
            if (staminaRatio < _config.treatStaminaThreshold && _treatCooldown <= 0f)
            {
                if (!ShouldMistake())
                {
                    StartCoroutine(DelayedAction(_config.reactionDelay, () => BotUseTreat()));
                    return;
                }
            }

            // --- Howl: use when wave favours bot ---
            if (wavePos >= _config.howlWaveThreshold && _howlCooldown <= 0f)
            {
                if (!ShouldMistake() && Random.value < _config.aggression)
                {
                    StartCoroutine(DelayedAction(_config.reactionDelay, () => BotUseHowl()));
                }
            }

            // --- Bark: default aggressive action ---
            if (_botStamina >= StaminaSystem.TAP_COST)
            {
                StartCoroutine(DelayedAction(_config.reactionDelay, () => BotBark()));
            }
        }

        // ─── Bot Actions ─────────────────────────────────────────────────────────
        private void BotBark()
        {
            if (!_active) return;

            bool doHold    = Random.value < _config.aggression;
            bool doMistake = ShouldMistake();

            if (doHold && !doMistake)
            {
                // Charge hold – duration varies with aggression & focus simulation
                float holdDur = Random.Range(0.4f, 1.2f) * Mathf.Lerp(0.5f, 1.5f, _config.aggression);
                StartCoroutine(BotHoldBark(holdDur));
            }
            else
            {
                // Simple tap
                float tapPower = _config.barkPower * BarkSystem.TAP_BARK_POWER;
                _botStamina   -= StaminaSystem.TAP_COST;
                _waveSystem?.PushWave(tapPower, false);
                AudioManager.Instance?.PlaySFX("BarkSmall");
                VFXManager.Instance?.PlayBarkPulse(false);
            }
        }

        private IEnumerator BotHoldBark(float holdDuration)
        {
            _isCharging = true;
            float elapsed   = 0f;
            float charge    = 0f;
            bool  overheated = false;

            while (elapsed < holdDuration && _active)
            {
                elapsed       += Time.deltaTime;
                charge        += BarkSystem.HOLD_CHARGE_RATE * Time.deltaTime;
                _botStamina   -= StaminaSystem.HOLD_COST_PER_S * Time.deltaTime;
                _botStamina    = Mathf.Max(0f, _botStamina);

                if (charge >= BarkSystem.OVERHEAT_THRESHOLD && ShouldMistake())
                {
                    // Bot accidentally overheats
                    overheated = true;
                    AudioManager.Instance?.PlaySFX("Overheat");
                    VFXManager.Instance?.PlayOverheat();
                    break;
                }

                if (_botStamina <= 0f) break;
                yield return null;
            }

            _isCharging = false;

            if (!overheated && charge > 0f)
            {
                charge = Mathf.Min(charge, BarkSystem.MAX_CHARGE);
                float releasePower = charge * _config.barkPower / BarkSystem.MAX_CHARGE;
                _waveSystem?.PushWave(releasePower, false);
                AudioManager.Instance?.PlaySFX(charge > BarkSystem.MAX_CHARGE * 0.6f ? "BarkBig" : "BarkSmall");
                VFXManager.Instance?.PlayBarkPulse(false);
            }
        }

        private void BotUseHowl()
        {
            if (!_active || _howlCooldown > 0f) return;
            _howlCooldown = 12f;
            // Bot howl: push wave with extra force
            _waveSystem?.PushWave(_config.barkPower * 2f, false);
            AudioManager.Instance?.PlaySFX("SkillHowl");
            Debug.Log("[BotController] Bot used HOWL");
        }

        private void BotUseTreat()
        {
            if (!_active || _treatCooldown > 0f) return;
            _treatCooldown = 15f;
            _botStamina    = Mathf.Min(_config.stamina, _botStamina + 40f);
            AudioManager.Instance?.PlaySFX("SkillTreat");
            Debug.Log("[BotController] Bot used TREAT");
        }

        private void BotUseShield()
        {
            if (!_active || _shieldCooldown > 0f) return;
            _shieldCooldown = 18f;
            StartCoroutine(BotShieldCoroutine(2f));
            AudioManager.Instance?.PlaySFX("SkillShield");
            VFXManager.Instance?.PlayShieldBlock();
            Debug.Log("[BotController] Bot used SHIELD");
        }

        private IEnumerator BotShieldCoroutine(float duration)
        {
            // Bot shield: temporarily halve incoming wave force
            // (WaveSystem push force would be halved via a flag in a full implementation)
            yield return new WaitForSeconds(duration);
        }

        // ─── Helpers ─────────────────────────────────────────────────────────────
        /// <summary>Returns true if the bot should make a mistake this action.</summary>
        private bool ShouldMistake()
        {
            return Random.value < _config.mistakeRate;
        }

        private IEnumerator DelayedAction(float delay, System.Action action)
        {
            if (delay > 0f) yield return new WaitForSeconds(delay);
            if (_active) action?.Invoke();
        }
    }
}
