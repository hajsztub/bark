import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';

const W = Dimensions.get('window').width;

interface Props {
  wavePosition: number;   // -100 to +100  (positive = player winning)
  playerCharging: boolean;
  chargeAmount: number;   // 0-1
  playerColor: string;
}

export default function WaveView({ wavePosition, playerCharging, chargeAmount, playerColor }: Props) {
  const splitAnim = useRef(new Animated.Value(0.5)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseLoop = useRef<Animated.CompositeAnimation | null>(null);

  // Move split point based on wave position
  useEffect(() => {
    const target = 0.5 + (wavePosition / 100) * 0.35;
    Animated.spring(splitAnim, {
      toValue: target,
      damping: 14,
      stiffness: 180,
      useNativeDriver: false,
    }).start();
  }, [wavePosition]);

  // Pulse the clash line while charging
  useEffect(() => {
    if (playerCharging) {
      pulseLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.3 + chargeAmount * 0.4, duration: 200, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        ])
      );
      pulseLoop.current.start();
    } else {
      pulseLoop.current?.stop();
      Animated.timing(pulseAnim, { toValue: 1, duration: 150, useNativeDriver: true }).start();
    }
  }, [playerCharging, chargeAmount]);

  const playerWidth = splitAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const clashGlow = chargeAmount > 0.5 ? '#FFFFFF' : '#FFD700';

  return (
    <View style={styles.container}>
      {/* Player wave (left, blue) */}
      <Animated.View style={[styles.playerWave, { width: playerWidth, backgroundColor: playerColor + 'CC' }]}>
        {/* Wave edge effect */}
        <View style={[styles.waveEdge, { backgroundColor: playerColor }]} />
      </Animated.View>

      {/* Bot wave (right, orange/red) — fills remaining space */}
      <View style={[styles.botWave, { backgroundColor: '#FF442299' }]}>
        <View style={styles.waveEdgeRight} />
      </View>

      {/* Clash point */}
      <Animated.View
        style={[
          styles.clashPoint,
          {
            left: playerWidth,
            transform: [{ scaleY: pulseAnim }],
            backgroundColor: clashGlow,
            shadowColor: clashGlow,
          },
        ]}
      />

      {/* Sound wave lines on player side */}
      {playerCharging && (
        <View style={styles.chargeLines}>
          {[0, 1, 2].map(i => (
            <Animated.View
              key={i}
              style={[
                styles.chargeLine,
                {
                  opacity: chargeAmount * 0.8,
                  transform: [{ scaleX: 0.5 + chargeAmount * 0.5 + i * 0.15 }],
                  backgroundColor: playerColor,
                  top: 30 + i * 20,
                },
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    flexDirection: 'row', overflow: 'hidden',
  },
  playerWave: {
    height: '100%',
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  waveEdge: {
    position: 'absolute', right: 0, top: '15%', bottom: '15%',
    width: 4, borderRadius: 2,
    opacity: 0.9,
  },
  botWave: {
    flex: 1, height: '100%',
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  waveEdgeRight: {
    position: 'absolute', left: 0, top: '15%', bottom: '15%',
    width: 4, borderRadius: 2, backgroundColor: '#FF4422', opacity: 0.9,
  },
  clashPoint: {
    position: 'absolute', top: '10%', bottom: '10%',
    width: 3, borderRadius: 2, marginLeft: -1.5,
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 8,
    elevation: 8,
  },
  chargeLines: {
    position: 'absolute', left: '10%', top: 0, bottom: 0,
  },
  chargeLine: {
    position: 'absolute', left: 0,
    height: 2, width: 40, borderRadius: 1,
  },
});
