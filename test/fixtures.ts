import type { AuthSession, AuthUser, OrderDetail } from '@/types';

export const owner: AuthUser = {
  id: 'owner-1',
  fullName: 'Nguyễn Chủ Quán',
  username: 'owner',
  telegramUserId: null,
  role: 'OWNER',
};

export const ownerSession: AuthSession = {
  accessToken: 'access-token-1',
  refreshToken: 'refresh-token-1',
  user: owner,
};

export const orderDetail: OrderDetail = {
  id: 'order-1',
  orderCode: 'OF-001',
  paymentMethod: 'QR',
  paymentStatus: 'PAID',
  fulfillmentStatus: 'DELIVERED',
  totalAmount: '50000',
  createdByUserId: 'staff-1',
  assignedBaristaId: 'barista-1',
  createdAt: '2026-08-13T02:00:00.000Z',
  customerNote: null,
  cancellationReason: null,
  paidAt: '2026-08-13T02:02:00.000Z',
  items: [
    {
      id: 'item-1',
      menuItemId: 'menu-1',
      itemName: 'Cà phê sữa',
      unitPrice: '25000',
      quantity: 2,
      note: null,
    },
  ],
  timeline: [],
  updatedAt: '2026-08-13T02:05:00.000Z',
};
