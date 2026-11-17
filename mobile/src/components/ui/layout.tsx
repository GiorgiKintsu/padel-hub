import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius, shadow } from '@/theme';

type CardProps = {
  children: ReactNode;
  /**
   * `surface` – the default white card.
   * `dark`    – the green hero card; pair it with `onDark` text and `dark` chips.
   * `muted`   – a flat tinted panel for side notes that should not compete with real content.
   */
  variant?: 'surface' | 'dark' | 'muted';
};

export function Card({ children, variant = 'surface' }: CardProps) {
  return <View style={[styles.card, styles[variant]]}>{children}</View>;
}

/** Two ends of one line, e.g. a label on the left and its value on the right. */
export function Row({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.row, style]}>{children}</View>;
}

/** A vertical group with even spacing. */
export function Column({ children, gap = 12, style }: { children: ReactNode; gap?: number; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ gap }, style]}>{children}</View>;
}

/** A hairline between two parts of a card. */
export function Divider({ onDark = false }: { onDark?: boolean }) {
  return <View style={[styles.divider, onDark && styles.dividerOnDark]} />;
}

type ProgressBarProps = {
  /** From 0 to 1; values outside are clamped. */
  value: number;
  tone?: 'lime' | 'warning';
  /** Read by screen readers, since the bar itself is only a shape. */
  accessibilityLabel?: string;
};

export function ProgressBar({ value, tone = 'lime', accessibilityLabel }: ProgressBarProps) {
  const percent = Math.round(Math.min(1, Math.max(0, value)) * 100);
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: percent }}
      style={styles.track}>
      <View style={[styles.fill, tone === 'warning' && styles.fillWarning, { width: `${percent}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: 16, padding: 20, borderRadius: radius.xl },
  surface: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.divider, boxShadow: shadow.card },
  dark: { backgroundColor: colors.ink, boxShadow: shadow.card },
  muted: { backgroundColor: colors.tag },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border },
  dividerOnDark: { backgroundColor: colors.inkSoft, height: 1 },
  track: { height: 8, borderRadius: radius.pill, backgroundColor: colors.tag, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: radius.pill, backgroundColor: colors.limeDeep },
  fillWarning: { backgroundColor: colors.warning },
});
