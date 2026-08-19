import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppColors, Radius, Spacing, Typography } from '@/theme/tokens';

import { OrderCard } from './OrderCard';
import { OrderFilters } from './OrderFilters';
import { type OrderListFilters, useOrders } from './useOrders';

export function OrdersView() {
  const [filters, setFilters] = useState<OrderListFilters>({});
  const query = useOrders(filters);
  const orders = useMemo(() => query.data?.pages.flatMap((page) => page.data) ?? [], [query.data]);
  const total = query.data?.pages[0]?.meta.total;

  if (query.isPending) {
    return <CenteredMessage loading message="Đang tải đơn hàng…" />;
  }

  if (query.isError && orders.length === 0) {
    return (
      <CenteredMessage
        actionLabel="Thử lại"
        message={query.error.message}
        onAction={() => query.refetch()}
      />
    );
  }

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
      <FlatList
        contentContainerStyle={[styles.list, orders.length === 0 && styles.emptyList]}
        data={orders}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        keyExtractor={(order) => order.id}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Không có đơn phù hợp</Text>
            <Text style={styles.emptyDescription}>
              Thử thay đổi bộ lọc hoặc kéo xuống để tải lại dữ liệu.
            </Text>
          </View>
        }
        ListFooterComponent={
          query.isFetchingNextPage ? (
            <ActivityIndicator color={AppColors.brandDark} style={styles.footerLoader} />
          ) : null
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.headingRow}>
              <View style={styles.flexOne}>
                <Text style={styles.eyebrow}>ĐƠN HÀNG</Text>
                <Text accessibilityRole="header" style={styles.title}>
                  Theo dõi đơn hàng
                </Text>
                <Text style={styles.subtitle}>
                  {total === undefined ? 'Dữ liệu từ hệ thống' : `${total.toLocaleString('vi-VN')} đơn`}
                </Text>
              </View>
              {query.isFetching && !query.isFetchingNextPage ? (
                <ActivityIndicator color={AppColors.brandDark} />
              ) : null}
            </View>
            {query.isError && orders.length > 0 ? (
              <View style={styles.warningBanner}>
                <Text style={styles.warningText}>
                  Không thể cập nhật dữ liệu mới. Đang hiển thị dữ liệu đã tải.
                </Text>
              </View>
            ) : null}
            <OrderFilters filters={filters} onChange={setFilters} />
          </View>
        }
        onEndReached={() => {
          if (query.hasNextPage && !query.isFetchingNextPage) query.fetchNextPage();
        }}
        onEndReachedThreshold={0.35}
        onRefresh={() => query.refetch()}
        refreshing={query.isRefetching && !query.isFetchingNextPage}
        renderItem={({ item }) => <OrderCard order={item} />}
      />
    </SafeAreaView>
  );
}

function CenteredMessage({
  actionLabel,
  loading,
  message,
  onAction,
}: {
  actionLabel?: string;
  loading?: boolean;
  message: string;
  onAction?: () => void;
}) {
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
  list: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  emptyList: { flexGrow: 1 },
  header: { gap: Spacing.lg },
  headingRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  flexOne: { flex: 1, gap: Spacing.xs },
  eyebrow: {
    color: AppColors.brandDark,
    fontSize: Typography.caption,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  title: { color: AppColors.text, fontSize: Typography.heading, fontWeight: '800' },
  subtitle: { color: AppColors.textMuted, fontSize: Typography.caption },
  warningBanner: { padding: Spacing.md, borderRadius: Radius.md, backgroundColor: '#FEF3C7' },
  warningText: { color: AppColors.warning, fontSize: Typography.caption },
  separator: { height: Spacing.md },
  footerLoader: { padding: Spacing.xl },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
  emptyTitle: { color: AppColors.text, fontSize: Typography.title, fontWeight: '700' },
  emptyDescription: {
    maxWidth: 320,
    color: AppColors.textMuted,
    fontSize: Typography.body,
    lineHeight: 24,
    textAlign: 'center',
  },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.lg, padding: Spacing.xl },
  centeredText: { color: AppColors.textMuted, fontSize: Typography.body, lineHeight: 24, textAlign: 'center' },
  retryButton: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.md,
    backgroundColor: AppColors.brandDark,
  },
  retryText: { color: AppColors.surface, fontSize: Typography.body, fontWeight: '700' },
});
