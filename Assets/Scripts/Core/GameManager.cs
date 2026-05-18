using System;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.Events;

namespace BarkBattle
{
    /// <summary>
    /// Central singleton managing scene transitions and global game state.
    /// </summary>
    public class GameManager : MonoBehaviour
    {
        // ─── Singleton ────────────────────────────────────────────────────────────
        public static GameManager Instance { get; private set; }

        // ─── Game States ──────────────────────────────────────────────────────────
        public enum GameState { Menu, DogSelect, Battle, Rewards }

        [Header("State")]
        [SerializeField] private GameState _currentState = GameState.Menu;
        public GameState CurrentState => _currentState;

        // ─── Scene Name Constants ─────────────────────────────────────────────────
        public const string SCENE_MENU    = "HomeScreen";
        public const string SCENE_DOGSEL  = "DogSelect";
        public const string SCENE_BATTLE  = "Battle";
        public const string SCENE_REWARDS = "Rewards";

        // ─── Events ───────────────────────────────────────────────────────────────
        [HideInInspector] public UnityEvent<GameState> OnStateChanged = new UnityEvent<GameState>();

        // ─── Transient Battle Data ────────────────────────────────────────────────
        /// <summary>Set before loading the Battle scene so BattleController can read it.</summary>
        [NonSerialized] public string PendingPlayerDogId  = "samoyed";
        [NonSerialized] public string PendingPlayerSkinId = "default";
        [NonSerialized] public string PendingBotDogId     = "shiba";
        [NonSerialized] public BattleResult LastBattleResult;

        // ─── Lifecycle ────────────────────────────────────────────────────────────
        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;
            DontDestroyOnLoad(gameObject);
            SceneManager.sceneLoaded += OnSceneLoaded;
        }

        private void OnDestroy()
        {
            SceneManager.sceneLoaded -= OnSceneLoaded;
        }

        private void OnSceneLoaded(Scene scene, LoadSceneMode mode)
        {
            switch (scene.name)
            {
                case SCENE_MENU:    SetState(GameState.Menu);      break;
                case SCENE_DOGSEL:  SetState(GameState.DogSelect); break;
                case SCENE_BATTLE:  SetState(GameState.Battle);    break;
                case SCENE_REWARDS: SetState(GameState.Rewards);   break;
            }
        }

        // ─── State Management ─────────────────────────────────────────────────────
        private void SetState(GameState newState)
        {
            if (_currentState == newState) return;
            _currentState = newState;
            OnStateChanged.Invoke(_currentState);
            Debug.Log($"[GameManager] State -> {_currentState}");
        }

        // ─── Scene Navigation ─────────────────────────────────────────────────────
        public void GoToMenu()
        {
            SceneManager.LoadScene(SCENE_MENU);
        }

        public void GoToDogSelect()
        {
            SceneManager.LoadScene(SCENE_DOGSEL);
        }

        /// <summary>Call after setting pending dog IDs.</summary>
        public void GoToBattle(string playerDogId, string playerSkinId, string botDogId)
        {
            PendingPlayerDogId  = playerDogId;
            PendingPlayerSkinId = playerSkinId;
            PendingBotDogId     = botDogId;
            SceneManager.LoadScene(SCENE_BATTLE);
        }

        /// <summary>Call from BattleController when a battle concludes.</summary>
        public void GoToRewards(BattleResult result)
        {
            LastBattleResult = result;
            SceneManager.LoadScene(SCENE_REWARDS);
        }

        public void QuitGame()
        {
#if UNITY_EDITOR
            UnityEditor.EditorApplication.isPlaying = false;
#else
            Application.Quit();
#endif
        }

        // ─── Utility ─────────────────────────────────────────────────────────────
        public bool IsInBattle => _currentState == GameState.Battle;
        public bool IsInMenu   => _currentState == GameState.Menu;
    }

    // ─── Battle Result Data ───────────────────────────────────────────────────────
    [Serializable]
    public class BattleResult
    {
        public bool  PlayerWon;
        public float FinalConfidencePlayer;
        public float FinalConfidenceBot;
        public float BattleDuration;
        public int   CoinsEarned;
        public int   GemsEarned;
        public int   TrophyDelta;
        public int   FragmentsEarned;
        public float ChestProgressAdded;
    }
}
