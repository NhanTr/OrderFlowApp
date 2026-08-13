import type { EmployeeDto } from '@/api/dto';
import type { Employee } from '@/types';

export function mapEmployee(dto: EmployeeDto): Employee {
  return {
    id: dto.id,
    fullName: dto.fullName,
    telegramUserId: dto.telegramUserId,
    telegramChatId: dto.telegramChatId ?? null,
    username: dto.username ?? null,
    role: dto.role,
    status: dto.status,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}
