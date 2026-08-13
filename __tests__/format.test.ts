import { formatMoney, multiplyMoney } from '@/utils/format';

describe('money utilities', () => {
  test.each([
    ['25000', 2, '50000'],
    ['12.50', 3, '37.50'],
    ['0.01', 7, '0.07'],
    ['-10.5', 2, '-21.0'],
  ])('multiplies decimal string %s by %d exactly', (value, quantity, expected) => {
    expect(multiplyMoney(value, quantity)).toBe(expected);
  });

  test('formats VND and handles missing values', () => {
    expect(formatMoney('50000')).toContain('50.000');
    expect(formatMoney(null)).toBe('—');
    expect(formatMoney('invalid')).toBe('—');
  });
});
