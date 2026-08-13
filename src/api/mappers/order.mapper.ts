import type {
  OrderDetailDto,
  OrderItemDto,
  OrderSummaryDto,
  OrderTimelineEventDto,
} from '@/api/dto';
import type { OrderDetail, OrderItem, OrderSummary, OrderTimelineEvent } from '@/types';

function requiredAlias(primary: string | undefined, fallback: string | undefined, field: string) {
  const value = primary ?? fallback;
  if (value === undefined) {
    throw new Error(`Validated DTO is missing ${field}`);
  }
  return value;
}

export function mapOrderSummary(dto: OrderSummaryDto): OrderSummary {
  return {
    id: dto.id,
    orderCode: requiredAlias(dto.orderCode, dto.code, 'orderCode'),
    paymentMethod: dto.paymentMethod ?? null,
    paymentStatus: dto.paymentStatus,
    fulfillmentStatus: dto.fulfillmentStatus,
    totalAmount: dto.totalAmount,
    createdByUserId: dto.createdByUserId,
    assignedBaristaId: dto.assignedBaristaId ?? null,
    createdAt: dto.createdAt,
  };
}

export function mapOrderItem(dto: OrderItemDto): OrderItem {
  return {
    id: dto.id,
    menuItemId: dto.menuItemId,
    itemName: requiredAlias(dto.itemName, dto.name, 'itemName'),
    unitPrice: dto.unitPrice,
    quantity: dto.quantity,
    note: dto.note ?? null,
  };
}

export function mapOrderTimelineEvent(dto: OrderTimelineEventDto): OrderTimelineEvent {
  return {
    id: dto.id ?? null,
    status: dto.status ?? null,
    label: dto.label ?? null,
    note: dto.note ?? null,
    createdAt: requiredAlias(dto.createdAt, dto.timestamp, 'createdAt'),
  };
}

export function mapOrderDetail(dto: OrderDetailDto): OrderDetail {
  return {
    ...mapOrderSummary(dto),
    customerNote: dto.customerNote ?? null,
    cancellationReason: dto.cancellationReason ?? null,
    paidAt: dto.paidAt ?? null,
    items: dto.items.map(mapOrderItem),
    timeline: dto.timeline.map(mapOrderTimelineEvent),
    updatedAt: dto.updatedAt,
  };
}
