import React from 'react';
import { Image, Text, View, StyleSheet } from 'react-native';
import type { Dog, DogImages } from '../types';

type Variant = keyof DogImages;

interface Props {
  dog: Dog;
  variant?: Variant;
  size?: number;
  style?: object;
}

export default function DogSprite({ dog, variant = 'idle', size = 120, style }: Props) {
  const imageSource = dog.images?.[variant];

  if (imageSource) {
    return (
      <Image
        source={imageSource}
        style={[{ width: size, height: size }, style]}
        resizeMode="contain"
      />
    );
  }

  // Fallback to emoji when no image asset is loaded yet
  return (
    <View style={[styles.emojiBox, { width: size, height: size }, style]}>
      <Text style={{ fontSize: size * 0.65 }}>{dog.emoji}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  emojiBox: { alignItems: 'center', justifyContent: 'center' },
});
