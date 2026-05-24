import type { ApiResponse } from '../types/api';

const BASE = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const json: ApiResponse<T> = await res.json();
  if (!json.success) throw new Error(json.error || 'Erro desconhecido');
  return json.data;
}

async function requestBlob(url: string): Promise<Blob> {
  const res = await fetch(`${BASE}${url}`, { credentials: 'include' });
  if (!res.ok) throw new Error('Erro ao descarregar');
  return res.blob();
}

export const api = {
  get: <T>(url: string) => request<T>(url),
  post: <T>(url: string, body?: unknown) =>
    request<T>(url, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: <T>(url: string, body?: unknown) =>
    request<T>(url, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  del: <T>(url: string) => request<T>(url, { method: 'DELETE' }),
  upload: <T>(url: string, file: File) => {
    const form = new FormData();
    form.append('image', file);
    return fetch(`${BASE}${url}`, { method: 'POST', credentials: 'include', body: form }).then(r => r.json()) as Promise<ApiResponse<T>>;
  },
  blob: requestBlob,
};
