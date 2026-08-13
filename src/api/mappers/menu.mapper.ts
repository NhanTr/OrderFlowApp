import type { MenuCategoryDto, MenuItemDto } from '@/api/dto';
import type { MenuCategory, MenuItem } from '@/types';

export function mapMenuCategory(dto: MenuCategoryDto): MenuCategory {
  return {
    id: dto.id,
    name: dto.name,
    displayOrder: dto.displayOrder,
    isActive: dto.isActive,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

export function mapMenuItem(dto: MenuItemDto): MenuItem {
  return {
    id: dto.id,
    categoryId: dto.categoryId,
    name: dto.name,
    description: dto.description ?? null,
    price: dto.price,
    isAvailable: dto.isAvailable,
    imageUrl: dto.imageUrl ?? null,
    displayOrder: dto.displayOrder,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}
