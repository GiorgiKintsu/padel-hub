import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TabBar } from '@/components/tab-bar';
import { useBooking } from '@/features/booking/context';
import { isPending } from '@/features/booking/domain/payment';
import { BookingProvider } from '@/features/booking/provider';
import { LanguageProvider } from '@/i18n/provider';
import { colors, MAX_CONTENT_WIDTH } from '@/theme';

export default function RootLayout() {
  return (
    <LanguageProvider>
      <BookingProvider>
        <StatusBar style="dark" />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.shell}>
            <Stack screenOptions={{ headerShown: false }} />
            <Navigation />
          </View>
        </SafeAreaView>
      </BookingProvider>
    </LanguageProvider>
  );
}

/** The tab bar, with a dot on "My booking" while a payment deadline is running. */
function Navigation() {
  const { booking } = useBooking();
  const waitingForPayment = booking !== null && isPending(booking);

  return <TabBar attention={waitingForPayment ? '/booking' : null} />;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  shell: { flex: 1, width: '100%', maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center' },
});
