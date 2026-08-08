import type { ReactNode } from 'react';

export function ProfileFormField({
  label,
  scale,
  error,
  children,
}: {
  label: string;
  scale: number;
  error?: string;
  children: ReactNode;
}) {
  const isEmail = label === '이메일';

  return (
    <div className="flex flex-col" style={{ gap: 12 * scale }}>
      <span
        className="font-semibold text-[#1c1c1c]"
        style={{ fontSize: 16 * scale, lineHeight: `${19 * scale}px` }}
      >
        {label}
      </span>
      <div
        className={`flex h-full items-center overflow-hidden rounded-xl border border-[#e4e4e4] ${isEmail ? 'bg-[#f1f1f1]' : 'bg-[#f9f9f9]'}`}
        style={{ height: 46 * scale, paddingInline: 14 * scale }}
      >
        {children}
      </div>
      {error && (
        <p
          role="alert"
          className="font-medium text-main-5"
          style={{ fontSize: 12 * scale, lineHeight: `${14 * scale}px` }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
