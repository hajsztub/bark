using System;
using TMPro;
using UnityEngine;
using UnityEngine.UI;

namespace BarkBattle
{
    public class SkinCard : MonoBehaviour
    {
        [SerializeField] private Image skinImage;
        [SerializeField] private TMP_Text skinNameText;
        [SerializeField] private TMP_Text rarityText;
        [SerializeField] private GameObject lockedOverlay;
        [SerializeField] private GameObject selectedIndicator;
        [SerializeField] private Button cardButton;

        private SkinConfig _skin;
        private Action<SkinConfig> _onSelected;

        public void Setup(SkinConfig skin, bool unlocked, Action<SkinConfig> onSelected)
        {
            _skin = skin;
            _onSelected = onSelected;

            if (skinNameText) skinNameText.text = skin.skinName;
            if (rarityText) rarityText.text = skin.rarity.ToString();
            if (skinImage && skin.skinSprite) skinImage.sprite = skin.skinSprite;
            if (lockedOverlay) lockedOverlay.SetActive(!unlocked);

            string currentSkin = SaveManager.Instance?.CurrentData.selectedSkin;
            if (selectedIndicator) selectedIndicator.SetActive(currentSkin == skin.id);

            if (cardButton) cardButton.onClick.AddListener(OnCardClicked);
        }

        private void OnCardClicked()
        {
            _onSelected?.Invoke(_skin);
        }
    }
}
