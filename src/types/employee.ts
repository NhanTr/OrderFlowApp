export const employeeRoles = ['SERVICE_STAFF', 'BARISTA'] as const;
export const userStatuses = ['ACTIVE', 'INACTIVE'] as const;

export type EmployeeRole = (typeof employeeRoles)[number];
export type UserStatus = (typeof userStatuses)[number];

export type Employee = {
  id: string;
  fullName: string;
  telegramUserId: string;
  telegramChatId: string | null;
  username: string | null;
  role: EmployeeRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
};

export type EmployeeFilters = {
  page?: number;
  limit?: number;
  search?: string;
  role?: EmployeeRole;
  status?: UserStatus;
};
