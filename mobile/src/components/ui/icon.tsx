import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { StyleSheet, View } from 'react-native';

import { colors, radius } from '@/theme';

type PlatformSymbol = Exclude<SymbolViewProps['name'], string>;

/**
 * The app's icon set. Each icon is a native SF Symbol on iOS and a Material Symbol on Android and
 * the web, so it looks at home on every platform. Add an icon here before using it anywhere.
 */
const SYMBOLS = {
  home: { ios: 'house.fill', android: 'home', web: 'home' },
  booking: { ios: 'calendar', android: 'calendar_month', web: 'calendar_month' },
  back: { ios: 'chevron.left', android: 'chevron_left', web: 'chevron_left' },
  check: { ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' },
  clock: { ios: 'clock', android: 'schedule', web: 'schedule' },
  timer: { ios: 'timer', android: 'timer', web: 'timer' },
  location: { ios: 'mappin.and.ellipse', android: 'location_on', web: 'location_on' },
  court: { ios: 'sportscourt', android: 'sports_tennis', web: 'sports_tennis' },
  indoor: { ios: 'house', android: 'roofing', web: 'roofing' },
  outdoor: { ios: 'sun.max', android: 'wb_sunny', web: 'wb_sunny' },
  person: { ios: 'person.fill', android: 'person', web: 'person' },
  trophy: { ios: 'trophy', android: 'emoji_events', web: 'emoji_events' },
  partners: { ios: 'person.2', android: 'group', web: 'group' },
  coach: { ios: 'graduationcap', android: 'school', web: 'school' },
  info: { ios: 'info.circle', android: 'info', web: 'info' },
  alert: { ios: 'exclamationmark.circle', android: 'error', web: 'error' },
} as const satisfies Record<string, PlatformSymbol>;

export type IconName = keyof typeof SYMBOLS;

type IconProps = {
  name: IconName;
  size?: number;
  color?: string;
};

/** Decorative by default: icons always sit next to text that says the same thing. */
export function Icon({ name, size = 18, color = colors.ink }: IconProps) {
  return (
    <SymbolView
      name={SYMBOLS[name]}
      size={size}
      tintColor={color}
      accessibilityElementsHidden
      importantForAccessibility="no"
    />
  );
}

/** An icon on a soft rounded tile, used to lead a list row or an empty state. */
export function IconTile({ name, size = 44 }: { name: IconName; size?: number }) {
  return (
    <View style={[styles.tile, { width: size, height: size }]}>
      <Icon name={name} size={Math.round(size * 0.5)} />
    </View>
  );
}

const styles = StyleSheet.create({
  tile: { alignItems: 'center', justifyContent: 'center', borderRadius: radius.md, backgroundColor: colors.limeSoft },
});
