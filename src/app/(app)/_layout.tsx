import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="orders/[id]" options={{ title: 'Chi tiết đơn hàng' }} />
      <Stack.Screen name="menu/[id]" options={{ title: 'Chi tiết món' }} />
      <Stack.Screen name="employees/index" options={{ title: 'Nhân viên' }} />
      <Stack.Screen name="employees/[id]" options={{ title: 'Chi tiết nhân viên' }} />
    </Stack>
  );
}
