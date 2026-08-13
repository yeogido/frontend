import type { ReactNode } from 'react';

interface AuthFieldProps {
  id: string;
  label?: string;
  error?: string;
  children: ReactNode;
}

function AuthField({ id, label, error, children }: AuthFieldProps) {
  return (
    <div>
      {label && (
        <label
          htmlFor={id}
          className="mb-2 block text-sm font-bold text-black"
        >
          {label}
        </label>
      )}

      {children}

      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-1 text-xs font-medium text-main-5"
        >
          {error}
        </p>
      )}
    </div>
  );
}

export default AuthField;
