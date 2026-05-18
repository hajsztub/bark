using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;

namespace BarkBattle
{
    /// <summary>
    /// Dog Collection / DogSelect screen.
    /// Shows a scrollable grid of dogs (locked/unlocked), fragment progress,
    /// selected dog's stats, upgrade button, and a skin selection row.
    /// </summary>
    public class DogCollectionScreen : MonoBehaviour
    {
        // ─── Inspector ────────────────────────────────────────────────────────────
        [Header("Dog Grid")]
        [SerializeField] private Transform      _dogGridParent;
        [SerializeField] private GameObject     _dogCardPrefab;     // prefab with DogCard component
        [SerializeField] private DogConfig[]    _allDogs;           // assign all 3 in Inspector

        [Header("Selected Dog Info Panel")]
        [SerializeField] private Image          _selectedDogPortrait;
        [SerializeField] private TMP_Text       _selectedDogName;
        [SerializeField] private TMP_Text       _selectedDogDescription;
        [SerializeField] private Slider         _barkPowerBar;
        [SerializeField] private Slider         _staminaBar;
        [SerializeField] private Slider         _focusBar;
        [SerializeField] private TMP_Text       _levelText;

        [Header("Fragments Progress")]
        [SerializeField] private Slider         _fragmentsBar;
        [SerializeField] private TMP_Text       _fragmentsText;

        [Header("Upgrade")]
        [SerializeField] private Button         _upgradeButton;
        [SerializeField] private TMP_Text       _upgradeCostText;
        [SerializeField] private TMP_Text       _upgradeButtonLabel;

        [Header("Skin Row")]
        [SerializeField] private Transform      _skinRowParent;
        [SerializeField] private GameObject     _skinCardPrefab;

        [Header("Navigation")]
        [SerializeField] private Button         _backButton;
        [SerializeField] private Button         _selectAndPlayButton;

        // ─── State ────────────────────────────────────────────────────────────────
        private DogConfig  _selectedDog;
        private SkinConfig _selectedSkin;
        private List<GameObject> _dogCards  = new List<GameObject>();
        private List<GameObject> _skinCards = new List<GameObject>();

        private const int BASE_UPGRADE_COST  = 100;
        private const int UPGRADE_COST_SCALE = 150;   // cost * level

        // ─── Lifecycle ────────────────────────────────────────────────────────────
        private void Start()
        {
            BuildDogGrid();
            BindButtons();

            // Restore previously selected dog
            string savedDogId = SaveManager.Instance?.CurrentData.selectedDog ?? "shiba";
            var preSelected   = System.Array.Find(_allDogs, d => d != null && d.id == savedDogId);
            SelectDog(preSelected ?? (_allDogs.Length > 0 ? _allDogs[0] : null));
        }

        // ─── Grid Construction ────────────────────────────────────────────────────
        private void BuildDogGrid()
        {
            foreach (var card in _dogCards) if (card != null) Destroy(card);
            _dogCards.Clear();

            if (_dogCardPrefab == null || _dogGridParent == null) return;

            foreach (var dog in _allDogs)
            {
                if (dog == null) continue;
                var card = Instantiate(_dogCardPrefab, _dogGridParent);
                _dogCards.Add(card);

                bool unlocked = IsDogUnlocked(dog);

                // Try to configure via a simple DogCard helper (optional component)
                var dogCard = card.GetComponent<DogCard>();
                if (dogCard != null)
                    dogCard.Setup(dog, unlocked, () => OnDogCardClicked(dog, unlocked));

                // Fallback: set portrait and name directly
                var portrait = card.transform.Find("Portrait")?.GetComponent<Image>();
                if (portrait != null && dog.portrait != null) portrait.sprite = dog.portrait;

                var nameLabel = card.transform.Find("NameText")?.GetComponent<TMP_Text>();
                if (nameLabel != null) nameLabel.text = dog.dogName;

                var lockOverlay = card.transform.Find("LockOverlay");
                if (lockOverlay != null) lockOverlay.gameObject.SetActive(!unlocked);

                var btn = card.GetComponent<Button>() ?? card.GetComponentInChildren<Button>();
                if (btn != null)
                {
                    var capturedDog     = dog;
                    var capturedUnlocked = unlocked;
                    btn.onClick.AddListener(() => OnDogCardClicked(capturedDog, capturedUnlocked));
                }
            }
        }

        private bool IsDogUnlocked(DogConfig dog)
        {
            if (dog == null) return false;
            // Shiba is free; others require fragments
            if (dog.fragmentsToUnlock <= 0) return true;
            int ownedFrags = EconomyManager.Instance?.Fragments ?? 0;
            return ownedFrags >= dog.fragmentsToUnlock;
        }

        // ─── Dog Selection ────────────────────────────────────────────────────────
        private void SelectDog(DogConfig dog)
        {
            if (dog == null) return;
            _selectedDog = dog;
            UpdateInfoPanel();
            BuildSkinRow();
        }

        private void OnDogCardClicked(DogConfig dog, bool unlocked)
        {
            AudioManager.Instance?.PlaySFX("ButtonClick");
            if (unlocked)
                SelectDog(dog);
            else
                Debug.Log($"[DogCollection] {dog.dogName} is locked. Need {dog.fragmentsToUnlock} fragments.");
        }

        // ─── Info Panel ───────────────────────────────────────────────────────────
        private void UpdateInfoPanel()
        {
            if (_selectedDog == null) return;

            int level = SaveManager.Instance?.GetDogLevel(_selectedDog.id) ?? 1;

            if (_selectedDogPortrait    != null && _selectedDog.portrait != null)
                _selectedDogPortrait.sprite = _selectedDog.portrait;
            if (_selectedDogName        != null) _selectedDogName.text        = _selectedDog.dogName;
            if (_selectedDogDescription != null) _selectedDogDescription.text = _selectedDog.description;
            if (_levelText              != null) _levelText.text              = $"Lv.{level}";

            float statScale = 1f + (level - 1) * 0.1f;
            if (_barkPowerBar != null) _barkPowerBar.value = (_selectedDog.baseBarkPower * statScale) / 10f;
            if (_staminaBar   != null) _staminaBar.value   = (_selectedDog.baseStamina   * statScale) / 10f;
            if (_focusBar     != null) _focusBar.value     = (_selectedDog.baseFocus     * statScale) / 10f;

            // Fragments progress (for locked dogs or display)
            int frags  = EconomyManager.Instance?.Fragments ?? 0;
            int needed = _selectedDog.fragmentsToUnlock;
            if (_fragmentsBar  != null) _fragmentsBar.value = needed > 0 ? Mathf.Clamp01((float)frags / needed) : 1f;
            if (_fragmentsText != null) _fragmentsText.text  = needed > 0 ? $"{frags}/{needed}" : "Unlocked";

            // Upgrade cost
            int cost = UpgradeCost(level);
            if (_upgradeCostText     != null) _upgradeCostText.text     = cost.ToString();
            if (_upgradeButtonLabel  != null) _upgradeButtonLabel.text  = $"Upgrade (Lv.{level + 1})";
            if (_upgradeButton       != null) _upgradeButton.interactable = EconomyManager.Instance?.HasCoins(cost) ?? false;
        }

        // ─── Skin Row ────────────────────────────────────────────────────────────
        private void BuildSkinRow()
        {
            foreach (var card in _skinCards) if (card != null) Destroy(card);
            _skinCards.Clear();

            if (_skinCardPrefab == null || _skinRowParent == null || _selectedDog == null) return;

            foreach (var skin in _selectedDog.availableSkins)
            {
                if (skin == null) continue;
                var card = Instantiate(_skinCardPrefab, _skinRowParent);
                _skinCards.Add(card);

                bool owned = skin.unlockType == SkinUnlockType.Default ||
                             (SaveManager.Instance?.IsSkinUnlocked(skin.id) ?? false);

                var preview = card.transform.Find("Preview")?.GetComponent<Image>();
                if (preview != null && skin.previewSprite != null) preview.sprite = skin.previewSprite;

                var nameLabel = card.transform.Find("NameText")?.GetComponent<TMP_Text>();
                if (nameLabel != null) nameLabel.text = skin.skinName;

                var lockOverlay = card.transform.Find("LockOverlay");
                if (lockOverlay != null) lockOverlay.gameObject.SetActive(!owned);

                var btn = card.GetComponent<Button>() ?? card.GetComponentInChildren<Button>();
                if (btn != null)
                {
                    var capturedSkin  = skin;
                    var capturedOwned = owned;
                    btn.onClick.AddListener(() => OnSkinCardClicked(capturedSkin, capturedOwned));
                }
            }
        }

        private void OnSkinCardClicked(SkinConfig skin, bool owned)
        {
            AudioManager.Instance?.PlaySFX("ButtonClick");
            if (!owned)
            {
                TryPurchaseSkin(skin);
                return;
            }
            _selectedSkin = skin;
            AnalyticsManager.LogSkinEquip(_selectedDog?.id ?? "", skin.id);
            Debug.Log($"[DogCollection] Skin equipped: {skin.skinName}");
        }

        private void TryPurchaseSkin(SkinConfig skin)
        {
            bool success = false;
            switch (skin.unlockType)
            {
                case SkinUnlockType.Coins:
                    success = EconomyManager.Instance?.SpendCoins(skin.unlockCost) ?? false;
                    break;
                case SkinUnlockType.Gems:
                    success = EconomyManager.Instance?.SpendGems(skin.unlockCost) ?? false;
                    break;
                case SkinUnlockType.Fragments:
                    success = EconomyManager.Instance?.SpendFragments(skin.unlockCost) ?? false;
                    break;
            }

            if (success)
            {
                SaveManager.Instance?.UnlockSkin(skin.id);
                BuildSkinRow();
                Debug.Log($"[DogCollection] Skin purchased: {skin.skinName}");
            }
            else
            {
                Debug.Log($"[DogCollection] Cannot afford skin: {skin.skinName}");
                AudioManager.Instance?.PlaySFX("ErrorDing");
            }
        }

        // ─── Upgrade ─────────────────────────────────────────────────────────────
        private void OnUpgradeClicked()
        {
            if (_selectedDog == null) return;
            int level = SaveManager.Instance?.GetDogLevel(_selectedDog.id) ?? 1;
            int cost  = UpgradeCost(level);

            if (EconomyManager.Instance?.SpendCoins(cost) == true)
            {
                SaveManager.Instance?.SetDogLevel(_selectedDog.id, level + 1);
                AnalyticsManager.LogUpgrade(_selectedDog.id, level + 1, cost);
                AudioManager.Instance?.PlaySFX("UpgradeSuccess");
                UpdateInfoPanel();
            }
            else
            {
                AudioManager.Instance?.PlaySFX("ErrorDing");
                Debug.Log("[DogCollection] Not enough coins to upgrade.");
            }
        }

        private static int UpgradeCost(int currentLevel)
            => BASE_UPGRADE_COST + currentLevel * UPGRADE_COST_SCALE;

        // ─── Navigation ──────────────────────────────────────────────────────────
        private void BindButtons()
        {
            if (_backButton          != null) _backButton.onClick.AddListener(OnBackClicked);
            if (_selectAndPlayButton != null) _selectAndPlayButton.onClick.AddListener(OnSelectAndPlayClicked);
            if (_upgradeButton       != null) _upgradeButton.onClick.AddListener(OnUpgradeClicked);
        }

        private void OnBackClicked()
        {
            AudioManager.Instance?.PlaySFX("ButtonClick");
            GameManager.Instance?.GoToMenu();
        }

        private void OnSelectAndPlayClicked()
        {
            if (_selectedDog == null) return;
            AudioManager.Instance?.PlaySFX("ButtonClick");

            var save = SaveManager.Instance?.CurrentData;
            if (save != null)
            {
                save.selectedDog  = _selectedDog.id;
                save.selectedSkin = _selectedSkin?.id ?? "default";
                SaveManager.Instance?.Save();
            }

            GameManager.Instance?.GoToBattle(
                _selectedDog.id,
                _selectedSkin?.id ?? "default",
                "shiba");
        }
    }

    // ─── Dog Card Component (lightweight, used by DogCollectionScreen) ────────────
    /// <summary>Optional helper component on the dog card prefab.</summary>
    public class DogCard : MonoBehaviour
    {
        public void Setup(DogConfig dog, bool unlocked, System.Action onClick) { }
    }
}
