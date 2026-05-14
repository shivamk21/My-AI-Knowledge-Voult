const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000';
const apiKey = import.meta.env.VITE_API_KEY;

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(apiKey ? { 'X-Vault-Api-Key': apiKey } : {}),
    ...(init?.headers ?? {})
  };

  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers,
    ...init
  });

  if (!response.ok) {
    const problem = await response.json().catch(() => null);
    throw new Error(problem?.detail ?? problem?.title ?? `Request failed: ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function queryString(filters: Record<string, string | boolean | undefined>) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') params.set(key, String(value));
  });
  const query = params.toString();
  return query ? `?${query}` : '';
}
