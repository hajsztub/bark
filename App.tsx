import React, { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';
import { useSaveStore } from './src/store/saveStore';
import HomeScreen from './src/screens/HomeScreen';
import BattleScreen from './src/screens/BattleScreen';
import RewardScreen from './src/screens/RewardScreen';
import DogsScreen from './src/screens/DogsScreen';
import type { BattleEndResult } from './src/types';

type AppScreen = 'home' | 'battle' | 'rewards' | 'dogs';

export default function App() {
  const [screen, setScreen] = useState<AppScreen>('home');
  const [lastResult, setLastResult] = useState<BattleEndResult | null>(null);
  const loadSave = useSaveStore(s => s.load);
  const loaded = useSaveStore(s => s.loaded);

  useEffect(() => {
    loadSave();
  }, []);

  if (!loaded) return null;

  const handleBattleEnd = (result: BattleEndResult) => {
    setLastResult(result);
    setScreen('rewards');
  };

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        {screen === 'home' && (
          <HomeScreen
            onPlay={() => setScreen('battle')}
            onDogs={() => setScreen('dogs')}
            onShop={() => {}}
          />
        )}
        {screen === 'battle' && (
          <BattleScreen onBattleEnd={handleBattleEnd} />
        )}
        {screen === 'rewards' && lastResult && (
          <RewardScreen
            result={lastResult}
            onHome={() => setScreen('home')}
            onNextBattle={() => setScreen('battle')}
          />
        )}
        {screen === 'dogs' && (
          <DogsScreen onBack={() => setScreen('home')} />
        )}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
