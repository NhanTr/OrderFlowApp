import { z } from 'zod';

import { userRoles } from '@/types/auth';

import { identifierSchema } from './common';

export const loginRequestSchema = z.object({
  username: z.string().trim().min(1),
  password: z.string().min(1),
});

export const refreshRequestSchema = z.object({
  refreshToken: z.string().min(1),
});

export const logoutRequestSchema = refreshRequestSchema;

export const authUserDtoSchema = z.object({
  id: identifierSchema,
  fullName: z.string().min(1),
  username: z.string().nullish(),
  telegramUserId: z.string().nullish(),
  role: z.enum(userRoles),
});

export const authSessionDtoSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
  user: authUserDtoSchema,
});

export type LoginRequestDto = z.infer<typeof loginRequestSchema>;
export type RefreshRequestDto = z.infer<typeof refreshRequestSchema>;
export type LogoutRequestDto = z.infer<typeof logoutRequestSchema>;
export type AuthUserDto = z.infer<typeof authUserDtoSchema>;
export type AuthSessionDto = z.infer<typeof authSessionDtoSchema>;
