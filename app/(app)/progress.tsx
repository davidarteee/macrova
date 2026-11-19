import { useTranslation } from 'react-i18next';
import { Card, Screen, Text } from '@/design/components';

export default function ProgressScreen() {
  const { t } = useTranslation();
  return (
    <Screen title={t('tabs.progress')} subtitle={t('progress.subtitle')}>
      <Card>
        <Text muted>{t('common.comingSoon')}</Text>
      </Card>
    </Screen>
  );
}
