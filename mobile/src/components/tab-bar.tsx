import { router, usePathname } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useLanguage } from '@/i18n/context';
import { colors, radius, shadow } from '@/theme';

import { Icon } from './ui';

const TABS = [
  { path: '/', icon: 'home', label: 'home' },
  { path: '/booking', icon: 'booking', label: 'myBooking' },
] as const;

export type TabPath = (typeof TABS)[number]['path'];

type TabBarProps = {
  /** Marks a tab with a dot when something there is waiting for the player. */
  attention?: TabPath | null;
};

/** Bottom navigation. It lives in the root layout, so it stays in place while screens change above it. */
export function TabBar({ attention = null }: TabBarProps) {
  const { t } = useLanguage();
  const pathname = usePathname();

  return (
    <View accessibilityRole="tablist" style={styles.bar}>
      {TABS.map(tab => {
        const selected = pathname === tab.path;
        return (
          <Pressable
            key={tab.path}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => router.navigate(tab.path)}
            style={styles.tab}>
            <View style={[styles.pill, selected && styles.pillSelected]}>
              <Icon name={tab.icon} size={22} color={selected ? colors.ink : colors.muted} />
              {attention === tab.path && <View style={styles.dot} />}
            </View>
            <Text style={[styles.label, selected && styles.labelSelected]}>{t(tab.label)}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 6,
    borderTopWidth: 1,
    borderColor: colors.divider,
    backgroundColor: colors.surface,
    boxShadow: shadow.bar,
  },
  tab: { flex: 1, alignItems: 'center', gap: 3, paddingVertical: 4 },
  pill: { width: 60, height: 32, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  pillSelected: { backgroundColor: colors.lime },
  dot: {
    position: 'absolute',
    top: 4,
    right: 14,
    width: 9,
    height: 9,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.surface,
    backgroundColor: colors.warning,
  },
  label: { fontSize: 12, lineHeight: 16, fontWeight: '600', color: colors.muted },
  labelSelected: { fontWeight: '800', color: colors.ink },
});
