using System;
using UnityEngine;

namespace BarkBattle
{
    public class AdManager : MonoBehaviour
    {
        public static AdManager Instance { get; private set; }

        [Header("Config")]
        [SerializeField] private int interstitialAfterBattleCount = 3;
        [SerializeField] private bool useRealAds = false;

        [Header("Ad Unit IDs (AdMob)")]
        [SerializeField] private string rewardedAdUnitId = "ca-app-pub-3940256099942544/5224354917";
        [SerializeField] private string interstitialAdUnitId = "ca-app-pub-3940256099942544/1033173712";

        private int _battlesSinceLastInterstitial = 0;

        public event Action<bool, string> OnRewardedAdCompleted;
        public event Action OnInterstitialAdClosed;

        private void Awake()
        {
            if (Instance != null && Instance != this) { Destroy(gameObject); return; }
            Instance = this;
            DontDestroyOnLoad(gameObject);
        }

        public void ShowRewardedAd(string placement, Action<bool> onComplete)
        {
            AnalyticsManager.LogAdStart(placement);

            if (!useRealAds)
            {
                Debug.Log($"[AdManager] PLACEHOLDER: Rewarded ad shown for placement: {placement}");
                AnalyticsManager.LogAdComplete(placement);
                onComplete?.Invoke(true);
                return;
            }

            // TODO: Integrate AdMob/ironSource SDK here
            // AdMob example:
            // RewardedAd.Load(rewardedAdUnitId, new AdRequest(), (ad, error) => { ... });
            Debug.LogWarning("[AdManager] Real ad SDK not yet integrated.");
            onComplete?.Invoke(false);
        }

        public void ShowInterstitialAd(string context = "after_battle")
        {
            if (ShouldShowInterstitial())
            {
                AnalyticsManager.LogInterstitialShow(_battlesSinceLastInterstitial);

                if (!useRealAds)
                {
                    Debug.Log($"[AdManager] PLACEHOLDER: Interstitial shown after {_battlesSinceLastInterstitial} battles.");
                    _battlesSinceLastInterstitial = 0;
                    return;
                }

                // TODO: Show real interstitial
                _battlesSinceLastInterstitial = 0;
            }
        }

        public bool ShouldShowInterstitial()
        {
            if (SaveManager.Instance?.Data.hasRemovedAds == true) return false;
            if (SaveManager.Instance?.Data.battleCount <= 1) return false;
            return _battlesSinceLastInterstitial >= interstitialAfterBattleCount;
        }

        public void OnBattleCompleted()
        {
            _battlesSinceLastInterstitial++;
        }

        public bool IsRewardedAdReady()
        {
            if (!useRealAds) return true;
            // TODO: Check real SDK readiness
            return false;
        }
    }
}
