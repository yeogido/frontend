import { useId, useRef } from 'react';
import { IoSearch } from 'react-icons/io5';

import closeRounded from '../../../assets/icons/close-rounded.svg';

// 모든 수치는 Figma 390 디자인 기준 리터럴 px. scale은 useGlobalScale 값이다.
const PADDING_X = 14;
const PADDING_Y = 11;
const GAP = 10;
const RADIUS = 12;
const SEARCH_ICON_SIZE = 24;
const CLEAR_ICON_SIZE = 16;
const TEXT_SIZE = 12;

interface FriendSearchBarProps {
  value: string;
  scale: number;
  desktop?: boolean;
  onChange: (value: string) => void;
  /** Enter로 디바운스를 기다리지 않고 바로 검색한다. */
  onSubmit: () => void;
  onClear: () => void;
}

function FriendSearchBar({
  value,
  scale,
  desktop = false,
  onChange,
  onSubmit,
  onClear,
}: FriendSearchBarProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      className="border-gray-2 flex w-full items-center overflow-hidden border bg-white"
      style={{
        gap: GAP * scale,
        padding: `${PADDING_Y * scale}px ${PADDING_X * scale}px`,
        borderRadius: RADIUS * scale,
      }}
    >
      <label htmlFor={inputId} className="sr-only">
        친구 이름 또는 친구 코드 검색
      </label>
      <IoSearch
        aria-hidden="true"
        className="text-gray-4 shrink-0"
        size={SEARCH_ICON_SIZE * scale}
      />
      <input
        ref={inputRef}
        id={inputId}
        type="text"
        inputMode="search"
        enterKeyHint="search"
        autoComplete="off"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="친구 이름 또는 친구 코드를 검색해 보세요"
        className="text-gray-5 placeholder:text-gray-4 min-w-0 flex-1 bg-transparent font-medium outline-none"
        style={{
          fontSize: (desktop ? 14 : TEXT_SIZE) * scale,
          lineHeight: 'normal',
        }}
      />
      {value ? (
        <button
          type="button"
          aria-label="검색어 지우기"
          onClick={() => {
            onClear();
            inputRef.current?.focus();
          }}
          className="relative shrink-0 before:absolute before:-inset-3.5 before:content-['']"
          style={{
            width: CLEAR_ICON_SIZE * scale,
            height: CLEAR_ICON_SIZE * scale,
          }}
        >
          <img
            src={closeRounded}
            alt=""
            aria-hidden="true"
            className="size-full"
          />
        </button>
      ) : null}
    </form>
  );
}

export default FriendSearchBar;
