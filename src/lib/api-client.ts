import { getAccessToken } from './token-store';

type ApiFetchOptions = Omit<RequestInit, 'headers'> & {
  headers?: Record<string, string>;
};

function getBaseUrl() {
  const baseUrl = process.env.EXPO_PUBLIC_API_URL;
  if (!baseUrl) return null;
  const trimmed = baseUrl.replace(/\/+$/, '');
  if (/\/api\/v1$/i.test(trimmed)) return trimmed;
  return `${trimmed}/api/v1`;
}

export async function apiFetch(path: string, options: ApiFetchOptions = {}) {
  const baseUrl = getBaseUrl();
  if (!baseUrl) {
    throw new Error('Missing EXPO_PUBLIC_API_URL');
  }

  const token = await getAccessToken();
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options.headers ?? {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`, {
    ...options,
    headers,
  });

  const contentType = res.headers.get('content-type') ?? '';
  const isJson = contentType.includes('application/json');
  const payload = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null);

  const maybeEnvelope =
    payload &&
    typeof payload === 'object' &&
    'success' in payload &&
    'data' in payload &&
    typeof (payload as any).success === 'boolean';

  if (!res.ok) {
    const message = typeof payload === 'string' ? payload : (payload as any)?.message;
    throw new Error(message || `Request failed (${res.status})`);
  }

  if (maybeEnvelope) {
    if (!(payload as any).success) {
      throw new Error((payload as any).message || 'Request failed');
    }
    return (payload as any).data;
  }

  return payload;
}
