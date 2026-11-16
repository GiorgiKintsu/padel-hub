import { useLanguage } from '@/i18n/context';
import { router, usePathname } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { ReactNode } from 'react';
export const colors = { ink: '#123D32', lime: '#D8F653', background: '#F5F6F0', muted: '#66776F', border: '#DFE5DA' };
export function Button({ label, onPress, secondary = false, disabled = false }: {
    label: string;
    onPress: () => void;
    secondary?: boolean;
    disabled?: boolean;
}) {
    return <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} style={({ pressed }) => [s.button, secondary && s.secondary, { opacity: disabled ? .4 : pressed ? .7 : 1 }]}><Text style={s.buttonText}>{label}</Text></Pressable>;
}
export function Chip({ label, active, onPress, dark = false }: {
    label: string;
    active: boolean;
    onPress: () => void;
    dark?: boolean;
}) {
    return <Pressable accessibilityRole="button" accessibilityState={{ selected: active }} onPress={onPress} style={[s.chip, dark && { backgroundColor: '#294D42', borderColor: '#294D42' }, active && { backgroundColor: colors.lime, borderColor: colors.lime }]}><Text style={[s.chipText, dark && !active && { color: '#fff' }]}>{label}</Text></Pressable>;
}
export function Card({ children, dark = false, style }: {
    children: ReactNode;
    dark?: boolean;
    style?: ViewStyle;
}) { return <View style={[s.card, dark && { backgroundColor: colors.ink, borderColor: colors.ink }, style]}>{children}</View>; }
export function Title({ children }: {
    children: ReactNode;
}) { return <Text accessibilityRole="header" style={s.title}>{children}</Text>; }
export function Copy({ children, light = false }: {
    children: ReactNode;
    light?: boolean;
}) { return <Text style={[s.copy, light && { color: '#C9D7CA' }]}>{children}</Text>; }
export function Screen({ children, back, title }: {
    children: ReactNode;
    back?: boolean;
    title?: string;
}) {
    const path = usePathname();
    const { t, language, setLanguage, storageError } = useLanguage();
    return <SafeAreaView style={s.safe}><View style={s.shell}><ScrollView contentContainerStyle={s.content}>
    <View style={s.row}><Text style={s.brand}>PADEL HUB <Text style={{ color: '#90A64B' }}>●</Text></Text><Text style={s.demo}>{t('demo')}</Text></View>
    <View style={[s.row, { flexWrap: 'wrap' }]}><Copy>{t('language')}</Copy><View style={s.wrap}>{([{ code: 'ka', label: 'ქართული' }, { code: 'en', label: 'English' }] as const).map(item => <Chip key={item.code} label={item.label} active={language === item.code} onPress={() => setLanguage(item.code)} />)}</View></View>
    {storageError && <Text accessibilityLiveRegion="polite" style={s.copy}>{t('storageError')}</Text>}
    {title && <View style={s.row}>{back && <Pressable accessibilityRole="button" accessibilityLabel={t('back')} onPress={() => router.canGoBack() ? router.back() : router.replace('/')} style={s.back}><Text style={{ fontSize: 24, color: colors.ink }}>‹</Text></Pressable>}<View style={{ flex: 1 }}><Title>{title}</Title></View></View>}
    {children}
    <Text style={s.disclaimer}>{t('disclaimer')}</Text>
  </ScrollView><View style={s.nav}>{[{ path: '/' as const, label: `⌂  ${t('home')}` }, { path: '/booking' as const, label: `▦  ${t('myBooking')}` }].map(item => <Pressable key={item.path} accessibilityRole="tab" accessibilityState={{ selected: path === item.path }} onPress={() => router.navigate(item.path)} style={[s.navItem, path === item.path && { backgroundColor: '#EAF2CD' }]}><Text style={s.navText}>{item.label}</Text></Pressable>)}</View></View></SafeAreaView>;
}
export const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background }, shell: { flex: 1, width: '100%', maxWidth: 620, alignSelf: 'center' }, content: { padding: 20, gap: 22, paddingBottom: 28 },
    brand: { fontSize: 13, letterSpacing: 2, fontWeight: '800', color: colors.ink }, demo: { fontSize: 10, color: colors.muted, backgroundColor: '#E8EEDD', padding: 7, borderRadius: 8 },
    title: { fontSize: 27, lineHeight: 38, fontWeight: '800', color: colors.ink }, heading: { fontSize: 19, lineHeight: 28, fontWeight: '700', color: colors.ink }, copy: { color: colors.muted, fontSize: 14, lineHeight: 23 },
    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }, wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    card: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, borderRadius: 26, padding: 20, gap: 16 }, button: { backgroundColor: colors.lime, borderRadius: 16, padding: 17, alignItems: 'center', minHeight: 54 }, secondary: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border }, buttonText: { fontSize: 15, fontWeight: '700', textAlign: 'center', color: colors.ink },
    chip: { paddingHorizontal: 15, paddingVertical: 12, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: '#fff', minHeight: 46, justifyContent: 'center' }, chipText: { fontSize: 14, lineHeight: 21, fontWeight: '700', color: colors.ink },
    back: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', borderRadius: 22 },
    nav: { flexDirection: 'row', padding: 12, gap: 10, borderTopWidth: 1, borderColor: colors.border, backgroundColor: '#fff' }, navItem: { flex: 1, alignItems: 'center', padding: 13, borderRadius: 16 }, navText: { fontSize: 13, fontWeight: '700', color: colors.ink }, disclaimer: { color: colors.muted, textAlign: 'center', fontSize: 11, lineHeight: 18 }, badge: { color: colors.ink, backgroundColor: '#EDF4D5', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, fontSize: 12, fontWeight: '600' },
});
