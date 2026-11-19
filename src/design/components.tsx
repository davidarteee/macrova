import React from 'react';
import { Pressable, ScrollView, Text as RNText, View, type TextProps, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { font, radius, space } from './tokens';
import { useTheme } from './theme';

export function Text({ muted, size = 'md', weight = '400', style, ...rest }: TextProps & {
  muted?: boolean;
  size?: keyof typeof font;
  weight?: '400' | '500' | '600' | '700';
}) {
  const { colors } = useTheme();
  return <RNText {...rest} style={[{ color: muted ? colors.textMuted : colors.text, fontSize: font[size], fontWeight: weight }, style]} />;
}

export function Screen({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: space.lg, paddingTop: insets.top + space.lg, gap: space.lg, maxWidth: 960, width: '100%', alignSelf: 'center' }}>
      <View style={{ gap: space.xs }}>
        <Text size="xl" weight="700">{title}</Text>
        {subtitle ? <Text muted>{subtitle}</Text> : null}
      </View>
      {children}
    </ScrollView>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  const { colors } = useTheme();
  return (
    <View style={[{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: radius.lg, padding: space.lg, gap: space.sm }, style]}>
      {children}
    </View>
  );
}

export function Button({ label, onPress, variant = 'primary' }: { label: string; onPress: () => void; variant?: 'primary' | 'secondary' }) {
  const { colors } = useTheme();
  const primary = variant === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: primary ? colors.accent : colors.surfaceAlt,
        paddingVertical: space.md,
        paddingHorizontal: space.lg,
        borderRadius: radius.md,
        alignItems: 'center',
        opacity: pressed ? 0.85 : 1,
        minHeight: 44,
        justifyContent: 'center',
      })}>
      <RNText style={{ color: primary ? colors.onAccent : colors.text, fontWeight: '600', fontSize: font.md }}>{label}</RNText>
    </Pressable>
  );
}

export function Segmented<T extends string>({ value, options, onChange }: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: 3 }}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(o.value)}
            style={{ flex: 1, paddingVertical: space.sm, alignItems: 'center', borderRadius: radius.sm, backgroundColor: active ? colors.surface : 'transparent' }}>
            <RNText style={{ color: active ? colors.text : colors.textMuted, fontWeight: '600', fontSize: font.sm }}>{o.label}</RNText>
          </Pressable>
        );
      })}
    </View>
  );
}
