using UnityEngine;
using UnityEngine.Events;

namespace BarkBattle
{
    /// <summary>
    /// Manages the bark-wave position on a –100 to +100 axis.
    /// Positive values = wave is pushing toward bot side.
    /// When the wave reaches ±100 it deals confidence damage and resets.
    /// </summary>
    public class WaveSystem : MonoBehaviour
    {
        // ─── Constants ────────────────────────────────────────────────────────────
        public const float BOUNDARY          =  100f;
        public const float DEFAULT_POSITION  =    0f;
        public const float BOUNDARY_DAMAGE   =   20f;  // confidence damage per boundary hit
        public const float PASSIVE_DRIFT     =    2f;  // wave drifts back toward 0 if no push (per second)

        // ─── Inspector ────────────────────────────────────────────────────────────
        [Header("Config")]
        [SerializeField] private float _passiveDrift = PASSIVE_DRIFT;

        // ─── State ────────────────────────────────────────────────────────────────
        private float _position;    // –100 to +100
        private bool  _hitPause;    // brief pause after boundary hit
        private float _hitPauseTimer;

        public float Position => _position;

        // ─── Events ───────────────────────────────────────────────────────────────
        [HideInInspector] public UnityEvent<float> OnPositionChanged  = new UnityEvent<float>();
        [HideInInspector] public UnityEvent<bool>  OnBoundaryHit      = new UnityEvent<bool>();
        // OnBoundaryHit arg: true = player side hit (player takes damage)

        // ─── Lifecycle ────────────────────────────────────────────────────────────
        private void Update()
        {
            if (!BattleController.Instance.BattleActive) return;

            if (_hitPause)
            {
                _hitPauseTimer -= Time.deltaTime;
                if (_hitPauseTimer <= 0f) _hitPause = false;
                return;
            }

            // Passive drift toward centre
            if (_position > 0f)
                _position -= _passiveDrift * Time.deltaTime;
            else if (_position < 0f)
                _position += _passiveDrift * Time.deltaTime;

            // Snap near-zero to zero
            if (Mathf.Abs(_position) < 0.1f) _position = 0f;

            CheckBoundary();
            BattleController.Instance?.ReportWavePosition(_position);
        }

        // ─── Public API ──────────────────────────────────────────────────────────
        /// <summary>Push the wave by amount. Positive = toward bot, negative = toward player.</summary>
        public void PushWave(float force, bool isPlayerPush)
        {
            if (_hitPause) return;
            float sign = isPlayerPush ? 1f : -1f;
            _position += force * sign;
            _position  = Mathf.Clamp(_position, -BOUNDARY, BOUNDARY);
            OnPositionChanged.Invoke(_position);
            CheckBoundary();
        }

        public void ResetWave()
        {
            _position      = DEFAULT_POSITION;
            _hitPause      = false;
            _hitPauseTimer = 0f;
            OnPositionChanged.Invoke(_position);
        }

        // ─── Internal ────────────────────────────────────────────────────────────
        private void CheckBoundary()
        {
            if (_position >= BOUNDARY)
            {
                // Bot takes damage
                BattleController.Instance?.DealDamageToBot(BOUNDARY_DAMAGE);
                OnBoundaryHit.Invoke(false);
                AudioManager.Instance?.PlaySFX("WaveHitBot");
                VFXManager.Instance?.PlayHitImpact();
                VFXManager.Instance?.PlayKnockback();
                ResetAfterHit();
            }
            else if (_position <= -BOUNDARY)
            {
                // Player takes damage
                BattleController.Instance?.DealDamageToPlayer(BOUNDARY_DAMAGE);
                OnBoundaryHit.Invoke(true);
                AudioManager.Instance?.PlaySFX("WaveHitPlayer");
                VFXManager.Instance?.PlayHitImpact();
                VFXManager.Instance?.PlayKnockback();
                ResetAfterHit();
            }
        }

        private void ResetAfterHit()
        {
            _position      = DEFAULT_POSITION;
            _hitPause      = true;
            _hitPauseTimer = 0.4f;
            OnPositionChanged.Invoke(_position);

            VFXManager.Instance?.PlayClash(Vector3.zero);
        }
    }
}
