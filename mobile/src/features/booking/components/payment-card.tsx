import { Fragment } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Badge, Button, Card, Column, Divider, Heading, Icon, Label, ProgressBar, Row, type IconName, type Tone } from '@/components/ui';
import { useLanguage } from '@/i18n/context';
import { colors, radius } from '@/theme';

import { money } from '../domain/format';
import { canPay, payerStatus, totalPaid, type Booking, type PayerStatus } from '../domain/payment';

const STATUS: Record<PayerStatus, { tone: Tone; icon?: IconName }> = {
  paid: { tone: 'lime', icon: 'check' },
  pending: { tone: 'warning', icon: 'clock' },
  covered: { tone: 'neutral' },
  refunded: { tone: 'neutral' },
  unpaid: { tone: 'neutral' },
};

type PaymentCardProps = {
  booking: Booking;
  onPay: (payer: number) => void;
};

/** Who owes what, who has paid, and the buttons that simulate each payment. */
export function PaymentCard({ booking, onPay }: PaymentCardProps) {
  const { t } = useLanguage();
  const collected = totalPaid(booking);

  return (
    <Card>
      <Heading>{t('paymentStatus')}</Heading>

      {booking.paid.map((paid, payer) => {
        const isAuthor = payer === 0;
        const status = payerStatus(booking, payer);
        return (
          <Fragment key={payer}>
            <Column gap={12}>
              <View style={styles.payer}>
                <View style={[styles.avatar, isAuthor && styles.avatarAuthor]}>
                  {isAuthor ? <Icon name="person" size={18} /> : <Text style={styles.avatarText}>{payer}</Text>}
                </View>
                <Column gap={4} style={styles.who}>
                  <Text style={styles.name}>{isAuthor ? t('author') : t('friend', { number: payer })}</Text>
                  <Badge tone={STATUS[status].tone} icon={STATUS[status].icon}>
                    {t(status)}
                  </Badge>
                </Column>
                {/* Until someone pays, show what they owe, muted so it does not read as money received. */}
                <Text style={[styles.amount, paid === 0 && styles.amountOwed]}>{money(paid || booking.share)}</Text>
              </View>
              {canPay(booking, payer) && (
                <Button
                  secondary
                  label={isAuthor ? t('simulateMine') : t('simulateFriend', { number: payer })}
                  onPress={() => onPay(payer)}
                />
              )}
            </Column>
            <Divider />
          </Fragment>
        );
      })}

      <Column gap={8}>
        <Row>
          <Label>{t('totalPaid')}</Label>
          <Text style={styles.amount}>
            {money(collected)} / {money(booking.total)}
          </Text>
        </Row>
        <ProgressBar value={collected / booking.total} accessibilityLabel={t('totalPaid')} />
      </Column>
    </Card>
  );
}

const styles = StyleSheet.create({
  payer: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.tag,
  },
  avatarAuthor: { backgroundColor: colors.lime },
  avatarText: { fontSize: 15, fontWeight: '800', color: colors.ink },
  who: { flex: 1 },
  name: { fontSize: 15, lineHeight: 22, fontWeight: '700', color: colors.ink },
  amount: { fontSize: 16, lineHeight: 24, fontWeight: '800', color: colors.ink, fontVariant: ['tabular-nums'] },
  amountOwed: { fontWeight: '600', color: colors.muted },
});
