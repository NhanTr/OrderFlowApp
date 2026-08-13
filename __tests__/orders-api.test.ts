import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { createApiClient } from '@/api/client';
import { createOrderEndpoints } from '@/api/endpoints/orders';

const apiBaseUrl = 'http://127.0.0.1:3001/api/v1';
const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('orders API integration', () => {
  test('sends backend filters and decodes a paginated response through MSW', async () => {
    server.use(
      http.get(`${apiBaseUrl}/admin/orders`, ({ request }) => {
        const url = new URL(request.url);
        expect(url.searchParams.get('paymentStatus')).toBe('PAID');
        expect(url.searchParams.get('page')).toBe('2');
        expect(url.searchParams.get('limit')).toBe('20');

        return HttpResponse.json({
          data: [
            {
              id: 'order-1',
              code: 'OF-001',
              paymentMethod: 'QR',
              paymentStatus: 'PAID',
              fulfillmentStatus: 'READY',
              totalAmount: '45000',
              createdByUserId: 'staff-1',
              assignedBaristaId: null,
              createdAt: '2026-08-13T02:00:00.000Z',
            },
          ],
          meta: { page: 2, limit: 20, total: 21, totalPages: 2 },
        });
      }),
    );

    const endpoints = createOrderEndpoints(createApiClient(() => 'access-token'));
    const result = await endpoints.list({ paymentStatus: 'PAID', page: 2, limit: 20 });

    expect(result.meta).toEqual({ page: 2, limit: 20, total: 21, totalPages: 2 });
    expect(result.data[0]).toMatchObject({ orderCode: 'OF-001', totalAmount: '45000' });
  });

  test('normalizes server error envelopes', async () => {
    server.use(
      http.get(`${apiBaseUrl}/admin/orders`, () =>
        HttpResponse.json(
          { error: { code: 'FORBIDDEN', message: 'Tài khoản đã bị khóa.' } },
          { status: 403 },
        ),
      ),
    );

    const endpoints = createOrderEndpoints(createApiClient());
    await expect(endpoints.list()).rejects.toMatchObject({
      code: 'FORBIDDEN',
      message: 'Tài khoản đã bị khóa.',
      status: 403,
    });
  });
});
