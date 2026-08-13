export const userRoles = ['OWNER', 'SERVICE_STAFF', 'BARISTA'] as const;

export type UserRole = (typeof userRoles)[number];

export type AuthUser = {
  id: string;
  fullName: string;
  username: string | null;
  telegramUserId: string | null;
  role: UserRole;
};

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};
