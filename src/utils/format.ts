import type { Money } from '@/types';

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

export function formatMoney(value: Money | null) {
  if (value === null) return '—';
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? currencyFormatter.format(numericValue) : '—';
}

export function formatDateTime(value: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatChartLabel(value: string, days: number) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('vi-VN',
    days === 1 ? { hour: '2-digit' } : { day: '2-digit', month: '2-digit' },
  ).format(date);
}
