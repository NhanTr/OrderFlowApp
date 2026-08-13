import type { z } from 'zod';

import { ApiContractError } from '@/api/errors';

export function parseDto<T>(schema: z.ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new ApiContractError(result.error.flatten(), result.error);
  }
  return result.data;
}
