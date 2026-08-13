import { z } from 'zod';

import { employeeRoles, userStatuses } from '@/types/employee';

import { dateTimeSchema, identifierSchema } from './common';

export const employeeDtoSchema = z.object({
  id: identifierSchema,
  fullName: z.string().min(1),
  telegramUserId: z.string().min(1),
  telegramChatId: z.string().nullish(),
  username: z.string().nullish(),
  role: z.enum(employeeRoles),
  status: z.enum(userStatuses),
  createdAt: dateTimeSchema,
  updatedAt: dateTimeSchema,
});

export type EmployeeDto = z.infer<typeof employeeDtoSchema>;
