import { dashboardSnapshotDtoSchema, orderDetailDtoSchema } from '@/api/dto';
import { mapDashboardSnapshot, mapOrderDetail } from '@/api/mappers';
import { parseDto } from '@/api/parse';
import { ApiContractError } from '@/api/errors';

describe('API DTO mapping', () => {
  test('normalizes dashboard compatibility fields into stable domain names', () => {
    const dto = dashboardSnapshotDtoSchema.parse({
      generatedAt: '2026-08-13T02:00:00.000Z',
      timeZone: 'Asia/Ho_Chi_Minh',
      range: { days: 7, from: '2026-08-06', to: '2026-08-13' },
      summary: {
        totalRevenue: '125000.50',
        revenueToday: '25000',
        orderCount: 5,
        avgOrderValue: '25000.10',
      },
      health: { queuedCount: 2, preparingCount: 1, readyCount: 3 },
      revenueSeries: [{ date: '2026-08-13', amount: '125000.50', count: 5 }],
      recentOrders: [],
      paymentAlerts: [{ code: 'OF-001', reason: 'Thiếu tiền', amount: '5000' }],
    });

    const snapshot = mapDashboardSnapshot(dto);

    expect(snapshot.summary.periodRevenue).toBe('125000.50');
    expect(snapshot.summary.totalOrders).toBe(5);
    expect(snapshot.health.queuedOrders).toBe(2);
    expect(snapshot.revenueSeries[0]).toMatchObject({ revenue: '125000.50', orderCount: 5 });
    expect(snapshot.paymentAlerts[0]).toMatchObject({ orderCode: 'OF-001', message: 'Thiếu tiền' });
  });

  test('maps backend aliases only at the DTO boundary', () => {
    const dto = orderDetailDtoSchema.parse({
      id: 'order-1',
      code: 'OF-001',
      paymentMethod: 'CASH',
      paymentStatus: 'PAID',
      fulfillmentStatus: 'DELIVERED',
      totalAmount: '20000',
      createdByUserId: 'staff-1',
      createdAt: '2026-08-13T02:00:00.000Z',
      items: [
        { id: 'line-1', menuItemId: 'menu-1', name: 'Bạc xỉu', unitPrice: '20000', quantity: 1 },
      ],
      timeline: [{ status: 'DELIVERED', timestamp: '2026-08-13T02:05:00.000Z' }],
      updatedAt: '2026-08-13T02:05:00.000Z',
    });

    const order = mapOrderDetail(dto);
    expect(order.orderCode).toBe('OF-001');
    expect(order.items[0]?.itemName).toBe('Bạc xỉu');
    expect(order.timeline[0]?.createdAt).toBe('2026-08-13T02:05:00.000Z');
  });

  test('turns invalid responses into a contract error', () => {
    expect(() => parseDto(orderDetailDtoSchema, { id: 'broken' })).toThrow(ApiContractError);
  });
});
