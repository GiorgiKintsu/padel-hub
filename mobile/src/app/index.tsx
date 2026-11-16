import { useLanguage } from '@/i18n/context';
import { router } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { Button, Card, Chip, Copy, Screen, Title, s } from '@/components/ui';
import { clock, dayKey, nextDays } from '@/features/booking/model';
import { useBooking } from '@/features/booking/context';
export default function Home() {
    const { t, dateLabel, courtName, weekday } = useLanguage();
    const { search, setSearch, booking } = useBooking();
    return <Screen><View><Copy>{t('hello')}</Copy><Title>{t('homeTitle')}</Title></View>
    <Card dark><Text style={[s.heading, { color: '#fff' }]}>{t('when')}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>{nextDays().map(day => <Chip key={dayKey(day)} dark active={search.day === dayKey(day)} label={`${weekday(day)}\n${day.getDate()}`} onPress={() => setSearch({ ...search, day: dayKey(day) })}/>)}</ScrollView>
      <Copy light>{t('time')}</Copy><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>{[540, 600, 660, 1080, 1140, 1200, 1260].map(start => <Chip dark key={start} label={clock(start)} active={search.start === start} onPress={() => setSearch({ ...search, start })}/>)}</ScrollView>
      <Copy light>{t('duration')}</Copy><View style={s.wrap}>{[60, 90, 120].map(duration => <Chip dark key={duration} label={t('minutes', { count: duration })} active={search.duration === duration} onPress={() => setSearch({ ...search, duration })}/>)}</View>
      <Button label={t('findBest')} onPress={() => router.push('/courts')}/>
      <Copy light>{t('searchHint')}</Copy>
    </Card>
    <View style={{ gap: 12 }}><Text style={s.heading}>{t('nextGame')}</Text><Card>{booking && booking.phase !== 'expired' ? <><Text style={s.heading}>{courtName(booking.court)}</Text><Copy>{dateLabel(booking.search.day)} · {clock(booking.search.start)} · {t('minutes', { count: booking.search.duration })}</Copy><Text style={s.badge}>{booking.phase === 'confirmed' ? t('confirmed') : t('awaitingPayment')}</Text><Button secondary label={t('viewBooking')} onPress={() => router.push('/booking')}/></> : <><Text style={s.heading}>{t('courtWaiting')}</Text><Copy>{t('firstBooking')}</Copy></>}</Card></View>
    <Text style={s.heading}>{t('services')}</Text><View style={{ gap: 10 }}>{[[t('tournaments'), t('tournamentsDescription')], [t('partners'), t('partnersDescription')], [t('trainers'), t('trainersDescription')]].map(([name, description]) => <Card key={name}><View style={s.row}><Text style={s.heading}>{name}</Text><Text style={s.badge}>{t('soon')}</Text></View><Copy>{description}</Copy></Card>)}</View>
  </Screen>;
}
