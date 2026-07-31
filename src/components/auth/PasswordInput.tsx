import { forwardRef, useState } from 'react';
import type { InputHTMLAttributes } from 'react';
import { IoEyeOffOutline, IoEyeOutline } from 'react-icons/io5';

type PasswordInputProps = InputHTMLAttributes<HTMLInputElement>;

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput({ className, ...props }, ref) {
    const [isVisible, setIsVisible] = useState(false);

    return (
      <div className="relative">
        <input
          {...props}
          ref={ref}
          type={isVisible ? 'text' : 'password'}
          className={`${className ?? ''} pr-11`}
        />

        <button
          type="button"
          onClick={() => setIsVisible((prev) => !prev)}
          aria-label={isVisible ? '비밀번호 숨기기' : '비밀번호 표시'}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-4"
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
