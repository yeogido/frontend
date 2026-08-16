import type { ReactNode } from 'react';

import { useGlobalScale } from '../../hooks/useGlobalScale';

// Figma 390 디자인 기준 리터럴 px. 이 컴포넌트를 쓰는 페이지들(로그인/
// 회원가입 등)과 같은 방식으로 useGlobalScale() 배율을 곱해서 쓴다.
const LABEL_MARGIN_BOTTOM = 8;
const LABEL_FONT_SIZE = 14;
const LABEL_LINE_HEIGHT = 20;

const ERROR_MARGIN_TOP = 4;
const ERROR_FONT_SIZE = 12;
const ERROR_LINE_HEIGHT = 16;

interface AuthFieldProps {
  id: string;
  label?: string;
  error?: string;
  children: ReactNode;
}

function AuthField({ id, label, error, children }: AuthFieldProps) {
  const scale = useGlobalScale();
  const s = (value: number) => value * scale;

  return (
    <div>
      {label && (
        <label
          htmlFor={id}
          className="block font-bold text-black"
          style={{
            marginBottom: s(LABEL_MARGIN_BOTTOM),
            fontSize: s(LABEL_FONT_SIZE),
            lineHeight: `${s(LABEL_LINE_HEIGHT)}px`,
          }}
        >
          {label}
        </label>
      )}

      {children}

      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="font-medium text-main-5"
          style={{
            marginTop: s(ERROR_MARGIN_TOP),
            fontSize: s(ERROR_FONT_SIZE),
            lineHeight: `${s(ERROR_LINE_HEIGHT)}px`,
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}

export default AuthField;
