import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  StatusBar, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSaveStore } from '../store/saveStore';
import { getDog } from '../data/dogs';
import { COLORS, FONTS } from '../utils/theme';

interface Props {
  onPlay: () => void;
  onDogs: () => void;
  onShop: () => void;
}

export default function HomeScreen({ onPlay, onDogs, onShop }: Props) {
  const save = useSaveStore();
  const dog = getDog(save.data.selectedDogId);
  const league = save.getLeagueName();
  const dailyAvailable = save.isDailyRewardAvailable();

  const handleDailyReward = () => {
    if (!dailyAvailable) return;
    save.claimDailyReward();
    save.addCoins(500);
    save.addGems(20);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.playerInfo}>
          <Text style={styles.dogEmoji}>{dog?.emoji ?? '🐾'}</Text>
          <View>
            <Text style={styles.playerName}>{save.data.playerName}</Text>
            <Text style={styles.trophies}>🏆 {save.data.trophies}</Text>
          </View>
        </View>
        <View style={styles.currencies}>
          <View style={styles.currencyPill}>
            <Text style={styles.currencyText}>🪙 {save.data.coins.toLocaleString()}</Text>
          </View>
          <View style={[styles.currencyPill, { backgroundColor: '#6B35C0' }]}>
            <Text style={styles.currencyText}>💎 {save.data.gems}</Text>
          </View>
        </View>
      </View>

      {/* Logo */}
      <View style={styles.logoArea}>
        <Text style={styles.logoTop}>BARK</Text>
        <Text style={styles.logoBattle}>BATTLE</Text>
        <View style={styles.logoDogDuel}>
          <Text style={styles.logoDogDuelText}>🐾 DOG DUEL 🐾</Text>
        </View>
      </View>

      {/* Dog Display */}
      <View style={styles.dogDisplay}>
        <Text style={styles.dogBig}>{dog?.emoji ?? '🐾'}</Text>
        <Text style={styles.dogName}>🐾 {dog?.name ?? 'Choose a dog'}</Text>
      </View>

      {/* Play Button */}
      <TouchableOpacity style={styles.playButton} onPress={onPlay} activeOpacity={0.85}>
        <Text style={styles.playText}>PLAY 🦴</Text>
      </TouchableOpacity>

      {/* Side Cards */}
      <View style={styles.sideCards}>
        <TouchableOpacity style={styles.sideCard}>
          <Text style={styles.sideCardIcon}>📋</Text>
          <Text style={styles.sideCardText}>MISSIONS</Text>
        </TouchableOpacity>
        <View style={styles.sideRight}>
          {/* Daily Reward */}
          <TouchableOpacity
            style={[styles.rewardCard, dailyAvailable && styles.rewardCardActive]}
            onPress={handleDailyReward}
            disabled={!dailyAvailable}
          >
            <Text style={styles.rewardCardTitle}>DAILY REWARD</Text>
            <Text style={styles.rewardCardIcon}>🎁</Text>
            <View style={[styles.claimBtn, !dailyAvailable && styles.claimBtnDisabled]}>
              <Text style={styles.claimBtnText}>{dailyAvailable ? 'CLAIM' : 'CLAIMED'}</Text>
            </View>
          </TouchableOpacity>
          {/* League */}
          <View style={styles.leagueCard}>
            <Text style={styles.leagueTitle}>RANK</Text>
            <Text style={styles.leagueName}>{league}</Text>
            <Text>⭐⭐⭐</Text>
          </View>
        </View>
      </View>

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        {[
          { label: 'DOGS', icon: '🐕', onPress: onDogs },
          { label: 'SHOP', icon: '🛍️', onPress: onShop },
          { label: 'LEAGUES', icon: '🏆', onPress: () => {} },
          { label: 'EVENTS', icon: '📅', onPress: () => {} },
        ].map(item => (
          <TouchableOpacity key={item.label} style={styles.navItem} onPress={item.onPress}>
            <Text style={styles.navIcon}>{item.icon}</Text>
            <Text style={styles.navLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A1628' },
  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 8,
  },
  playerInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dogEmoji: { fontSize: 36, backgroundColor: '#1A2E4A', borderRadius: 20, padding: 4 },
  playerName: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  trophies: { color: '#FFD700', fontSize: 12 },
  currencies: { flexDirection: 'row', gap: 8 },
  currencyPill: {
    backgroundColor: '#1A3A1A', borderRadius: 16, paddingHorizontal: 10, paddingVertical: 4,
  },
  currencyText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
  logoArea: { alignItems: 'center', marginTop: 8 },
  logoTop: { fontSize: 48, fontWeight: '900', color: '#FFD700', letterSpacing: 4 },
  logoBattle: { fontSize: 52, fontWeight: '900', color: '#4A9EFF', letterSpacing: 6, marginTop: -10 },
  logoDogDuel: {
    backgroundColor: '#CC2200', borderRadius: 4, paddingHorizontal: 20, paddingVertical: 4, marginTop: 4,
  },
  logoDogDuelText: { color: '#FFF', fontWeight: '800', fontSize: 16, letterSpacing: 2 },
  dogDisplay: { alignItems: 'center', marginTop: 8 },
  dogBig: { fontSize: 100 },
  dogName: {
    backgroundColor: '#C87820', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 4,
    color: '#FFF', fontWeight: '700', fontSize: 16, marginTop: 4,
  },
  playButton: {
    backgroundColor: '#F5A623', marginHorizontal: 32, marginTop: 12, borderRadius: 36,
    paddingVertical: 18, alignItems: 'center',
    shadowColor: '#F5A623', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 8,
    elevation: 8,
  },
  playText: { fontSize: 28, fontWeight: '900', color: '#FFF', letterSpacing: 2 },
  sideCards: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, marginTop: 8, gap: 8 },
  sideCard: {
    backgroundColor: '#1A2E4A', borderRadius: 12, padding: 12, alignItems: 'center', width: 80,
  },
  sideCardIcon: { fontSize: 24 },
  sideCardText: { color: '#FFF', fontSize: 10, fontWeight: '700', marginTop: 4 },
  sideRight: { flex: 1, gap: 8 },
  rewardCard: {
    backgroundColor: '#1A2E4A', borderRadius: 12, padding: 10, alignItems: 'center',
  },
  rewardCardActive: { borderColor: '#FFD700', borderWidth: 1 },
  rewardCardTitle: { color: '#AAA', fontSize: 10, fontWeight: '700' },
  rewardCardIcon: { fontSize: 28, marginVertical: 4 },
  claimBtn: { backgroundColor: '#44AA44', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 4 },
  claimBtnDisabled: { backgroundColor: '#555' },
  claimBtnText: { color: '#FFF', fontWeight: '700', fontSize: 12 },
  leagueCard: {
    backgroundColor: '#1A2E4A', borderRadius: 12, padding: 10, alignItems: 'center',
  },
  leagueTitle: { color: '#AAA', fontSize: 10, fontWeight: '700' },
  leagueName: { color: '#FFD700', fontWeight: '800', fontSize: 13, marginTop: 2 },
  bottomNav: {
    flexDirection: 'row', backgroundColor: '#0D1E33', paddingVertical: 8,
    borderTopWidth: 1, borderTopColor: '#1A2E4A',
  },
  navItem: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  navIcon: { fontSize: 24 },
  navLabel: { color: '#AAA', fontSize: 10, fontWeight: '700', marginTop: 2 },
});
