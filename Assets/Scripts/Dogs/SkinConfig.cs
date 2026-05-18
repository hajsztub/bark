using UnityEngine;

namespace BarkBattle
{
    /// <summary>How a skin is unlocked.</summary>
    public enum SkinUnlockType
    {
        Default,    // always available
        Coins,      // purchase with coins
        Gems,       // purchase with gems
        Fragments   // unlock via fragment collection
    }

    /// <summary>
    /// ScriptableObject describing a cosmetic skin for a dog.
    /// Create via Assets > Create > BarkBattle > Skin Config.
    /// </summary>
    [CreateAssetMenu(fileName = "NewSkinConfig", menuName = "BarkBattle/Skin Config", order = 1)]
    public class SkinConfig : ScriptableObject
    {
        [Header("Identity")]
        public string         id;
        public string         skinName;
        public DogRarity      rarity;
        [Tooltip("ID of the dog this skin belongs to")]
        public string         dogId;

        [Header("Unlock")]
        public SkinUnlockType unlockType;
        [Tooltip("Cost in the currency defined by UnlockType (0 if Default)")]
        public int            unlockCost;

        [Header("Visuals")]
        public Sprite         previewSprite;
        public Sprite         battleSprite;

        [Header("Optional VFX override")]
        [Tooltip("Particle effect prefab name override for this skin (leave empty to use default)")]
        public string         barkVFXOverride;
    }
}
