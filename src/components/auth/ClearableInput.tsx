import { forwardRef, useRef, useState } from 'react';
import type { ChangeEvent, InputHTMLAttributes } from 'react';
import { IoCloseCircle } from 'react-icons/io5';

type ClearableInputProps = InputHTMLAttributes<HTMLInputElement> & {
  wrapperClassName?: string;
};

const ClearableInput = forwardRef<HTMLInputElement, ClearableInputProps>(
  function ClearableInput(
    { className, wrapperClassName, onChange, ...props },
    forwardedRef
  ) {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [hasValue, setHasValue] = useState(
      Boolean(props.value ?? props.defaultValue ?? '')
    );

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
      <div className={`relative ${wrapperClassName ?? ''}`}>
        <input
          {...props}
          ref={setRefs}
          onChange={handleChange}
          className={`${className ?? ''} ${hasValue && !props.disabled ? 'pr-11' : ''}`}
        />

        {hasValue && !props.disabled && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="입력값 지우기"
            className="absolute right-0 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center text-gray-4"
          >
            <IoCloseCircle size={18} />
          </button>
        )}
      </div>
    );
  }
);

export default ClearableInput;
