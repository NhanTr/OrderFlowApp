import { z } from 'zod';

import { dateTimeSchema, identifierSchema, moneySchema } from './common';

export const menuCategoryDtoSchema = z.object({
  id: identifierSchema,
  name: z.string().min(1),
  displayOrder: z.number().int(),
  isActive: z.boolean(),
  createdAt: dateTimeSchema,
  updatedAt: dateTimeSchema,
});

export const menuItemDtoSchema = z.object({
  id: identifierSchema,
  categoryId: identifierSchema,
  name: z.string().min(1),
  description: z.string().nullish(),
  price: moneySchema,
  isAvailable: z.boolean(),
  imageUrl: z.string().url().nullish(),
  displayOrder: z.number().int(),
  createdAt: dateTimeSchema,
  updatedAt: dateTimeSchema,
});

export type MenuCategoryDto = z.infer<typeof menuCategoryDtoSchema>;
export type MenuItemDto = z.infer<typeof menuItemDtoSchema>;
