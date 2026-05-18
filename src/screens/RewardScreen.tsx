import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { BattleEndResult } from '../types';

interface Props {
  result: BattleEndResult;
  onHome: () => void;
  onNextBattle: () => void;
}

export default function RewardScreen({ result, onHome, onNextBattle }: Props) {
  const won = result.result === 'victory';

  return (
    <SafeAreaView style={styles.container}>
      {/* Victory/Defeat Banner */}
      <View style={[styles.banner, won ? styles.bannerWin : styles.bannerLose]}>
        <Text style={styles.resultEmoji}>{won ? '🏆' : '💔'}</Text>
        <Text style={styles.resultText}>{won ? 'VICTORY!' : 'DEFEAT'}</Text>
        {won && <Text style={styles.subtitleText}>🐾 YOU WIN! 🐾</Text>}
      </View>

      {/* Trophy Delta */}
      <View style={styles.trophyRow}>
        <Text style={styles.trophyDelta}>
          🏆 {result.trophyDelta >= 0 ? '+' : ''}{result.trophyDelta}
        </Text>
      </View>

      {/* Rewards Grid */}
      <View style={styles.rewardsCard}>
        <Text style={styles.rewardsTitle}>🐾 YOUR REWARDS 🐾</Text>
        <View style={styles.rewardsGrid}>
          <RewardItem icon="🪙" label="COINS" value={result.coinsEarned.toLocaleString()} color="#FFD700" />
          <RewardItem icon="💎" label="GEMS" value={result.gemsEarned.toString()} color="#AA44FF" />
          <RewardItem icon="🏆" label="TROPHIES" value={`+${result.trophyDelta}`} color="#FFD700" />
          <RewardItem
            icon="📦"
            label="CHEST"
            value={`${Math.round(result.chestProgressAdded * 100)}%`}
            color="#4A9EFF"
          />
          <RewardItem icon="🧩" label="FRAGMENTS" value={`x${result.fragmentsEarned}`} color="#FF6B35" />
        </View>
      </View>

      {/* x2 Reward Ad Button */}
      <TouchableOpacity style={styles.adButton}>
        <Text style={styles.adButtonEmoji}>🎬</Text>
        <View>
          <Text style={styles.adButtonTitle}>X2 REWARDS!</Text>
          <Text style={styles.adButtonSub}>WATCH AD</Text>
        </View>
        <View style={styles.bestValueBadge}>
          <Text style={styles.bestValueText}>BEST VALUE!</Text>
        </View>
      </TouchableOpacity>

      {/* Navigation */}
      <View style={styles.navRow}>
        <TouchableOpacity style={styles.homeBtn} onPress={onHome}>
          <Text style={styles.homeBtnText}>🏠 BACK HOME</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.nextBtn} onPress={onNextBattle}>
          <Text style={styles.nextBtnText}>⚔️ NEXT BATTLE</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function RewardItem({ icon, label, value, color }: {
  icon: string; label: string; value: string; color: string;
}) {
  return (
    <View style={rewardStyles.item}>
      <View style={[rewardStyles.iconBox, { backgroundColor: color + '33', borderColor: color }]}>
        <Text style={rewardStyles.icon}>{icon}</Text>
      </View>
      <Text style={rewardStyles.label}>{label}</Text>
      <Text style={[rewardStyles.value, { color }]}>{value}</Text>
    </View>
  );
}

const rewardStyles = StyleSheet.create({
  item: { alignItems: 'center', width: '18%' },
  iconBox: { width: 52, height: 52, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 24 },
  label: { color: '#AAA', fontSize: 9, fontWeight: '700', marginTop: 4 },
  value: { fontSize: 13, fontWeight: '800', marginTop: 2 },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A1628', paddingHorizontal: 16 },
  banner: { alignItems: 'center', paddingVertical: 20, borderRadius: 16, marginTop: 16 },
  bannerWin: { backgroundColor: '#1A3A1A', borderWidth: 2, borderColor: '#FFD700' },
  bannerLose: { backgroundColor: '#3A1A1A', borderWidth: 2, borderColor: '#FF4422' },
  resultEmoji: { fontSize: 56 },
  resultText: { fontSize: 40, fontWeight: '900', color: '#FFD700', letterSpacing: 4 },
  subtitleText: { color: '#FFF', fontSize: 16, fontWeight: '700', marginTop: 4 },
  trophyRow: { alignItems: 'center', marginVertical: 12 },
  trophyDelta: { fontSize: 28, fontWeight: '900', color: '#FFD700' },
  rewardsCard: {
    backgroundColor: '#1A2E4A', borderRadius: 16, padding: 16, marginBottom: 12,
  },
  rewardsTitle: { color: '#FFF', fontWeight: '800', fontSize: 14, textAlign: 'center', marginBottom: 12 },
  rewardsGrid: { flexDirection: 'row', justifyContent: 'space-around', flexWrap: 'wrap', gap: 8 },
  adButton: {
    backgroundColor: '#F5A623', borderRadius: 16, padding: 16,
    flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16,
  },
  adButtonEmoji: { fontSize: 32 },
  adButtonTitle: { color: '#FFF', fontSize: 20, fontWeight: '900' },
  adButtonSub: { color: '#FFF8', fontSize: 12 },
  bestValueBadge: {
    marginLeft: 'auto', backgroundColor: '#CC2200', borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 4,
  },
  bestValueText: { color: '#FFF', fontSize: 10, fontWeight: '800' },
  navRow: { flexDirection: 'row', gap: 12 },
  homeBtn: {
    flex: 1, backgroundColor: '#4A9EFF', borderRadius: 16, paddingVertical: 16, alignItems: 'center',
  },
  homeBtnText: { color: '#FFF', fontWeight: '800', fontSize: 16 },
  nextBtn: {
    flex: 1, backgroundColor: '#44AA44', borderRadius: 16, paddingVertical: 16, alignItems: 'center',
  },
  nextBtnText: { color: '#FFF', fontWeight: '800', fontSize: 16 },
});
