import type { DashboardSnapshotDto } from '@/api/dto';
import { mapOrderSummary } from '@/api/mappers/order.mapper';
import { paymentStatuses, type DashboardSnapshot, type PaymentStatus } from '@/types';

type UnknownRecord = Readonly<Record<string, unknown>>;

function first(record: UnknownRecord, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (value !== undefined && value !== null) return value;
  }
  return null;
}

function asString(record: UnknownRecord, keys: string[]) {
  const value = first(record, keys);
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function asMoney(record: UnknownRecord, keys: string[]) {
  const value = first(record, keys);
  if (typeof value === 'string' && /^-?\d+(\.\d+)?$/.test(value)) return value;
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return null;
}

function asNumber(record: UnknownRecord, keys: string[]) {
  const value = first(record, keys);
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function asPaymentStatus(record: UnknownRecord) {
  const value = asString(record, ['paymentStatus', 'status']);
  return paymentStatuses.includes(value as PaymentStatus) ? (value as PaymentStatus) : null;
}

export function mapDashboardSnapshot(dto: DashboardSnapshotDto): DashboardSnapshot {
  return {
    generatedAt: dto.generatedAt,
    timeZone: dto.timeZone,
    range: {
      days: asNumber(dto.range, ['days']),
      startAt: asString(dto.range, ['startAt', 'from', 'start']),
      endAt: asString(dto.range, ['endAt', 'to', 'end']),
    },
    summary: {
      periodRevenue: asMoney(dto.summary, ['periodRevenue', 'totalRevenue', 'revenue']),
      todayRevenue: asMoney(dto.summary, ['todayRevenue', 'revenueToday']),
      totalOrders: asNumber(dto.summary, ['totalOrders', 'orderCount']),
      averageOrderValue: asMoney(dto.summary, [
        'averageOrderValue',
        'averageOrderAmount',
        'avgOrderValue',
      ]),
    },
    health: {
      status: asString(dto.health, ['status', 'overallStatus']),
      pendingPaymentOrders: asNumber(dto.health, [
        'pendingPaymentOrders',
        'pendingPaymentCount',
      ]),
      queuedOrders: asNumber(dto.health, ['queuedOrders', 'queuedCount']),
      preparingOrders: asNumber(dto.health, ['preparingOrders', 'preparingCount']),
      readyOrders: asNumber(dto.health, ['readyOrders', 'readyCount']),
    },
    revenueSeries: dto.revenueSeries.map((point, index) => {
      const bucket = asString(point, ['bucket', 'bucketStart', 'timestamp', 'date']) ?? String(index);
      return {
        bucket,
        label: asString(point, ['label', 'displayLabel']) ?? bucket,
        revenue: asMoney(point, ['revenue', 'amount', 'totalRevenue']) ?? '0',
        orderCount: asNumber(point, ['orderCount', 'count']),
      };
    }),
    recentOrders: dto.recentOrders.map(mapOrderSummary),
    paymentAlerts: dto.paymentAlerts.map((alert) => ({
      id: asString(alert, ['id', 'alertId']),
      orderId: asString(alert, ['orderId']),
      orderCode: asString(alert, ['orderCode', 'code']),
      paymentStatus: asPaymentStatus(alert),
      amount: asMoney(alert, ['amount', 'totalAmount', 'expectedAmount']),
      message:
        asString(alert, ['message', 'reason', 'description']) ??
        'Đơn hàng có thanh toán cần kiểm tra.',
      createdAt: asString(alert, ['createdAt', 'detectedAt', 'timestamp']),
    })),
  };
}
