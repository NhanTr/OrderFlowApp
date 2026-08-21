import { Stack, useLocalSearchParams } from 'expo-router';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { StatusBadge } from '@/components/status-badge';
import { AppColors, Radius, Spacing, Typography } from '@/theme/tokens';
import type { OrderDetail, OrderItem, OrderTimelineEvent } from '@/types';
import { formatDateTime, formatMoney, multiplyMoney } from '@/utils/format';
import { getFulfillmentStatus, getPaymentStatus } from '@/utils/status';

import { useOrderDetail } from './useOrders';

export function OrderDetailView() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const orderId = Array.isArray(params.id) ? params.id[0] : params.id;
  const query = useOrderDetail(orderId ?? '');

  if (!orderId) return <DetailMessage message="Mã đơn hàng không hợp lệ." />;
  if (query.isPending) return <DetailMessage loading message="Đang tải chi tiết đơn hàng…" />;
  if (query.isError) {
    return (
      <DetailMessage
        actionLabel="Thử lại"
        message={query.error.message}
        onAction={() => query.refetch()}
      />
    );
  }

  return <DetailContent order={query.data} refreshing={query.isRefetching} onRefresh={() => query.refetch()} />;
}

function DetailContent({
  onRefresh,
  order,
  refreshing,
}: {
  onRefresh: () => void;
  order: OrderDetail;
  refreshing: boolean;
}) {
  const payment = getPaymentStatus(order.paymentStatus);
  const fulfillment = getFulfillmentStatus(order.fulfillmentStatus);

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
      <Stack.Screen options={{ title: order.orderCode }} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <View style={styles.heroRow}>
            <View style={styles.flexOne}>
              <Text style={styles.eyebrow}>ĐƠN HÀNG</Text>
              <Text accessibilityRole="header" style={styles.title}>
                {order.orderCode}
              </Text>
              <Text style={styles.muted}>{formatDateTime(order.createdAt)}</Text>
            </View>
            <Text style={styles.total}>{formatMoney(order.totalAmount)}</Text>
          </View>
          <View style={styles.badges}>
            <StatusBadge label={payment.label} tone={payment.tone} />
            <StatusBadge label={fulfillment.label} tone={fulfillment.tone} />
          </View>
        </View>

        <Section title="Thanh toán và vận hành">
          <InfoRow
            label="Phương thức"
            value={
              order.paymentMethod === 'QR'
                ? 'Chuyển khoản QR'
                : order.paymentMethod === 'CASH'
                  ? 'Tiền mặt'
                  : 'Chưa chọn'
            }
          />
          <InfoRow label="Người tạo" value={order.createdByUserId} />
          <InfoRow label="Barista phụ trách" value={order.assignedBaristaId ?? 'Chưa phân công'} />
          <InfoRow label="Thanh toán lúc" value={formatDateTime(order.paidAt)} />
          <InfoRow label="Cập nhật lúc" value={formatDateTime(order.updatedAt)} />
        </Section>

        <Section title={`Món (${order.items.length})`}>
          {order.items.length === 0 ? (
            <Text style={styles.emptyText}>Đơn hàng chưa có món.</Text>
          ) : (
            order.items.map((item) => <OrderItemRow item={item} key={item.id} />)
          )}
        </Section>

        {order.customerNote || order.cancellationReason ? (
          <Section title="Ghi chú">
            {order.customerNote ? <InfoRow label="Khách hàng" value={order.customerNote} /> : null}
            {order.cancellationReason ? (
              <InfoRow label="Lý do hủy" value={order.cancellationReason} />
            ) : null}
          </Section>
        ) : null}

        <Section title="Dòng thời gian">
          {order.timeline.length === 0 ? (
            <Text style={styles.emptyText}>Chưa có sự kiện trạng thái.</Text>
          ) : (
            order.timeline.map((event, index) => (
              <TimelineRow event={event} key={event.id ?? `${event.createdAt}-${index}`} />
            ))
          )}
        </Section>

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ busy: refreshing }}
          disabled={refreshing}
          onPress={onRefresh}
          style={styles.refreshButton}>
          {refreshing ? (
            <ActivityIndicator color={AppColors.brandDark} />
          ) : (
            <Text style={styles.refreshText}>Làm mới chi tiết</Text>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function OrderItemRow({ item }: { item: OrderItem }) {
  return (
    <View style={styles.itemRow}>
      <View style={styles.quantityBadge}>
        <Text style={styles.quantityText}>{item.quantity}×</Text>
      </View>
      <View style={styles.flexOne}>
        <Text style={styles.itemName}>{item.itemName}</Text>
        {item.note ? <Text style={styles.muted}>{item.note}</Text> : null}
        <Text style={styles.muted}>{formatMoney(item.unitPrice)} / món</Text>
      </View>
      <Text style={styles.itemAmount}>
        {formatMoney(multiplyMoney(item.unitPrice, item.quantity))}
      </Text>
    </View>
  );
}

function TimelineRow({ event }: { event: OrderTimelineEvent }) {
  return (
    <View style={styles.timelineRow}>
      <View style={styles.timelineDot} />
      <View style={styles.flexOne}>
        <Text style={styles.itemName}>{event.label ?? event.status ?? 'Cập nhật đơn hàng'}</Text>
        {event.note ? <Text style={styles.muted}>{event.note}</Text> : null}
        <Text style={styles.muted}>{formatDateTime(event.createdAt)}</Text>
      </View>
    </View>
  );
}

function Section({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <View style={styles.section}>
      <Text accessibilityRole="header" style={styles.sectionTitle}>
        {title}
      </Text>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text selectable style={styles.infoValue}>
        {value}
      </Text>
    </View>
  );
}

function DetailMessage({
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
          <Pressable accessibilityRole="button" onPress={onAction} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>{actionLabel}</Text>
          </Pressable>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: AppColors.background },
  content: { gap: Spacing.lg, padding: Spacing.lg, paddingBottom: Spacing.xxl },
  heroCard: {
    gap: Spacing.lg,
    padding: Spacing.xl,
    borderRadius: Radius.lg,
    backgroundColor: AppColors.brandDark,
  },
  heroRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md },
  flexOne: { flex: 1, gap: Spacing.xs },
  eyebrow: { color: AppColors.brandSoft, fontSize: Typography.caption, fontWeight: '800', letterSpacing: 1.2 },
  title: { color: AppColors.surface, fontSize: Typography.heading, fontWeight: '800' },
  total: { color: AppColors.surface, fontSize: Typography.title, fontWeight: '800' },
  muted: { color: AppColors.textMuted, fontSize: Typography.caption, lineHeight: 18 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  section: {
    gap: Spacing.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: Radius.lg,
    backgroundColor: AppColors.surface,
  },
  sectionTitle: { color: AppColors.text, fontSize: Typography.title, fontWeight: '800' },
  sectionContent: { gap: Spacing.md },
  infoRow: { gap: Spacing.xs },
  infoLabel: { color: AppColors.textMuted, fontSize: Typography.caption },
  infoValue: { color: AppColors.text, fontSize: Typography.body, fontWeight: '600' },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  quantityBadge: {
    minWidth: 40,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
    backgroundColor: AppColors.brandSoft,
  },
  quantityText: { color: AppColors.brandDark, fontSize: Typography.body, fontWeight: '800' },
  itemName: { color: AppColors.text, fontSize: Typography.body, fontWeight: '700' },
  itemAmount: { color: AppColors.text, fontSize: Typography.body, fontWeight: '700' },
  timelineRow: { flexDirection: 'row', gap: Spacing.md },
  timelineDot: { width: 10, height: 10, marginTop: 5, borderRadius: Radius.pill, backgroundColor: AppColors.brand },
  emptyText: { paddingVertical: Spacing.md, color: AppColors.textMuted, textAlign: 'center' },
  refreshButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: AppColors.brandDark,
    borderRadius: Radius.md,
  },
  refreshText: { color: AppColors.brandDark, fontSize: Typography.body, fontWeight: '700' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.lg, padding: Spacing.xl },
  centeredText: { color: AppColors.textMuted, fontSize: Typography.body, lineHeight: 24, textAlign: 'center' },
  primaryButton: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.md,
    backgroundColor: AppColors.brandDark,
  },
  primaryButtonText: { color: AppColors.surface, fontSize: Typography.body, fontWeight: '700' },
});
