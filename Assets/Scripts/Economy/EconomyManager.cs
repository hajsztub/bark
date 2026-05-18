using UnityEngine;
using UnityEngine.Events;

namespace BarkBattle
{
    /// <summary>
    /// Manages the player's currency (Coins, Gems, Trophies, Fragments).
    /// All mutations go through this class; persisted via SaveManager.
    /// </summary>
    public class EconomyManager : MonoBehaviour
    {
        // ─── Singleton ────────────────────────────────────────────────────────────
        public static EconomyManager Instance { get; private set; }

        // ─── Cached Values ────────────────────────────────────────────────────────
        private int _coins;
        private int _gems;
        private int _trophies;
        private int _fragments;

        public int Coins     => _coins;
        public int Gems      => _gems;
        public int Trophies  => _trophies;
        public int Fragments => _fragments;

        // ─── Events ───────────────────────────────────────────────────────────────
        [HideInInspector] public UnityEvent<int> OnCoinsChanged     = new UnityEvent<int>();
        [HideInInspector] public UnityEvent<int> OnGemsChanged      = new UnityEvent<int>();
        [HideInInspector] public UnityEvent<int> OnTrophiesChanged  = new UnityEvent<int>();
        [HideInInspector] public UnityEvent<int> OnFragmentsChanged = new UnityEvent<int>();

        // ─── Lifecycle ────────────────────────────────────────────────────────────
        private void Awake()
        {
            if (Instance != null && Instance != this) { Destroy(gameObject); return; }
            Instance = this;
            DontDestroyOnLoad(gameObject);
            LoadFromSave();
        }

        private void LoadFromSave()
        {
            var data = SaveManager.Instance?.CurrentData;
            if (data == null) return;
            _coins     = data.coins;
            _gems      = data.gems;
            _trophies  = data.trophies;
            _fragments = data.fragments;
        }

        // ─── Coins ───────────────────────────────────────────────────────────────
        public void AddCoins(int amount)
        {
            if (amount <= 0) return;
            _coins += amount;
            OnCoinsChanged.Invoke(_coins);
            PersistCurrency();
        }

        /// <summary>Returns true and deducts if enough coins, false otherwise.</summary>
        public bool SpendCoins(int amount)
        {
            if (amount <= 0) return true;
            if (_coins < amount) return false;
            _coins -= amount;
            OnCoinsChanged.Invoke(_coins);
            PersistCurrency();
            return true;
        }

        public bool HasCoins(int amount) => _coins >= amount;

        // ─── Gems ────────────────────────────────────────────────────────────────
        public void AddGems(int amount)
        {
            if (amount <= 0) return;
            _gems += amount;
            OnGemsChanged.Invoke(_gems);
            PersistCurrency();
        }

        public bool SpendGems(int amount)
        {
            if (amount <= 0) return true;
            if (_gems < amount) return false;
            _gems -= amount;
            OnGemsChanged.Invoke(_gems);
            PersistCurrency();
            return true;
        }

        public bool HasGems(int amount) => _gems >= amount;

        // ─── Trophies ────────────────────────────────────────────────────────────
        public void AddTrophies(int amount)
        {
            int before = _trophies;
            _trophies = Mathf.Max(0, _trophies + amount);
            if (_trophies != before)
            {
                OnTrophiesChanged.Invoke(_trophies);
                PersistCurrency();
            }
        }

        public void SetTrophies(int value)
        {
            _trophies = Mathf.Max(0, value);
            OnTrophiesChanged.Invoke(_trophies);
            PersistCurrency();
        }

        // ─── Fragments ───────────────────────────────────────────────────────────
        public void AddFragments(int amount)
        {
            if (amount <= 0) return;
            _fragments += amount;
            OnFragmentsChanged.Invoke(_fragments);
            PersistCurrency();
        }

        public bool SpendFragments(int amount)
        {
            if (amount <= 0) return true;
            if (_fragments < amount) return false;
            _fragments -= amount;
            OnFragmentsChanged.Invoke(_fragments);
            PersistCurrency();
            return true;
        }

        // ─── Battle Rewards ───────────────────────────────────────────────────────
        /// <summary>Called by BattleController.BuildResult to apply earned rewards.</summary>
        public void ApplyBattleRewards(BattleResult result)
        {
            AddCoins(result.CoinsEarned);
            AddGems(result.GemsEarned);
            AddTrophies(result.TrophyDelta);
            AddFragments(result.FragmentsEarned);
        }

        /// <summary>Apply x2 multiplier from rewarded ad.</summary>
        public void ApplyAdMultiplier(BattleResult result)
        {
            var rewardCfg = Resources.Load<RewardConfig>("RewardConfig");
            float mult    = rewardCfg != null ? rewardCfg.adMultiplier : 2f;

            // Add the extra portion (result already applied once; add the remainder)
            int extraCoins = Mathf.RoundToInt(result.CoinsEarned * (mult - 1f));
            int extraGems  = Mathf.RoundToInt(result.GemsEarned  * (mult - 1f));
            AddCoins(extraCoins);
            AddGems(extraGems);

            AnalyticsManager.LogAdComplete("rewarded_x2", true);
        }

        // ─── Persistence ─────────────────────────────────────────────────────────
        private void PersistCurrency()
        {
            if (SaveManager.Instance == null) return;
            var data       = SaveManager.Instance.CurrentData;
            data.coins     = _coins;
            data.gems      = _gems;
            data.trophies  = _trophies;
            data.fragments = _fragments;
            SaveManager.Instance.Save();
        }

        // ─── League Helpers ───────────────────────────────────────────────────────
        public string GetLeagueName()
        {
            if (_trophies >= 5000) return "Champion";
            if (_trophies >= 3000) return "Master";
            if (_trophies >= 1500) return "Diamond";
            if (_trophies >= 800)  return "Gold";
            if (_trophies >= 300)  return "Silver";
            return "Bronze";
        }
    }
}
