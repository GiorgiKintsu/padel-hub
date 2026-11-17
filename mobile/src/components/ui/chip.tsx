import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors, radius } from '@/theme';

type ChipProps = {
  label: string;
  /** A small line above the label, e.g. the weekday above a date. Makes the chip a centred two-line tile. */
  caption?: string;
  active: boolean;
  onPress: () => void;
  /** Use on dark surfaces such as a dark `Card`. */
  dark?: boolean;
};

/** One choice in a group of options. */
export function Chip({ label, caption, active, onPress, dark = false }: ChipProps) {
  const onDarkSurface = dark && !active;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={caption ? `${caption} ${label}` : label}
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        caption !== undefined && styles.tile,
        dark && styles.chipDark,
        active && styles.chipActive,
        pressed && styles.pressed,
      ]}>
      {caption !== undefined && (
        <Text style={[styles.caption, onDarkSurface && styles.captionDark, active && styles.captionActive]}>{caption}</Text>
      )}
      <Text style={[styles.label, caption !== undefined && styles.tileLabel, onDarkSurface && styles.labelDark]}>
        {label}
      </Text>
    </Pressable>
  );
}

/** Lays chips out in a row; `scroll` keeps a long row on one line instead of wrapping it. */
export function ChipGroup({ children, scroll = false }: { children: ReactNode; scroll?: boolean }) {
  if (scroll) {
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {children}
      </ScrollView>
    );
  }
  return <View style={styles.wrap}>{children}</View>;
}

const styles = StyleSheet.create({
  chip: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  tile: { minWidth: 58, alignItems: 'center', paddingHorizontal: 10, gap: 2 },
  chipDark: { backgroundColor: colors.inkSoft, borderColor: colors.inkSoft },
  chipActive: { backgroundColor: colors.lime, borderColor: colors.lime },
  pressed: { opacity: 0.75 },
  label: { fontSize: 14, lineHeight: 20, fontWeight: '700', color: colors.ink, fontVariant: ['tabular-nums'] },
  tileLabel: { fontSize: 18, lineHeight: 24, fontWeight: '800' },
  labelDark: { color: colors.onInk },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '600', color: colors.muted },
  captionDark: { color: colors.onInkMuted },
  captionActive: { color: colors.ink },
  scroll: { gap: 8 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
