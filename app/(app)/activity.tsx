import { useTranslation } from 'react-i18next';
import { Card, Screen, Text } from '@/design/components';

export default function ActivityScreen() {
  const { t } = useTranslation();
  return (
    <Screen title={t('tabs.activity')} subtitle={t('activity.subtitle')}>
      <Card>
        <Text muted>{t('common.comingSoon')}</Text>
      </Card>
    </Screen>
  );
}
