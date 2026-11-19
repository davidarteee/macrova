import '@/i18n';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from '@/design/theme';

function Inner() {
  const { scheme } = useTheme();
  return (
    <>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}

export default function RootLayout() {
  const [client] = useState(() => new QueryClient());
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={client}>
        <ThemeProvider>
          <Inner />
        </ThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
