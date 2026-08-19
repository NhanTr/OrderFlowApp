import { type Href, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { StatusBadge } from '@/components/status-badge';
import { AppColors, Radius, Spacing, Typography } from '@/theme/tokens';
import type { OrderSummary } from '@/types';
import { formatDateTime, formatMoney } from '@/utils/format';
import { getFulfillmentStatus, getPaymentStatus } from '@/utils/status';

export function OrderCard({ order }: { order: OrderSummary }) {
  const router = useRouter();
  const payment = getPaymentStatus(order.paymentStatus);
  const fulfillment = getFulfillmentStatus(order.fulfillmentStatus);

  return (
    <Pressable
      accessibilityHint="Mở chi tiết đơn hàng"
      accessibilityRole="button"
      onPress={() => router.push(`/orders/${order.id}` as Href)}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
      <View style={styles.topRow}>
        <View style={styles.flexOne}>
          <Text style={styles.orderCode}>{order.orderCode}</Text>
          <Text style={styles.muted}>{formatDateTime(order.createdAt)}</Text>
        </View>
        <Text style={styles.amount}>{formatMoney(order.totalAmount)}</Text>
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.method}>
          {order.paymentMethod === 'QR'
            ? 'Chuyển khoản QR'
            : order.paymentMethod === 'CASH'
              ? 'Tiền mặt'
              : 'Chưa chọn thanh toán'}
        </Text>
        <Text style={styles.chevron}>›</Text>
      </View>

      <View style={styles.badges}>
        <StatusBadge label={payment.label} tone={payment.tone} />
        <StatusBadge label={fulfillment.label} tone={fulfillment.tone} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.md,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: Radius.lg,
    backgroundColor: AppColors.surface,
  },
  cardPressed: { backgroundColor: AppColors.background },
  topRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md },
  flexOne: { flex: 1, gap: Spacing.xs },
  orderCode: { color: AppColors.text, fontSize: Typography.title, fontWeight: '800' },
  muted: { color: AppColors.textMuted, fontSize: Typography.caption },
  amount: { color: AppColors.text, fontSize: Typography.body, fontWeight: '800' },
  metaRow: { flexDirection: 'row', alignItems: 'center' },
  method: { flex: 1, color: AppColors.textMuted, fontSize: Typography.body },
  chevron: { color: AppColors.textMuted, fontSize: Typography.heading },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
});
