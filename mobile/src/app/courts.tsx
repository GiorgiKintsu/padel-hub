import { useLanguage } from '@/i18n/context';
import { useState } from 'react';
import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { Button, Card, Chip, Copy, Screen, s } from '@/components/ui';
import { available, clock, courts, money, price } from '@/features/booking/model';
import { useBooking } from '@/features/booking/context';
export default function Courts() {
    const { t, dateLabel, courtName, courtArea } = useLanguage();
    const { search, select, booking } = useBooking();
    const [all, setAll] = useState(false);
    const [chosen, setChosen] = useState<Record<string, number>>({});
    const options = courts.map(court => ({ court, times: available(court, search).sort((a, b) => Math.abs(a - search.start) - Math.abs(b - search.start)) })).filter(item => item.times.length).sort((a, b) => all ? courtName(a.court).localeCompare(courtName(b.court)) : Math.abs(a.times[0] - search.start) - Math.abs(b.times[0] - search.start) || a.court.hourlyPrice - b.court.hourlyPrice);
    const active = booking && booking.phase !== 'expired';
    return <Screen back title={t('freeCourts')}><Copy>{dateLabel(search.day)} · {clock(search.start)} · {t('minutes', { count: search.duration })}</Copy><View style={s.wrap}><Chip label={t('bestOptions')} active={!all} onPress={() => setAll(false)}/><Chip label={t('allCourts')} active={all} onPress={() => setAll(true)}/></View>
    {active && <Card><Copy>{t('existingBooking')}</Copy><Button secondary label={t('myBooking')} onPress={() => router.push('/booking')}/></Card>}
    {!options.length && <Card><Text style={s.heading}>{t('noTimes')}</Text><Copy>{t('chooseAnother')}</Copy><Button label={t('changeSearch')} onPress={() => router.replace('/')}/></Card>}
    {options.map(({ court, times }) => { const start = times.includes(chosen[court.id]) ? chosen[court.id] : times[0]; return <Card key={court.id}><Text style={s.badge}>{start === search.start ? t('exactMatch') : t('timeOffset', { offset: `${start > search.start ? '+' : '−'}${Math.abs(start - search.start)}` })}</Text><Text style={s.heading}>{courtName(court)}</Text><Copy>{courtArea(court)} · {t('courtNumber', { number: court.number })} · {court.indoor ? t('indoor') : t('outdoor')}</Copy><View style={s.row}><Text style={s.heading}>{money(price(court, search.duration))}</Text><Copy>{t('totalPrice')}</Copy></View><View style={s.wrap}>{(all ? times.slice().sort((a, b) => a - b) : times.slice(0, 3)).map(time => <Chip key={time} label={clock(time)} active={start === time} onPress={() => setChosen({ ...chosen, [court.id]: time })}/>)}</View><Copy>{clock(start)} – {clock(start + search.duration)} · {t('minutes', { count: search.duration })}</Copy><Button disabled={!!active} label={t('reserve')} onPress={() => { select({ court, search: { ...search, start } }); router.push('/checkout'); }}/></Card>; })}
  </Screen>;
}
