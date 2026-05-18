using TMPro;
using UnityEngine;
using UnityEngine.UI;

namespace BarkBattle
{
    public class DogCollectionScreen : MonoBehaviour
    {
        [Header("Selected Dog Display")]
        [SerializeField] private Image selectedDogImage;
        [SerializeField] private TMP_Text dogNameText;
        [SerializeField] private TMP_Text dogRarityText;
        [SerializeField] private TMP_Text dogLevelText;

        [Header("Stats")]
        [SerializeField] private Slider barkPowerBar;
        [SerializeField] private TMP_Text barkPowerText;
        [SerializeField] private Slider staminaBar;
        [SerializeField] private TMP_Text staminaText;
        [SerializeField] private Slider focusBar;
        [SerializeField] private TMP_Text focusText;

        [Header("Upgrade")]
        [SerializeField] private Button upgradeButton;
        [SerializeField] private TMP_Text upgradeCostText;
        [SerializeField] private TMP_Text playerCoinsText;

        [Header("Dog Grid")]
        [SerializeField] private Transform dogGridParent;
        [SerializeField] private GameObject dogCardPrefab;

        [Header("Skins")]
        [SerializeField] private Transform skinRowParent;
        [SerializeField] private GameObject skinCardPrefab;

        [Header("Buttons")]
        [SerializeField] private Button equipSkinButton;
        [SerializeField] private Button selectButton;
        [SerializeField] private Button closeButton;

        private DogConfig _selectedDog;
        private SkinConfig _selectedSkin;

        private void Start()
        {
            if (upgradeButton) upgradeButton.onClick.AddListener(OnUpgradeClicked);
            if (selectButton)  selectButton.onClick.AddListener(OnSelectClicked);
            if (equipSkinButton) equipSkinButton.onClick.AddListener(OnEquipSkinClicked);
            if (closeButton)   closeButton.onClick.AddListener(OnCloseClicked);
        }

        private void OnEnable()
        {
            RefreshCurrency();
            LoadSelectedDog();
        }

        private void LoadSelectedDog()
        {
            var save = SaveManager.Instance?.CurrentData;
            if (save == null) return;

            string dogId = save.selectedDog;
            _selectedDog = Resources.Load<DogConfig>($"Dogs/{dogId}");
            if (_selectedDog != null)
                DisplayDog(_selectedDog);
        }

        private void DisplayDog(DogConfig dog)
        {
            int level = SaveManager.Instance?.GetDogLevel(dog.id) ?? 1;

            if (dogNameText)   dogNameText.text   = dog.dogName.ToUpper();
            if (dogRarityText) dogRarityText.text = dog.rarity.ToString().ToUpper();
            if (dogLevelText)  dogLevelText.text  = $"LEVEL {level}";

            if (selectedDogImage && dog.idleSprite) selectedDogImage.sprite = dog.idleSprite;

            float maxStat = 100f;
            float bpValue = dog.GetBarkPowerForLevel(level);
            float stValue = dog.GetStaminaMaxForLevel(level);

            if (barkPowerBar)  barkPowerBar.value  = dog.baseBarkPower / 10f;
            if (staminaBar)    staminaBar.value     = dog.baseStamina  / 10f;
            if (focusBar)      focusBar.value       = dog.baseFocus    / 10f;

            if (barkPowerText) barkPowerText.text = $"{bpValue:F0}";
            if (staminaText)   staminaText.text   = $"{stValue:F0}";
            if (focusText)     focusText.text     = $"{dog.focusValue:F0}";

            RefreshUpgradeButton(dog, level);
            RefreshSkinsRow(dog);
        }

        private void RefreshUpgradeButton(DogConfig dog, int level)
        {
            if (level >= dog.maxLevel)
            {
                if (upgradeButton) upgradeButton.interactable = false;
                if (upgradeCostText) upgradeCostText.text = "MAX";
                return;
            }

            var costs = Resources.Load<UpgradeCostConfig>("UpgradeCosts");
            int cost = costs?.GetCost(0, level) ?? 500;

            if (upgradeCostText) upgradeCostText.text = cost.ToString("N0");

            bool canAfford = (EconomyManager.Instance?.Coins ?? 0) >= cost;
            if (upgradeButton) upgradeButton.interactable = canAfford;
        }

        private void RefreshSkinsRow(DogConfig dog)
        {
            if (skinRowParent == null || skinCardPrefab == null) return;

            foreach (Transform child in skinRowParent)
                Destroy(child.gameObject);

            if (dog.availableSkins == null) return;

            foreach (var skin in dog.availableSkins)
            {
                if (skin == null) continue;
                var card = Instantiate(skinCardPrefab, skinRowParent);
                var skinCard = card.GetComponent<SkinCard>();
                if (skinCard != null)
                {
                    bool unlocked = SaveManager.Instance?.IsSkinUnlocked(skin.id) ?? false;
                    skinCard.Setup(skin, unlocked, OnSkinSelected);
                }
            }
        }

        private void RefreshCurrency()
        {
            if (playerCoinsText)
                playerCoinsText.text = EconomyManager.Instance?.Coins.ToString("N0") ?? "0";
        }

        private void OnSkinSelected(SkinConfig skin)
        {
            _selectedSkin = skin;
        }

        private void OnUpgradeClicked()
        {
            if (_selectedDog == null) return;

            int level = SaveManager.Instance?.GetDogLevel(_selectedDog.id) ?? 1;
            if (level >= _selectedDog.maxLevel) return;

            var costs = Resources.Load<UpgradeCostConfig>("UpgradeCosts");
            int cost = costs?.GetCost(0, level) ?? 500;

            if (EconomyManager.Instance?.SpendCoins(cost) == true)
            {
                SaveManager.Instance?.SetDogLevel(_selectedDog.id, level + 1);
                AnalyticsManager.LogUpgrade(_selectedDog.id, "barkPower", level + 1, cost);
                DisplayDog(_selectedDog);
                RefreshCurrency();
            }
        }

        private void OnSelectClicked()
        {
            if (_selectedDog == null) return;
            SaveManager.Instance.CurrentData.selectedDog = _selectedDog.id;
            SaveManager.Instance.Save();
        }

        private void OnEquipSkinClicked()
        {
            if (_selectedSkin == null) return;
            bool unlocked = SaveManager.Instance?.IsSkinUnlocked(_selectedSkin.id) ?? false;
            if (!unlocked) return;

            SaveManager.Instance.CurrentData.selectedSkin = _selectedSkin.id;
            SaveManager.Instance.Save();
            AnalyticsManager.LogSkinEquip(_selectedSkin.id, "collection");
        }

        private void OnCloseClicked() => GameManager.Instance?.GoToHome();
    }
}
