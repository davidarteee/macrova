import '@/i18n';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from '@/design/theme';
import { AuthProvider, useAuth } from '@/features/auth/AuthProvider';
import { isSupabaseConfigured } from '@/lib/supabase';

// Redirects based on session state. Without Supabase config the app stays open (local dev only).
function AuthGate({ children }: { children: React.ReactNode }) {
  const { session, loading, recovering } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const { colors } = useTheme();
  const group = segments[0] as string | undefined;
  const inAuth = group === '(auth)';
  const onReset = (segments as string[]).includes('reset-password');

  useEffect(() => {
    if (loading || !isSupabaseConfigured) return;
    if (recovering && !onReset) router.replace('/reset-password');
    else if (!session && !inAuth) router.replace('/sign-in');
    else if (session && inAuth && !onReset) router.replace('/today');
  }, [loading, session, recovering, inAuth, onReset, router]);

  if (loading && isSupabaseConfigured) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }
  return <>{children}</>;
}

function Inner() {
  const { scheme } = useTheme();
  return (
    <>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <AuthGate>
        <Stack screenOptions={{ headerShown: false }} />
      </AuthGate>
    </>
  );
}

export default function RootLayout() {
  const [client] = useState(() => new QueryClient());
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={client}>
        <ThemeProvider>
          <AuthProvider>
            <Inner />
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
