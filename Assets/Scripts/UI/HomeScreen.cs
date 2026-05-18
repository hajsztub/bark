using System;
using UnityEngine;
using UnityEngine.UI;
using TMPro;

namespace BarkBattle
{
    /// <summary>
    /// Home screen (main menu) UI controller.
    /// Shows player name, trophies, league, daily reward status, chest timer,
    /// and provides navigation to all major screens.
    /// </summary>
    public class HomeScreen : MonoBehaviour
    {
        // ─── Inspector ────────────────────────────────────────────────────────────
        [Header("Player Info")]
        [SerializeField] private TMP_Text  _playerNameText;
        [SerializeField] private TMP_Text  _trophiesText;
        [SerializeField] private TMP_Text  _leagueRankText;
        [SerializeField] private Image     _leagueIcon;

        [Header("Daily Reward")]
        [SerializeField] private Button    _dailyRewardButton;
        [SerializeField] private TMP_Text  _dailyRewardCountdownText;
        [SerializeField] private GameObject _dailyReadyIndicator;

        [Header("Chest")]
        [SerializeField] private Button    _chestButton;
        [SerializeField] private TMP_Text  _chestTimerText;
        [SerializeField] private Slider    _chestProgressBar;
        [SerializeField] private GameObject _chestReadyIndicator;

        [Header("Navigation")]
        [SerializeField] private Button    _playButton;
        [SerializeField] private Button    _dogsButton;
        [SerializeField] private Button    _shopButton;
        [SerializeField] private Button    _leaguesButton;
        [SerializeField] private Button    _eventsButton;

        [Header("Currency HUD")]
        [SerializeField] private TMP_Text  _coinsHUDText;
        [SerializeField] private TMP_Text  _gemsHUDText;

        // ─── Lifecycle ────────────────────────────────────────────────────────────
        private void Start()
        {
            BindButtons();
            RefreshUI();
            SubscribeToEconomy();
            AudioManager.Instance?.PlayMusic("HomeTheme");
        }

        private void OnDestroy()
        {
            UnsubscribeFromEconomy();
        }

        private void Update()
        {
            UpdateDailyRewardCountdown();
        }

        // ─── UI Refresh ───────────────────────────────────────────────────────────
        private void RefreshUI()
        {
            var save = SaveManager.Instance?.CurrentData;
            var eco  = EconomyManager.Instance;

            if (save != null && _playerNameText != null)
                _playerNameText.text = save.playerName;

            if (eco != null)
            {
                if (_trophiesText  != null) _trophiesText.text  = eco.Trophies.ToString();
                if (_leagueRankText!= null) _leagueRankText.text= eco.GetLeagueName();
                if (_coinsHUDText  != null) _coinsHUDText.text  = eco.Coins.ToString();
                if (_gemsHUDText   != null) _gemsHUDText.text   = eco.Gems.ToString();
            }

            RefreshDailyReward();
            RefreshChest();
        }

        private void RefreshDailyReward()
        {
            bool available = SaveManager.Instance?.IsDailyRewardAvailable() ?? false;
            if (_dailyRewardButton    != null) _dailyRewardButton.interactable = available;
            if (_dailyReadyIndicator  != null) _dailyReadyIndicator.SetActive(available);
        }

        private void RefreshChest()
        {
            float prog = SaveManager.Instance?.CurrentData.chestProgress ?? 0f;
            bool  ready = prog >= 1f;
            if (_chestProgressBar    != null) _chestProgressBar.value = prog;
            if (_chestReadyIndicator != null) _chestReadyIndicator.SetActive(ready);
            if (_chestButton         != null) _chestButton.interactable = ready;
            if (_chestTimerText      != null) _chestTimerText.text = ready ? "READY!" : $"{Mathf.RoundToInt(prog * 100)}%";
        }

        private void UpdateDailyRewardCountdown()
        {
            if (_dailyRewardCountdownText == null) return;
            if (SaveManager.Instance == null) return;

            if (SaveManager.Instance.IsDailyRewardAvailable())
            {
                _dailyRewardCountdownText.text = "CLAIM!";
                return;
            }

            long ticks = SaveManager.Instance.CurrentData.lastDailyRewardTicks;
            if (ticks == 0) { _dailyRewardCountdownText.text = "CLAIM!"; return; }

            var last      = new DateTime(ticks, DateTimeKind.Utc);
            var nextTime  = last.AddHours(24);
            var remaining = nextTime - DateTime.UtcNow;

            if (remaining.TotalSeconds <= 0)
                _dailyRewardCountdownText.text = "CLAIM!";
            else
                _dailyRewardCountdownText.text = $"{remaining.Hours:D2}:{remaining.Minutes:D2}:{remaining.Seconds:D2}";
        }

        // ─── Economy Events ───────────────────────────────────────────────────────
        private void SubscribeToEconomy()
        {
            var eco = EconomyManager.Instance;
            if (eco == null) return;
            eco.OnCoinsChanged.AddListener(OnCoinsChanged);
            eco.OnGemsChanged.AddListener(OnGemsChanged);
            eco.OnTrophiesChanged.AddListener(OnTrophiesChanged);
        }

        private void UnsubscribeFromEconomy()
        {
            var eco = EconomyManager.Instance;
            if (eco == null) return;
            eco.OnCoinsChanged.RemoveListener(OnCoinsChanged);
            eco.OnGemsChanged.RemoveListener(OnGemsChanged);
            eco.OnTrophiesChanged.RemoveListener(OnTrophiesChanged);
        }

        private void OnCoinsChanged(int val)   { if (_coinsHUDText != null) _coinsHUDText.text = val.ToString(); }
        private void OnGemsChanged(int val)    { if (_gemsHUDText  != null) _gemsHUDText.text  = val.ToString(); }
        private void OnTrophiesChanged(int val)
        {
            if (_trophiesText  != null) _trophiesText.text   = val.ToString();
            if (_leagueRankText!= null) _leagueRankText.text = EconomyManager.Instance?.GetLeagueName() ?? "";
        }

        // ─── Button Binding ───────────────────────────────────────────────────────
        private void BindButtons()
        {
            if (_playButton     != null) _playButton.onClick.AddListener(OnPlayClicked);
            if (_dogsButton     != null) _dogsButton.onClick.AddListener(OnDogsClicked);
            if (_shopButton     != null) _shopButton.onClick.AddListener(OnShopClicked);
            if (_leaguesButton  != null) _leaguesButton.onClick.AddListener(OnLeaguesClicked);
            if (_eventsButton   != null) _eventsButton.onClick.AddListener(OnEventsClicked);
            if (_dailyRewardButton != null) _dailyRewardButton.onClick.AddListener(OnDailyRewardClicked);
            if (_chestButton    != null) _chestButton.onClick.AddListener(OnChestClicked);
        }

        // ─── Button Handlers ─────────────────────────────────────────────────────
        private void OnPlayClicked()
        {
            AudioManager.Instance?.PlaySFX("ButtonClick");
            var save = SaveManager.Instance?.CurrentData;
            GameManager.Instance?.GoToBattle(
                save?.selectedDog  ?? "shiba",
                save?.selectedSkin ?? "default",
                "shiba");
        }

        private void OnDogsClicked()
        {
            AudioManager.Instance?.PlaySFX("ButtonClick");
            GameManager.Instance?.GoToDogSelect();
        }

        private void OnShopClicked()
        {
            AudioManager.Instance?.PlaySFX("ButtonClick");
            AnalyticsManager.LogShopOpen();
            // Shop scene placeholder
            Debug.Log("[HomeScreen] Shop opened (placeholder).");
        }

        private void OnLeaguesClicked()
        {
            AudioManager.Instance?.PlaySFX("ButtonClick");
            Debug.Log("[HomeScreen] Leagues opened (placeholder).");
        }

        private void OnEventsClicked()
        {
            AudioManager.Instance?.PlaySFX("ButtonClick");
            Debug.Log("[HomeScreen] Events opened (placeholder).");
        }

        private void OnDailyRewardClicked()
        {
            if (SaveManager.Instance == null || !SaveManager.Instance.IsDailyRewardAvailable()) return;

            var rewardCfg = Resources.Load<RewardConfig>("RewardConfig");
            int streak    = SaveManager.Instance.CurrentData.dailyRewardStreak;
            int coins     = rewardCfg != null ? rewardCfg.dailyRewardCoins[Mathf.Min(streak, rewardCfg.dailyRewardCoins.Length - 1)] : 50;

            EconomyManager.Instance?.AddCoins(coins);
            SaveManager.Instance.ClaimDailyReward();
            AudioManager.Instance?.PlaySFX("DailyReward");
            RefreshDailyReward();
            Debug.Log($"[HomeScreen] Daily reward claimed: +{coins} coins");
        }

        private void OnChestClicked()
        {
            if (SaveManager.Instance == null || !SaveManager.Instance.IsChestReady()) return;

            // Simple chest open: award a random gem
            EconomyManager.Instance?.AddGems(1);
            SaveManager.Instance.ClaimChest();
            AudioManager.Instance?.PlaySFX("ChestOpen");
            RefreshChest();
            Debug.Log("[HomeScreen] Chest opened!");
        }
    }
}
