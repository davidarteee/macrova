// Maps Supabase/network errors to i18n keys under `auth.errors.*`. Never shows raw server text.
export function authErrorKey(err: unknown): string {
  const e = err as { code?: string; message?: string; status?: number } | null;
  const code = e?.code ?? '';
  const msg = (e?.message ?? '').toLowerCase();
  if (code === 'not_configured') return 'not_configured';
  if (code === 'invalid_credentials' || msg.includes('invalid login')) return 'invalid_credentials';
  if (code === 'email_not_confirmed') return 'email_not_confirmed';
  if (code === 'user_already_exists' || code === 'email_exists' || msg.includes('already registered')) return 'user_already_exists';
  if (code === 'weak_password') return 'weak_password';
  if (code.includes('rate_limit') || e?.status === 429) return 'rate_limit';
  if (msg.includes('network') || msg.includes('failed to fetch')) return 'network';
  return 'generic';
}
