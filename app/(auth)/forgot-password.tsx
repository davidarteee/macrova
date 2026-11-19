import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { Button, Field, Notice, Text } from '@/design/components';
import { useAuth } from '@/features/auth/AuthProvider';
import { AuthShell } from '@/features/auth/AuthShell';
import { authErrorKey } from '@/features/auth/errors';

export default function ForgotPassword() {
  const { t } = useTranslation();
  const { sendPasswordReset } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const schema = z.object({ email: z.string().trim().email(t('auth.validation.email')) });
  const { control, handleSubmit, formState: { errors } } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  const submit = handleSubmit(async (v) => {
    setBusy(true);
    setError(null);
    const { error: e } = await sendPasswordReset(v.email.trim());
    setBusy(false);
    // Same message whether or not the account exists (no account enumeration).
    if (e && authErrorKey(e) !== 'generic') setError(t(`auth.errors.${authErrorKey(e)}`));
    else setSent(true);
  });

  return (
    <AuthShell title={t('auth.sendReset')}>
      {error ? <Notice kind="error">{error}</Notice> : null}
      {sent ? <Notice kind="success">{t('auth.resetSent')}</Notice> : null}
      <Controller control={control} name="email" render={({ field }) => (
        <Field label={t('auth.email')} value={field.value} onChangeText={field.onChange} error={errors.email?.message} autoCapitalize="none" keyboardType="email-address" />
      )} />
      <Button label={busy ? t('auth.loading') : t('auth.sendReset')} onPress={submit} />
      <Link href="/sign-in"><Text muted>{t('auth.backToSignIn')}</Text></Link>
    </AuthShell>
  );
}
