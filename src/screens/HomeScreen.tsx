import React from 'react';
import {
  View, View as SafeAreaView, Text, TouchableOpacity, StyleSheet,
  StatusBar, ImageBackground,
} from 'react-native';
import { useSaveStore } from '../store/saveStore';
import { getDog } from '../data/dogs';

// Drop assets/backgrounds/home_bg.png into the repo, then replace null with:
// require('../../assets/backgrounds/home_bg.png')
const HOME_BG: any = null;

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

  const inner = (
    <SafeAreaView style={styles.inner}>
      <StatusBar barStyle="light-content" />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.playerInfo}>
          <View style={styles.avatarBubble}>
            <Text style={styles.dogEmoji}>{dog?.emoji ?? '🐾'}</Text>
          </View>
          <View style={styles.playerTexts}>
            <Text style={styles.playerName}>{save.data.playerName}</Text>
            <Text style={styles.trophies}>🏆 {save.data.trophies}</Text>
          </View>
        </View>
        <View style={styles.currencies}>
          <View style={styles.currencyPill}>
            <Text style={styles.currencyText}>🪙 {save.data.coins.toLocaleString()}</Text>
          </View>
          <View style={[styles.currencyPill, styles.currencyGem]}>
            <Text style={styles.currencyText}>💎 {save.data.gems}</Text>
          </View>
        </View>
      </View>

      {/* Logo */}
      <View style={styles.logoArea}>
        <View style={styles.logoBg}>
          <Text style={styles.logoTop}>BARK</Text>
          <Text style={styles.logoBattle}>BATTLE</Text>
        </View>
        <View style={styles.logoDogDuel}>
          <Text style={styles.logoDogDuelText}>🐾 DOG DUEL 🐾</Text>
        </View>
      </View>

      {/* Dog Display */}
      <View style={styles.dogDisplay}>
        <Text style={styles.dogBig}>{dog?.emoji ?? '🐾'}</Text>
        <View style={styles.dogNameBubble}>
          <Text style={styles.dogName}>🐾 {dog?.name ?? 'Choose a dog'}</Text>
        </View>
      </View>

      {/* Play Button */}
      <TouchableOpacity style={styles.playButton} onPress={onPlay} activeOpacity={0.85}>
        <Text style={styles.playText}>▶  PLAY</Text>
      </TouchableOpacity>

      {/* Side Cards */}
      <View style={styles.sideCards}>
        <TouchableOpacity style={styles.sideCard}>
          <Text style={styles.sideCardIcon}>📋</Text>
          <Text style={styles.sideCardText}>MISSIONS</Text>
        </TouchableOpacity>
        <View style={styles.sideRight}>
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

  if (HOME_BG) {
    return (
      <ImageBackground source={HOME_BG} style={styles.bg} resizeMode="cover">
        <View style={styles.overlay} />
        {inner}
      </ImageBackground>
    );
  }

  return <View style={styles.fallback}>{inner}</View>;
}

const GLASS = 'rgba(8, 18, 36, 0.78)';
const GLASS_LIGHT = 'rgba(8, 18, 36, 0.65)';

const styles = StyleSheet.create({
  bg: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5, 12, 28, 0.35)',
  },
  fallback: { flex: 1, backgroundColor: '#0A1628' },
  inner: { flex: 1 },

  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 12, paddingTop: 10, paddingBottom: 8,
    backgroundColor: GLASS,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  playerInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avatarBubble: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(74, 158, 255, 0.25)',
    borderWidth: 2, borderColor: '#4A9EFF',
    alignItems: 'center', justifyContent: 'center',
  },
  dogEmoji: { fontSize: 26 },
  playerTexts: {},
  playerName: { color: '#FFF', fontWeight: '700', fontSize: 14, textShadowColor: '#000', textShadowRadius: 4 },
  trophies: { color: '#FFD700', fontSize: 12, fontWeight: '700' },
  currencies: { flexDirection: 'row', gap: 6 },
  currencyPill: {
    backgroundColor: 'rgba(26, 58, 26, 0.9)', borderRadius: 16,
    paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: 'rgba(255,215,0,0.3)',
  },
  currencyGem: {
    backgroundColor: 'rgba(107, 53, 192, 0.9)',
    borderColor: 'rgba(170,68,255,0.4)',
  },
  currencyText: { color: '#FFF', fontWeight: '700', fontSize: 13 },

  logoArea: { alignItems: 'center', marginTop: 10 },
  logoBg: {
    alignItems: 'center',
    backgroundColor: 'rgba(5, 12, 28, 0.55)',
    borderRadius: 16, paddingHorizontal: 24, paddingVertical: 4,
    borderWidth: 1, borderColor: 'rgba(255,215,0,0.2)',
  },
  logoTop: {
    fontSize: 52, fontWeight: '900', color: '#FFD700', letterSpacing: 6,
    textShadowColor: '#000', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 8,
  },
  logoBattle: {
    fontSize: 46, fontWeight: '900', color: '#4A9EFF', letterSpacing: 6, marginTop: -12,
    textShadowColor: '#000', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 8,
  },
  logoDogDuel: {
    backgroundColor: '#CC2200', borderRadius: 6,
    paddingHorizontal: 20, paddingVertical: 5, marginTop: 6,
    shadowColor: '#CC2200', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.7, shadowRadius: 6,
    elevation: 6,
  },
  logoDogDuelText: { color: '#FFF', fontWeight: '800', fontSize: 15, letterSpacing: 2 },

  dogDisplay: { alignItems: 'center', flex: 1, justifyContent: 'center', marginTop: -8 },
  dogBig: { fontSize: 110 },
  dogNameBubble: {
    backgroundColor: 'rgba(200, 120, 32, 0.92)', borderRadius: 20,
    paddingHorizontal: 18, paddingVertical: 5, marginTop: 4,
    borderWidth: 1, borderColor: 'rgba(255,200,100,0.4)',
  },
  dogName: { color: '#FFF', fontWeight: '700', fontSize: 16 },

  playButton: {
    backgroundColor: '#F5A623', marginHorizontal: 24, marginBottom: 10, borderRadius: 36,
    paddingVertical: 20, alignItems: 'center',
    shadowColor: '#F5A623', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.7, shadowRadius: 12,
    elevation: 10,
    borderWidth: 2, borderColor: 'rgba(255,240,180,0.5)',
  },
  playText: { fontSize: 30, fontWeight: '900', color: '#FFF', letterSpacing: 3 },

  sideCards: {
    flexDirection: 'row', paddingHorizontal: 12, marginBottom: 8, gap: 8,
  },
  sideCard: {
    backgroundColor: GLASS, borderRadius: 14, padding: 12, alignItems: 'center', width: 80,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  sideCardIcon: { fontSize: 24 },
  sideCardText: { color: '#FFF', fontSize: 10, fontWeight: '700', marginTop: 4 },
  sideRight: { flex: 1, gap: 8 },
  rewardCard: {
    backgroundColor: GLASS_LIGHT, borderRadius: 14, padding: 10, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  rewardCardActive: { borderColor: '#FFD700', borderWidth: 1.5 },
  rewardCardTitle: { color: '#CCC', fontSize: 10, fontWeight: '700' },
  rewardCardIcon: { fontSize: 28, marginVertical: 2 },
  claimBtn: { backgroundColor: '#44AA44', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 4 },
  claimBtnDisabled: { backgroundColor: '#555' },
  claimBtnText: { color: '#FFF', fontWeight: '700', fontSize: 12 },
  leagueCard: {
    backgroundColor: GLASS_LIGHT, borderRadius: 14, padding: 10, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  leagueTitle: { color: '#CCC', fontSize: 10, fontWeight: '700' },
  leagueName: { color: '#FFD700', fontWeight: '800', fontSize: 13, marginTop: 2 },

  bottomNav: {
    flexDirection: 'row',
    backgroundColor: GLASS,
    paddingVertical: 8,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)',
  },
  navItem: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  navIcon: { fontSize: 24 },
  navLabel: { color: '#DDD', fontSize: 10, fontWeight: '700', marginTop: 2 },
});
