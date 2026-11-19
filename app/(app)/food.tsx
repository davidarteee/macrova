import { useTranslation } from 'react-i18next';
import { Card, Screen, Text } from '@/design/components';

export default function FoodScreen() {
  const { t } = useTranslation();
  return (
    <Screen title={t('tabs.food')} subtitle={t('food.subtitle')}>
      <Card>
        <Text muted>{t('common.comingSoon')}</Text>
      </Card>
    </Screen>
  );
}
