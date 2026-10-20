import { Text, type TextProps } from 'react-native';

import { colors, type as typeScale } from '@/theme/tokens';

export type TextVariant = keyof typeof typeScale;

interface Props extends TextProps {
  variant?: TextVariant;
  color?: string;
  align?: 'left' | 'center' | 'right';
  upper?: boolean;
}

export function AppText({ variant = 'body', color = colors.ink, align, upper, style, children, ...rest }: Props) {
  return (
    <Text
      {...rest}
      style={[typeScale[variant], { color, textAlign: align }, upper && { textTransform: 'uppercase' }, style]}
    >
      {children}
    </Text>
  );
}
