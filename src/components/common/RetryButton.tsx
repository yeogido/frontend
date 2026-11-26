import type { ButtonHTMLAttributes } from 'react';

type RetryButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'>;

export default function RetryButton({
  children = '다시 시도',
  className = '',
  ...props
}: RetryButtonProps) {
  return (
    <button
      {...props}
      type="button"
      className={`border-gray-2 text-gray-5 rounded-full border px-4 py-2 text-base font-medium ${className}`}
    >
      {children}
    </button>
  );
}
