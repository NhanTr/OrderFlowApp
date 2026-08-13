type QueryValue = boolean | number | string | null | undefined;

export function compactQueryParams<T extends Record<string, QueryValue>>(params: T) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  ) as Partial<T>;
}
