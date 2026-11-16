import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { BookingProvider } from '@/features/booking/store';
import { LanguageProvider } from '@/i18n/provider';
export default function RootLayout() {
    return <LanguageProvider><BookingProvider><StatusBar style="dark"/><Stack screenOptions={{ headerShown: false }}/></BookingProvider></LanguageProvider>;
}
