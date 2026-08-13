import type { OrderSummary } from '@/types/order';

export type DashboardDays = 1 | 7 | 30;

export type DashboardSnapshot = {
  generatedAt: string;
  timeZone: string;
  range: Readonly<Record<string, unknown>>;
  summary: Readonly<Record<string, unknown>>;
  health: Readonly<Record<string, unknown>>;
  revenueSeries: Readonly<Record<string, unknown>>[];
  recentOrders: OrderSummary[];
  paymentAlerts: Readonly<Record<string, unknown>>[];
};
