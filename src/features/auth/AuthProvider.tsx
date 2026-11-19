import type { Session, User } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import { supabase } from '@/lib/supabase';

WebBrowser.maybeCompleteAuthSession();

type Result = { error: unknown | null };
type Ctx = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  recovering: boolean; // true after following a password-recovery link
  signIn: (email: string, password: string) => Promise<Result>;
  signUp: (email: string, password: string, name?: string) => Promise<Result & { needsConfirmation: boolean }>;
  signInWithGoogle: () => Promise<Result>;
  sendPasswordReset: (email: string) => Promise<Result>;
  updatePassword: (password: string) => Promise<Result>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<Result>;
};

const AuthContext = createContext<Ctx | null>(null);
const notConfigured: Result = { error: { code: 'not_configured' } };

function redirectUrl(path: string): string {
  if (Platform.OS === 'web') return `${window.location.origin}${path}`;
  return Linking.createURL(path); // macrova://path (or exp:// in Expo Go)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [recovering, setRecovering] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, next) => {
      setSession(next);
      if (event === 'PASSWORD_RECOVERY') setRecovering(true);
      if (event === 'SIGNED_OUT') setRecovering(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signIn: Ctx['signIn'] = useCallback(async (email, password) => {
    if (!supabase) return notConfigured;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  }, []);

  const signUp: Ctx['signUp'] = useCallback(async (email, password, name) => {
    if (!supabase) return { ...notConfigured, needsConfirmation: false };
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: name ? { full_name: name } : undefined, emailRedirectTo: redirectUrl('/') },
    });
    return { error, needsConfirmation: !error && !data.session };
  }, []);

  const signInWithGoogle: Ctx['signInWithGoogle'] = useCallback(async () => {
    if (!supabase) return notConfigured;
    const redirectTo = redirectUrl('/');
    if (Platform.OS === 'web') {
      const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } });
      return { error };
    }
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo, skipBrowserRedirect: true },
    });
    if (error || !data.url) return { error: error ?? { code: 'generic' } };
    const res = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    if (res.type !== 'success') return { error: null }; // user cancelled
    const code = Linking.parse(res.url).queryParams?.code;
    if (typeof code !== 'string') return { error: { code: 'generic' } };
    const { error: exErr } = await supabase.auth.exchangeCodeForSession(code);
    return { error: exErr };
  }, []);

  const sendPasswordReset: Ctx['sendPasswordReset'] = useCallback(async (email) => {
    if (!supabase) return notConfigured;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: redirectUrl('/reset-password') });
    return { error };
  }, []);

  const updatePassword: Ctx['updatePassword'] = useCallback(async (password) => {
    if (!supabase) return notConfigured;
    const { error } = await supabase.auth.updateUser({ password });
    if (!error) setRecovering(false);
    return { error };
  }, []);

  const signOut = useCallback(async () => {
    await supabase?.auth.signOut();
  }, []);

  // Deletion runs server-side (Edge Function with the service role); the client never holds that key.
  const deleteAccount: Ctx['deleteAccount'] = useCallback(async () => {
    if (!supabase) return notConfigured;
    const { error } = await supabase.functions.invoke('delete-account', { method: 'POST' });
    if (error) return { error };
    await supabase.auth.signOut();
    return { error: null };
  }, []);

  const value = useMemo<Ctx>(
    () => ({ session, user: session?.user ?? null, loading, recovering, signIn, signUp, signInWithGoogle, sendPasswordReset, updatePassword, signOut, deleteAccount }),
    [session, loading, recovering, signIn, signUp, signInWithGoogle, sendPasswordReset, updatePassword, signOut, deleteAccount],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): Ctx {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
