import { useCallback, useRef } from "react";

/**
 * Returns a function that prevents rapid duplicate calls.
 * The returned function ignores calls while a previous call is still in progress.
 */
export function useSubmitGuard() {
  const isSubmitting = useRef(false);

  const guard = useCallback(
    <T>(fn: () => Promise<T>): (() => Promise<T | undefined>) => {
      return async () => {
        if (isSubmitting.current) return undefined;
        isSubmitting.current = true;
        try {
          return await fn();
        } finally {
          isSubmitting.current = false;
        }
      };
    },
    [],
  );

  return { guard, isSubmitting };
}
