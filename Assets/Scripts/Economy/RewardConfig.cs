using UnityEngine;

namespace BarkBattle
{
    /// <summary>
    /// ScriptableObject that defines economy reward values for battles.
    /// Create via Assets > Create > BarkBattle > Reward Config.
    /// Place one instance at Resources/RewardConfig.
    /// </summary>
    [CreateAssetMenu(fileName = "RewardConfig", menuName = "BarkBattle/Reward Config", order = 20)]
    public class RewardConfig : ScriptableObject
    {
        [Header("Battle Rewards")]
        [Tooltip("Coins awarded for winning a battle")]
        public int   battleWinCoins  = 50;
        [Tooltip("Coins awarded for losing a battle")]
        public int   battleLoseCoins = 10;

        [Header("Trophy Changes")]
        [Tooltip("Trophies gained on a win")]
        public int   trophyWin  = 30;
        [Tooltip("Trophies lost on a loss")]
        public int   trophyLose = 20;

        [Header("Fragments")]
        [Tooltip("Fragments earned per win")]
        public int   fragmentsPerWin  = 5;
        [Tooltip("Fragments earned per loss")]
        public int   fragmentsPerLose = 1;

        [Header("Chest")]
        [Tooltip("How much chest progress (0-1) one win awards")]
        [Range(0f, 1f)]
        public float chestProgressPerWin = 0.2f;

        [Header("Ads")]
        [Tooltip("Multiplier applied to all rewards when the player watches a rewarded ad")]
        public float adMultiplier = 2f;

        [Header("Daily Reward")]
        public int[] dailyRewardCoins = { 50, 75, 100, 150, 200, 250, 500 };

        [Header("Gem Sources")]
        [Tooltip("Gems awarded for achieving a new trophy milestone")]
        public int   gemsPerLeagueMilestone = 10;
    }
}
