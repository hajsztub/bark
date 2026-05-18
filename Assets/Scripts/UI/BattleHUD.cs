using UnityEngine;
using UnityEngine.UI;
using TMPro;

namespace BarkBattle
{
    /// <summary>
    /// Updates all Battle-scene UI elements by subscribing to BattleController,
    /// StaminaSystem, and WaveSystem events.
    /// </summary>
    public class BattleHUD : MonoBehaviour
    {
        // ─── Inspector ────────────────────────────────────────────────────────────
        [Header("Confidence Bars")]
        [SerializeField] private Slider     _playerConfidenceBar;
        [SerializeField] private Slider     _botConfidenceBar;
        [SerializeField] private TMP_Text   _playerConfidenceText;
        [SerializeField] private TMP_Text   _botConfidenceText;

        [Header("Stamina Bar")]
        [SerializeField] private Slider     _staminaBar;
        [SerializeField] private Image      _staminaFill;
        [SerializeField] private Color      _normalStaminaColor   = Color.yellow;
        [SerializeField] private Color      _lowStaminaColor      = Color.red;

        [Header("Timer")]
        [SerializeField] private TMP_Text   _timerText;
        [SerializeField] private Color      _urgentTimerColor     = Color.red;
        [SerializeField] private float      _urgentTimeThreshold  = 10f;

        [Header("Wave Indicator")]
        [SerializeField] private RectTransform _waveIndicatorHandle;
        [SerializeField] private float          _waveIndicatorRange = 400f; // pixels total travel

        [Header("Bark Charge Ring")]
        [SerializeField] private Image      _chargeRing;           // radial fill image
        [SerializeField] private Image      _overheatOverlay;

        [Header("Skill Cooldown UI")]
        [SerializeField] private Image      _howlCooldownFill;
        [SerializeField] private Image      _treatCooldownFill;
        [SerializeField] private Image      _shieldCooldownFill;

        [Header("Battle End Overlay")]
        [SerializeField] private GameObject _winOverlay;
        [SerializeField] private GameObject _loseOverlay;

        // ─── References ──────────────────────────────────────────────────────────
        private BattleController _battle;
        private StaminaSystem    _stamina;
        private WaveSystem       _wave;
        private BarkSystem       _bark;
        private SkillController  _skills;

        // ─── Lifecycle ────────────────────────────────────────────────────────────
        private void Start()
        {
            _battle = BattleController.Instance;
            _stamina = FindObjectOfType<StaminaSystem>();
            _wave    = FindObjectOfType<WaveSystem>();
            _bark    = FindObjectOfType<BarkSystem>();
            _skills  = FindObjectOfType<SkillController>();

            Subscribe();
            InitUI();
        }

        private void OnDestroy()
        {
            Unsubscribe();
        }

        private void Update()
        {
            // Continuous updates (charge ring, cooldown fills)
            if (_bark != null && _chargeRing != null)
                _chargeRing.fillAmount = _bark.ChargeNormal;

            if (_skills != null)
            {
                if (_howlCooldownFill   != null) _howlCooldownFill.fillAmount   = _skills.GetCooldownNormal(SkillType.Howl);
                if (_treatCooldownFill  != null) _treatCooldownFill.fillAmount  = _skills.GetCooldownNormal(SkillType.Treat);
                if (_shieldCooldownFill != null) _shieldCooldownFill.fillAmount = _skills.GetCooldownNormal(SkillType.Shield);
            }
        }

        // ─── Init ────────────────────────────────────────────────────────────────
        private void InitUI()
        {
            SetConfidence(BattleController.MAX_CONFIDENCE, true);
            SetConfidence(BattleController.MAX_CONFIDENCE, false);
            UpdateTimer(BattleController.BATTLE_DURATION);
            SetWavePosition(0f);

            if (_winOverlay  != null) _winOverlay.SetActive(false);
            if (_loseOverlay != null) _loseOverlay.SetActive(false);
            if (_overheatOverlay != null) _overheatOverlay.SetActive(false);
        }

        // ─── Event Subscriptions ─────────────────────────────────────────────────
        private void Subscribe()
        {
            if (_battle != null)
            {
                _battle.OnConfidenceChanged.AddListener(OnConfidenceChanged);
                _battle.OnWavePositionChanged.AddListener(SetWavePosition);
                _battle.OnTimerChanged.AddListener(UpdateTimer);
                _battle.OnBattleEnd.AddListener(OnBattleEnd);
            }
            if (_stamina != null)
                _stamina.OnStaminaChanged.AddListener(OnStaminaChanged);
            if (_bark != null)
            {
                _bark.OnOverheatStart.AddListener(OnOverheatStart);
                _bark.OnOverheatEnd.AddListener(OnOverheatEnd);
            }
        }

        private void Unsubscribe()
        {
            if (_battle != null)
            {
                _battle.OnConfidenceChanged.RemoveListener(OnConfidenceChanged);
                _battle.OnWavePositionChanged.RemoveListener(SetWavePosition);
                _battle.OnTimerChanged.RemoveListener(UpdateTimer);
                _battle.OnBattleEnd.RemoveListener(OnBattleEnd);
            }
            if (_stamina != null)
                _stamina.OnStaminaChanged.RemoveListener(OnStaminaChanged);
            if (_bark != null)
            {
                _bark.OnOverheatStart.RemoveListener(OnOverheatStart);
                _bark.OnOverheatEnd.RemoveListener(OnOverheatEnd);
            }
        }

        // ─── Event Handlers ───────────────────────────────────────────────────────
        private void OnConfidenceChanged(float value, bool isPlayer)
            => SetConfidence(value, isPlayer);

        private void SetConfidence(float value, bool isPlayer)
        {
            float norm = value / BattleController.MAX_CONFIDENCE;
            if (isPlayer)
            {
                if (_playerConfidenceBar  != null) _playerConfidenceBar.value   = norm;
                if (_playerConfidenceText != null) _playerConfidenceText.text   = Mathf.CeilToInt(value).ToString();
            }
            else
            {
                if (_botConfidenceBar  != null) _botConfidenceBar.value   = norm;
                if (_botConfidenceText != null) _botConfidenceText.text   = Mathf.CeilToInt(value).ToString();
            }
        }

        private void OnStaminaChanged(float normalValue)
        {
            if (_staminaBar  != null) _staminaBar.value = normalValue;
            if (_staminaFill != null)
                _staminaFill.color = normalValue < 0.25f ? _lowStaminaColor : _normalStaminaColor;
        }

        private void UpdateTimer(float remaining)
        {
            if (_timerText == null) return;
            int secs = Mathf.CeilToInt(remaining);
            _timerText.text  = secs.ToString();
            _timerText.color = remaining <= _urgentTimeThreshold ? _urgentTimerColor : Color.white;
        }

        private void SetWavePosition(float position)
        {
            if (_waveIndicatorHandle == null) return;
            // Map –100..+100 to –range/2..+range/2 pixels
            float x = (position / WaveSystem.BOUNDARY) * (_waveIndicatorRange / 2f);
            _waveIndicatorHandle.anchoredPosition = new Vector2(x, _waveIndicatorHandle.anchoredPosition.y);
        }

        private void OnBattleEnd(BattleResult result)
        {
            if (result.PlayerWon)
            {
                if (_winOverlay  != null) _winOverlay.SetActive(true);
                AudioManager.Instance?.PlaySFX("VictoryJingle");
                VFXManager.Instance?.PlayVictoryBurst();
            }
            else
            {
                if (_loseOverlay != null) _loseOverlay.SetActive(true);
                AudioManager.Instance?.PlaySFX("DefeatJingle");
            }
        }

        private void OnOverheatStart()
        {
            if (_overheatOverlay != null) _overheatOverlay.SetActive(true);
        }

        private void OnOverheatEnd()
        {
            if (_overheatOverlay != null) _overheatOverlay.SetActive(false);
        }
    }
}
