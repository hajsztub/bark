import React from 'react';
import {
  View, View as SafeAreaView, Text, TouchableOpacity, StyleSheet,
  StatusBar, Image, Dimensions,
} from 'react-native';
import { useSaveStore } from '../store/saveStore';
import { getDog } from '../data/dogs';

const HOME_BG = require('../../assets/backgrounds/home_bg.png');

const { height: SCREEN_H } = Dimensions.get('window');
// Clamp to phone-frame height on web
const H = Math.min(SCREEN_H, 844);

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
  const chestPct = Math.round((save.data.chestProgress ?? 0) * 100);

  const handleDailyReward = () => {
    if (!dailyAvailable) return;
    save.claimDailyReward();
    save.addCoins(500);
    save.addGems(20);
  };

  return (
    <View style={styles.bg}>
      {/* Image anchored to bottom — hides sky, shows park */}
      <Image source={HOME_BG} style={styles.bgImage} resizeMode="cover" />
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
        <View style={styles.logoRow}>
          <View style={styles.logoBg}>
            <Text style={styles.logoTop}>BARK</Text>
            <Text style={styles.logoBattle}>BATTLE</Text>
          </View>
          <View style={styles.dogDuelBadge}>
            <Text style={styles.dogDuelText}>🐾 DOG DUEL 🐾</Text>
          </View>
        </View>

        {/* ── Middle: left cards | dog | right cards ── */}
        <View style={styles.midRow}>

          {/* Left column */}
          <View style={styles.sideCol}>
            <TouchableOpacity style={styles.card}>
              <Text style={styles.cardIcon}>📋</Text>
              <Text style={styles.cardLabel}>MISSIONS</Text>
            </TouchableOpacity>
            <View style={styles.card}>
              <Text style={styles.cardSmall}>RANK</Text>
              <Text style={styles.rankText}>{league}</Text>
              <Text style={{ fontSize: 10 }}>⭐⭐⭐</Text>
            </View>
          </View>

          {/* Dog — fixed size box */}
          <View style={styles.dogBox}>
            <Text style={styles.dogEmoji}>{dog?.emoji ?? '🐾'}</Text>
            <View style={styles.dogNameBadge}>
              <Text style={styles.dogNameText}>🐾 {dog?.name ?? 'Choose a dog'}</Text>
            </View>
          </View>

          {/* Right column */}
          <View style={styles.sideCol}>
            <TouchableOpacity
              style={[styles.card, dailyAvailable && styles.cardGold]}
              onPress={handleDailyReward}
              disabled={!dailyAvailable}
            >
              <Text style={styles.cardSmall}>DAILY REWARD</Text>
              <Text style={styles.cardIcon}>🎁</Text>
              <View style={[styles.claimBtn, !dailyAvailable && styles.claimDone]}>
                <Text style={styles.claimText}>{dailyAvailable ? 'CLAIM' : 'CLAIMED'}</Text>
              </View>
            </TouchableOpacity>
            <View style={styles.card}>
              <Text style={styles.cardSmall}>NEXT CHEST</Text>
              <Text style={styles.cardIcon}>📦</Text>
              <View style={styles.chestTrack}>
                <View style={[styles.chestFill, { width: `${chestPct}%` as any }]} />
              </View>
              <Text style={styles.chestPct}>{chestPct}%</Text>
            </View>
          </View>
        </View>

        {/* ── PLAY ── */}
        <TouchableOpacity style={styles.playBtn} onPress={onPlay} activeOpacity={0.85}>
          <Text style={styles.playText}>▶  PLAY 🦴</Text>
        </TouchableOpacity>

        {/* ── Bottom Nav ── */}
        <View style={styles.bottomNav}>
          {([
            { label: 'DOGS',    icon: '🐕',  color: '#2255CC', onPress: onDogs },
            { label: 'SHOP',    icon: '🛍️',  color: '#229930', onPress: onShop },
            { label: 'LEAGUES', icon: '🏆',  color: '#8833BB', onPress: () => {} },
            { label: 'EVENTS',  icon: '📅',  color: '#CC3311', onPress: () => {} },
          ] as const).map(item => (
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
    </View>
  );
}

const GLASS = 'rgba(6, 14, 34, 0.82)';

const styles = StyleSheet.create({
  bg: { flex: 1, overflow: 'hidden' },
  // Anchor image to bottom so park/arch is visible, sky is cropped at top
  bgImage: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '110%',
  },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(4, 10, 24, 0.28)' },
  container: { flex: 1 },

  /* top bar */
  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 12, paddingTop: 8, paddingBottom: 6,
    backgroundColor: GLASS,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.07)',
  },
  playerInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avatarBubble: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(74,158,255,0.25)', borderWidth: 2, borderColor: '#4A9EFF',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarEmoji: { fontSize: 22 },
  playerName: { color: '#FFF', fontWeight: '700', fontSize: 13 },
  trophies: { color: '#FFD700', fontSize: 11, fontWeight: '700' },
  currencies: { flexDirection: 'row', gap: 6 },
  currencyPill: {
    backgroundColor: 'rgba(20,50,20,0.95)', borderRadius: 14,
    paddingHorizontal: 9, paddingVertical: 3,
    borderWidth: 1, borderColor: 'rgba(255,215,0,0.3)',
  },
  gemPill: { backgroundColor: 'rgba(100,40,170,0.95)', borderColor: 'rgba(180,80,255,0.4)' },
  currencyText: { color: '#FFF', fontWeight: '700', fontSize: 12 },

  /* logo */
  logoRow: { alignItems: 'center', paddingTop: 6, paddingBottom: 2 },
  logoBg: {
    alignItems: 'center',
    backgroundColor: 'rgba(4,10,24,0.55)', borderRadius: 14,
    paddingHorizontal: 20, paddingVertical: 2,
    borderWidth: 1, borderColor: 'rgba(255,215,0,0.15)',
  },
  logoTop: {
    fontSize: 44, fontWeight: '900', color: '#FFD700', letterSpacing: 6,
    textShadowColor: '#000', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 6,
  },
  logoBattle: {
    fontSize: 38, fontWeight: '900', color: '#4A9EFF', letterSpacing: 6, marginTop: -10,
    textShadowColor: '#000', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 6,
  },
  dogDuelBadge: {
    backgroundColor: '#CC2200', borderRadius: 6,
    paddingHorizontal: 18, paddingVertical: 4, marginTop: 4,
    shadowColor: '#CC2200', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.8, shadowRadius: 6,
    elevation: 5,
  },
  dogDuelText: { color: '#FFF', fontWeight: '800', fontSize: 13, letterSpacing: 2 },

  /* middle row */
  midRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    gap: 4,
    minHeight: 240,
  },

  sideCol: { width: 86, gap: 6, alignSelf: 'center' },
  card: {
    backgroundColor: GLASS, borderRadius: 12, padding: 8, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)',
  },
  cardGold: { borderColor: '#FFD700', borderWidth: 1.5 },
  cardIcon: { fontSize: 24, marginVertical: 2 },
  cardLabel: { color: '#FFF', fontSize: 9, fontWeight: '700', marginTop: 2 },
  cardSmall: { color: '#AAA', fontSize: 8, fontWeight: '700', marginBottom: 2 },
  rankText: { color: '#FFD700', fontWeight: '900', fontSize: 11, marginVertical: 1 },
  claimBtn: { backgroundColor: '#44AA44', borderRadius: 7, paddingHorizontal: 8, paddingVertical: 2, marginTop: 3 },
  claimDone: { backgroundColor: '#555' },
  claimText: { color: '#FFF', fontWeight: '700', fontSize: 9 },
  chestTrack: { width: '100%', height: 4, backgroundColor: '#1A2E4A', borderRadius: 2, overflow: 'hidden', marginTop: 3 },
  chestFill: { height: '100%', backgroundColor: '#4A9EFF', borderRadius: 2 },
  chestPct: { color: '#4A9EFF', fontSize: 8, fontWeight: '700', marginTop: 2 },

  /* dog */
  dogBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: H * 0.34,         // ~30% of screen height for the dog area
  },
  dogEmoji: {
    fontSize: H * 0.18,       // scales with screen height
    lineHeight: H * 0.22,
    textAlign: 'center',
  },
  dogNameBadge: {
    backgroundColor: 'rgba(200,120,32,0.92)', borderRadius: 18,
    paddingHorizontal: 14, paddingVertical: 4, marginTop: 6,
    borderWidth: 1, borderColor: 'rgba(255,200,100,0.4)',
  },
  dogNameText: { color: '#FFF', fontWeight: '700', fontSize: 13 },

  /* play button */
  playBtn: {
    backgroundColor: '#F5A623', marginHorizontal: 18, marginBottom: 8, borderRadius: 34,
    paddingVertical: 17, alignItems: 'center',
    shadowColor: '#F5A623', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.8, shadowRadius: 12,
    elevation: 10,
    borderWidth: 2, borderColor: 'rgba(255,240,160,0.5)',
  },
  playText: { fontSize: 26, fontWeight: '900', color: '#FFF', letterSpacing: 3 },

  /* bottom nav */
  bottomNav: {
    flexDirection: 'row', gap: 6, paddingHorizontal: 10, paddingBottom: 10, paddingTop: 4,
    backgroundColor: GLASS,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.07)',
  },
  navBtn: {
    flex: 1, borderRadius: 12, paddingVertical: 9, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 4,
    elevation: 4,
  },
  navIcon: { fontSize: 20 },
  navLabel: { color: '#FFF', fontSize: 9, fontWeight: '800', marginTop: 2 },
});
