import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { Button, Field, Notice } from '@/design/components';
import { useAuth } from '@/features/auth/AuthProvider';
import { AuthShell } from '@/features/auth/AuthShell';
import { authErrorKey } from '@/features/auth/errors';

export default function ResetPassword() {
  const { t } = useTranslation();
  const router = useRouter();
  const { updatePassword } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const schema = z
    .object({ password: z.string().min(8, t('auth.validation.passwordMin')), confirm: z.string() })
    .refine((v) => v.password === v.confirm, { path: ['confirm'], message: t('auth.validation.passwordMatch') });
  const { control, handleSubmit, formState: { errors } } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { password: '', confirm: '' },
  });

  const submit = handleSubmit(async (v) => {
    setBusy(true);
    setError(null);
    const { error: e } = await updatePassword(v.password);
    setBusy(false);
    if (e) setError(t(`auth.errors.${authErrorKey(e)}`));
    else router.replace('/today');
  });

  return (
    <AuthShell title={t('auth.newPassword')}>
      {error ? <Notice kind="error">{error}</Notice> : null}
      <Controller control={control} name="password" render={({ field }) => (
        <Field label={t('auth.newPassword')} value={field.value} onChangeText={field.onChange} error={errors.password?.message} secureTextEntry autoComplete="new-password" />
      )} />
      <Controller control={control} name="confirm" render={({ field }) => (
        <Field label={t('auth.confirmPassword')} value={field.value} onChangeText={field.onChange} error={errors.confirm?.message} secureTextEntry autoComplete="new-password" />
      )} />
      <Button label={busy ? t('auth.loading') : t('auth.updatePassword')} onPress={submit} />
    </AuthShell>
  );
}
