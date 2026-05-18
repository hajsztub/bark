using System;
using System.Collections.Generic;

namespace BarkBattle
{
    /// <summary>
    /// All persistent player data. Serialised to/from JSON by SaveManager.
    /// This class must stay serialisable (no Unity types, only primitives/collections).
    /// </summary>
    [Serializable]
    public class PlayerSaveData
    {
        // ─── Currency ─────────────────────────────────────────────────────────────
        public int coins      = 200;
        public int gems       = 10;
        public int trophies   = 0;
        public int fragments  = 0;

        // ─── Selection ────────────────────────────────────────────────────────────
        public string selectedDog  = "shiba";
        public string selectedSkin = "default";

        // ─── Dog Progression ─────────────────────────────────────────────────────
        /// <summary>Maps dog ID -> level (1-based)</summary>
        public SerializableDictionary<string, int> dogLevels = new SerializableDictionary<string, int>();

        // ─── Skins ────────────────────────────────────────────────────────────────
        public List<string> unlockedSkins = new List<string> { "shiba_default" };

        // ─── Stats ────────────────────────────────────────────────────────────────
        public int  battleCount   = 0;
        public int  battleWins    = 0;
        public int  battleLosses  = 0;

        // ─── Chest ────────────────────────────────────────────────────────────────
        /// <summary>0.0 – 1.0 representing how full the current chest is</summary>
        public float chestProgress = 0f;

        // ─── Daily Reward ─────────────────────────────────────────────────────────
        /// <summary>Last time daily reward was claimed (UTC ticks)</summary>
        public long  lastDailyRewardTicks = 0;
        public int   dailyRewardStreak    = 0;

        // ─── Tutorial ────────────────────────────────────────────────────────────
        public bool tutorialComplete = false;

        // ─── Settings ────────────────────────────────────────────────────────────
        public string playerName = "Pup";

        // ─── Version ─────────────────────────────────────────────────────────────
        public int saveVersion = 1;
    }

    // ─── Serializable Dictionary ─────────────────────────────────────────────────
    /// <summary>A JSON-serialisable string->int dictionary backed by parallel lists.</summary>
    [Serializable]
    public class SerializableDictionary<TKey, TValue>
    {
        public List<TKey>   keys   = new List<TKey>();
        public List<TValue> values = new List<TValue>();

        public void Set(TKey key, TValue value)
        {
            int idx = keys.IndexOf(key);
            if (idx >= 0) values[idx] = value;
            else { keys.Add(key); values.Add(value); }
        }

        public bool TryGet(TKey key, out TValue value)
        {
            int idx = keys.IndexOf(key);
            if (idx >= 0) { value = values[idx]; return true; }
            value = default;
            return false;
        }

        public TValue GetOrDefault(TKey key, TValue defaultValue = default)
        {
            return TryGet(key, out TValue v) ? v : defaultValue;
        }

        public bool ContainsKey(TKey key) => keys.Contains(key);
        public int  Count => keys.Count;
    }
}
