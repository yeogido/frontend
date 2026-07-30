import type { ReactNode } from 'react';

import { ResponsivePageShell } from '../../../components/layout/ResponsivePageShell';

export interface DetailStateGuardProps<T> {
  readonly error: string | null;
  readonly data: T | null;
  readonly loadingMessage?: string;
  readonly children: (data: T) => ReactNode;
}

export function DetailStateGuard<T>({
  error,
  data,
  loadingMessage = '불러오는 중...',
  children,
}: DetailStateGuardProps<T>) {
  if (error) {
    return (
      <ResponsivePageShell mode="main-layout" className="text-red-500">
        <div
          role="alert"
          className="flex flex-1 items-center justify-center text-center"
        >
          {error}
        </div>
      </ResponsivePageShell>
    );
  }

  if (!data) {
    return (
      <ResponsivePageShell mode="standalone" className="text-gray-4">
        <div
          role="status"
          className="flex flex-1 items-center justify-center text-center"
        >
          {loadingMessage}
        </div>
      </ResponsivePageShell>
    );
  }

  return <>{children(data)}</>;
}

export default DetailStateGuard;
