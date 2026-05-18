using UnityEngine;

namespace BarkBattle
{
    /// <summary>Dog rarity tier.</summary>
    public enum DogRarity
    {
        Common,
        Rare,
        Epic,
        Legendary
    }

    /// <summary>
    /// ScriptableObject describing a dog's identity and base stats.
    /// Create via Assets > Create > BarkBattle > Dog Config.
    ///
    /// Preconfigured values:
    ///   Samoyed  – Tank:    BP 8, Stam 9, Focus 5
    ///   Shiba    – Balanced: BP 7, Stam 7, Focus 7
    ///   Corgi    – Fast:    BP 5, Stam 6, Focus 9
    /// </summary>
    [CreateAssetMenu(fileName = "NewDogConfig", menuName = "BarkBattle/Dog Config", order = 0)]
    public class DogConfig : ScriptableObject
    {
        [Header("Identity")]
        public string    id;
        public string    dogName;
        [TextArea(2, 4)]
        public string    description;
        public DogRarity rarity;

        [Header("Base Stats (1–10)")]
        [Range(1, 10)] public int baseBarkPower;   // Samoyed:8 Shiba:7 Corgi:5
        [Range(1, 10)] public int baseStamina;      // Samoyed:9 Shiba:7 Corgi:6
        [Range(1, 10)] public int baseFocus;        // Samoyed:5 Shiba:7 Corgi:9
        // Focus controls Perfect Bark window size & bot reaction speed

        [Header("Visuals")]
        public Sprite    portrait;
        public Sprite    battleSprite;

        [Header("Skins")]
        public SkinConfig[] availableSkins;

        [Header("Unlock")]
        [Tooltip("0 = available from start")]
        public int       fragmentsToUnlock;
        public int       unlockCoinCost;

        // ─── Derived Stats ────────────────────────────────────────────────────────
        /// <summary>Scaled bark power used by BarkSystem (raw stat → game unit).</summary>
        public float ScaledBarkPower  => baseBarkPower * 1.2f;

        /// <summary>Scaled max stamina (raw stat → stamina capacity 0-100).</summary>
        public float ScaledMaxStamina => Mathf.Lerp(60f, 100f, (baseStamina - 1) / 9f);

        /// <summary>
        /// Perfect Bark window size. Higher focus = wider window.
        /// Returns a pair (start, end) as normalised charge 0-1.
        /// </summary>
        public (float start, float end) PerfectBarkWindow()
        {
            float window = Mathf.Lerp(0.05f, 0.25f, (baseFocus - 1) / 9f);
            float center = 0.775f;
            return (center - window / 2f, center + window / 2f);
        }
    }
}
