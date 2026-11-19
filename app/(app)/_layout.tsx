import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useWindowDimensions } from 'react-native';
import { useTheme } from '@/design/theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];
const TABS: { name: string; icon: IconName; key: string }[] = [
  { name: 'today', icon: 'today-outline', key: 'today' },
  { name: 'food', icon: 'nutrition-outline', key: 'food' },
  { name: 'activity', icon: 'barbell-outline', key: 'activity' },
  { name: 'progress', icon: 'stats-chart-outline', key: 'progress' },
  { name: 'profile', icon: 'person-circle-outline', key: 'profile' },
];

export default function AppLayout() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const desktop = width >= 900; // sidebar on desktop, bottom bar on mobile

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarPosition: desktop ? 'left' : 'bottom',
        tabBarVariant: desktop ? 'material' : 'uikit',
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.surface, borderColor: colors.border },
        sceneStyle: { backgroundColor: colors.bg },
      }}>
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: t(`tabs.${tab.key}`),
            tabBarIcon: ({ color, size }) => <Ionicons name={tab.icon} color={String(color)} size={size} />,
          }}
        />
      ))}
    </Tabs>
  );
}
