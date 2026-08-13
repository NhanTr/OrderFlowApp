import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppColors, Radius, Spacing, Typography } from '@/theme/tokens';
import type { FulfillmentStatus, PaymentStatus } from '@/types';
import { getFulfillmentStatus, getPaymentStatus } from '@/utils/status';

import type { OrderListFilters } from './useOrders';

const paymentOptions: PaymentStatus[] = [
  'UNPAID',
  'PENDING',
  'PAID',
  'UNDERPAID',
  'OVERPAID',
  'REVIEW',
];
const fulfillmentOptions: FulfillmentStatus[] = [
  'PENDING_PAYMENT',
  'QUEUED',
  'PREPARING',
  'READY',
  'DELIVERED',
  'CANCELLED',
];

export function OrderFilters({
  filters,
  onChange,
}: {
  filters: OrderListFilters;
  onChange: (filters: OrderListFilters) => void;
}) {
  return (
    <View style={styles.container}>
      <FilterRow label="Thanh toán">
        <FilterChip
          label="Tất cả"
          selected={!filters.paymentStatus}
          onPress={() => onChange({ ...filters, paymentStatus: undefined })}
        />
        {paymentOptions.map((status) => (
          <FilterChip
            key={status}
            label={getPaymentStatus(status).label}
            selected={filters.paymentStatus === status}
            onPress={() => onChange({ ...filters, paymentStatus: status })}
          />
        ))}
      </FilterRow>

      <FilterRow label="Vận hành">
        <FilterChip
          label="Tất cả"
          selected={!filters.fulfillmentStatus}
          onPress={() => onChange({ ...filters, fulfillmentStatus: undefined })}
        />
        {fulfillmentOptions.map((status) => (
          <FilterChip
            key={status}
            label={getFulfillmentStatus(status).label}
            selected={filters.fulfillmentStatus === status}
            onPress={() => onChange({ ...filters, fulfillmentStatus: status })}
          />
        ))}
      </FilterRow>
    </View>
  );
}

function FilterRow({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <View style={styles.rowGroup}>
      <Text style={styles.label}>{label}</Text>
      <ScrollView
        contentContainerStyle={styles.chips}
        horizontal
        showsHorizontalScrollIndicator={false}>
        {children}
      </ScrollView>
    </View>
  );
}

function FilterChip({
  label,
  onPress,
  selected,
}: {
  label: string;
  onPress: () => void;
  selected: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}>
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.md, paddingBottom: Spacing.md },
  rowGroup: { gap: Spacing.sm },
  label: { color: AppColors.text, fontSize: Typography.caption, fontWeight: '700' },
  chips: { gap: Spacing.sm, paddingRight: Spacing.lg },
  chip: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: Radius.pill,
    backgroundColor: AppColors.surface,
  },
  chipSelected: { borderColor: AppColors.brandDark, backgroundColor: AppColors.brandSoft },
  chipText: { color: AppColors.textMuted, fontSize: Typography.caption, fontWeight: '600' },
  chipTextSelected: { color: AppColors.brandDark },
});
