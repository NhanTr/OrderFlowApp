import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/auth/AuthProvider';
import { StatusBadge } from '@/components/status-badge';
import { AppColors, Radius, Spacing, Typography } from '@/theme/tokens';
import type { DashboardDays, DashboardSnapshot, OrderSummary, RevenuePoint } from '@/types';
import { formatChartLabel, formatDateTime, formatMoney } from '@/utils/format';
import { getFulfillmentStatus, getPaymentStatus } from '@/utils/status';

import { useDashboard } from './useDashboard';

const dayOptions: { label: string; value: DashboardDays }[] = [
  { label: '1 ngày', value: 1 },
  { label: '7 ngày', value: 7 },
  { label: '30 ngày', value: 30 },
];

export function DashboardView() {
  const { user } = useAuth();
  const [days, setDays] = useState<DashboardDays>(7);
  const query = useDashboard(days);

  if (query.isPending && !query.data) {
    return <FullScreenMessage loading message="Đang tải dashboard…" />;
  }

  if (query.isError && !query.data) {
    return (
      <FullScreenMessage
        message={query.error.message}
        actionLabel="Thử lại"
        onAction={() => query.refetch()}
      />
    );
  }

  if (!query.data) return null;

  return (
    <DashboardContent
      data={query.data}
      days={days}
      isFetching={query.isFetching}
      isPlaceholderData={query.isPlaceholderData}
      refetchError={query.isError ? query.error.message : null}
      userName={user?.fullName ?? 'Chủ quán'}
      onChangeDays={setDays}
      onRefresh={() => query.refetch()}
    />
  );
}

type DashboardContentProps = {
  data: DashboardSnapshot;
  days: DashboardDays;
  isFetching: boolean;
  isPlaceholderData: boolean;
  onChangeDays: (days: DashboardDays) => void;
  onRefresh: () => Promise<unknown>;
  refetchError: string | null;
  userName: string;
};

function DashboardContent({
  data,
  days,
  isFetching,
  isPlaceholderData,
  onChangeDays,
  onRefresh,
  refetchError,
  userName,
}: DashboardContentProps) {
  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isFetching && !isPlaceholderData} onRefresh={onRefresh} />}>
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>TỔNG QUAN</Text>
            <Text accessibilityRole="header" style={styles.title}>
              Xin chào, {userName}
            </Text>
            <Text style={styles.updatedAt}>
              Cập nhật {formatDateTime(data.generatedAt)} · {data.timeZone}
            </Text>
          </View>
          {isFetching ? <ActivityIndicator color={AppColors.brandDark} /> : null}
        </View>

        <DaySelector days={days} disabled={isPlaceholderData} onChange={onChangeDays} />

        {refetchError ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>
              Không thể cập nhật dữ liệu mới. Đang hiển thị lần tải gần nhất.
            </Text>
          </View>
        ) : null}

        <KpiGrid data={data} />
        <RevenueChart days={days} points={data.revenueSeries} />
        <HealthCard data={data} />
        <PaymentAlerts data={data} />
        <RecentOrders orders={data.recentOrders} />
      </ScrollView>
    </SafeAreaView>
  );
}

function DaySelector({
  days,
  disabled,
  onChange,
}: {
  days: DashboardDays;
  disabled: boolean;
  onChange: (days: DashboardDays) => void;
}) {
  return (
    <View accessibilityRole="tablist" style={styles.daySelector}>
      {dayOptions.map((option) => {
        const selected = days === option.value;
        return (
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected, disabled }}
            disabled={disabled}
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[styles.dayOption, selected && styles.dayOptionSelected]}>
            <Text style={[styles.dayOptionText, selected && styles.dayOptionTextSelected]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function KpiGrid({ data }: { data: DashboardSnapshot }) {
  const { width } = useWindowDimensions();
  const cardWidth = width >= 720 ? '23%' : '48%';
  const items = [
    { label: 'Doanh thu kỳ', value: formatMoney(data.summary.periodRevenue) },
    { label: 'Doanh thu hôm nay', value: formatMoney(data.summary.todayRevenue) },
    { label: 'Tổng đơn', value: data.summary.totalOrders?.toLocaleString('vi-VN') ?? '—' },
    { label: 'Trung bình/đơn', value: formatMoney(data.summary.averageOrderValue) },
  ];

  return (
    <View style={styles.kpiGrid}>
      {items.map((item) => (
        <View key={item.label} style={[styles.kpiCard, { width: cardWidth }]}>
          <Text style={styles.kpiLabel}>{item.label}</Text>
          <Text adjustsFontSizeToFit minimumFontScale={0.75} numberOfLines={1} style={styles.kpiValue}>
            {item.value}
          </Text>
        </View>
      ))}
    </View>
  );
}

function RevenueChart({ days, points }: { days: DashboardDays; points: RevenuePoint[] }) {
  const { width } = useWindowDimensions();
  const values = points.map((point) => Number(point.revenue));
  const maximum = Math.max(0, ...values.filter(Number.isFinite));

  return (
    <Section title="Doanh thu" description={days === 1 ? 'Theo giờ' : 'Theo ngày'}>
      {points.length === 0 ? (
        <EmptyText>Chưa có dữ liệu doanh thu trong khoảng này.</EmptyText>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={[styles.chart, { minWidth: Math.max(width - 82, points.length * 34) }]}>
            {points.map((point) => {
              const numericValue = Number(point.revenue);
              const ratio = maximum > 0 && Number.isFinite(numericValue) ? numericValue / maximum : 0;
              return (
                <View
                  accessibilityLabel={`${formatChartLabel(point.label, days)}, ${formatMoney(point.revenue)}`}
                  key={point.bucket}
                  style={styles.barColumn}>
                  <View style={styles.barTrack}>
                    <View style={[styles.bar, { height: Math.max(4, ratio * 132) }]} />
                  </View>
                  <Text numberOfLines={1} style={styles.barLabel}>
                    {formatChartLabel(point.label, days)}
                  </Text>
                </View>
              );
            })}
          </View>
        </ScrollView>
      )}
    </Section>
  );
}

function HealthCard({ data }: { data: DashboardSnapshot }) {
  const health = data.health;
  const healthItems = [
    ['Chờ thanh toán', health.pendingPaymentOrders],
    ['Chờ pha chế', health.queuedOrders],
    ['Đang pha chế', health.preparingOrders],
    ['Sẵn sàng giao', health.readyOrders],
  ] as const;

  return (
    <Section title="Tình trạng vận hành">
      {health.status ? <StatusBadge label={health.status} tone="info" /> : null}
      <View style={styles.healthGrid}>
        {healthItems.map(([label, value]) => (
          <View key={label} style={styles.healthItem}>
            <Text style={styles.healthValue}>{value ?? '—'}</Text>
            <Text style={styles.healthLabel}>{label}</Text>
          </View>
        ))}
      </View>
    </Section>
  );
}

function PaymentAlerts({ data }: { data: DashboardSnapshot }) {
  if (data.paymentAlerts.length === 0) return null;
  return (
    <Section title={`Cảnh báo thanh toán (${data.paymentAlerts.length})`}>
      <View style={styles.listGap}>
        {data.paymentAlerts.map((alert, index) => (
          <View key={alert.id ?? alert.orderId ?? `${alert.createdAt}-${index}`} style={styles.alertRow}>
            <View style={styles.flexOne}>
              <Text style={styles.orderCode}>{alert.orderCode ?? 'Đơn cần kiểm tra'}</Text>
              <Text style={styles.mutedText}>{alert.message}</Text>
            </View>
            {alert.amount ? <Text style={styles.alertAmount}>{formatMoney(alert.amount)}</Text> : null}
          </View>
        ))}
      </View>
    </Section>
  );
}

function RecentOrders({ orders }: { orders: OrderSummary[] }) {
  const router = useRouter();
  return (
    <Section title="Đơn mới nhất">
      {orders.length === 0 ? (
        <EmptyText>Chưa có đơn hàng gần đây.</EmptyText>
      ) : (
        <View style={styles.listGap}>
          {orders.map((order) => {
            const payment = getPaymentStatus(order.paymentStatus);
            const fulfillment = getFulfillmentStatus(order.fulfillmentStatus);
            return (
              <Pressable
                accessibilityRole="button"
                key={order.id}
                onPress={() => router.push(`./orders/${order.id}`)}
                style={({ pressed }) => [styles.orderRow, pressed && styles.orderRowPressed]}>
                <View style={styles.flexOne}>
                  <Text style={styles.orderCode}>{order.orderCode}</Text>
                  <Text style={styles.mutedText}>{formatDateTime(order.createdAt)}</Text>
                  <View style={styles.badgeRow}>
                    <StatusBadge label={payment.label} tone={payment.tone} />
                    <StatusBadge label={fulfillment.label} tone={fulfillment.tone} />
                  </View>
                </View>
                <Text style={styles.orderAmount}>{formatMoney(order.totalAmount)}</Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </Section>
  );
}

function Section({
  children,
  description,
  title,
}: {
  children: React.ReactNode;
  description?: string;
  title: string;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text accessibilityRole="header" style={styles.sectionTitle}>
          {title}
        </Text>
        {description ? <Text style={styles.mutedText}>{description}</Text> : null}
      </View>
      {children}
    </View>
  );
}

function EmptyText({ children }: { children: string }) {
  return <Text style={styles.emptyText}>{children}</Text>;
}

function FullScreenMessage({
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
        <Text style={styles.centeredMessage}>{message}</Text>
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
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
  headerText: { flex: 1, gap: Spacing.xs },
  eyebrow: {
    color: AppColors.brandDark,
    fontSize: Typography.caption,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  title: { color: AppColors.text, fontSize: Typography.heading, fontWeight: '800' },
  updatedAt: { color: AppColors.textMuted, fontSize: Typography.caption },
  daySelector: {
    flexDirection: 'row',
    padding: Spacing.xs,
    borderRadius: Radius.md,
    backgroundColor: AppColors.surfaceMuted,
  },
  dayOption: {
    minHeight: 44,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.sm,
  },
  dayOptionSelected: { backgroundColor: AppColors.surface },
  dayOptionText: { color: AppColors.textMuted, fontSize: Typography.body, fontWeight: '600' },
  dayOptionTextSelected: { color: AppColors.brandDark },
  errorBanner: { padding: Spacing.md, borderRadius: Radius.md, backgroundColor: '#FEF3C7' },
  errorBannerText: { color: AppColors.warning, fontSize: Typography.caption },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: Spacing.md },
  kpiCard: {
    minWidth: 140,
    gap: Spacing.sm,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: Radius.lg,
    backgroundColor: AppColors.surface,
  },
  kpiLabel: { color: AppColors.textMuted, fontSize: Typography.caption },
  kpiValue: { color: AppColors.text, fontSize: Typography.title, fontWeight: '800' },
  section: {
    gap: Spacing.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: Radius.lg,
    backgroundColor: AppColors.surface,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { color: AppColors.text, fontSize: Typography.title, fontWeight: '800' },
  chart: { height: 180, flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.sm },
  barColumn: { flex: 1, minWidth: 24, alignItems: 'center', gap: Spacing.xs },
  barTrack: { height: 140, justifyContent: 'flex-end' },
  bar: { width: 18, borderRadius: Radius.sm, backgroundColor: AppColors.brand },
  barLabel: { maxWidth: 40, color: AppColors.textMuted, fontSize: 10 },
  healthGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  healthItem: {
    minWidth: 120,
    flex: 1,
    gap: Spacing.xs,
    padding: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: AppColors.background,
  },
  healthValue: { color: AppColors.text, fontSize: Typography.heading, fontWeight: '800' },
  healthLabel: { color: AppColors.textMuted, fontSize: Typography.caption },
  listGap: { gap: Spacing.md },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: '#FFF7ED',
  },
  alertAmount: { color: AppColors.warning, fontSize: Typography.body, fontWeight: '700' },
  orderRow: {
    minHeight: 88,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: Radius.md,
  },
  orderRowPressed: { backgroundColor: AppColors.background },
  flexOne: { flex: 1, gap: Spacing.xs },
  orderCode: { color: AppColors.text, fontSize: Typography.body, fontWeight: '700' },
  mutedText: { color: AppColors.textMuted, fontSize: Typography.caption },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, marginTop: Spacing.xs },
  orderAmount: { color: AppColors.text, fontSize: Typography.body, fontWeight: '800' },
  emptyText: { paddingVertical: Spacing.xl, color: AppColors.textMuted, textAlign: 'center' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.lg, padding: Spacing.xl },
  centeredMessage: { color: AppColors.textMuted, fontSize: Typography.body, lineHeight: 24, textAlign: 'center' },
  retryButton: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.md,
    backgroundColor: AppColors.brandDark,
  },
  retryText: { color: AppColors.surface, fontSize: Typography.body, fontWeight: '700' },
});
