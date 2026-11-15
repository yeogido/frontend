import { useEffect, useState } from 'react';

export function useDebouncedValue(value: string, delayMs: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = window.setTimeout(
      () => setDebouncedValue(value),
      delayMs
    );

    return () => window.clearTimeout(timeoutId);
  }, [value, delayMs]);

  return [debouncedValue, setDebouncedValue] as const;
}
