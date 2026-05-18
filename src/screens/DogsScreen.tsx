import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DOGS } from '../data/dogs';
import { useSaveStore } from '../store/saveStore';
import type { Dog } from '../types';

interface Props {
  onBack: () => void;
}

const RARITY_COLORS: Record<string, string> = {
  Common: '#AAA', Uncommon: '#44DD44', Rare: '#4488FF', Epic: '#AA44FF', Legendary: '#FFD700',
};

const UPGRADE_COSTS = [500, 1000, 1500, 2000, 2500, 3000, 4000, 5000, 6000, 7500, 10000, 12500, 15000, 20000];

export default function DogsScreen({ onBack }: Props) {
  const save = useSaveStore();
  const [selectedDog, setSelectedDog] = useState<Dog>(
    DOGS.find(d => d.id === save.data.selectedDogId) ?? DOGS[0]
  );

  const level = save.getDogLevel(selectedDog.id);
  const isUnlocked = save.data.unlockedDogs.includes(selectedDog.id);
  const isSelected = save.data.selectedDogId === selectedDog.id;
  const isMaxLevel = level >= selectedDog.maxLevel;
  const upgradeCost = isMaxLevel ? 0 : (UPGRADE_COSTS[level - 1] ?? 500);
  const canAfford = save.data.coins >= upgradeCost;

  const handleUpgrade = () => {
    if (!canAfford || isMaxLevel) return;
    save.spendCoins(upgradeCost);
    save.setDogLevel(selectedDog.id, level + 1);
  };

  const handleSelect = () => {
    if (!isUnlocked) return;
    save.data.selectedDogId = selectedDog.id;
    save.save();
  };

  const statScale = 1 + (level - 1) * 0.1;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>DOG COLLECTION</Text>
        <View style={styles.currencies}>
          <Text style={styles.coinText}>🪙 {save.data.coins.toLocaleString()}</Text>
          <Text style={styles.gemText}>💎 {save.data.gems}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Selected Dog Info */}
        <View style={styles.selectedCard}>
          {/* Rarity badge */}
          <View style={[styles.rarityBadge, { backgroundColor: RARITY_COLORS[selectedDog.rarity] + '33' }]}>
            <Text style={[styles.rarityText, { color: RARITY_COLORS[selectedDog.rarity] }]}>
              {selectedDog.name.toUpperCase()}
            </Text>
            <Text style={[styles.rarityLabel, { color: RARITY_COLORS[selectedDog.rarity] }]}>
              {selectedDog.rarity.toUpperCase()}
            </Text>
          </View>

          {/* Dog Display */}
          <Text style={styles.dogEmoji}>{selectedDog.emoji}</Text>
          <Text style={styles.levelBadge}>LEVEL {level}</Text>

          {/* Stats */}
          <View style={styles.statsPanel}>
            <StatRow label="BARK POWER" icon="🐾"
              value={Math.round(selectedDog.stats.barkPower * statScale * 100 + 200)}
              color="#FF4422" max={1000} />
            <StatRow label="STAMINA" icon="⚡"
              value={Math.round(selectedDog.stats.stamina * statScale * 100 + 80)}
              color="#4A9EFF" max={1000} />
            <StatRow label="FOCUS" icon="🎯"
              value={Math.round(selectedDog.stats.focus * statScale * 100 - 80)}
              color="#44BB44" max={1000} />
          </View>

          {/* Upgrade Button */}
          {!isMaxLevel ? (
            <TouchableOpacity
              style={[styles.upgradeBtn, !canAfford && styles.upgradeBtnDisabled]}
              onPress={handleUpgrade}
              disabled={!canAfford}
            >
              <Text style={styles.upgradeBtnText}>🪙 {upgradeCost.toLocaleString()}  UPGRADE</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.maxBadge}><Text style={styles.maxText}>✨ MAX LEVEL</Text></View>
          )}

          {/* Select Button */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.equipSkinBtn}>
              <Text style={styles.equipSkinText}>👔 EQUIP SKIN</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.selectBtn, isSelected && styles.selectedBtn]}
              onPress={handleSelect}
              disabled={!isUnlocked}
            >
              <Text style={styles.selectBtnText}>{isSelected ? 'SELECTED ✓' : 'SELECT'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Dog Grid */}
        <View style={styles.dogGrid}>
          {DOGS.map(dog => {
            const unlocked = save.data.unlockedDogs.includes(dog.id);
            const dogLevel = save.getDogLevel(dog.id);
            const isMax = dogLevel >= dog.maxLevel;
            const frags = save.data.dogFragments[dog.id] ?? 0;
            const rarityColor = RARITY_COLORS[dog.rarity];

            return (
              <TouchableOpacity
                key={dog.id}
                style={[
                  styles.dogCard,
                  { borderColor: rarityColor },
                  selectedDog.id === dog.id && styles.dogCardSelected,
                ]}
                onPress={() => setSelectedDog(dog)}
              >
                <View style={[styles.dogCardRarity, { backgroundColor: rarityColor + '33' }]}>
                  <Text style={[styles.dogCardRarityText, { color: rarityColor }]}>{dog.rarity.toUpperCase()}</Text>
                </View>
                <Text style={styles.dogCardEmoji}>{dog.emoji}</Text>
                <Text style={styles.dogCardName}>{dog.name.toUpperCase()}</Text>
                {unlocked ? (
                  <View style={[styles.levelTag, isMax && styles.maxTag]}>
                    <Text style={styles.levelTagText}>{isMax ? 'MAX' : dogLevel}</Text>
                  </View>
                ) : (
                  <View style={styles.fragmentsTag}>
                    <Text style={styles.fragmentsText}>
                      💎 {frags}/{dog.fragmentsRequired}
                    </Text>
                  </View>
                )}
                {!unlocked && <View style={styles.lockOverlay}><Text style={styles.lockIcon}>🔒</Text></View>}
                {selectedDog.id === dog.id && dog.id === save.data.selectedDogId && (
                  <View style={styles.checkmark}><Text>✓</Text></View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatRow({ label, icon, value, color, max }: {
  label: string; icon: string; value: number; color: string; max: number;
}) {
  const pct = Math.min(1, value / max);
  return (
    <View style={statStyles.row}>
      <Text style={statStyles.icon}>{icon}</Text>
      <Text style={statStyles.label}>{label}</Text>
      <View style={statStyles.track}>
        <View style={[statStyles.fill, { width: `${pct * 100}%`, backgroundColor: color }]} />
      </View>
      <Text style={[statStyles.value, { color }]}>{value}</Text>
    </View>
  );
}

const statStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  icon: { fontSize: 16, width: 20 },
  label: { color: '#FFF', fontSize: 11, fontWeight: '700', width: 80 },
  track: { flex: 1, height: 8, backgroundColor: '#0A1628', borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4 },
  value: { fontSize: 13, fontWeight: '800', width: 40, textAlign: 'right' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A1628' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 12, borderBottomWidth: 1, borderBottomColor: '#1A2E4A',
  },
  backBtn: { padding: 8 },
  backText: { color: '#FFF', fontSize: 24 },
  title: { color: '#FFF', fontWeight: '900', fontSize: 16 },
  currencies: { flexDirection: 'row', gap: 8 },
  coinText: { color: '#FFD700', fontWeight: '700' },
  gemText: { color: '#AA44FF', fontWeight: '700' },
  content: { padding: 12 },
  selectedCard: {
    backgroundColor: '#1A2E4A', borderRadius: 16, padding: 16, marginBottom: 16, alignItems: 'center',
  },
  rarityBadge: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4, marginBottom: 8 },
  rarityText: { fontSize: 16, fontWeight: '900' },
  rarityLabel: { fontSize: 12, fontWeight: '700', textAlign: 'center' },
  dogEmoji: { fontSize: 96 },
  levelBadge: {
    backgroundColor: '#4A9EFF', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4,
    color: '#FFF', fontWeight: '800', fontSize: 13, marginTop: 4,
  },
  statsPanel: { width: '100%', marginTop: 12 },
  upgradeBtn: {
    backgroundColor: '#44AA44', borderRadius: 16, paddingVertical: 14, paddingHorizontal: 24,
    marginTop: 12, width: '100%', alignItems: 'center',
  },
  upgradeBtnDisabled: { backgroundColor: '#555' },
  upgradeBtnText: { color: '#FFF', fontWeight: '800', fontSize: 15 },
  maxBadge: { backgroundColor: '#FFD700' + '33', borderRadius: 12, padding: 8, marginTop: 8 },
  maxText: { color: '#FFD700', fontWeight: '800' },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 8, width: '100%' },
  equipSkinBtn: {
    flex: 1, backgroundColor: '#4A9EFF', borderRadius: 12, paddingVertical: 12, alignItems: 'center',
  },
  equipSkinText: { color: '#FFF', fontWeight: '700' },
  selectBtn: {
    flex: 1, backgroundColor: '#555', borderRadius: 12, paddingVertical: 12, alignItems: 'center',
  },
  selectedBtn: { backgroundColor: '#44AA44' },
  selectBtnText: { color: '#FFF', fontWeight: '700' },
  dogGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  dogCard: {
    width: '22%', backgroundColor: '#1A2E4A', borderRadius: 12, borderWidth: 2,
    padding: 6, alignItems: 'center', position: 'relative', overflow: 'hidden',
  },
  dogCardSelected: { borderWidth: 3 },
  dogCardRarity: { borderRadius: 4, paddingHorizontal: 4, paddingVertical: 2, marginBottom: 4 },
  dogCardRarityText: { fontSize: 8, fontWeight: '700' },
  dogCardEmoji: { fontSize: 36 },
  dogCardName: { color: '#FFF', fontSize: 9, fontWeight: '700', textAlign: 'center', marginTop: 2 },
  levelTag: {
    backgroundColor: '#4A9EFF', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2, marginTop: 4,
  },
  maxTag: { backgroundColor: '#FFD700' },
  levelTagText: { color: '#FFF', fontSize: 10, fontWeight: '800' },
  fragmentsTag: { marginTop: 4 },
  fragmentsText: { color: '#AA44FF', fontSize: 9, fontWeight: '700' },
  lockOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center',
    borderRadius: 10,
  },
  lockIcon: { fontSize: 24 },
  checkmark: {
    position: 'absolute', top: 4, right: 4, backgroundColor: '#44AA44',
    borderRadius: 8, width: 16, height: 16, alignItems: 'center', justifyContent: 'center',
  },
});
