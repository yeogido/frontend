import type { ReactNode } from 'react';

interface AuthDesktopFieldProps {
  readonly id: string;
  readonly label: string;
  /** 시안에 라벨이 보이지 않는 입력(로그인)은 스크린 리더용으로만 둔다. */
  readonly hideLabel?: boolean;
  readonly error?: string;
  readonly children: ReactNode;
}

/** 데스크톱 인증 폼의 필드 — 라벨, 입력, 오류 문구. */
function AuthDesktopField({
  id,
  label,
  hideLabel = false,
  error,
  children,
}: AuthDesktopFieldProps) {
  return (
    <div className="flex flex-col gap-[12px]">
      <label
        htmlFor={id}
        className={
          hideLabel ? 'sr-only' : 'text-[16px] font-semibold text-black'
        }
      >
        {label}
      </label>

      {children}

      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="text-main-5 -mt-[4px] text-[12px] font-medium"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

export default AuthDesktopField;
