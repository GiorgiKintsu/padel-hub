import { router } from 'expo-router';
import { Fragment } from 'react';
import { StyleSheet, View } from 'react-native';

import { Screen } from '@/components/screen';
import { Badge, Card, Column, Copy, Divider, Heading, IconTile, Row, Title } from '@/components/ui';
import { NextGameCard } from '@/features/booking/components/next-game-card';
import { SearchCard } from '@/features/booking/components/search-card';
import { useLanguage } from '@/i18n/context';

/** Services that are planned but not built yet; each is listed as "coming soon". */
const UPCOMING_SERVICES = [
  { icon: 'trophy', name: 'tournaments', description: 'tournamentsDescription' },
  { icon: 'partners', name: 'partners', description: 'partnersDescription' },
  { icon: 'coach', name: 'trainers', description: 'trainersDescription' },
] as const;

export default function Home() {
  const { t } = useLanguage();

  return (
    <Screen>
      <View>
        <Copy>{t('hello')}</Copy>
        <Title>{t('homeTitle')}</Title>
      </View>

      <SearchCard onSubmit={() => router.push('/courts')} />

      <Column>
        <Heading>{t('nextGame')}</Heading>
        <NextGameCard onOpen={() => router.push('/booking')} />
      </Column>

      <Column>
        <Heading>{t('services')}</Heading>
        <Card>
          {UPCOMING_SERVICES.map((service, index) => (
            <Fragment key={service.name}>
              {index > 0 && <Divider />}
              <View style={styles.service}>
                <IconTile name={service.icon} />
                <Column gap={2} style={styles.serviceText}>
                  <Row>
                    <Heading style={styles.serviceName}>{t(service.name)}</Heading>
                    <Badge tone="neutral">{t('soon')}</Badge>
                  </Row>
                  <Copy>{t(service.description)}</Copy>
                </Column>
              </View>
            </Fragment>
          ))}
        </Card>
      </Column>
    </Screen>
  );
}

const styles = StyleSheet.create({
  service: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  serviceText: { flex: 1 },
  // Shrinks so a long name wraps instead of pushing the badge off the row.
  serviceName: { flexShrink: 1, fontSize: 16, lineHeight: 24 },
});
