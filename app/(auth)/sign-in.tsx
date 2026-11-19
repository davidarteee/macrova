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

export default function SignIn() {
  const { t } = useTranslation();
  const { signIn, signInWithGoogle } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const schema = z.object({
    email: z.string().trim().email(t('auth.validation.email')),
    password: z.string().min(1, t('auth.validation.required')),
  });
  const { control, handleSubmit, formState: { errors } } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const run = async (fn: () => Promise<{ error: unknown }>) => {
    setBusy(true);
    setError(null);
    const { error: e } = await fn();
    setBusy(false);
    if (e) setError(t(`auth.errors.${authErrorKey(e)}`));
  };

  return (
    <AuthShell title={t('auth.signIn')}>
      {error ? <Notice kind="error">{error}</Notice> : null}
      <Controller control={control} name="email" render={({ field }) => (
        <Field label={t('auth.email')} value={field.value} onChangeText={field.onChange} error={errors.email?.message}
          autoCapitalize="none" autoComplete="email" keyboardType="email-address" textContentType="emailAddress" />
      )} />
      <Controller control={control} name="password" render={({ field }) => (
        <Field label={t('auth.password')} value={field.value} onChangeText={field.onChange} error={errors.password?.message}
          secureTextEntry autoComplete="password" textContentType="password" onSubmitEditing={() => void handleSubmit((v) => run(() => signIn(v.email.trim(), v.password)))()} />
      )} />
      <Button label={busy ? t('auth.loading') : t('auth.signIn')} onPress={handleSubmit((v) => run(() => signIn(v.email.trim(), v.password)))} />
      <Button variant="secondary" label={t('auth.google')} onPress={() => run(signInWithGoogle)} />
      <View style={{ gap: space.sm, alignItems: 'center' }}>
        <Link href="/forgot-password"><Text muted>{t('auth.forgot')}</Text></Link>
        <Link href="/sign-up"><Text muted>{t('auth.noAccount')} <Text weight="600">{t('auth.signUp')}</Text></Text></Link>
      </View>
    </AuthShell>
  );
}
