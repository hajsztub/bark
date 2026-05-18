using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Events;

namespace BarkBattle
{
    /// <summary>
    /// Manages the three skill slots (HOWL, TREAT, SHIELD) and their cooldowns.
    /// Attach to the Battle scene's skill panel.
    /// </summary>
    public class SkillController : MonoBehaviour
    {
        // ─── Inspector ────────────────────────────────────────────────────────────
        [Header("Skill Configs (assign in Inspector)")]
        [SerializeField] private SkillConfig _howlConfig;
        [SerializeField] private SkillConfig _treatConfig;
        [SerializeField] private SkillConfig _shieldConfig;

        [Header("References")]
        [SerializeField] private StaminaSystem _staminaSystem;
        [SerializeField] private BarkSystem    _barkSystem;

        // ─── State ────────────────────────────────────────────────────────────────
        private Dictionary<SkillType, float> _cooldownTimers    = new Dictionary<SkillType, float>();
        private Dictionary<SkillType, bool>  _activeBuffs       = new Dictionary<SkillType, bool>();

        private bool  _shieldActive;
        private float _shieldDamageReduction = 0.5f;  // 50% reduction

        public bool ShieldActive => _shieldActive;
        public float ShieldDamageReduction => _shieldActive ? _shieldDamageReduction : 0f;

        // ─── Events ───────────────────────────────────────────────────────────────
        [HideInInspector] public UnityEvent<SkillType, float> OnSkillUsed        = new UnityEvent<SkillType, float>(); // type, cooldown
        [HideInInspector] public UnityEvent<SkillType, float> OnCooldownUpdated  = new UnityEvent<SkillType, float>(); // type, remaining
        [HideInInspector] public UnityEvent<SkillType>        OnSkillReady       = new UnityEvent<SkillType>();

        // ─── Lifecycle ────────────────────────────────────────────────────────────
        private void Awake()
        {
            if (_staminaSystem == null) _staminaSystem = FindObjectOfType<StaminaSystem>();
            if (_barkSystem    == null) _barkSystem    = FindObjectOfType<BarkSystem>();

            foreach (SkillType t in System.Enum.GetValues(typeof(SkillType)))
            {
                _cooldownTimers[t] = 0f;
                _activeBuffs[t]    = false;
            }
        }

        private void Update()
        {
            foreach (SkillType t in System.Enum.GetValues(typeof(SkillType)))
            {
                if (_cooldownTimers[t] > 0f)
                {
                    _cooldownTimers[t] -= Time.deltaTime;
                    OnCooldownUpdated.Invoke(t, _cooldownTimers[t]);

                    if (_cooldownTimers[t] <= 0f)
                    {
                        _cooldownTimers[t] = 0f;
                        OnSkillReady.Invoke(t);
                    }
                }
            }
        }

        // ─── Public API ──────────────────────────────────────────────────────────
        /// <summary>Attempt to use a skill. Returns false if on cooldown.</summary>
        public bool UseSkill(SkillType type)
        {
            if (!BattleController.Instance.BattleActive) return false;
            if (_cooldownTimers[type] > 0f) return false;

            SkillConfig cfg = GetConfig(type);
            if (cfg == null) return false;

            switch (type)
            {
                case SkillType.Howl:   ApplyHowl(cfg);   break;
                case SkillType.Treat:  ApplyTreat(cfg);  break;
                case SkillType.Shield: ApplyShield(cfg); break;
            }

            _cooldownTimers[type] = cfg.cooldown;
            OnSkillUsed.Invoke(type, cfg.cooldown);

            if (!string.IsNullOrEmpty(cfg.sfxKey))
                AudioManager.Instance?.PlaySFX(cfg.sfxKey);

            AnalyticsManager.LogBattleStart(type.ToString(), "skill");
            return true;
        }

        public bool IsOnCooldown(SkillType type) => _cooldownTimers[type] > 0f;
        public float GetCooldownRemaining(SkillType type) => Mathf.Max(0f, _cooldownTimers[type]);
        public float GetCooldownNormal(SkillType type)
        {
            SkillConfig cfg = GetConfig(type);
            if (cfg == null || cfg.cooldown <= 0f) return 0f;
            return _cooldownTimers[type] / cfg.cooldown;
        }

        public void ResetCooldowns()
        {
            foreach (SkillType t in System.Enum.GetValues(typeof(SkillType)))
                _cooldownTimers[t] = 0f;
            _shieldActive = false;
        }

        // ─── Skill Effects ────────────────────────────────────────────────────────
        private void ApplyHowl(SkillConfig cfg)
        {
            StartCoroutine(HowlCoroutine(cfg));
            VFXManager.Instance?.PlayBarkPulse(true);
        }

        private IEnumerator HowlCoroutine(SkillConfig cfg)
        {
            _activeBuffs[SkillType.Howl] = true;
            _barkSystem?.SetPowerMultiplier(cfg.effectValue);
            BattleController.Instance?.ApplyHowlBoost(true);
            yield return new WaitForSeconds(cfg.duration);
            _barkSystem?.SetPowerMultiplier(1f);
            _activeBuffs[SkillType.Howl] = false;
        }

        private void ApplyTreat(SkillConfig cfg)
        {
            _staminaSystem?.AddStamina(cfg.effectValue);
            BattleController.Instance?.ApplyTreat(true);
        }

        private void ApplyShield(SkillConfig cfg)
        {
            StartCoroutine(ShieldCoroutine(cfg));
        }

        private IEnumerator ShieldCoroutine(SkillConfig cfg)
        {
            _shieldActive            = true;
            _shieldDamageReduction   = cfg.effectValue; // e.g. 0.5 for 50%
            _activeBuffs[SkillType.Shield] = true;
            VFXManager.Instance?.PlayShieldBlock();
            yield return new WaitForSeconds(cfg.duration);
            _shieldActive = false;
            _activeBuffs[SkillType.Shield] = false;
        }

        // ─── Helpers ─────────────────────────────────────────────────────────────
        private SkillConfig GetConfig(SkillType type)
        {
            switch (type)
            {
                case SkillType.Howl:   return _howlConfig;
                case SkillType.Treat:  return _treatConfig;
                case SkillType.Shield: return _shieldConfig;
                default: return null;
            }
        }
    }
}
