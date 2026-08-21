import type { FulfillmentStatus, PaymentStatus } from '@/types';
import type { StatusTone } from '@/components/status-badge';

const paymentLabels: Record<PaymentStatus, string> = {
  UNPAID: 'Chưa thanh toán',
  PENDING: 'Chờ xác nhận',
  PAID: 'Đã thanh toán',
  UNDERPAID: 'Thiếu tiền',
  OVERPAID: 'Thừa tiền',
  REVIEW: 'Cần kiểm tra',
};

const fulfillmentLabels: Record<FulfillmentStatus, string> = {
  PENDING_PAYMENT: 'Chờ thanh toán',
  QUEUED: 'Chờ pha chế',
  PREPARING: 'Đang pha chế',
  READY: 'Sẵn sàng giao',
  DELIVERED: 'Đã giao',
  CANCELLED: 'Đã hủy',
};

export function getPaymentStatus(status: PaymentStatus) {
  const tone: StatusTone =
    status === 'PAID'
      ? 'success'
      : status === 'UNDERPAID' || status === 'OVERPAID' || status === 'REVIEW'
        ? 'danger'
        : 'warning';
  return { label: paymentLabels[status], tone };
}

export function getFulfillmentStatus(status: FulfillmentStatus) {
  const tone: StatusTone =
    status === 'DELIVERED'
      ? 'success'
      : status === 'CANCELLED'
        ? 'danger'
        : status === 'READY'
          ? 'info'
          : 'neutral';
  return { label: fulfillmentLabels[status], tone };
}
