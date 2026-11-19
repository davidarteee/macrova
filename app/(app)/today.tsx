import { useTranslation } from 'react-i18next';
import { Card, Screen, Text } from '@/design/components';

export default function TodayScreen() {
  const { t } = useTranslation();
  return (
    <Screen title={t('tabs.today')} subtitle={t('today.subtitle')}>
      <Card>
        <Text muted>{t('common.comingSoon')}</Text>
      </Card>
    </Screen>
  );
}
