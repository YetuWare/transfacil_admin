import type { ApiResponse } from '../types/api';

const BASE = import.meta.env.VITE_API_URL || '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`Erro do servidor (${res.status})`);
  const text = await res.text();
  let json: ApiResponse<T>;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error('Resposta inválida do servidor.');
  }
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
    return fetch(`${BASE}${url}`, { method: 'POST', credentials: 'include', body: form })
      .then(async (r) => {
        if (!r.ok) throw new Error(`Erro do servidor (${r.status})`);
        const text = await r.text();
        try {
          return JSON.parse(text) as ApiResponse<T>;
        } catch {
          throw new Error('Resposta inválida do servidor.');
        }
      });
  },
  blob: requestBlob,
};
