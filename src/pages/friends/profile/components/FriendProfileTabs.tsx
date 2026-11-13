import { useRef, type KeyboardEvent } from 'react';

import {
  FRIEND_PROFILE_TABS,
  type FriendProfileTab,
} from '../friendProfileTabs';

// 모든 수치는 Figma 390 디자인 기준 리터럴 px. scale은 useGlobalScale 값이다.
const TAB_GAP = 16;
const TAB_SIZE = 20;

interface FriendProfileTabsProps {
  value: FriendProfileTab;
  scale: number;
  onChange: (tab: FriendProfileTab) => void;
}

/** 여행 폴더 / 여행 지도 / 우리동네추천코스 탭. 좌우 화살표로 옮길 수 있다. */
function FriendProfileTabs({ value, scale, onChange }: FriendProfileTabsProps) {
  const tabRefs = useRef<Partial<Record<FriendProfileTab, HTMLButtonElement>>>(
    {}
  );

  const handleKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number
  ) => {
    const step =
      event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;

    if (step === 0) return;

    event.preventDefault();

    const next =
      FRIEND_PROFILE_TABS[
        (index + step + FRIEND_PROFILE_TABS.length) % FRIEND_PROFILE_TABS.length
      ];

    onChange(next.key);
    tabRefs.current[next.key]?.focus();
  };

  return (
    <div
      role="tablist"
      aria-label="친구 프로필"
      className="flex items-center"
      style={{ gap: TAB_GAP * scale }}
    >
      {FRIEND_PROFILE_TABS.map((tab, index) => {
        const isSelected = tab.key === value;

        return (
          <button
            key={tab.key}
            ref={(node) => {
              if (node) tabRefs.current[tab.key] = node;
            }}
            type="button"
            role="tab"
            aria-selected={isSelected}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => onChange(tab.key)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={`font-semibold whitespace-nowrap ${
              isSelected ? 'text-black' : 'text-gray-3'
            }`}
            style={{ fontSize: TAB_SIZE * scale, lineHeight: 'normal' }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

export default FriendProfileTabs;
