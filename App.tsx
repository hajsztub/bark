import React, { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform, StyleSheet, View } from 'react-native';
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

  useEffect(() => { loadSave(); }, []);

  if (!loaded) return null;

  const handleBattleEnd = (result: BattleEndResult) => {
    setLastResult(result);
    setScreen('rewards');
  };

  const content = (
    <>
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
    </>
  );

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        {Platform.OS === 'web' ? (
          <View style={styles.webOuter}>
            <View style={styles.webFrame}>
              {content}
            </View>
          </View>
        ) : content}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  // On web: center a 390×844 phone frame
  webOuter: {
    flex: 1,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  webFrame: {
    width: 390,
    height: '100%' as any,
    maxHeight: 844,
    overflow: 'hidden',
    backgroundColor: '#0A1628',
    // subtle phone shadow
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 0 60px rgba(0,0,0,0.8)',
      borderRadius: 8,
    } as any : {}),
  },
});
