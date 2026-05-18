import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Canvas, Path, Skia } from '@shopify/react-native-skia';

const { width: SCREEN_W } = Dimensions.get('window');
const CANVAS_H = 200;

interface Props {
  wavePosition: number;  // -100 to +100
  playerCharging: boolean;
  chargeAmount: number;  // 0-1
  playerColor: string;
}

export default function WaveCanvas({ wavePosition, playerCharging, chargeAmount, playerColor }: Props) {
  const offsetX = (wavePosition / 100) * (SCREEN_W / 4);
  const amplitude = playerCharging ? 20 + chargeAmount * 40 : 20;

  const playerPath = useMemo(
    () => buildWavePath(SCREEN_W, CANVAS_H, -offsetX, amplitude, 'left'),
    [offsetX, amplitude],
  );
  const botPath = useMemo(
    () => buildWavePath(SCREEN_W, CANVAS_H, offsetX, amplitude * 0.7, 'right'),
    [offsetX, amplitude],
  );

  const playerPaint = useMemo(() => {
    const p = Skia.Paint();
    p.setColor(Skia.Color(playerColor + '88'));
    p.setStyle(1);
    return p;
  }, [playerColor]);

  const botPaint = useMemo(() => {
    const p = Skia.Paint();
    p.setColor(Skia.Color('#FF442288'));
    p.setStyle(1);
    return p;
  }, []);

  return (
    <View style={styles.container}>
      <Canvas style={styles.canvas}>
        <Path path={playerPath} paint={playerPaint} />
        <Path path={botPath} paint={botPaint} />
      </Canvas>
    </View>
  );
}

function buildWavePath(
  w: number,
  h: number,
  offsetX: number,
  amplitude: number,
  side: 'left' | 'right',
): ReturnType<typeof Skia.Path.Make> {
  const path = Skia.Path.Make();
  const cx = w / 2 + offsetX;
  const steps = 40;

  if (side === 'left') {
    path.moveTo(0, h);
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = t * cx;
      const y = h / 2 + Math.sin(t * Math.PI * 3) * amplitude * (1 - t * 0.5);
      path.lineTo(x, y);
    }
    path.lineTo(cx, h);
    path.close();
  } else {
    path.moveTo(w, h);
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = w - t * (w - cx);
      const y = h / 2 + Math.sin(t * Math.PI * 3) * amplitude * (1 - t * 0.5);
      path.lineTo(x, y);
    }
    path.lineTo(cx, h);
    path.close();
  }

  return path;
}

const styles = StyleSheet.create({
  container: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  canvas: { flex: 1 },
});
