using UnityEngine;

namespace BarkBattle
{
    /// <summary>Bot difficulty presets.</summary>
    public enum BotDifficulty
    {
        Easy,
        Medium,
        Hard,
        Expert
    }

    /// <summary>
    /// ScriptableObject that configures a bot opponent's behaviour.
    /// Create via Assets > Create > BarkBattle > Bot Config.
    /// </summary>
    [CreateAssetMenu(fileName = "NewBotConfig", menuName = "BarkBattle/Bot Config", order = 10)]
    public class BotConfig : ScriptableObject
    {
        [Header("Identity")]
        public string        botName;
        public BotDifficulty difficulty;

        [Header("Reaction")]
        [Tooltip("Seconds the bot waits before responding to player actions")]
        [Range(0f, 2f)]
        public float reactionDelay = 0.5f;

        [Header("Behaviour (0 = passive, 1 = aggressive)")]
        [Range(0f, 1f)]
        [Tooltip("0 = mostly defends / spams treats, 1 = continuous bark attacks")]
        public float aggression = 0.5f;

        [Range(0f, 1f)]
        [Tooltip("Probability per action that the bot makes a suboptimal choice")]
        public float mistakeRate = 0.2f;

        [Header("Combat Stats")]
        [Tooltip("Base bark power (mirrors DogConfig.baseBarkPower scale)")]
        public float barkPower = 7f;
        [Tooltip("Base stamina capacity")]
        public float stamina   = 70f;

        [Header("Skill Thresholds")]
        [Tooltip("Wave position below which the bot uses Shield (e.g. –40 means wave is 40 toward bot)")]
        [Range(-100f, 0f)]
        public float shieldWaveThreshold = -40f;

        [Tooltip("Stamina fraction below which the bot uses Treat (0.25 = 25%)")]
        [Range(0f, 1f)]
        public float treatStaminaThreshold = 0.3f;

        [Tooltip("Wave position above which bot uses Howl (e.g. 20 = wave slightly favours bot)")]
        [Range(0f, 100f)]
        public float howlWaveThreshold = 20f;
    }
}
