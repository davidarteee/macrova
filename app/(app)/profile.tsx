import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Card, Notice, Screen, Segmented, Text } from '@/design/components';
import { useAuth } from '@/features/auth/AuthProvider';
import { authErrorKey } from '@/features/auth/errors';
import { confirmAction } from '@/lib/confirm';
import { useTheme, type ThemePreference } from '@/design/theme';
import i18n, { SUPPORTED_LANGUAGES, type Language } from '@/i18n';
import { isSupabaseConfigured } from '@/lib/supabase';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { preference, setPreference } = useTheme();
  const { user, signOut, deleteAccount } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const onDelete = async () => {
    const ok = await confirmAction(t('auth.deleteConfirmTitle'), t('auth.deleteConfirmBody'), t('auth.delete'), t('auth.cancel'));
    if (!ok) return;
    const { error: e } = await deleteAccount();
    if (e) setError(t(`auth.errors.${authErrorKey(e)}`));
  };
  const lang = (i18n.resolvedLanguage ?? 'ca') as Language;

  return (
    <Screen title={t('tabs.profile')} subtitle={t('profile.subtitle')}>
      {user ? (
        <Card>
          <Text weight="600">{t('auth.account')}</Text>
          <Text muted>{user.email}</Text>
          {error ? <Notice kind="error">{error}</Notice> : null}
          <Button variant="secondary" label={t('auth.signOut')} onPress={() => void signOut()} />
          <Button variant="secondary" label={t('auth.deleteAccount')} onPress={onDelete} />
        </Card>
      ) : null}
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
