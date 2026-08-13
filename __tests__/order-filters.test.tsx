import { fireEvent, render, screen } from '@testing-library/react-native';

import { OrderFilters } from '@/features/orders/OrderFilters';

describe('<OrderFilters />', () => {
  test('exposes readable status labels and selected state', async () => {
    const onChange = jest.fn();
    await render(<OrderFilters filters={{ paymentStatus: 'PAID' }} onChange={onChange} />);

    const paid = screen.getByRole('button', { name: 'Đã thanh toán' });
    expect(paid.props.accessibilityState).toMatchObject({ selected: true });

    fireEvent.press(screen.getByRole('button', { name: 'Cần kiểm tra' }));
    expect(onChange).toHaveBeenCalledWith({ paymentStatus: 'REVIEW' });
  });

  test('keeps text labels in addition to color for fulfillment statuses', async () => {
    await render(<OrderFilters filters={{}} onChange={jest.fn()} />);
    expect(screen.getByText('Chờ pha chế')).toBeTruthy();
    expect(screen.getByText('Đang pha chế')).toBeTruthy();
    expect(screen.getByText('Đã hủy')).toBeTruthy();
  });
});
