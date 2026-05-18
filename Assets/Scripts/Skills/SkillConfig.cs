using UnityEngine;

namespace BarkBattle
{
    /// <summary>Defines the type of skill effect.</summary>
    public enum SkillType
    {
        Howl,    // temporary bark-power boost
        Treat,   // instant stamina restore
        Shield   // temporary damage reduction
    }

    /// <summary>
    /// ScriptableObject that holds static configuration for a single skill.
    /// Create via Assets > Create > BarkBattle > Skill Config.
    /// </summary>
    [CreateAssetMenu(fileName = "NewSkillConfig", menuName = "BarkBattle/Skill Config", order = 2)]
    public class SkillConfig : ScriptableObject
    {
        [Header("Identity")]
        public string    id;
        public string    skillName;

        [Header("Type & Effect")]
        public SkillType skillType;
        [Tooltip("Multiplier for Howl, flat stamina for Treat, reduction % for Shield")]
        public float     effectValue;

        [Header("Timing")]
        [Tooltip("Time in seconds before this skill can be used again")]
        public float     cooldown;
        [Tooltip("How long the buff/debuff lasts (0 = instant)")]
        public float     duration;

        [Header("Visuals")]
        public Sprite    icon;
        [Tooltip("Optional particle effect name in VFXManager")]
        public string    vfxKey;
        [Tooltip("SFX clip name in AudioManager")]
        public string    sfxKey;
    }
}
