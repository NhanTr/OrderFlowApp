import { isSafeToPersist } from '@/query/persistence';

describe('query persistence safety', () => {
  test.each([
    [['dashboard', { days: 7 }], true],
    [['categories', {}], true],
    [['menu-items', { limit: 20 }], true],
    [['orders', { paymentStatus: 'PAID' }], true],
    [['orders', 'order-1'], false],
    [['employees', { limit: 20 }], false],
    [['employees', 'employee-1'], false],
    [['auth', 'me'], false],
  ])('classifies %j as persist=%s', (queryKey, expected) => {
    expect(isSafeToPersist(queryKey)).toBe(expected);
  });
});
