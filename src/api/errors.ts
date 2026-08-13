import { isAxiosError } from 'axios';
import { z } from 'zod';

const errorEnvelopeSchema = z
  .object({
    error: z
      .union([
        z.string(),
        z.object({
          code: z.string().optional(),
          message: z.string().optional(),
          details: z.unknown().optional(),
        }),
      ])
      .optional(),
    message: z.union([z.string(), z.array(z.string())]).optional(),
    code: z.string().optional(),
  })
  .passthrough();

type ApiErrorOptions = {
  code?: string;
  details?: unknown;
  status?: number;
  cause?: unknown;
};

export class ApiError extends Error {
  readonly code?: string;
  readonly details?: unknown;
  readonly status?: number;

  constructor(message: string, options: ApiErrorOptions = {}) {
    super(message, { cause: options.cause });
    this.name = 'ApiError';
    this.code = options.code;
    this.details = options.details;
    this.status = options.status;
  }
}

export class ApiContractError extends ApiError {
  constructor(details: unknown, cause?: unknown) {
    super('Dữ liệu máy chủ không đúng định dạng mong đợi.', {
      code: 'INVALID_RESPONSE',
      details,
      cause,
    });
    this.name = 'ApiContractError';
  }
}

function fallbackMessage(status?: number) {
  if (status === 401) return 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.';
  if (status === 403) return 'Tài khoản không có quyền thực hiện thao tác này.';
  if (status === 404) return 'Không tìm thấy dữ liệu yêu cầu.';
  if (status !== undefined && status >= 500) return 'Máy chủ đang gặp sự cố. Vui lòng thử lại.';
  return 'Không thể kết nối tới máy chủ. Vui lòng thử lại.';
}

export function normalizeApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (!isAxiosError(error)) {
    return new ApiError('Đã xảy ra lỗi không xác định.', { cause: error });
  }

  const status = error.response?.status;
  const parsed = errorEnvelopeSchema.safeParse(error.response?.data);
  const payload = parsed.success ? parsed.data : undefined;
  const nestedError = typeof payload?.error === 'object' ? payload.error : undefined;
  const messageValue =
    nestedError?.message ??
    (typeof payload?.error === 'string' ? payload.error : undefined) ??
    payload?.message;
  const message = Array.isArray(messageValue) ? messageValue.join('\n') : messageValue;

  return new ApiError(message || fallbackMessage(status), {
    status,
    code: nestedError?.code ?? payload?.code ?? error.code,
    details: nestedError?.details ?? error.response?.data,
    cause: error,
  });
}
