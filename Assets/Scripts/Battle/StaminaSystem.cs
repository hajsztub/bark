using UnityEngine;
using UnityEngine.Events;

namespace BarkBattle
{
    /// <summary>
    /// Manages stamina for one combatant (player or bot).
    /// Max 100, auto-regen 18/s, costs for bark actions.
    /// </summary>
    public class StaminaSystem : MonoBehaviour
    {
        // ─── Constants ────────────────────────────────────────────────────────────
        public const float MAX_STAMINA      = 100f;
        public const float REGEN_RATE       = 18f;   // per second
        public const float TAP_COST         = 8f;
        public const float HOLD_COST_PER_S  = 3f;    // also defined in BarkSystem for self-doc

        // ─── Inspector ────────────────────────────────────────────────────────────
        [Header("Config")]
        [SerializeField] private float _regenRate = REGEN_RATE;
        [SerializeField] private bool  _regenPaused = false;

        // ─── State ────────────────────────────────────────────────────────────────
        private float _currentStamina;
        private bool  _isOverheated;

        public float CurrentStamina => _currentStamina;
        public float StaminaNormal  => _currentStamina / MAX_STAMINA;
        public bool  IsOverheated   => _isOverheated;

        // ─── Events ───────────────────────────────────────────────────────────────
        [HideInInspector] public UnityEvent<float> OnStaminaChanged = new UnityEvent<float>(); // 0-1
        [HideInInspector] public UnityEvent        OnOverheat       = new UnityEvent();
        [HideInInspector] public UnityEvent        OnOverheatEnd    = new UnityEvent();

        // ─── Lifecycle ────────────────────────────────────────────────────────────
        private void Awake()
        {
            _currentStamina = MAX_STAMINA;
        }

        private void Update()
        {
            if (_regenPaused || !BattleController.Instance.BattleActive) return;

            if (_currentStamina < MAX_STAMINA)
            {
                AddStamina(_regenRate * Time.deltaTime);
            }
        }

        // ─── Public API ──────────────────────────────────────────────────────────
        /// <summary>
        /// Try to spend the given amount. Returns false (and does NOT deduct) if insufficient.
        /// </summary>
        public bool TrySpend(float amount)
        {
            if (_currentStamina < amount) return false;
            SetStamina(_currentStamina - amount);
            return true;
        }

        /// <summary>Force-spend without checking (can go below 0, clamped to 0).</summary>
        public void ForceSpend(float amount)
        {
            SetStamina(_currentStamina - amount);
        }

        public void AddStamina(float amount)
        {
            SetStamina(_currentStamina + amount);
        }

        public void ResetStamina()
        {
            _isOverheated = false;
            SetStamina(MAX_STAMINA);
        }

        public void PauseRegen(bool paused)
        {
            _regenPaused = paused;
        }

        /// <summary>Direct set — clamps and fires event.</summary>
        private void SetStamina(float value)
        {
            float clamped = Mathf.Clamp(value, 0f, MAX_STAMINA);
            if (Mathf.Approximately(_currentStamina, clamped)) return;
            _currentStamina = clamped;
            OnStaminaChanged.Invoke(StaminaNormal);
        }
    }
}
