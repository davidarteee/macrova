import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/design/components';
import { space } from '@/design/tokens';
import { useTheme } from '@/design/theme';

export function AuthShell({ title, children }: { title: string; children: React.ReactNode }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: space.xl, paddingTop: insets.top + space.xl }} keyboardShouldPersistTaps="handled">
        <View style={{ width: '100%', maxWidth: 400, alignSelf: 'center', gap: space.lg }}>
          <View style={{ gap: space.xs }}>
            <Text size="xxl" weight="700" style={{ color: colors.accent }}>Macrova</Text>
            <Text muted>Nutrition. Training. Progress.</Text>
          </View>
          <Text size="lg" weight="600">{title}</Text>
          {children}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
