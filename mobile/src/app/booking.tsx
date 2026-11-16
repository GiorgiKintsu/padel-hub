import { useLanguage } from '@/i18n/context';
import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { Button, Card, Copy, Screen, s } from '@/components/ui';
import { clock, money } from '@/features/booking/model';
import { useBooking } from '@/features/booking/context';
export default function BookingScreen() {
    const { t, dateLabel, courtName } = useLanguage();
    const { booking: b, now, act, reset } = useBooking();
    if (!b)
        return <Screen title={t('myBooking')}><Card><Text style={s.heading}>{t('noBooking')}</Text><Copy>{t('noBookingHint')}</Copy><Button label={t('findCourt')} onPress={() => router.navigate('/')}/></Card></Screen>;
    const totalPaid = b.paid.reduce((a, v) => a + v, 0);
    const remaining = Math.max(0, Math.ceil((b.deadline - now) / 1000));
    const finished = b.phase === 'confirmed' || b.phase === 'expired';
    return <Screen title={t('myBooking')}><Text style={s.badge}>{b.phase === 'confirmed' ? `✓ ${t('confirmed')}` : b.phase === 'expired' ? t('expired') : t('awaitingPayment')}</Text><Card dark><Text style={[s.heading, { color: '#fff' }]}>{courtName(b.court)}</Text><Copy light>{dateLabel(b.search.day)} · {clock(b.search.start)} – {clock(b.search.start + b.search.duration)}</Copy><Copy light>{t('courtNumber', { number: b.court.number })} · {t('minutes', { count: b.search.duration })}</Copy></Card>
    {!finished && <Card><Copy>{b.phase === 'author' ? t('authorTime') : t('friendsTime')}</Copy><Text accessibilityLiveRegion="none" style={[s.title, { fontSize: 40, fontVariant: ['tabular-nums'] }]}>{Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, '0')}</Text><Copy>{t('expiryHint')}</Copy></Card>}
    <Card><Text style={s.heading}>{t('paymentStatus')}</Text>{b.paid.map((paid, i) => <View key={i} style={{ gap: 10, paddingBottom: 12, borderBottomWidth: 1, borderColor: '#E9EDE4' }}><View style={s.row}><Text style={s.heading}>{i === 0 ? t('author') : t('friend', { number: i })}</Text><Text style={s.heading}>{money(paid || b.total / b.count)}</Text></View><Copy>{b.phase === 'expired' ? paid ? t('refunded') : t('unpaid') : paid ? t('paid') : b.phase === 'confirmed' ? t('covered') : t('pending')}</Copy>{!paid && !finished && (i === 0 || b.phase === 'friends') && <Button secondary label={i === 0 ? t('simulateMine') : t('simulateFriend', { number: i })} onPress={() => act({ type: 'pay', index: i, now: Date.now() })}/>}</View>)}<View style={s.row}><Copy>{t('totalPaid')}</Copy><Text style={s.heading}>{money(totalPaid)} / {money(b.total)}</Text></View></Card>
    {b.phase === 'friends' && <Button label={t('coverRemaining', { amount: money(b.total - totalPaid) })} onPress={() => act({ type: 'cover', now: Date.now() })}/>}
    {b.phase === 'expired' && <Card><Text style={s.heading}>{t('courtReleased')}</Text><Copy>{t('refundExplanation', { amount: money(totalPaid) })}</Copy></Card>}
    <Button secondary label={t('clearBooking')} onPress={() => { reset(); router.replace('/'); }}/>
  </Screen>;
}
