import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/auth/AuthProvider';
import { environment } from '@/config/environment';
import { AppColors, Radius, Spacing, Typography } from '@/theme/tokens';

export default function MoreScreen() {
  const { logout, user } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch {
      Alert.alert(
        'Đã đăng xuất trên thiết bị',
        'Không thể hoàn tất yêu cầu với máy chủ. Phiên trên thiết bị vẫn đã được xóa.',
      );
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.eyebrow}>TÀI KHOẢN OWNER</Text>
          <Text accessibilityRole="header" style={styles.name}>
            {user?.fullName}
          </Text>
          <View style={styles.details}>
            <Detail label="Tên đăng nhập" value={user?.username ?? 'Chưa có'} />
            <Detail label="Vai trò" value="Chủ quán" />
            <Detail label="Môi trường" value={environment.name} />
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ busy: isLoggingOut, disabled: isLoggingOut }}
            disabled={isLoggingOut}
            onPress={handleLogout}
            style={({ pressed }) => [styles.logoutButton, pressed && styles.logoutPressed]}>
            {isLoggingOut ? (
              <ActivityIndicator color={AppColors.danger} />
            ) : (
              <Text style={styles.logoutText}>Đăng xuất</Text>
            )}
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: AppColors.background },
  container: { flex: 1, padding: Spacing.lg },
  card: {
    gap: Spacing.lg,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: Radius.lg,
    backgroundColor: AppColors.surface,
  },
  eyebrow: {
    color: AppColors.brandDark,
    fontSize: Typography.caption,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  name: { color: AppColors.text, fontSize: Typography.heading, fontWeight: '800' },
  details: { gap: Spacing.md },
  detailRow: { gap: Spacing.xs },
  detailLabel: { color: AppColors.textMuted, fontSize: Typography.caption },
  detailValue: { color: AppColors.text, fontSize: Typography.body, fontWeight: '600' },
  logoutButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
    borderWidth: 1,
    borderColor: AppColors.danger,
    borderRadius: Radius.md,
  },
  logoutPressed: { backgroundColor: '#FEE2E2' },
  logoutText: { color: AppColors.danger, fontSize: Typography.body, fontWeight: '700' },
});
