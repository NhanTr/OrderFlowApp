import type { Money } from '@/types/order';

export type MenuCategory = {
  id: string;
  name: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type MenuItem = {
  id: string;
  categoryId: string;
  name: string;
  description: string | null;
  price: Money;
  isAvailable: boolean;
  imageUrl: string | null;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type CategoryFilters = {
  search?: string;
  isActive?: boolean;
};

export type MenuItemFilters = {
  page?: number;
  limit?: number;
  categoryId?: string;
  search?: string;
  isAvailable?: boolean;
};
