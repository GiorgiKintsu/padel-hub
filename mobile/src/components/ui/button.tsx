import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, radius } from '@/theme';

type ButtonProps = {
  label: string;
  onPress: () => void;
  /** Outlined, for actions that are not the main one on the screen. */
  secondary?: boolean;
  disabled?: boolean;
};

export function Button({ label, onPress, secondary = false, disabled = false }: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        secondary && styles.secondary,
        disabled ? styles.disabled : pressed && styles.pressed,
      ]}>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 54,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.lime,
  },
  secondary: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  disabled: { opacity: 0.4 },
  pressed: { opacity: 0.75, transform: [{ scale: 0.985 }] },
  label: { fontSize: 15, lineHeight: 22, fontWeight: '700', textAlign: 'center', color: colors.ink },
});
