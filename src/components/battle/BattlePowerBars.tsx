import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MAX_HP } from '../../game/battle/BattleEngine';

interface Props {
  playerHP:    number;
  botHP:       number;
  superMeter:  number;   // 0-100
  playerColor: string;
}

export default function BattlePowerBars({ playerHP, botHP, superMeter, playerColor }: Props) {
  const playerPct = (playerHP / MAX_HP) * 100;
  const botPct    = (botHP   / MAX_HP) * 100;
  const superPct  = superMeter;

  const playerColor2 = playerPct < 25 ? '#FF4422' : playerPct < 50 ? '#FFB300' : playerColor;
  const botColor     = botPct    < 25 ? '#FF4422' : botPct    < 50 ? '#FFB300' : '#BB2200';

  return (
    <View style={styles.wrapper}>
      {/* HP bars */}
      <View style={styles.hpRow}>
        <View style={styles.hpSection}>
          <View style={styles.hpTrack}>
            <View style={[styles.hpFill, { width: `${playerPct}%` as any, backgroundColor: playerColor2 }]} />
            <Text style={styles.hpNum}>{Math.ceil(playerHP)}</Text>
          </View>
          <Text style={[styles.hpLabel, { color: playerColor }]}>❤️ HP</Text>
        </View>

        <View style={styles.vsBox}>
          <Text style={styles.vs}>VS</Text>
        </View>

        <View style={[styles.hpSection, { alignItems: 'flex-end' }]}>
          <View style={[styles.hpTrack, { transform: [{ scaleX: -1 }] }]}>
            <View style={[styles.hpFill, { width: `${botPct}%` as any, backgroundColor: botColor }]} />
            <Text style={[styles.hpNum, { transform: [{ scaleX: -1 }] }]}>{Math.ceil(botHP)}</Text>
          </View>
          <Text style={[styles.hpLabel, { color: '#FF4422' }]}>❤️ HP</Text>
        </View>
      </View>

      {/* SUPER meter — full width, glows when full */}
      <View style={styles.superRow}>
        <Text style={styles.superLabel}>⚡ SUPER</Text>
        <View style={styles.superTrack}>
          <View style={[
            styles.superFill,
            { width: `${superPct}%` as any },
            superPct >= 100 && styles.superReady,
          ]} />
        </View>
        <Text style={[styles.superPct, superPct >= 100 && styles.superPctReady]}>
          {superPct >= 100 ? 'READY!' : `${Math.floor(superPct)}%`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { backgroundColor: 'rgba(6,14,34,0.88)', paddingBottom: 4 },

  hpRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingTop: 5, gap: 6 },
  hpSection: { flex: 1 },
  hpTrack: {
    height: 18, backgroundColor: 'rgba(255,255,255,0.10)', borderRadius: 9,
    overflow: 'hidden', justifyContent: 'center',
  },
  hpFill:  { position: 'absolute', top: 0, left: 0, bottom: 0, borderRadius: 9 },
  hpNum:   { color: '#FFF', fontSize: 11, fontWeight: '900', textAlign: 'center', zIndex: 1 },
  hpLabel: { fontSize: 8, fontWeight: '800', marginTop: 2 },
  vsBox:   { paddingHorizontal: 4 },
  vs: {
    color: '#FFD700', fontSize: 20, fontWeight: '900',
    textShadowColor: '#AA7700', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2,
  },

  superRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 8, paddingTop: 4,
  },
  superLabel: { color: '#FFD700', fontSize: 9, fontWeight: '800', width: 48 },
  superTrack: {
    flex: 1, height: 8, backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 4, overflow: 'hidden',
  },
  superFill: {
    height: '100%', borderRadius: 4, backgroundColor: '#FFB300',
  },
  superReady: {
    backgroundColor: '#FFD700',
    shadowColor: '#FFD700', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 6,
  },
  superPct:      { color: '#AAA', fontSize: 9, fontWeight: '700', width: 38, textAlign: 'right' },
  superPctReady: { color: '#FFD700', fontWeight: '900' },
});
