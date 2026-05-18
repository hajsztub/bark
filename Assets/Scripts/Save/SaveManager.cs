using System;
using UnityEngine;

namespace BarkBattle
{
    /// <summary>
    /// Singleton that persists PlayerSaveData using PlayerPrefs as a JSON store.
    /// Provides Save(), Load(), and Reset() for the full save data graph.
    /// </summary>
    public class SaveManager : MonoBehaviour
    {
        // ─── Singleton ────────────────────────────────────────────────────────────
        public static SaveManager Instance { get; private set; }

        // ─── Constants ────────────────────────────────────────────────────────────
        private const string PREFS_KEY    = "BarkBattle_SaveData";
        private const int    CURRENT_VER  = 1;

        // ─── Data ─────────────────────────────────────────────────────────────────
        private PlayerSaveData _data;

        /// <summary>Always-valid reference to live save data. Never null after Awake.</summary>
        public PlayerSaveData CurrentData => _data;

        // ─── Lifecycle ────────────────────────────────────────────────────────────
        private void Awake()
        {
            if (Instance != null && Instance != this) { Destroy(gameObject); return; }
            Instance = this;
            DontDestroyOnLoad(gameObject);
            Load();
        }

        private void OnApplicationPause(bool paused)
        {
            if (paused) Save();
        }

        private void OnApplicationQuit()
        {
            Save();
        }

        // ─── Public API ──────────────────────────────────────────────────────────
        /// <summary>Serialize current data to PlayerPrefs.</summary>
        public void Save()
        {
            try
            {
                _data.saveVersion = CURRENT_VER;
                string json = JsonUtility.ToJson(_data, prettyPrint: false);
                PlayerPrefs.SetString(PREFS_KEY, json);
                PlayerPrefs.Save();
            }
            catch (Exception ex)
            {
                Debug.LogError($"[SaveManager] Save failed: {ex.Message}");
            }
        }

        /// <summary>Load from PlayerPrefs. Creates default data if none found.</summary>
        public void Load()
        {
            try
            {
                if (PlayerPrefs.HasKey(PREFS_KEY))
                {
                    string json = PlayerPrefs.GetString(PREFS_KEY);
                    _data = JsonUtility.FromJson<PlayerSaveData>(json);

                    if (_data == null || _data.saveVersion < CURRENT_VER)
                    {
                        Debug.Log("[SaveManager] Save version mismatch – migrating.");
                        _data = MigrateOrReset(_data);
                    }
                }
                else
                {
                    _data = CreateDefault();
                    Debug.Log("[SaveManager] No save found – using defaults.");
                }
            }
            catch (Exception ex)
            {
                Debug.LogError($"[SaveManager] Load failed ({ex.Message}), resetting to default.");
                _data = CreateDefault();
            }
        }

        /// <summary>Wipe all progress and save a fresh default state.</summary>
        public void Reset()
        {
            _data = CreateDefault();
            Save();
            Debug.Log("[SaveManager] Save data reset.");
        }

        // ─── Dog Levels ──────────────────────────────────────────────────────────
        public int GetDogLevel(string dogId)
            => _data.dogLevels.GetOrDefault(dogId, 1);

        public void SetDogLevel(string dogId, int level)
        {
            _data.dogLevels.Set(dogId, Mathf.Max(1, level));
            Save();
        }

        // ─── Skins ───────────────────────────────────────────────────────────────
        public bool IsSkinUnlocked(string skinId)
            => _data.unlockedSkins.Contains(skinId);

        public void UnlockSkin(string skinId)
        {
            if (!_data.unlockedSkins.Contains(skinId))
            {
                _data.unlockedSkins.Add(skinId);
                Save();
            }
        }

        // ─── Battle Stats ────────────────────────────────────────────────────────
        public void RecordBattle(bool won)
        {
            _data.battleCount++;
            if (won) _data.battleWins++;
            else      _data.battleLosses++;
            Save();
        }

        // ─── Chest ───────────────────────────────────────────────────────────────
        public void AddChestProgress(float amount)
        {
            _data.chestProgress = Mathf.Clamp01(_data.chestProgress + amount);
            Save();
        }

        public bool IsChestReady() => _data.chestProgress >= 1f;

        public void ClaimChest()
        {
            _data.chestProgress = 0f;
            Save();
        }

        // ─── Daily Reward ─────────────────────────────────────────────────────────
        public bool IsDailyRewardAvailable()
        {
            if (_data.lastDailyRewardTicks == 0) return true;
            var last = new DateTime(_data.lastDailyRewardTicks, DateTimeKind.Utc);
            return (DateTime.UtcNow - last).TotalHours >= 24.0;
        }

        public void ClaimDailyReward()
        {
            _data.lastDailyRewardTicks = DateTime.UtcNow.Ticks;
            _data.dailyRewardStreak    = Mathf.Min(_data.dailyRewardStreak + 1, 6);
            Save();
        }

        // ─── Internal ────────────────────────────────────────────────────────────
        private static PlayerSaveData CreateDefault()
        {
            var d = new PlayerSaveData();
            d.dogLevels.Set("samoyed", 1);
            d.dogLevels.Set("shiba",   1);
            d.dogLevels.Set("corgi",   1);
            return d;
        }

        private static PlayerSaveData MigrateOrReset(PlayerSaveData old)
        {
            // In a real game you would copy fields across versions here.
            // For now, preserve currency and return a patched copy.
            var fresh        = CreateDefault();
            if (old != null)
            {
                fresh.coins    = old.coins;
                fresh.gems     = old.gems;
                fresh.trophies = old.trophies;
                fresh.playerName = old.playerName;
            }
            return fresh;
        }
    }
}
