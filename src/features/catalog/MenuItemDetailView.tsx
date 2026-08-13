import { Image } from 'expo-image';
import { Stack, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { StatusBadge } from '@/components/status-badge';
import { AppColors, Radius, Spacing, Typography } from '@/theme/tokens';
import { formatDateTime, formatMoney } from '@/utils/format';

import { useMenuItem } from './useCatalog';

export function MenuItemDetailView() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const itemId = Array.isArray(params.id) ? params.id[0] : params.id;
  const query = useMenuItem(itemId ?? '');

  if (!itemId) return <DetailMessage message="Mã món không hợp lệ." />;
  if (query.isPending) return <DetailMessage loading message="Đang tải chi tiết món…" />;
  if (query.isError) {
    return (
      <DetailMessage actionLabel="Thử lại" message={query.error.message} onAction={() => query.refetch()} />
    );
  }

  const item = query.data;
  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
      <Stack.Screen options={{ title: item.name }} />
      <ScrollView contentContainerStyle={styles.content}>
        {item.imageUrl ? (
          <Image contentFit="cover" source={item.imageUrl} style={styles.heroImage} transition={180} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderText}>ORDER FLOW</Text>
          </View>
        )}
        <View style={styles.card}>
          <Text style={styles.eyebrow}>MÓN TRONG THỰC ĐƠN</Text>
          <Text accessibilityRole="header" style={styles.title}>
            {item.name}
          </Text>
          <Text style={styles.price}>{formatMoney(item.price)}</Text>
          <StatusBadge
            label={item.isAvailable ? 'Đang bán' : 'Tạm hết'}
            tone={item.isAvailable ? 'success' : 'warning'}
          />
          {item.description ? <Text style={styles.description}>{item.description}</Text> : null}
          <Info label="Mã danh mục" value={item.categoryId} />
          <Info label="Thứ tự hiển thị" value={String(item.displayOrder)} />
          <Info label="Ngày tạo" value={formatDateTime(item.createdAt)} />
          <Info label="Cập nhật" value={formatDateTime(item.updatedAt)} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.info}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text selectable style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function DetailMessage({ actionLabel, loading, message, onAction }: { actionLabel?: string; loading?: boolean; message: string; onAction?: () => void }) {
  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
      <View style={styles.centered}>
        {loading ? <ActivityIndicator color={AppColors.brandDark} size="large" /> : null}
        <Text style={styles.centeredText}>{message}</Text>
        {actionLabel && onAction ? (
          <Pressable accessibilityRole="button" onPress={onAction} style={styles.retryButton}>
            <Text style={styles.retryText}>{actionLabel}</Text>
          </Pressable>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: AppColors.background },
  content: { gap: Spacing.lg, padding: Spacing.lg, paddingBottom: Spacing.xxl },
  heroImage: { width: '100%', aspectRatio: 16 / 10, borderRadius: Radius.lg, backgroundColor: AppColors.surfaceMuted },
  imagePlaceholder: { width: '100%', aspectRatio: 16 / 10, alignItems: 'center', justifyContent: 'center', borderRadius: Radius.lg, backgroundColor: AppColors.brandSoft },
  placeholderText: { color: AppColors.brandDark, fontSize: Typography.heading, fontWeight: '800' },
  card: { gap: Spacing.lg, padding: Spacing.xl, borderWidth: 1, borderColor: AppColors.border, borderRadius: Radius.lg, backgroundColor: AppColors.surface },
  eyebrow: { color: AppColors.brandDark, fontSize: Typography.caption, fontWeight: '800', letterSpacing: 1.2 },
  title: { color: AppColors.text, fontSize: Typography.display, fontWeight: '800' },
  price: { color: AppColors.brandDark, fontSize: Typography.heading, fontWeight: '800' },
  description: { color: AppColors.textMuted, fontSize: Typography.body, lineHeight: 24 },
  info: { gap: Spacing.xs },
  infoLabel: { color: AppColors.textMuted, fontSize: Typography.caption },
  infoValue: { color: AppColors.text, fontSize: Typography.body, fontWeight: '600' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.lg, padding: Spacing.xl },
  centeredText: { color: AppColors.textMuted, fontSize: Typography.body, lineHeight: 24, textAlign: 'center' },
  retryButton: { minHeight: 44, justifyContent: 'center', paddingHorizontal: Spacing.xl, borderRadius: Radius.md, backgroundColor: AppColors.brandDark },
  retryText: { color: AppColors.surface, fontSize: Typography.body, fontWeight: '700' },
});
