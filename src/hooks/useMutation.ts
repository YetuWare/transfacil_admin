import { useState, useCallback } from 'react';

interface UseMutationResult<T> {
  execute: (...args: unknown[]) => Promise<T | null>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

export function useMutation<T>(
  fn: (...args: unknown[]) => Promise<T>,
): UseMutationResult<T> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (...args: unknown[]): Promise<T | null> => {
    setLoading(true);
    setError(null);
    try {
      const result = await fn(...args);
      return result;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro na operação';
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, [fn]);

  return { execute, loading, error, clearError: () => setError(null) };
}
