import { render, userEvent, waitFor } from '@testing-library/react-native';

import LoginScreen from '@/app/(auth)/login';

const mockLogin = jest.fn();

jest.mock('@/auth/AuthProvider', () => ({
  useAuth: () => ({ login: mockLogin }),
}));

beforeEach(() => {
  mockLogin.mockReset();
});

describe('<LoginScreen />', () => {
  test('validates required credentials without calling the API', async () => {
    const view = await render(<LoginScreen />);
    const user = userEvent.setup();

    await user.press(view.getByRole('button', { name: 'Đăng nhập' }));

    expect(await view.findByText('Vui lòng nhập tên đăng nhập.')).toBeTruthy();
    expect(await view.findByText('Vui lòng nhập mật khẩu.')).toBeTruthy();
    expect(mockLogin).not.toHaveBeenCalled();
  });

  test('submits username and password to the auth action', async () => {
    mockLogin.mockResolvedValue(undefined);
    const view = await render(<LoginScreen />);
    const user = userEvent.setup();

    await user.type(view.getByLabelText('Tên đăng nhập'), 'owner');
    await user.type(view.getByLabelText('Mật khẩu'), 'secret-password');
    await user.press(view.getByRole('button', { name: 'Đăng nhập' }));

    await waitFor(() =>
      expect(mockLogin).toHaveBeenCalledWith({
        username: 'owner',
        password: 'secret-password',
      }),
    );
  });

  test('shows a backend authentication error inside the form', async () => {
    mockLogin.mockRejectedValue(new Error('Tên đăng nhập hoặc mật khẩu không đúng.'));
    const view = await render(<LoginScreen />);
    const user = userEvent.setup();

    await user.type(view.getByLabelText('Tên đăng nhập'), 'owner');
    await user.type(view.getByLabelText('Mật khẩu'), 'wrong');
    await user.press(view.getByRole('button', { name: 'Đăng nhập' }));

    expect(await view.findByText('Tên đăng nhập hoặc mật khẩu không đúng.')).toBeTruthy();
  });
});
