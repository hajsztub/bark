using UnityEngine;

namespace BarkBattle
{
    [CreateAssetMenu(fileName = "UpgradeCosts", menuName = "BarkBattle/Upgrade Cost Config")]
    public class UpgradeCostConfig : ScriptableObject
    {
        [Header("Bark Power Upgrade Costs per Level")]
        public int[] barkPowerCosts = { 500, 1000, 1500, 2000, 2500, 3000, 4000, 5000, 6000, 7500, 10000, 12500, 15000, 20000 };

        [Header("Stamina Upgrade Costs per Level")]
        public int[] staminaCosts = { 400, 800, 1200, 1600, 2000, 2500, 3000, 4000, 5000, 6500, 8000, 10000, 12000, 15000 };

        [Header("Focus Upgrade Costs per Level")]
        public int[] focusCosts = { 600, 1100, 1600, 2100, 2600, 3200, 4200, 5200, 6500, 8000, 10500, 13000, 16000, 21000 };

        public int GetCost(int statIndex, int currentLevel)
        {
            int[] costs = statIndex == 0 ? barkPowerCosts
                        : statIndex == 1 ? staminaCosts
                        : focusCosts;

            int idx = Mathf.Clamp(currentLevel - 1, 0, costs.Length - 1);
            return costs[idx];
        }
    }
}
