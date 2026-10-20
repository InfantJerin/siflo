import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import Svg, { Path, Rect, Text as SvgText } from 'react-native-svg';

import type { PhotoProof } from '@/store/types';
import { colors, fonts } from '@/theme/tokens';

/** Illustrated shopfront used for mock photo evidence (matches the Figma placeholder). */
export function Shopfront({ label }: { label: string }) {
  const shutterLines = Array.from({ length: 8 }, (_, i) => 236 + i * 18);
  return (
    <Svg width="100%" height="100%" viewBox="0 0 364 480" preserveAspectRatio="xMidYMid slice">
      <Rect x={0} y={0} width={364} height={480} fill="#c8ccbb" />
      <Rect x={0} y={150} width={364} height={250} fill="#d6dbd2" />
      <Rect x={18} y={116} width={328} height={18} fill="#a9b09e" />
      <Rect x={24} y={134} width={316} height={264} fill="#e4e0d2" />
      <Rect x={36} y={154} width={292} height={50} fill={colors.green} />
      <SvgText x={182} y={185} fill={colors.white} fontSize={14} fontFamily={fonts.semibold} textAnchor="middle">
        {label}
      </SvgText>
      <Rect x={44} y={222} width={276} height={162} fill="#8f9a90" />
      {shutterLines.map((y) => (
        <Path key={y} d={`M 44 ${y} L 320 ${y}`} stroke="#68736a" strokeWidth={3} />
      ))}
      <Rect x={18} y={384} width={328} height={12} fill="#b7bcaf" />
      <Rect x={0} y={392} width={364} height={88} fill="#9aa094" />
      <Path d="M 0 450 L 364 450" stroke="#e4e0d2" strokeWidth={3} />
    </Svg>
  );
}

export function PhotoProofView({ photo, height }: { photo: PhotoProof; height: number }) {
  return (
    <View style={[styles.frame, { height }]}>
      {photo.uri ? (
        <Image source={{ uri: photo.uri }} style={StyleSheet.absoluteFill} contentFit="cover" />
      ) : (
        <Shopfront label={photo.label ?? ''} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { width: '100%', overflow: 'hidden', backgroundColor: colors.line },
});
