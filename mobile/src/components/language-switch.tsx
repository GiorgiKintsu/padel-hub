import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useLanguage } from '@/i18n/context';
import { LANGUAGES } from '@/i18n/translate';
import { colors, radius } from '@/theme';

/** A compact two-segment switch that fits in the header of every screen. */
export function LanguageSwitch() {
  const { t, language, setLanguage } = useLanguage();

  return (
    <View accessibilityRole="radiogroup" accessibilityLabel={t('language')} style={styles.track}>
      {LANGUAGES.map(({ code, label, short }) => {
        const selected = language === code;
        return (
          <Pressable
            key={code}
            accessibilityRole="radio"
            accessibilityLabel={label}
            accessibilityState={{ selected }}
            // The segment is small on purpose; the slop keeps the touch target comfortable.
            hitSlop={{ top: 8, bottom: 8 }}
            onPress={() => setLanguage(code)}
            style={[styles.segment, selected && styles.segmentSelected]}>
            <Text style={[styles.label, selected && styles.labelSelected]}>{short}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flexDirection: 'row', padding: 3, borderRadius: radius.pill, backgroundColor: colors.tag },
  segment: { minWidth: 46, paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.pill, alignItems: 'center' },
  segmentSelected: { backgroundColor: colors.ink },
  label: { fontSize: 12, lineHeight: 18, fontWeight: '700', color: colors.muted },
  labelSelected: { color: colors.onInk },
});
