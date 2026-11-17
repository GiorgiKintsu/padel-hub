import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type StyleProp, type TextStyle } from 'react-native';

import { colors, radius } from '@/theme';

import { Icon, type IconName } from './icon';

type TextProps = {
  children: ReactNode;
  /** Use on dark surfaces such as a dark `Card`. */
  onDark?: boolean;
  style?: StyleProp<TextStyle>;
};

/** The one large heading of a screen. */
export function Title({ children, style }: TextProps) {
  return (
    <Text accessibilityRole="header" style={[styles.title, style]}>
      {children}
    </Text>
  );
}

/** A large standalone value such as a price or a timer. Looks like `Title` but is not announced as a heading. */
export function Display({ children, style }: TextProps) {
  return <Text style={[styles.title, style]}>{children}</Text>;
}

/** Section and card headings, and any value that should stand out. */
export function Heading({ children, onDark = false, style }: TextProps) {
  return <Text style={[styles.heading, onDark && styles.onDark, style]}>{children}</Text>;
}

/** Body text. */
export function Copy({ children, onDark = false, style }: TextProps) {
  return <Text style={[styles.copy, onDark && styles.mutedOnDark, style]}>{children}</Text>;
}

/** A small caption above a group of controls or next to a value. Not uppercased: Georgian has no case. */
export function Label({ children, onDark = false, style }: TextProps) {
  return <Text style={[styles.label, onDark && styles.mutedOnDark, style]}>{children}</Text>;
}

/** A line of secondary detail led by an icon, e.g. a date or an address. */
export function Meta({ icon, children, onDark = false }: { icon: IconName; children: ReactNode; onDark?: boolean }) {
  return (
    <View style={styles.meta}>
      <Icon name={icon} size={16} color={onDark ? colors.onInkMuted : colors.muted} />
      <Text style={[styles.copy, styles.metaText, onDark && styles.mutedOnDark]}>{children}</Text>
    </View>
  );
}

export type Tone = 'lime' | 'neutral' | 'warning' | 'danger';

const TONES: Record<Tone, { background: string; text: string }> = {
  lime: { background: colors.limeSoft, text: colors.ink },
  neutral: { background: colors.tag, text: colors.muted },
  warning: { background: colors.warningSoft, text: colors.warning },
  danger: { background: colors.dangerSoft, text: colors.danger },
};

/** A small status pill. The tone says how good the news is; the optional icon repeats it for colour-blind users. */
export function Badge({ children, tone = 'lime', icon }: { children: ReactNode; tone?: Tone; icon?: IconName }) {
  const { background, text } = TONES[tone];
  return (
    <View style={[styles.badge, { backgroundColor: background }]}>
      {icon && <Icon name={icon} size={14} color={text} />}
      <Text style={[styles.badgeText, { color: text }]}>{children}</Text>
    </View>
  );
}

/** A short message in a tinted box: a hint, a warning or an error that belongs to the content around it. */
export function Notice({ children, tone = 'neutral', icon = 'info' }: { children: ReactNode; tone?: Tone; icon?: IconName }) {
  const { background, text } = TONES[tone];
  return (
    <View style={[styles.notice, { backgroundColor: background }]}>
      <View style={styles.noticeIcon}>
        <Icon name={icon} size={18} color={text} />
      </View>
      <Text style={[styles.copy, styles.metaText, { color: tone === 'neutral' ? colors.muted : text }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, lineHeight: 38, fontWeight: '800', letterSpacing: -0.3, color: colors.ink },
  heading: { fontSize: 18, lineHeight: 26, fontWeight: '700', color: colors.ink },
  copy: { fontSize: 14, lineHeight: 22, color: colors.muted },
  label: { fontSize: 12, lineHeight: 18, fontWeight: '700', letterSpacing: 0.3, color: colors.muted },
  onDark: { color: colors.onInk },
  mutedOnDark: { color: colors.onInkMuted },
  meta: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  // Lets long text wrap inside a row instead of pushing the row wider than the screen.
  metaText: { flex: 1 },
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  badgeText: { fontSize: 12, lineHeight: 16, fontWeight: '700' },
  notice: { flexDirection: 'row', gap: 10, padding: 14, borderRadius: radius.md },
  noticeIcon: { paddingTop: 2 },
});
