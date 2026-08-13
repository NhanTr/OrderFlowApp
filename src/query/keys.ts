import type {
  CategoryFilters,
  DashboardDays,
  EmployeeFilters,
  MenuItemFilters,
  OrderFilters,
} from '@/types';

export const queryKeys = {
  me: ['auth', 'me'] as const,
  dashboard: (days: DashboardDays) => ['dashboard', { days }] as const,
  orders: (filters: OrderFilters) => ['orders', filters] as const,
  order: (id: string) => ['orders', id] as const,
  categories: (filters: CategoryFilters) => ['categories', filters] as const,
  menuItems: (filters: MenuItemFilters) => ['menu-items', filters] as const,
  menuItem: (id: string) => ['menu-items', id] as const,
  employees: (filters: EmployeeFilters) => ['employees', filters] as const,
  employee: (id: string) => ['employees', id] as const,
};
