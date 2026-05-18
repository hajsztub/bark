import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface Props {
  wavePosition: number;   // -100 to +100
  playerCharging: boolean;
  chargeAmount: number;
  playerColor: string;
}

// Tug-of-war bar + clash glow — no longer a full-screen color split
export default function WaveView({ wavePosition, playerCharging, chargeAmount, playerColor }: Props) {
  const splitAnim = useRef(new Animated.Value(0.5)).current;
  const glowAnim  = useRef(new Animated.Value(0)).current;
  const pulseLoop = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    const target = 0.5 + (wavePosition / 100) * 0.35;
    Animated.spring(splitAnim, { toValue: target, damping: 14, stiffness: 180, useNativeDriver: false }).start();
  }, [wavePosition]);

  useEffect(() => {
    if (playerCharging) {
      pulseLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 1, duration: 250, useNativeDriver: false }),
          Animated.timing(glowAnim, { toValue: 0.4, duration: 250, useNativeDriver: false }),
        ])
      );
      pulseLoop.current.start();
    } else {
      pulseLoop.current?.stop();
      Animated.timing(glowAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start();
    }
  }, [playerCharging]);

  const tugFill = splitAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.6 + chargeAmount * 0.3] });

  return (
    <View style={styles.container}>
      {/* Tug-of-war bar */}
      <View style={styles.tugTrack}>
        <Animated.View style={[styles.tugFill, { width: tugFill, backgroundColor: playerColor }]} />
        <View style={styles.tugCenter} />
      </View>

      {/* Clash glow in center of arena */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.clashGlow,
          { opacity: glowOpacity, shadowColor: chargeAmount > 0.5 ? '#FFF' : '#FFD700' },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  tugTrack: {
    position: 'absolute', top: 0, left: 0, right: 0,
    height: 6, backgroundColor: 'rgba(255,68,34,0.6)', flexDirection: 'row',
  },
  tugFill: { height: '100%' },
  tugCenter: {
    position: 'absolute', left: '50%', top: -3,
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: '#FFD700',
    marginLeft: -6,
    shadowColor: '#FFD700', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 6,
    elevation: 6,
  },
  clashGlow: {
    position: 'absolute',
    top: '20%', bottom: '10%',
    left: '38%', right: '38%',
    borderRadius: 60,
    backgroundColor: '#FFD700',
    shadowColor: '#FFD700', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 40,
    elevation: 10,
  },
});
