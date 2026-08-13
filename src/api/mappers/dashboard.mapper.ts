import type { DashboardSnapshotDto } from '@/api/dto';
import { mapOrderSummary } from '@/api/mappers/order.mapper';
import type { DashboardSnapshot } from '@/types';

export function mapDashboardSnapshot(dto: DashboardSnapshotDto): DashboardSnapshot {
  return {
    generatedAt: dto.generatedAt,
    timeZone: dto.timeZone,
    range: dto.range,
    summary: dto.summary,
    health: dto.health,
    revenueSeries: dto.revenueSeries,
    recentOrders: dto.recentOrders.map(mapOrderSummary),
    paymentAlerts: dto.paymentAlerts,
  };
}
