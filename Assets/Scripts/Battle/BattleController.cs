using System;
using System.Collections;
using UnityEngine;
using UnityEngine.Events;

namespace BarkBattle
{
    /// <summary>
    /// Orchestrates a full 60-second battle: timer, confidence, stamina, wave.
    /// Place on a persistent GameObject in the Battle scene.
    /// </summary>
    public class BattleController : MonoBehaviour
    {
        // ─── Singleton (scene-local) ──────────────────────────────────────────────
        public static BattleController Instance { get; private set; }

        // ─── Constants ────────────────────────────────────────────────────────────
        public const float BATTLE_DURATION      = 60f;
        public const float MAX_CONFIDENCE       = 100f;
        public const float STARTING_CONFIDENCE  = 100f;

        // ─── Inspector ────────────────────────────────────────────────────────────
        [Header("Config")]
        [SerializeField] private BotConfig _botConfig;
        [SerializeField] private DogConfig _playerDogConfig;
        [SerializeField] private DogConfig _botDogConfig;

        [Header("Sub-systems (auto-found if null)")]
        [SerializeField] private StaminaSystem  _playerStamina;
        [SerializeField] private WaveSystem     _waveSystem;
        [SerializeField] private SkillController _skillController;
        [SerializeField] private BotController  _botController;

        // ─── State ────────────────────────────────────────────────────────────────
        private float _timeRemaining;
        private float _playerConfidence;
        private float _botConfidence;
        private bool  _battleActive;
        private bool  _battleEnded;

        public float TimeRemaining     => _timeRemaining;
        public float PlayerConfidence  => _playerConfidence;
        public float BotConfidence     => _botConfidence;
        public bool  BattleActive      => _battleActive;

        // ─── Events ───────────────────────────────────────────────────────────────
        [HideInInspector] public UnityEvent               OnBattleStart             = new UnityEvent();
        [HideInInspector] public UnityEvent<BattleResult> OnBattleEnd               = new UnityEvent<BattleResult>();
        [HideInInspector] public UnityEvent<float, bool>  OnConfidenceChanged       = new UnityEvent<float, bool>();
        // args: newConfidence, isPlayer
        [HideInInspector] public UnityEvent<float>        OnWavePositionChanged     = new UnityEvent<float>();
        [HideInInspector] public UnityEvent<float>        OnTimerChanged            = new UnityEvent<float>();

        // ─── Lifecycle ────────────────────────────────────────────────────────────
        private void Awake()
        {
            if (Instance != null && Instance != this) { Destroy(gameObject); return; }
            Instance = this;

            // Auto-find sub-systems in scene
            if (_playerStamina  == null) _playerStamina  = FindObjectOfType<StaminaSystem>();
            if (_waveSystem     == null) _waveSystem     = FindObjectOfType<WaveSystem>();
            if (_skillController== null) _skillController= FindObjectOfType<SkillController>();
            if (_botController  == null) _botController  = FindObjectOfType<BotController>();
        }

        private void Start()
        {
            // Load dog configs from GameManager
            if (GameManager.Instance != null)
            {
                _playerDogConfig = Resources.Load<DogConfig>("Dogs/" + GameManager.Instance.PendingPlayerDogId);
                _botDogConfig    = Resources.Load<DogConfig>("Dogs/" + GameManager.Instance.PendingBotDogId);
            }

            StartBattle();
        }

        private void OnDestroy()
        {
            if (Instance == this) Instance = null;
        }

        // ─── Battle Flow ─────────────────────────────────────────────────────────
        public void StartBattle()
        {
            if (_battleActive) return;

            _timeRemaining    = BATTLE_DURATION;
            _playerConfidence = STARTING_CONFIDENCE;
            _botConfidence    = STARTING_CONFIDENCE;
            _battleActive     = true;
            _battleEnded      = false;

            // Init sub-systems
            _waveSystem?.ResetWave();
            _playerStamina?.ResetStamina();
            _skillController?.ResetCooldowns();
            _botController?.BeginBotBattle();

            OnBattleStart.Invoke();
            AnalyticsManager.LogBattleStart(
                GameManager.Instance?.PendingPlayerDogId ?? "unknown",
                GameManager.Instance?.PendingBotDogId    ?? "unknown");

            AudioManager.Instance?.PlayMusic("BattleTheme");
        }

        private void Update()
        {
            if (!_battleActive || _battleEnded) return;

            _timeRemaining -= Time.deltaTime;
            OnTimerChanged.Invoke(_timeRemaining);

            if (_timeRemaining <= 0f)
            {
                _timeRemaining = 0f;
                EndBattle(DetermineWinner());
            }
        }

        // ─── Damage API ──────────────────────────────────────────────────────────
        /// <summary>Called by WaveSystem when the wave hits the player boundary.</summary>
        public void DealDamageToPlayer(float amount)
        {
            if (!_battleActive || _battleEnded) return;
            _playerConfidence = Mathf.Max(0f, _playerConfidence - amount);
            OnConfidenceChanged.Invoke(_playerConfidence, true);

            if (_playerConfidence <= 0f) EndBattle(false);
        }

        /// <summary>Called by WaveSystem when the wave hits the bot boundary.</summary>
        public void DealDamageToBot(float amount)
        {
            if (!_battleActive || _battleEnded) return;
            _botConfidence = Mathf.Max(0f, _botConfidence - amount);
            OnConfidenceChanged.Invoke(_botConfidence, false);

            if (_botConfidence <= 0f) EndBattle(true);
        }

        // ─── Wave Relay ───────────────────────────────────────────────────────────
        /// <summary>WaveSystem calls this each frame so the HUD can update.</summary>
        public void ReportWavePosition(float position)
        {
            OnWavePositionChanged.Invoke(position);
        }

        // ─── Skill Effects ────────────────────────────────────────────────────────
        public void ApplyHowlBoost(bool isPlayer)
        {
            // BarkSystem picks up the modifier from SkillController directly
            if (!isPlayer)
            {
                Debug.Log("[BattleController] Bot used HOWL!");
            }
        }

        public void ApplyTreat(bool isPlayer)
        {
            if (isPlayer) _playerStamina?.AddStamina(40f);
        }

        // ─── Winner Logic ─────────────────────────────────────────────────────────
        private bool DetermineWinner()
        {
            if (_playerConfidence > _botConfidence) return true;
            if (_botConfidence    > _playerConfidence) return false;
            // Tie-break: player wins on draw
            return true;
        }

        private void EndBattle(bool playerWon)
        {
            if (_battleEnded) return;
            _battleEnded  = true;
            _battleActive = false;

            _botController?.StopBotBattle();

            // Build reward data via EconomyManager / RewardConfig
            var result = BuildResult(playerWon);
            EconomyManager.Instance?.ApplyBattleRewards(result);

            OnBattleEnd.Invoke(result);
            AnalyticsManager.LogBattleEnd(
                playerWon,
                _playerConfidence,
                _botConfidence,
                BATTLE_DURATION - _timeRemaining);

            AudioManager.Instance?.StopMusic();

            if (GameManager.Instance != null)
                GameManager.Instance.GoToRewards(result);
        }

        private BattleResult BuildResult(bool playerWon)
        {
            var rewardCfg = Resources.Load<RewardConfig>("RewardConfig");

            int coins      = playerWon ? (rewardCfg?.battleWinCoins  ?? 50) : (rewardCfg?.battleLoseCoins ?? 10);
            int trophyDelta= playerWon ? (rewardCfg?.trophyWin       ?? 30) : -(rewardCfg?.trophyLose     ?? 20);
            int frags      = playerWon ? 5 : 1;
            float chest    = rewardCfg?.chestProgressPerWin ?? 0.2f;

            return new BattleResult
            {
                PlayerWon              = playerWon,
                FinalConfidencePlayer  = _playerConfidence,
                FinalConfidenceBot     = _botConfidence,
                BattleDuration         = BATTLE_DURATION - _timeRemaining,
                CoinsEarned            = coins,
                GemsEarned             = 0,
                TrophyDelta            = trophyDelta,
                FragmentsEarned        = frags,
                ChestProgressAdded     = playerWon ? chest : 0f
            };
        }
    }
}
