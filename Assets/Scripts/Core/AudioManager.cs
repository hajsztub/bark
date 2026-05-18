using System.Collections.Generic;
using UnityEngine;

namespace BarkBattle
{
    /// <summary>
    /// Singleton audio manager with pooled AudioSources for SFX and a dedicated
    /// music source. Clip names map to Resources/Audio/ prefabs by convention.
    /// </summary>
    public class AudioManager : MonoBehaviour
    {
        // ─── Singleton ────────────────────────────────────────────────────────────
        public static AudioManager Instance { get; private set; }

        // ─── Inspector ────────────────────────────────────────────────────────────
        [Header("Pool Settings")]
        [SerializeField] private int _sfxPoolSize = 10;

        [Header("Volume")]
        [SerializeField, Range(0f, 1f)] private float _sfxVolume   = 1f;
        [SerializeField, Range(0f, 1f)] private float _musicVolume  = 0.6f;

        [Header("Music Source")]
        [SerializeField] private AudioSource _musicSource;

        // ─── Runtime ──────────────────────────────────────────────────────────────
        private AudioSource[]            _sfxPool;
        private int                      _poolIndex;
        private Dictionary<string, AudioClip> _clipCache = new Dictionary<string, AudioClip>();

        // PlayerPrefs keys
        private const string KEY_SFX   = "audio_sfx_volume";
        private const string KEY_MUSIC = "audio_music_volume";

        // ─── Lifecycle ────────────────────────────────────────────────────────────
        private void Awake()
        {
            if (Instance != null && Instance != this) { Destroy(gameObject); return; }
            Instance = this;
            DontDestroyOnLoad(gameObject);

            LoadVolumes();
            BuildPool();

            if (_musicSource == null)
            {
                _musicSource             = gameObject.AddComponent<AudioSource>();
                _musicSource.loop        = true;
                _musicSource.playOnAwake = false;
            }
            _musicSource.volume = _musicVolume;
        }

        private void BuildPool()
        {
            _sfxPool = new AudioSource[_sfxPoolSize];
            for (int i = 0; i < _sfxPoolSize; i++)
            {
                var src           = gameObject.AddComponent<AudioSource>();
                src.playOnAwake   = false;
                src.volume        = _sfxVolume;
                _sfxPool[i]       = src;
            }
        }

        private void LoadVolumes()
        {
            _sfxVolume   = PlayerPrefs.GetFloat(KEY_SFX,   1f);
            _musicVolume = PlayerPrefs.GetFloat(KEY_MUSIC, 0.6f);
        }

        // ─── SFX API ─────────────────────────────────────────────────────────────
        /// <summary>Play a one-shot SFX. clipName maps to Resources/Audio/SFX/{clipName}.</summary>
        public void PlaySFX(string clipName)
        {
            AudioClip clip = GetClip("Audio/SFX/" + clipName);
            if (clip == null) { Debug.LogWarning($"[AudioManager] SFX clip not found: {clipName}"); return; }

            AudioSource src = NextSource();
            src.volume = _sfxVolume;
            src.clip   = clip;
            src.Play();
        }

        /// <summary>Play SFX at a world position (uses PlayClipAtPoint).</summary>
        public void PlaySFXAt(string clipName, Vector3 position)
        {
            AudioClip clip = GetClip("Audio/SFX/" + clipName);
            if (clip == null) return;
            AudioSource.PlayClipAtPoint(clip, position, _sfxVolume);
        }

        // ─── Music API ────────────────────────────────────────────────────────────
        /// <summary>Play music track. clipName maps to Resources/Audio/Music/{clipName}.</summary>
        public void PlayMusic(string clipName)
        {
            AudioClip clip = GetClip("Audio/Music/" + clipName);
            if (clip == null) { Debug.LogWarning($"[AudioManager] Music clip not found: {clipName}"); return; }

            if (_musicSource.clip == clip && _musicSource.isPlaying) return;

            _musicSource.clip   = clip;
            _musicSource.volume = _musicVolume;
            _musicSource.Play();
        }

        public void StopMusic()
        {
            _musicSource.Stop();
        }

        public void PauseMusic()
        {
            _musicSource.Pause();
        }

        public void ResumeMusic()
        {
            _musicSource.UnPause();
        }

        // ─── Volume API ───────────────────────────────────────────────────────────
        public void SetSFXVolume(float value)
        {
            _sfxVolume = Mathf.Clamp01(value);
            foreach (var src in _sfxPool) src.volume = _sfxVolume;
            PlayerPrefs.SetFloat(KEY_SFX, _sfxVolume);
            PlayerPrefs.Save();
        }

        public void SetMusicVolume(float value)
        {
            _musicVolume          = Mathf.Clamp01(value);
            _musicSource.volume   = _musicVolume;
            PlayerPrefs.SetFloat(KEY_MUSIC, _musicVolume);
            PlayerPrefs.Save();
        }

        public float SFXVolume   => _sfxVolume;
        public float MusicVolume => _musicVolume;

        // ─── Helpers ─────────────────────────────────────────────────────────────
        private AudioSource NextSource()
        {
            // Round-robin through pool; skip any sources still playing if possible
            int start = _poolIndex;
            for (int i = 0; i < _sfxPool.Length; i++)
            {
                int idx = (start + i) % _sfxPool.Length;
                if (!_sfxPool[idx].isPlaying)
                {
                    _poolIndex = (idx + 1) % _sfxPool.Length;
                    return _sfxPool[idx];
                }
            }
            // All busy — reuse next in sequence (oldest will be stomped)
            AudioSource fallback = _sfxPool[_poolIndex];
            _poolIndex = (_poolIndex + 1) % _sfxPool.Length;
            return fallback;
        }

        private AudioClip GetClip(string resourcePath)
        {
            if (_clipCache.TryGetValue(resourcePath, out AudioClip cached)) return cached;
            AudioClip loaded = Resources.Load<AudioClip>(resourcePath);
            if (loaded != null) _clipCache[resourcePath] = loaded;
            return loaded;
        }
    }
}
