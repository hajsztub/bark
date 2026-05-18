// Bot AI is now handled entirely inside BattleEngine.ts via botGrowlProgress.
// This file is kept as a no-op stub so existing imports don't break.
export function useBotAI(_bot: any, _actions: any) {
  return { start: () => {}, stop: () => {} };
}
