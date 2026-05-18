using UnityEngine;

namespace BarkBattle
{
    public enum VFXSide { Player, Bot }

    public class VFXManager : MonoBehaviour
    {
        public static VFXManager Instance { get; private set; }

        [Header("Bark Pulse Prefabs")]
        [SerializeField] private GameObject smallBarkPulsePrefab;
        [SerializeField] private GameObject mediumBarkPulsePrefab;
        [SerializeField] private GameObject chargedBarkPulsePrefab;

        [Header("Battle VFX Prefabs")]
        [SerializeField] private GameObject clashPrefab;
        [SerializeField] private GameObject hitImpactPrefab;
        [SerializeField] private GameObject knockbackPrefab;
        [SerializeField] private GameObject shieldBlockPrefab;
        [SerializeField] private GameObject perfectBarkPrefab;
        [SerializeField] private GameObject victoryBurstPrefab;
        [SerializeField] private GameObject overheatPrefab;

        [Header("Colors")]
        [SerializeField] private Color playerColor = new Color(0.27f, 0.53f, 1f);
        [SerializeField] private Color botColor = new Color(1f, 0.45f, 0.13f);

        [Header("Spawn Points")]
        [SerializeField] private Transform playerPosition;
        [SerializeField] private Transform botPosition;
        [SerializeField] private Transform clashCenterPosition;

        private void Awake()
        {
            if (Instance != null && Instance != this) { Destroy(gameObject); return; }
            Instance = this;
        }

        public void PlayBarkPulse(VFXSide side, float chargeAmount)
        {
            GameObject prefab = chargeAmount > 0.7f ? chargedBarkPulsePrefab
                              : chargeAmount > 0.3f ? mediumBarkPulsePrefab
                              : smallBarkPulsePrefab;

            if (prefab == null) return;

            Transform spawnPoint = side == VFXSide.Player ? playerPosition : botPosition;
            Color color = side == VFXSide.Player ? playerColor : botColor;

            var vfx = Instantiate(prefab, spawnPoint.position, Quaternion.identity);
            TintParticles(vfx, color);

            if (side == VFXSide.Bot)
            {
                var scale = vfx.transform.localScale;
                scale.x *= -1f;
                vfx.transform.localScale = scale;
            }

            Destroy(vfx, 2f);
        }

        public void PlayClash(float wavePosition)
        {
            if (clashPrefab == null) return;

            Vector3 pos = clashCenterPosition != null ? clashCenterPosition.position : Vector3.zero;
            pos.x += wavePosition * 0.03f;

            var vfx = Instantiate(clashPrefab, pos, Quaternion.identity);
            Destroy(vfx, 2f);
        }

        public void PlayHitImpact(VFXSide targetSide)
        {
            if (hitImpactPrefab == null) return;

            Transform t = targetSide == VFXSide.Player ? playerPosition : botPosition;
            var vfx = Instantiate(hitImpactPrefab, t.position, Quaternion.identity);
            Destroy(vfx, 1.5f);
        }

        public void PlayKnockback(VFXSide targetSide)
        {
            if (knockbackPrefab == null) return;

            Transform t = targetSide == VFXSide.Player ? playerPosition : botPosition;
            var vfx = Instantiate(knockbackPrefab, t.position, Quaternion.identity);
            Destroy(vfx, 1f);
        }

        public void PlayShieldBlock(VFXSide side)
        {
            if (shieldBlockPrefab == null) return;

            Transform t = side == VFXSide.Player ? playerPosition : botPosition;
            var vfx = Instantiate(shieldBlockPrefab, t.position, Quaternion.identity);
            Destroy(vfx, 2f);
        }

        public void PlayPerfectBark()
        {
            if (perfectBarkPrefab == null) return;

            var vfx = Instantiate(perfectBarkPrefab, playerPosition.position, Quaternion.identity);
            TintParticles(vfx, playerColor);
            Destroy(vfx, 2f);
        }

        public void PlayVictoryBurst(VFXSide winningSide)
        {
            if (victoryBurstPrefab == null) return;

            Transform t = winningSide == VFXSide.Player ? playerPosition : botPosition;
            Color color = winningSide == VFXSide.Player ? playerColor : botColor;

            var vfx = Instantiate(victoryBurstPrefab, t.position, Quaternion.identity);
            TintParticles(vfx, color);
            Destroy(vfx, 3f);
        }

        public void PlayOverheat()
        {
            if (overheatPrefab == null) return;

            var vfx = Instantiate(overheatPrefab, playerPosition.position, Quaternion.identity);
            Destroy(vfx, 2f);
        }

        private void TintParticles(GameObject vfxGO, Color color)
        {
            foreach (var ps in vfxGO.GetComponentsInChildren<ParticleSystem>())
            {
                var main = ps.main;
                main.startColor = new ParticleSystem.MinMaxGradient(color);
            }
        }
    }
}
