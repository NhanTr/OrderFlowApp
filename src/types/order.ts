export const paymentMethods = ['CASH', 'QR'] as const;
export const paymentStatuses = [
  'UNPAID',
  'PENDING',
  'PAID',
  'UNDERPAID',
  'OVERPAID',
  'REVIEW',
] as const;
export const fulfillmentStatuses = [
  'PENDING_PAYMENT',
  'QUEUED',
  'PREPARING',
  'READY',
  'DELIVERED',
  'CANCELLED',
] as const;

export type Money = string;
export type PaymentMethod = (typeof paymentMethods)[number];
export type PaymentStatus = (typeof paymentStatuses)[number];
export type FulfillmentStatus = (typeof fulfillmentStatuses)[number];

export type OrderSummary = {
  id: string;
  orderCode: string;
  paymentMethod: PaymentMethod | null;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  totalAmount: Money;
  createdByUserId: string;
  assignedBaristaId: string | null;
  createdAt: string;
};

export type OrderItem = {
  id: string;
  menuItemId: string;
  itemName: string;
  unitPrice: Money;
  quantity: number;
  note: string | null;
};

export type OrderTimelineEvent = {
  id: string | null;
  status: string | null;
  label: string | null;
  note: string | null;
  createdAt: string;
};

export type OrderDetail = OrderSummary & {
  customerNote: string | null;
  cancellationReason: string | null;
  paidAt: string | null;
  items: OrderItem[];
  timeline: OrderTimelineEvent[];
  updatedAt: string;
};

export type OrderFilters = {
  fulfillmentStatus?: FulfillmentStatus;
  paymentStatus?: PaymentStatus;
  createdByUserId?: string;
  assignedBaristaId?: string;
  page?: number;
  limit?: number;
};
