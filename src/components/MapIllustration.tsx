import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, G, Path, Rect, Text as SvgText } from 'react-native-svg';

import { colors, fonts } from '@/theme/tokens';

export interface MapStop {
  id: string;
  number: number;
  x: number;
  y: number;
  done: boolean;
  selected: boolean;
}

interface Props {
  stops: MapStop[];
  you: { x: number; y: number };
  youLabel: string;
  onSelect?: (id: string) => void;
  height?: number;
}

// Illustrative geography matching the Figma map (412 × 528 canvas).
const W = 412;
const H = 528;
const STREETS_X = [30, 75, 120, 165, 210, 255, 300, 345, 390];
const STREET_GAP = 50;
const ARTERIAL = 'M -20 470 C 80 360, 150 250, 250 170 S 380 60, 440 40';
const HIGHWAY = 'M -20 250 L 440 335';

export function MapIllustration({ stops, you, youLabel, onSelect, height }: Props) {
  // Keep the drawing at its native scale: a taller container shows more map rather than zooming in.
  const [size, setSize] = useState({ w: W, h: H });
  const viewH = Math.max(H, (W * size.h) / Math.max(1, size.w));
  const top = -(viewH - H) / 2;
  const streetsY: number[] = [];
  for (let y = top - STREET_GAP; y < top + viewH + STREET_GAP; y += STREET_GAP) streetsY.push(Math.round(y / 10) * 10);

  return (
    <View
      style={[styles.wrap, height ? { height } : styles.fill]}
      onLayout={(e) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
    >
      <Svg width="100%" height="100%" viewBox={`0 ${top} ${W} ${viewH}`} preserveAspectRatio="xMidYMid meet">
        <Rect x={0} y={top} width={W} height={viewH} fill={colors.mapLand} />
        <Rect x={0} y={130} width={130} height={60} fill={colors.mapPark} />
        <Rect x={300} y={0} width={90} height={60} fill={colors.mapPark} />
        <Rect x={240} y={420} width={130} height={70} fill={colors.mapPark} />

        {STREETS_X.map((x) => (
          <Path
            key={`x${x}`}
            d={`M ${x - 40} ${top - 200} L ${x + 80} ${top + viewH + 200}`}
            stroke={colors.mapRoad}
            strokeWidth={6}
          />
        ))}
        {streetsY.map((y) => (
          <Path key={`y${y}`} d={`M -10 ${y} L ${W + 10} ${y + 18}`} stroke={colors.mapRoad} strokeWidth={6} />
        ))}

        <Path d={HIGHWAY} stroke={colors.mapRoadEdge} strokeWidth={18} fill="none" />
        <Path d={HIGHWAY} stroke={colors.mapRoad} strokeWidth={13} fill="none" />
        <Path d={ARTERIAL} stroke={colors.mapRoadEdge} strokeWidth={22} fill="none" />
        <Path d={ARTERIAL} stroke={colors.mapRoad} strokeWidth={16} fill="none" />

        <SvgText x={28} y={98} fill={colors.muted} fontSize={13} fontFamily={fonts.medium}>
          RS Puram
        </SvgText>
        <SvgText x={226} y={222} fill={colors.muted} fontSize={13} fontFamily={fonts.medium}>
          Gandhipuram
        </SvgText>

        <G>
          <Circle cx={you.x} cy={you.y} r={22} fill={colors.userDot} opacity={0.18} />
          <Circle cx={you.x} cy={you.y} r={8} fill={colors.white} />
          <Circle cx={you.x} cy={you.y} r={6} fill={colors.userDot} />
          <SvgText
            x={you.x + 26}
            y={you.y + 4}
            fill={colors.ink}
            fontSize={12}
            fontFamily={fonts.medium}
            textAnchor="start"
          >
            {youLabel}
          </SvgText>
        </G>

        {stops.map((s) => (
          <G key={s.id} onPress={onSelect ? () => onSelect(s.id) : undefined}>
            {/* Larger invisible target so markers are easy to tap. */}
            <Circle cx={s.x} cy={s.y} r={26} fill="transparent" />
            {s.done ? (
              <>
                <Circle cx={s.x} cy={s.y} r={22} fill={colors.green} />
                <Path
                  d={`M ${s.x - 7} ${s.y} l 5 5 l 9 -10`}
                  stroke={colors.white}
                  strokeWidth={2.5}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </>
            ) : (
              <>
                <Circle
                  cx={s.x}
                  cy={s.y}
                  r={s.selected ? 21 : 20}
                  fill={s.selected ? colors.green : colors.white}
                  stroke={s.selected ? colors.white : colors.green}
                  strokeWidth={s.selected ? 4 : 1.5}
                />
                <SvgText
                  x={s.x}
                  y={s.y + 5}
                  fill={s.selected ? colors.white : colors.green}
                  fontSize={14}
                  fontFamily={fonts.semibold}
                  textAnchor="middle"
                >
                  {String(s.number)}
                </SvgText>
              </>
            )}
          </G>
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', overflow: 'hidden', backgroundColor: colors.mapLand },
  fill: { flex: 1 },
});
