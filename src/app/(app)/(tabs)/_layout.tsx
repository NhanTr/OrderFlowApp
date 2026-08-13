import { Tabs } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import type { ColorValue } from 'react-native';

import { AppColors, Typography } from '@/theme/tokens';

type TabIconProps = {
  color: ColorValue;
  name: Parameters<typeof SymbolView>[0]['name'];
};

function TabIcon({ color, name }: TabIconProps) {
  return <SymbolView name={name} tintColor={color} size={22} />;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: AppColors.background },
        headerTitleStyle: { color: AppColors.text, fontSize: Typography.title },
        tabBarActiveTintColor: AppColors.brandDark,
        tabBarInactiveTintColor: AppColors.textMuted,
        tabBarStyle: { backgroundColor: AppColors.surface, borderTopColor: AppColors.border },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Tổng quan',
          tabBarIcon: ({ color }) => (
            <TabIcon color={color} name={{ ios: 'chart.bar.fill', android: 'bar_chart' }} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Đơn hàng',
          tabBarIcon: ({ color }) => (
            <TabIcon color={color} name={{ ios: 'list.bullet.rectangle', android: 'receipt_long' }} />
          ),
        }}
      />
      <Tabs.Screen
        name="catalog"
        options={{
          title: 'Danh mục',
          tabBarIcon: ({ color }) => (
            <TabIcon color={color} name={{ ios: 'square.grid.2x2.fill', android: 'category' }} />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'Khác',
          tabBarIcon: ({ color }) => (
            <TabIcon color={color} name={{ ios: 'ellipsis.circle.fill', android: 'more_horiz' }} />
          ),
        }}
      />
    </Tabs>
  );
}
