export type FetchInstance = <T = unknown>(
  path: string,
  options?: RequestInit & { body?: unknown },
) => Promise<T>;