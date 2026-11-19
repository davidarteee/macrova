import { useTranslation } from 'react-i18next';
import { Card, Screen, Segmented, Text } from '@/design/components';
import { useTheme, type ThemePreference } from '@/design/theme';
import i18n, { SUPPORTED_LANGUAGES, type Language } from '@/i18n';
import { isSupabaseConfigured } from '@/lib/supabase';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { preference, setPreference } = useTheme();
  const lang = (i18n.resolvedLanguage ?? 'ca') as Language;

  return (
    <Screen title={t('tabs.profile')} subtitle={t('profile.subtitle')}>
      <Card>
        <Text weight="600">{t('profile.appearance')}</Text>
        <Segmented<ThemePreference>
          value={preference}
          onChange={setPreference}
          options={(['light', 'dark', 'system'] as const).map((v) => ({ value: v, label: t(`profile.theme.${v}`) }))}
        />
      </Card>
      <Card>
        <Text weight="600">{t('profile.language')}</Text>
        <Segmented<Language>
          value={lang}
          onChange={(l) => void i18n.changeLanguage(l)}
          options={SUPPORTED_LANGUAGES.map((l) => ({ value: l, label: l.toUpperCase() }))}
        />
      </Card>
      <Card>
        <Text weight="600">{t('profile.backend')}</Text>
        <Text muted>{isSupabaseConfigured ? t('profile.backendOk') : t('profile.backendMissing')}</Text>
      </Card>
    </Screen>
  );
}
