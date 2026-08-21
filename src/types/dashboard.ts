import type { Money, OrderSummary, PaymentStatus } from '@/types/order';

export type DashboardDays = 1 | 7 | 30;

export type DashboardRange = {
  days: number | null;
  startAt: string | null;
  endAt: string | null;
};

export type DashboardSummary = {
  periodRevenue: Money | null;
  todayRevenue: Money | null;
  totalOrders: number | null;
  averageOrderValue: Money | null;
};

export type DashboardHealth = {
  status: string | null;
  pendingPaymentOrders: number | null;
  queuedOrders: number | null;
  preparingOrders: number | null;
  readyOrders: number | null;
};

export type RevenuePoint = {
  bucket: string;
  label: string;
  revenue: Money;
  orderCount: number | null;
};

export type PaymentAlert = {
  id: string | null;
  orderId: string | null;
  orderCode: string | null;
  paymentStatus: PaymentStatus | null;
  amount: Money | null;
  message: string;
  createdAt: string | null;
};

export type DashboardSnapshot = {
  generatedAt: string;
  timeZone: string;
  range: DashboardRange;
  summary: DashboardSummary;
  health: DashboardHealth;
  revenueSeries: RevenuePoint[];
  recentOrders: OrderSummary[];
  paymentAlerts: PaymentAlert[];
};
