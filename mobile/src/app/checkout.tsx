import { useLanguage } from '@/i18n/context';
import { useState } from 'react';
import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { Button, Card, Chip, Copy, Screen, s } from '@/components/ui';
import { available, clock, money, price } from '@/features/booking/model';
import { useBooking } from '@/features/booking/context';
export default function Checkout() {
    const { t, dateLabel, courtName } = useLanguage();
    const { selected, begin, booking, now } = useBooking();
    const [count, setCount] = useState(1);
    if (!selected)
        return <Screen back title={t('chooseCourt')}><Copy>{t('chooseCourtHint')}</Copy><Button label={t('viewCourts')} onPress={() => router.replace('/courts')}/></Screen>;
    const { court, search } = selected;
    const total = price(court, search.duration);
    const blocked = !!booking && booking.phase !== 'expired';
    const valid = available(court, search, now).includes(search.start);
    return <Screen back title={t('summary')}><Card dark><Text style={[s.heading, { color: '#fff' }]}>{courtName(court)}</Text><Copy light>{t('courtNumber', { number: court.number })} · {court.indoor ? t('indoor') : t('outdoor')}</Copy><Copy light>{dateLabel(search.day)} · {clock(search.start)} – {clock(search.start + search.duration)}</Copy><Text style={[s.title, { color: '#D8F653' }]}>{money(total)}</Text></Card>
    <Card><Text style={s.heading}>{t('howPay')}</Text><View style={s.wrap}><Chip label={t('payFull')} active={count === 1} onPress={() => setCount(1)}/>{[2, 3, 4].map(n => <Chip key={n} label={t('splitPeople', { count: n })} active={count === n} onPress={() => setCount(n)}/>)}</View><Copy>{count === 1 ? t('fullHint') : t('splitHint')}</Copy><View style={s.row}><Copy>{t('yourShare')}</Copy><Text style={s.heading}>{money(total / count)}</Text></View><Copy>{t('demoFee', { amount: money(0) })}</Copy></Card>
    <Card><Text style={s.heading}>{t('demoScenario')}</Text><Copy>{t('timerRules')}</Copy><Copy>{t('simulationHint')}</Copy></Card>
    {!valid && <Copy>{t('noLongerAvailable')}</Copy>}
    {blocked ? <Button label={t('viewCurrent')} onPress={() => router.replace('/booking')}/> : <Button disabled={!valid} label={t('startPayment')} onPress={() => { begin(count); router.replace('/booking'); }}/>}
  </Screen>;
}
