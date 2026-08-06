import type { ReactNode } from 'react';

export function ProfileFormField({
  label,
  scale,
  children,
}: {
  label: string;
  scale: number;
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
      <span
        className={`flex h-full items-center overflow-hidden rounded-xl border border-[#e4e4e4] px-[14px] py-[16px] ${isEmail ? 'bg-[#f1f1f1]' : 'bg-[#f9f9f9]'}`}
        style={{ height: 46 * scale }}
      >
        {children}
      </span>
    </div>
  );
}
