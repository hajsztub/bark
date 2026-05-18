using UnityEngine;

namespace BarkBattle
{
    public static class AnalyticsManager
    {
        private static bool _enabled = true;

        public static void LogTutorialStart(string selectedDog)
        {
            Log("tutorial_start", $"dog={selectedDog}");
        }

        public static void LogTutorialComplete(float durationSeconds, string result)
        {
            Log("tutorial_complete", $"duration={durationSeconds:F1},result={result}");
        }

        public static void LogBattleStart(string playerDog, string botDog, string skinId = "", int trophies = 0)
        {
            Log("battle_start", $"dog={playerDog},skin={skinId},opponent={botDog},trophies={trophies}");
        }

        public static void LogBattleEnd(bool playerWon, float playerConfidence, float botConfidence, float duration,
            int skillUses = 0, int perfectBarks = 0)
        {
            string result = playerWon ? "victory" : "defeat";
            Log("battle_end",
                $"result={result},duration={duration:F1}," +
                $"confidence_left={playerConfidence:F1},confidence_right={botConfidence:F1}," +
                $"skill_uses={skillUses},perfect_barks={perfectBarks}");
        }

        public static void LogRewardClaim(string rewardType, int amount, bool doubled = false)
        {
            Log("reward_claim", $"type={rewardType},amount={amount},doubled={doubled}");
        }

        public static void LogAdOfferShow(string placement)
        {
            Log("ad_offer_show", $"placement={placement}");
        }

        public static void LogAdStart(string placement, string network = "unknown")
        {
            Log("ad_start", $"placement={placement},network={network}");
        }

        public static void LogAdComplete(string placement, string reward = "")
        {
            Log("ad_complete", $"placement={placement},reward={reward}");
        }

        public static void LogInterstitialShow(int afterBattleCount)
        {
            Log("interstitial_show", $"after_battle_count={afterBattleCount}");
        }

        public static void LogUpgrade(string dogId, string stat, int newLevel, int cost)
        {
            Log("upgrade", $"dog={dogId},stat={stat},level={newLevel},cost={cost}");
        }

        public static void LogSkinEquip(string skinId, string source = "collection")
        {
            Log("skin_equip", $"skin={skinId},source={source}");
        }

        public static void LogShopOpen(string source = "nav")
        {
            Log("shop_open", $"source={source}");
        }

        public static void LogDailyRewardClaim(int coinsEarned, int gemsEarned)
        {
            Log("daily_reward_claim", $"coins={coinsEarned},gems={gemsEarned}");
        }

        public static void LogChestOpen(string method, int coins, int gems)
        {
            Log("chest_open", $"method={method},coins={coins},gems={gems}");
        }

        private static void Log(string eventName, string parameters)
        {
            if (!_enabled) return;
#if UNITY_ANALYTICS
            Unity.Services.Analytics.AnalyticsService.Instance?.RecordEvent(eventName);
#endif
            Debug.Log($"[Analytics] {eventName} | {parameters}");
        }

        public static void SetEnabled(bool enabled) => _enabled = enabled;
    }
}
