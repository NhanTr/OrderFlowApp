import { Stack, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { StatusBadge } from '@/components/status-badge';
import { AppColors, Radius, Spacing, Typography } from '@/theme/tokens';
import { formatDateTime } from '@/utils/format';

import { useEmployee } from './useEmployees';

export function EmployeeDetailView() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const employeeId = Array.isArray(params.id) ? params.id[0] : params.id;
  const query = useEmployee(employeeId ?? '');

  if (!employeeId) return <DetailMessage message="Mã nhân viên không hợp lệ." />;
  if (query.isPending) return <DetailMessage loading message="Đang tải chi tiết nhân viên…" />;
  if (query.isError) {
    return <DetailMessage actionLabel="Thử lại" message={query.error.message} onAction={() => query.refetch()} />;
  }

  const employee = query.data;
  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
      <Stack.Screen options={{ title: employee.fullName }} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials(employee.fullName)}</Text>
          </View>
          <Text accessibilityRole="header" style={styles.name}>{employee.fullName}</Text>
          <View style={styles.badges}>
            <StatusBadge label={employee.role === 'BARISTA' ? 'Barista' : 'Phục vụ'} tone="info" />
            <StatusBadge label={employee.status === 'ACTIVE' ? 'Hoạt động' : 'Ngừng hoạt động'} tone={employee.status === 'ACTIVE' ? 'success' : 'neutral'} />
          </View>
        </View>
        <View style={styles.card}>
          <Info label="Username" value={employee.username ? `@${employee.username}` : 'Chưa có'} />
          <Info label="Telegram User ID" value={employee.telegramUserId} />
          <Info label="Telegram Chat ID" value={employee.telegramChatId ?? 'Chưa liên kết'} />
          <Info label="Ngày tạo" value={formatDateTime(employee.createdAt)} />
          <Info label="Cập nhật" value={formatDateTime(employee.updatedAt)} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function initials(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  return `${parts.at(-2)?.[0] ?? ''}${parts.at(-1)?.[0] ?? ''}`.toUpperCase();
}

function Info({ label, value }: { label: string; value: string }) {
  return <View style={styles.info}><Text style={styles.infoLabel}>{label}</Text><Text selectable style={styles.infoValue}>{value}</Text></View>;
}

function DetailMessage({ actionLabel, loading, message, onAction }: { actionLabel?: string; loading?: boolean; message: string; onAction?: () => void }) {
  return <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}><View style={styles.centered}>{loading ? <ActivityIndicator color={AppColors.brandDark} size="large" /> : null}<Text style={styles.centeredText}>{message}</Text>{actionLabel && onAction ? <Pressable accessibilityRole="button" onPress={onAction} style={styles.retryButton}><Text style={styles.retryText}>{actionLabel}</Text></Pressable> : null}</View></SafeAreaView>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: AppColors.background },
  content: { gap: Spacing.lg, padding: Spacing.lg, paddingBottom: Spacing.xxl },
  hero: { alignItems: 'center', gap: Spacing.md, padding: Spacing.xl, borderRadius: Radius.lg, backgroundColor: AppColors.brandDark },
  avatar: { width: 80, height: 80, alignItems: 'center', justifyContent: 'center', borderRadius: Radius.pill, backgroundColor: AppColors.brandSoft },
  avatarText: { color: AppColors.brandDark, fontSize: Typography.display, fontWeight: '800' },
  name: { color: AppColors.surface, fontSize: Typography.heading, fontWeight: '800', textAlign: 'center' },
  badges: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: Spacing.sm },
  card: { gap: Spacing.lg, padding: Spacing.xl, borderWidth: 1, borderColor: AppColors.border, borderRadius: Radius.lg, backgroundColor: AppColors.surface },
  info: { gap: Spacing.xs },
  infoLabel: { color: AppColors.textMuted, fontSize: Typography.caption },
  infoValue: { color: AppColors.text, fontSize: Typography.body, fontWeight: '600' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.lg, padding: Spacing.xl },
  centeredText: { color: AppColors.textMuted, fontSize: Typography.body, lineHeight: 24, textAlign: 'center' },
  retryButton: { minHeight: 44, justifyContent: 'center', paddingHorizontal: Spacing.xl, borderRadius: Radius.md, backgroundColor: AppColors.brandDark },
  retryText: { color: AppColors.surface, fontSize: Typography.body, fontWeight: '700' },
});
