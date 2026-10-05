export type ApiErrorCode =
  | 'PROVIDER_NOT_FOUND'
  | 'PROVIDER_DISABLED'
  | 'ANIME_NOT_FOUND'
  | 'EPISODE_NOT_FOUND'
  | 'SERVER_NOT_FOUND'
  | 'SOURCE_NOT_FOUND'
  | 'PROVIDER_TIMEOUT'
  | 'PROVIDER_ERROR'
  | 'UNSUPPORTED_SOURCE'
  | 'INVALID_REQUEST'
  | 'NOT_CONFIGURED'
  | 'UPSTREAM_ERROR'
  | 'RATE_LIMITED';

export class ApiError extends Error {
  status: number;
  code: ApiErrorCode;

  constructor(code: ApiErrorCode, message: string, status = 400) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

export function mapStreamingError(err: unknown): ApiError {
  if (err instanceof ApiError) return err;
  const any = err as { code?: string; message?: string };
  const msg = any?.message || (err instanceof Error ? err.message : 'Unknown error');
  switch (any?.code) {
    case 'invalid_provider':
      return new ApiError('PROVIDER_NOT_FOUND', msg, 404);
    case 'provider_unavailable':
      return new ApiError('PROVIDER_DISABLED', msg, 503);
    case 'episode_unavailable':
    case 'invalid_episode':
      return new ApiError('EPISODE_NOT_FOUND', msg, 404);
    case 'server_unavailable':
      return new ApiError('SERVER_NOT_FOUND', msg, 404);
    case 'source_resolution_failed':
      return new ApiError('SOURCE_NOT_FOUND', msg, 502);
    case 'timeout':
      return new ApiError('PROVIDER_TIMEOUT', msg, 504);
    case 'unsupported_format':
      return new ApiError('UNSUPPORTED_SOURCE', msg, 422);
    default:
      return new ApiError('PROVIDER_ERROR', msg, 502);
  }
}
