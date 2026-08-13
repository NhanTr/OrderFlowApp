import { z } from 'zod';

export const identifierSchema = z.string().min(1);
export const dateTimeSchema = z.string().min(1);
export const moneySchema = z.string().regex(/^-?\d+(?:\.\d+)?$/, 'Expected a decimal string');

export const paginationMetaSchema = z.object({
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
});

export function singleEnvelopeSchema<T extends z.ZodType>(dataSchema: T) {
  return z.object({ data: dataSchema });
}

export function listEnvelopeSchema<T extends z.ZodType>(itemSchema: T) {
  return z.object({
    data: z.array(itemSchema),
    meta: paginationMetaSchema,
  });
}
