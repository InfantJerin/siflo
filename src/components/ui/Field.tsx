import type { ReactNode } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { colors, fonts, radius } from '@/theme/tokens';
import { AppText } from './AppText';

interface FieldProps extends TextInputProps {
  label?: string;
  prefix?: string;
  trailing?: ReactNode;
}

export function Field({ label, prefix, trailing, style, ...input }: FieldProps) {
  return (
    <View style={styles.wrap}>
      {label && <AppText variant="bodyMedium">{label}</AppText>}
      <View style={styles.box}>
        {prefix && <AppText variant="body">{prefix}</AppText>}
        <TextInput
          placeholderTextColor={colors.subtle}
          accessibilityLabel={label}
          style={[styles.input, style]}
          {...input}
        />
        {trailing}
      </View>
    </View>
  );
}

interface SelectFieldProps {
  label: string;
  value?: string;
  placeholder?: string;
  onPress?: () => void;
  trailing?: ReactNode;
}

/** A field that looks like an input but opens something (date picker etc.) when tapped. */
export function SelectField({ label, value, placeholder, onPress, trailing }: SelectFieldProps) {
  return (
    <View style={styles.wrap}>
      <AppText variant="bodyMedium">{label}</AppText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${value ?? placeholder ?? ''}`}
        onPress={onPress}
        disabled={!onPress}
        style={styles.box}
      >
        <AppText variant="body" color={value ? colors.ink : colors.subtle} style={styles.input}>
          {value ?? placeholder}
        </AppText>
        {trailing}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 48,
    paddingHorizontal: 16,
    borderRadius: radius[12],
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
  },
  input: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.ink,
    paddingVertical: 10,
  },
});
