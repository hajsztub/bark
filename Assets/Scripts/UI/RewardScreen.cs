using UnityEngine;
using UnityEngine.UI;
using TMPro;

namespace BarkBattle
{
    /// <summary>
    /// Displays post-battle rewards: coins, gems, trophies, chest progress,
    /// fragments. Offers a x2 reward via rewarded ad, and navigation back to
    /// Home or straight into the next battle.
    /// </summary>
    public class RewardScreen : MonoBehaviour
    {
        // ─── Inspector ────────────────────────────────────────────────────────────
        [Header("Result Banner")]
        [SerializeField] private GameObject _winBanner;
        [SerializeField] private GameObject _loseBanner;

        [Header("Reward Labels")]
        [SerializeField] private TMP_Text  _coinsText;
        [SerializeField] private TMP_Text  _gemsText;
        [SerializeField] private TMP_Text  _trophyDeltaText;
        [SerializeField] private TMP_Text  _fragmentsText;

        [Header("Chest Progress")]
        [SerializeField] private Slider    _chestProgressBar;
        [SerializeField] private TMP_Text  _chestProgressText;
        [SerializeField] private GameObject _chestReadyBanner;

        [Header("Ad Button")]
        [SerializeField] private Button    _x2RewardButton;
        [SerializeField] private TMP_Text  _x2ButtonLabel;
        [SerializeField] private GameObject _adUnavailableNote;

        [Header("Navigation")]
        [SerializeField] private Button    _homeButton;
        [SerializeField] private Button    _nextBattleButton;

        // ─── State ────────────────────────────────────────────────────────────────
        private BattleResult _result;
        private bool         _adRewardClaimed;

        // ─── Lifecycle ────────────────────────────────────────────────────────────
        private void Start()
        {
            _result = GameManager.Instance?.LastBattleResult;
            if (_result == null)
            {
                Debug.LogWarning("[RewardScreen] No battle result found.");
                return;
            }

            PopulateUI();
            BindButtons();
            AnalyticsManager.LogRewardClaim(_result.PlayerWon, _result.CoinsEarned, _result.TrophyDelta);
        }

        // ─── UI Population ────────────────────────────────────────────────────────
        private void PopulateUI()
        {
            // Win/lose banner
            if (_winBanner  != null) _winBanner.SetActive(_result.PlayerWon);
            if (_loseBanner != null) _loseBanner.SetActive(!_result.PlayerWon);

            // Currencies
            if (_coinsText   != null) _coinsText.text       = $"+{_result.CoinsEarned}";
            if (_gemsText    != null) _gemsText.text        = _result.GemsEarned > 0 ? $"+{_result.GemsEarned}" : "-";
            if (_trophyDeltaText != null)
            {
                int delta = _result.TrophyDelta;
                _trophyDeltaText.text  = delta >= 0 ? $"+{delta}" : delta.ToString();
                _trophyDeltaText.color = delta >= 0 ? Color.green : Color.red;
            }
            if (_fragmentsText != null) _fragmentsText.text = $"+{_result.FragmentsEarned}";

            // Chest
            float chestProg = SaveManager.Instance?.CurrentData.chestProgress ?? 0f;
            if (_chestProgressBar  != null) _chestProgressBar.value = chestProg;
            if (_chestProgressText != null) _chestProgressText.text  = $"{Mathf.RoundToInt(chestProg * 100)}%";
            if (_chestReadyBanner  != null) _chestReadyBanner.SetActive(chestProg >= 1f);

            // Ad button availability
            bool adReady = AdManager.Instance != null && !_adRewardClaimed;
            if (_x2RewardButton    != null) _x2RewardButton.gameObject.SetActive(adReady);
            if (_adUnavailableNote != null) _adUnavailableNote.SetActive(!adReady);

            AnalyticsManager.LogAdOffer("rewarded_x2");
        }

        // ─── Button Binding ───────────────────────────────────────────────────────
        private void BindButtons()
        {
            if (_homeButton != null)
                _homeButton.onClick.AddListener(OnHomeClicked);

            if (_nextBattleButton != null)
                _nextBattleButton.onClick.AddListener(OnNextBattleClicked);

            if (_x2RewardButton != null)
                _x2RewardButton.onClick.AddListener(OnX2RewardClicked);
        }

        // ─── Button Handlers ─────────────────────────────────────────────────────
        private void OnHomeClicked()
        {
            AudioManager.Instance?.PlaySFX("ButtonClick");
            GameManager.Instance?.GoToMenu();
        }

        private void OnNextBattleClicked()
        {
            AudioManager.Instance?.PlaySFX("ButtonClick");
            if (GameManager.Instance != null)
                GameManager.Instance.GoToBattle(
                    GameManager.Instance.PendingPlayerDogId,
                    GameManager.Instance.PendingPlayerSkinId,
                    GameManager.Instance.PendingBotDogId);
        }

        private void OnX2RewardClicked()
        {
            if (_adRewardClaimed) return;
            AnalyticsManager.LogAdStart("rewarded_x2");

            AdManager.Instance?.ShowRewardedAd(success =>
            {
                if (success)
                {
                    _adRewardClaimed = true;
                    EconomyManager.Instance?.ApplyAdMultiplier(_result);

                    // Update displayed values
                    int doubled = _result.CoinsEarned * 2;
                    if (_coinsText != null) _coinsText.text = $"+{doubled}";
                    if (_x2RewardButton != null) _x2RewardButton.gameObject.SetActive(false);
                    AudioManager.Instance?.PlaySFX("RewardClaim");

                    AnalyticsManager.LogAdComplete("rewarded_x2", true);
                }
                else
                {
                    AnalyticsManager.LogAdComplete("rewarded_x2", false);
                }
            });
        }
    }
}
