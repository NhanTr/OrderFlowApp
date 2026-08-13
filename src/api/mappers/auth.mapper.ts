import type { AuthSessionDto, AuthUserDto } from '@/api/dto';
import type { AuthSession, AuthUser } from '@/types';

export function mapAuthUser(dto: AuthUserDto): AuthUser {
  return {
    id: dto.id,
    fullName: dto.fullName,
    username: dto.username ?? null,
    telegramUserId: dto.telegramUserId ?? null,
    role: dto.role,
  };
}

export function mapAuthSession(dto: AuthSessionDto): AuthSession {
  return {
    accessToken: dto.accessToken,
    refreshToken: dto.refreshToken,
    user: mapAuthUser(dto.user),
  };
}
