import React from 'react';
import {
  View, View as SafeAreaView, Text, TouchableOpacity, StyleSheet,
  StatusBar, ImageBackground,
} from 'react-native';
import { useSaveStore } from '../store/saveStore';
import { getDog } from '../data/dogs';

const HOME_BG = require('../../assets/backgrounds/home_bg.png');

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

  const chestPct = Math.round((save.data.chestProgress ?? 0) * 100);

  return (
    <ImageBackground source={HOME_BG} style={styles.bg} resizeMode="cover">
      <View style={styles.overlay} />
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />

        {/* ── Top Bar ── */}
        <View style={styles.topBar}>
          <View style={styles.playerInfo}>
            <View style={styles.avatarBubble}>
              <Text style={styles.avatarEmoji}>{dog?.emoji ?? '🐾'}</Text>
            </View>
            <View>
              <Text style={styles.playerName}>{save.data.playerName}</Text>
              <Text style={styles.trophies}>🏆 {save.data.trophies}</Text>
            </View>
          </View>
          <View style={styles.currencies}>
            <View style={styles.currencyPill}>
              <Text style={styles.currencyText}>🪙 {save.data.coins.toLocaleString()}</Text>
            </View>
            <View style={[styles.currencyPill, styles.gemPill]}>
              <Text style={styles.currencyText}>💎 {save.data.gems}</Text>
            </View>
          </View>
        </View>

        {/* ── Logo ── */}
        <View style={styles.logoWrap}>
          <Text style={styles.logoTop}>BARK</Text>
          <Text style={styles.logoBattle}>BATTLE</Text>
          <View style={styles.dogDuelBadge}>
            <Text style={styles.dogDuelText}>🐾 DOG DUEL 🐾</Text>
          </View>
        </View>

        {/* ── Middle row: left cards | dog | right cards ── */}
        <View style={styles.midRow}>
          {/* Left */}
          <View style={styles.sideCol}>
            <TouchableOpacity style={styles.card}>
              <Text style={styles.cardIcon}>📋</Text>
              <Text style={styles.cardLabel}>MISSIONS</Text>
            </TouchableOpacity>
            <View style={styles.card}>
              <Text style={styles.cardSmallLabel}>RANK</Text>
              <Text style={styles.rankText}>{league}</Text>
              <Text style={{ fontSize: 12 }}>⭐⭐⭐</Text>
            </View>
          </View>

          {/* Center — dog */}
          <View style={styles.dogCol}>
            <Text style={styles.dogEmoji}>{dog?.emoji ?? '🐾'}</Text>
            <View style={styles.dogNameBadge}>
              <Text style={styles.dogNameText}>🐾 {dog?.name ?? 'Choose a dog'}</Text>
            </View>
          </View>

          {/* Right */}
          <View style={styles.sideCol}>
            <TouchableOpacity
              style={[styles.card, dailyAvailable && styles.cardGold]}
              onPress={handleDailyReward}
              disabled={!dailyAvailable}
            >
              <Text style={styles.cardSmallLabel}>DAILY REWARD</Text>
              <Text style={styles.cardIcon}>🎁</Text>
              <View style={[styles.claimBtn, !dailyAvailable && styles.claimBtnDone]}>
                <Text style={styles.claimBtnText}>{dailyAvailable ? 'CLAIM' : 'CLAIMED'}</Text>
              </View>
            </TouchableOpacity>
            <View style={styles.card}>
              <Text style={styles.cardSmallLabel}>NEXT CHEST</Text>
              <Text style={styles.cardIcon}>📦</Text>
              <View style={styles.chestBar}>
                <View style={[styles.chestFill, { width: `${chestPct}%` as any }]} />
              </View>
              <Text style={styles.chestPct}>{chestPct}%</Text>
            </View>
          </View>
        </View>

        {/* ── PLAY button ── */}
        <TouchableOpacity style={styles.playBtn} onPress={onPlay} activeOpacity={0.85}>
          <Text style={styles.playText}>▶  PLAY 🦴</Text>
        </TouchableOpacity>

        {/* ── Bottom Nav ── */}
        <View style={styles.bottomNav}>
          {[
            { label: 'DOGS',    icon: '🐕',  color: '#2255CC', onPress: onDogs },
            { label: 'SHOP',    icon: '🛍️',  color: '#22992A', onPress: onShop },
            { label: 'LEAGUES', icon: '🏆',  color: '#8833BB', onPress: () => {} },
            { label: 'EVENTS',  icon: '📅',  color: '#CC3311', onPress: () => {} },
          ].map(item => (
            <TouchableOpacity
              key={item.label}
              style={[styles.navBtn, { backgroundColor: item.color }]}
              onPress={item.onPress}
            >
              <Text style={styles.navIcon}>{item.icon}</Text>
              <Text style={styles.navLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const GLASS = 'rgba(8, 18, 40, 0.80)';

const styles = StyleSheet.create({
  bg: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(4, 10, 24, 0.30)' },
  container: { flex: 1 },

  // Top bar
  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 12, paddingTop: 10, paddingBottom: 8,
    backgroundColor: GLASS,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  playerInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avatarBubble: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: 'rgba(74,158,255,0.25)', borderWidth: 2, borderColor: '#4A9EFF',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarEmoji: { fontSize: 24 },
  playerName: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  trophies: { color: '#FFD700', fontSize: 11, fontWeight: '700' },
  currencies: { flexDirection: 'row', gap: 6 },
  currencyPill: {
    backgroundColor: 'rgba(20,50,20,0.95)', borderRadius: 16,
    paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: 'rgba(255,215,0,0.3)',
  },
  gemPill: { backgroundColor: 'rgba(100,40,170,0.95)', borderColor: 'rgba(180,80,255,0.4)' },
  currencyText: { color: '#FFF', fontWeight: '700', fontSize: 12 },

  // Logo
  logoWrap: { alignItems: 'center', paddingTop: 8, paddingBottom: 4 },
  logoTop: {
    fontSize: 50, fontWeight: '900', color: '#FFD700', letterSpacing: 6,
    textShadowColor: '#000', textShadowOffset: { width: 0, height: 3 }, textShadowRadius: 8,
  },
  logoBattle: {
    fontSize: 44, fontWeight: '900', color: '#4A9EFF', letterSpacing: 6, marginTop: -14,
    textShadowColor: '#000', textShadowOffset: { width: 0, height: 3 }, textShadowRadius: 8,
  },
  dogDuelBadge: {
    backgroundColor: '#CC2200', borderRadius: 6,
    paddingHorizontal: 20, paddingVertical: 4, marginTop: 4,
    shadowColor: '#CC2200', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.8, shadowRadius: 6,
    elevation: 6,
  },
  dogDuelText: { color: '#FFF', fontWeight: '800', fontSize: 14, letterSpacing: 2 },

  // Middle row
  midRow: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, gap: 6 },

  sideCol: { width: 88, gap: 8 },
  card: {
    backgroundColor: GLASS, borderRadius: 14, padding: 8, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)',
  },
  cardGold: { borderColor: '#FFD700', borderWidth: 1.5 },
  cardIcon: { fontSize: 26, marginVertical: 2 },
  cardLabel: { color: '#FFF', fontSize: 10, fontWeight: '700', marginTop: 4 },
  cardSmallLabel: { color: '#AAA', fontSize: 9, fontWeight: '700', marginBottom: 2 },
  rankText: { color: '#FFD700', fontWeight: '900', fontSize: 12, marginVertical: 2 },
  claimBtn: { backgroundColor: '#44AA44', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3, marginTop: 4 },
  claimBtnDone: { backgroundColor: '#555' },
  claimBtnText: { color: '#FFF', fontWeight: '700', fontSize: 10 },
  chestBar: { width: '100%', height: 5, backgroundColor: '#1A2E4A', borderRadius: 3, overflow: 'hidden', marginTop: 4 },
  chestFill: { height: '100%', backgroundColor: '#4A9EFF', borderRadius: 3 },
  chestPct: { color: '#4A9EFF', fontSize: 9, fontWeight: '700', marginTop: 2 },

  dogCol: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  dogEmoji: { fontSize: 120 },
  dogNameBadge: {
    backgroundColor: 'rgba(200,120,32,0.92)', borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 5, marginTop: 4,
    borderWidth: 1, borderColor: 'rgba(255,200,100,0.4)',
  },
  dogNameText: { color: '#FFF', fontWeight: '700', fontSize: 14 },

  // Play button
  playBtn: {
    backgroundColor: '#F5A623', marginHorizontal: 20, marginBottom: 10, borderRadius: 36,
    paddingVertical: 18, alignItems: 'center',
    shadowColor: '#F5A623', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.8, shadowRadius: 14,
    elevation: 10,
    borderWidth: 2, borderColor: 'rgba(255,240,160,0.5)',
  },
  playText: { fontSize: 28, fontWeight: '900', color: '#FFF', letterSpacing: 3 },

  // Bottom nav
  bottomNav: {
    flexDirection: 'row', gap: 8, paddingHorizontal: 12, paddingBottom: 12, paddingTop: 4,
    backgroundColor: GLASS,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)',
  },
  navBtn: {
    flex: 1, borderRadius: 14, paddingVertical: 10, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 4,
    elevation: 4,
  },
  navIcon: { fontSize: 22 },
  navLabel: { color: '#FFF', fontSize: 10, fontWeight: '800', marginTop: 2 },
});
