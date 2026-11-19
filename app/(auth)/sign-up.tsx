import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { z } from 'zod';
import { Button, Field, Notice, Text } from '@/design/components';
import { space } from '@/design/tokens';
import { useAuth } from '@/features/auth/AuthProvider';
import { AuthShell } from '@/features/auth/AuthShell';
import { authErrorKey } from '@/features/auth/errors';

export default function SignUp() {
  const { t } = useTranslation();
  const { signUp, signInWithGoogle } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const schema = z
    .object({
      name: z.string().trim().optional(),
      email: z.string().trim().email(t('auth.validation.email')),
      password: z.string().min(8, t('auth.validation.passwordMin')),
      confirm: z.string(),
    })
    .refine((v) => v.password === v.confirm, { path: ['confirm'], message: t('auth.validation.passwordMatch') });
  const { control, handleSubmit, formState: { errors } } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', password: '', confirm: '' },
  });

  const submit = handleSubmit(async (v) => {
    setBusy(true);
    setError(null);
    const res = await signUp(v.email.trim(), v.password, v.name || undefined);
    setBusy(false);
    if (res.error) setError(t(`auth.errors.${authErrorKey(res.error)}`));
    else if (res.needsConfirmation) setInfo(t('auth.checkEmail'));
  });

  return (
    <AuthShell title={t('auth.signUp')}>
      {error ? <Notice kind="error">{error}</Notice> : null}
      {info ? <Notice kind="success">{info}</Notice> : null}
      <Controller control={control} name="name" render={({ field }) => (
        <Field label={t('auth.name')} value={field.value} onChangeText={field.onChange} autoComplete="name" />
      )} />
      <Controller control={control} name="email" render={({ field }) => (
        <Field label={t('auth.email')} value={field.value} onChangeText={field.onChange} error={errors.email?.message}
          autoCapitalize="none" autoComplete="email" keyboardType="email-address" />
      )} />
      <Controller control={control} name="password" render={({ field }) => (
        <Field label={t('auth.password')} value={field.value} onChangeText={field.onChange} error={errors.password?.message} secureTextEntry autoComplete="new-password" />
      )} />
      <Controller control={control} name="confirm" render={({ field }) => (
        <Field label={t('auth.confirmPassword')} value={field.value} onChangeText={field.onChange} error={errors.confirm?.message} secureTextEntry autoComplete="new-password" />
      )} />
      <Button label={busy ? t('auth.loading') : t('auth.signUp')} onPress={submit} />
      <Button variant="secondary" label={t('auth.google')} onPress={() => void signInWithGoogle()} />
      <View style={{ alignItems: 'center', gap: space.sm }}>
        <Link href="/sign-in"><Text muted>{t('auth.haveAccount')} <Text weight="600">{t('auth.signIn')}</Text></Text></Link>
      </View>
    </AuthShell>
  );
}
