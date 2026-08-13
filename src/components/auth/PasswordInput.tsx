import { forwardRef, useRef, useState } from 'react';
import type { ChangeEvent, InputHTMLAttributes } from 'react';
import { IoCloseCircle, IoEyeOffOutline, IoEyeOutline } from 'react-icons/io5';

type PasswordInputProps = InputHTMLAttributes<HTMLInputElement>;

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput({ className, onChange, ...props }, forwardedRef) {
    const [isVisible, setIsVisible] = useState(false);
    const [hasValue, setHasValue] = useState(
      Boolean(props.value ?? props.defaultValue ?? '')
    );
    const inputRef = useRef<HTMLInputElement | null>(null);

    const setRefs = (node: HTMLInputElement | null) => {
      inputRef.current = node;

      if (node && node.value.length > 0) {
        setHasValue(true);
      }

      if (typeof forwardedRef === 'function') {
        forwardedRef(node);
      } else if (forwardedRef) {
        forwardedRef.current = node;
      }
    };

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      setHasValue(event.target.value.length > 0);
      onChange?.(event);
    };

    // Safari는 자동입력된 비밀번호 필드의 type을 password<->text로 바꾸면
    // 보안 정책상 값을 지워버린다. 전환 직전 값을 저장해뒀다가, 지워졌으면
    // 다음 페인트 직후 되돌려서 자동입력된 값에서도 토글이 동작하게 한다.
    const handleToggleVisibility = () => {
      const valueBeforeToggle = inputRef.current?.value ?? '';

      setIsVisible((prev) => !prev);

      requestAnimationFrame(() => {
        if (inputRef.current && inputRef.current.value !== valueBeforeToggle) {
          inputRef.current.value = valueBeforeToggle;
        }
      });
    };

    // react-hook-form이 관리하는 ref 기반(비제어) 입력에서도 동작해야 해서,
    // React state가 아니라 네이티브 value setter로 값을 비우고 input
    // 이벤트를 직접 발생시켜 react-hook-form/제어형 onChange 양쪽 모두에
    // 정상적으로 반영되게 한다.
    const handleClear = () => {
      const input = inputRef.current;

      if (!input) {
        return;
      }

      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value'
      )?.set;

      nativeInputValueSetter?.call(input, '');
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.focus();
    };

    return (
      <div className="relative">
        <input
          {...props}
          ref={setRefs}
          onChange={handleChange}
          type={isVisible ? 'text' : 'password'}
          className={`${className ?? ''} ${hasValue && !props.disabled ? 'pr-22' : 'pr-11'}`}
        />

        {hasValue && !props.disabled && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="입력값 지우기"
            className="absolute right-11 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center text-gray-4"
          >
            <IoCloseCircle size={18} />
          </button>
        )}

        <button
          type="button"
          onClick={handleToggleVisibility}
          aria-label={isVisible ? '비밀번호 숨기기' : '비밀번호 표시'}
          className="absolute right-0 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center text-gray-4"
        >
          {isVisible ? (
            <IoEyeOutline size={18} />
          ) : (
            <IoEyeOffOutline size={18} />
          )}
        </button>
      </div>
    );
  }
);

export default PasswordInput;
