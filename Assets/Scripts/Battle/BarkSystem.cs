using System;
using UnityEngine;
using UnityEngine.Events;

namespace BarkBattle
{
    /// <summary>
    /// Handles BARK input: tap, hold, release, overheat, and Perfect Bark detection.
    /// Requires a StaminaSystem on the same GameObject or in the scene.
    /// </summary>
    public class BarkSystem : MonoBehaviour
    {
        // ─── Constants ────────────────────────────────────────────────────────────
        public const float TAP_BARK_POWER        = 5f;
        public const float HOLD_CHARGE_RATE      = 20f;   // units per second
        public const float MAX_CHARGE            = 100f;
        public const float OVERHEAT_THRESHOLD    = 95f;   // charge level that triggers overheat
        public const float OVERHEAT_COOLDOWN     = 2f;    // seconds
        public const float HOLD_STAMINA_COST     = 3f;    // per second
        public const float PERFECT_WINDOW_START  = 0.7f;  // normalised charge (0-1)
        public const float PERFECT_WINDOW_END    = 0.85f;
        public const float PERFECT_MULTIPLIER    = 1.5f;

        // ─── Inspector ────────────────────────────────────────────────────────────
        [Header("References")]
        [SerializeField] private StaminaSystem _staminaSystem;
        [SerializeField] private WaveSystem    _waveSystem;

        [Header("Dog Stats (override at runtime from DogConfig)")]
        [SerializeField] private float _barkPower = 7f;

        // ─── State ────────────────────────────────────────────────────────────────
        private bool  _isHolding;
        private float _chargeAmount;      // 0 – MAX_CHARGE
        private bool  _isOverheated;
        private float _overheatTimer;
        private float _externalPowerMultiplier = 1f;  // modified by Howl skill

        public bool  IsHolding     => _isHolding;
        public float ChargeAmount  => _chargeAmount;
        public float ChargeNormal  => _chargeAmount / MAX_CHARGE;
        public bool  IsOverheated  => _isOverheated;

        // ─── Events ───────────────────────────────────────────────────────────────
        [HideInInspector] public UnityEvent<float>  OnBarkFired   = new UnityEvent<float>();  // arg: total power
        [HideInInspector] public UnityEvent<float>  OnChargeChanged = new UnityEvent<float>(); // 0-1
        [HideInInspector] public UnityEvent         OnOverheatStart = new UnityEvent();
        [HideInInspector] public UnityEvent         OnOverheatEnd   = new UnityEvent();
        [HideInInspector] public UnityEvent<float>  OnPerfectBark   = new UnityEvent<float>(); // arg: power

        // ─── Lifecycle ────────────────────────────────────────────────────────────
        private void Awake()
        {
            if (_staminaSystem == null) _staminaSystem = FindObjectOfType<StaminaSystem>();
            if (_waveSystem    == null) _waveSystem    = FindObjectOfType<WaveSystem>();
        }

        private void Update()
        {
            if (_isOverheated)
            {
                _overheatTimer -= Time.deltaTime;
                if (_overheatTimer <= 0f)
                {
                    _isOverheated  = false;
                    _chargeAmount  = 0f;
                    OnOverheatEnd.Invoke();
                }
                return;
            }

            if (_isHolding)
            {
                // Drain stamina while holding
                if (_staminaSystem != null && !_staminaSystem.TrySpend(HOLD_STAMINA_COST * Time.deltaTime))
                {
                    // No stamina left — force release
                    ReleaseBark();
                    return;
                }

                _chargeAmount += HOLD_CHARGE_RATE * Time.deltaTime;
                _chargeAmount  = Mathf.Min(_chargeAmount, MAX_CHARGE);
                OnChargeChanged.Invoke(ChargeNormal);

                // Auto-release on overheat threshold
                if (_chargeAmount >= OVERHEAT_THRESHOLD)
                {
                    TriggerOverheat();
                }
            }
        }

        // ─── Public Input API ─────────────────────────────────────────────────────
        /// <summary>Call when the BARK button is pressed (tap begins).</summary>
        public void OnBarkButtonDown()
        {
            if (_isOverheated || !BattleController.Instance.BattleActive) return;

            // Check stamina for tap cost
            if (_staminaSystem != null && !_staminaSystem.TrySpend(StaminaSystem.TAP_COST)) return;

            _isHolding    = true;
            _chargeAmount = 0f;

            // Fire a small tap-bark immediately
            float tapPower = TAP_BARK_POWER * _barkPower * _externalPowerMultiplier;
            FireBark(tapPower, false);
        }

        /// <summary>Call when the BARK button is released.</summary>
        public void OnBarkButtonUp()
        {
            if (!_isHolding) return;
            _isHolding = false;
            ReleaseBark();
        }

        // ─── Internal ────────────────────────────────────────────────────────────
        private void ReleaseBark()
        {
            if (_chargeAmount <= 0f) return;

            float normCharge = ChargeNormal;
            float power      = _chargeAmount * _barkPower * _externalPowerMultiplier / MAX_CHARGE;

            bool isPerfect = normCharge >= PERFECT_WINDOW_START && normCharge <= PERFECT_WINDOW_END;
            if (isPerfect)
            {
                power *= PERFECT_MULTIPLIER;
                OnPerfectBark.Invoke(power);
                AudioManager.Instance?.PlaySFX("PerfectBark");
                VFXManager.Instance?.PlayPerfectBark();
            }

            FireBark(power, isPerfect);
            _chargeAmount = 0f;
            OnChargeChanged.Invoke(0f);
        }

        private void FireBark(float power, bool isPerfect)
        {
            _waveSystem?.PushWave(power, true);
            OnBarkFired.Invoke(power);

            string sfxName = isPerfect ? "BarkPerfect" : (power > TAP_BARK_POWER ? "BarkBig" : "BarkSmall");
            AudioManager.Instance?.PlaySFX(sfxName);
            VFXManager.Instance?.PlayBarkPulse(true);
        }

        private void TriggerOverheat()
        {
            _isHolding     = false;
            _isOverheated  = true;
            _overheatTimer = OVERHEAT_COOLDOWN;
            _chargeAmount  = MAX_CHARGE;  // visual feedback at max
            OnChargeChanged.Invoke(1f);
            OnOverheatStart.Invoke();
            AudioManager.Instance?.PlaySFX("Overheat");
            VFXManager.Instance?.PlayOverheat();
        }

        // ─── External Modifiers ───────────────────────────────────────────────────
        /// <summary>Set from SkillController when Howl is active.</summary>
        public void SetPowerMultiplier(float multiplier)
        {
            _externalPowerMultiplier = multiplier;
        }

        /// <summary>Called from DogConfig setup to assign base bark power.</summary>
        public void SetBarkPower(float power)
        {
            _barkPower = power;
        }
    }
}
