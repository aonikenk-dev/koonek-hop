const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

function getToken(): string | null {
  try {
    return sessionStorage.getItem('koonek_token');
  } catch {
    return null;
  }
}

export function setToken(token: string): void {
  sessionStorage.setItem('koonek_token', token);
}

export function clearToken(): void {
  sessionStorage.removeItem('koonek_token');
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw Object.assign(new Error(body?.error ?? res.statusText), { status: res.status, body });
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
