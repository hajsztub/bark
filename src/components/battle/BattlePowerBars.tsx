import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  playerConfPct: number;
  botConfPct: number;
  wavePosition: number; // -100 to +100
  playerColor: string;
}

export default function BattlePowerBars({ playerConfPct, botConfPct, wavePosition, playerColor }: Props) {
  // Tug fill: 50% neutral, shift ±35% based on wave
  const tugPlayerFlex = 50 + (wavePosition / 100) * 35;
  const tugBotFlex    = 100 - tugPlayerFlex;

  return (
    <View style={styles.wrapper}>
      {/* Power bars row */}
      <View style={styles.barsRow}>
        {/* Player bar */}
        <View style={styles.barSection}>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${playerConfPct}%`, backgroundColor: playerColor }]} />
            <Text style={styles.pct}>{playerConfPct}%</Text>
          </View>
          <Text style={[styles.label, { color: playerColor }]}>BARK POWER</Text>
        </View>

        {/* VS — swap with a graphic here */}
        <View style={styles.vsBox}>
          <Text style={styles.vs}>VS</Text>
        </View>

        {/* Bot bar (mirrored fill direction) */}
        <View style={[styles.barSection, { alignItems: 'flex-end' }]}>
          <View style={[styles.track, { transform: [{ scaleX: -1 }] }]}>
            <View style={[styles.fill, { width: `${botConfPct}%`, backgroundColor: '#BB2200' }]} />
            <Text style={[styles.pct, { transform: [{ scaleX: -1 }] }]}>{botConfPct}%</Text>
          </View>
          <Text style={[styles.label, { color: '#FF4422' }]}>BARK POWER</Text>
        </View>
      </View>

      {/* Tug-of-war bar — swap whole View for an image/animated sprite */}
      <View style={styles.tugRow}>
        <View style={[styles.tugFill, { flex: tugPlayerFlex, backgroundColor: playerColor }]} />
        <View style={[styles.tugFill, { flex: tugBotFlex, backgroundColor: '#BB2200' }]} />
        {/* Center dot — swap with a paw-print icon */}
        <View style={styles.tugDot} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { backgroundColor: 'rgba(6,14,34,0.85)', paddingBottom: 2 },

  barsRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingTop: 4, gap: 6 },
  barSection: { flex: 1 },
  track: {
    height: 18, backgroundColor: 'rgba(255,255,255,0.10)', borderRadius: 9,
    overflow: 'hidden', justifyContent: 'center',
  },
  fill:  { position: 'absolute', top: 0, left: 0, bottom: 0, borderRadius: 9 },
  pct:   { color: '#FFF', fontSize: 11, fontWeight: '900', textAlign: 'center', zIndex: 1 },
  label: { fontSize: 8, fontWeight: '800', marginTop: 2 },

  vsBox: { paddingHorizontal: 4 },
  vs: {
    color: '#FFD700', fontSize: 20, fontWeight: '900',
    textShadowColor: '#AA7700', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3,
  },

  tugRow: {
    flexDirection: 'row', height: 6, marginHorizontal: 8, marginTop: 4,
    borderRadius: 3, overflow: 'hidden', position: 'relative',
  },
  tugFill: {},
  tugDot: {
    position: 'absolute', top: -3, left: '50%', marginLeft: -5,
    width: 10, height: 10, borderRadius: 5, backgroundColor: '#FFD700',
    shadowColor: '#FFD700', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 4, elevation: 4,
  },
});
