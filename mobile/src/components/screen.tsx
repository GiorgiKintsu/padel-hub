import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useLanguage } from '@/i18n/context';
import { colors, radius } from '@/theme';

import { LanguageSwitch } from './language-switch';
import { Icon, Notice, Row, Title } from './ui';

type ScreenProps = {
  children: ReactNode;
  title?: string;
  /** Shows a back button next to the title. */
  back?: boolean;
};

/** The frame every route renders into: brand bar with the language switch, optional title and the demo notice. */
export function Screen({ children, title, back = false }: ScreenProps) {
  const { t, storageError } = useLanguage();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Row>
        <View style={styles.brand}>
          <Text style={styles.brandName}>PADEL HUB</Text>
          <View style={styles.brandDot} />
          <Text numberOfLines={1} style={styles.demoTag}>
            {t('demo')}
          </Text>
        </View>
        <LanguageSwitch />
      </Row>

      {storageError && (
        <View accessibilityLiveRegion="polite">
          <Notice tone="warning" icon="alert">
            {t('storageError')}
          </Notice>
        </View>
      )}

      {title !== undefined && (
        <View style={styles.titleRow}>
          {back && <BackButton label={t('back')} />}
          <View style={styles.title}>
            <Title>{title}</Title>
          </View>
        </View>
      )}

      {children}

      <Text style={styles.disclaimer}>{t('disclaimer')}</Text>
    </ScrollView>
  );
}

function BackButton({ label }: { label: string }) {
  // A deep link or a web reload can open a screen with no history behind it; fall back to home.
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/'));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={goBack}
      style={({ pressed }) => [styles.back, pressed && styles.backPressed]}>
      <Icon name="back" size={22} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 32, gap: 20 },
  // `flexShrink` lets the demo tag give way before the language switch is pushed off a narrow screen.
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 },
  brandName: { fontSize: 13, letterSpacing: 2, fontWeight: '800', color: colors.ink },
  brandDot: { width: 7, height: 7, borderRadius: radius.pill, backgroundColor: colors.limeDeep },
  demoTag: {
    flexShrink: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
    fontSize: 10,
    lineHeight: 16,
    fontWeight: '600',
    color: colors.muted,
    backgroundColor: colors.tag,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { flex: 1 },
  back: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  backPressed: { opacity: 0.7 },
  disclaimer: { textAlign: 'center', fontSize: 11, lineHeight: 18, color: colors.muted },
});
