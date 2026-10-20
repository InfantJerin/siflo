// Design tokens mirrored from the Figma "SIF" variables.
export const colors = {
  ink: '#1b2a22',
  muted: '#5b6a62',
  subtle: '#8a958f',
  paper: '#fbfaf6',
  white: '#ffffff',
  line: '#e4e7e2',
  green: '#1f6b45',
  greenSoft: '#e3f1e8',
  greenDisabled: '#9fbfac',
  red: '#a3261a',
  redSoft: '#fbe3e1',
  amber: '#7a4b00',
  amberSoft: '#fdf1d6',
  scrim: 'rgba(24, 27, 25, 0.88)',
  mapLand: '#e7e8e2',
  mapBlock: '#dcded7',
  mapPark: '#d6e8d3',
  mapRoad: '#fbfaf6',
  mapRoadEdge: '#d4d6cf',
  userDot: '#3d5a73',
} as const;

export const space = { 0: 0, 4: 4, 8: 8, 12: 12, 16: 16, 20: 20, 24: 24, 32: 32 } as const;

export const radius = { 8: 8, 12: 12, 16: 16, 24: 24, pill: 999 } as const;

export const fonts = {
  condensed: 'BarlowCondensed_600SemiBold',
  regular: 'Barlow_400Regular',
  medium: 'Barlow_500Medium',
  semibold: 'Barlow_600SemiBold',
} as const;

export const type = {
  display: { fontFamily: fonts.condensed, fontSize: 40, lineHeight: 44 },
  heading: { fontFamily: fonts.condensed, fontSize: 28, lineHeight: 32 },
  headingSm: { fontFamily: fonts.condensed, fontSize: 24, lineHeight: 28 },
  title: { fontFamily: fonts.semibold, fontSize: 20, lineHeight: 26 },
  body: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 24 },
  bodyMedium: { fontFamily: fonts.medium, fontSize: 16, lineHeight: 24 },
  label: { fontFamily: fonts.semibold, fontSize: 14, lineHeight: 20 },
  small: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20 },
  caption: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 18 },
  overline: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 16, letterSpacing: 0.4 },
} as const;
