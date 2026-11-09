const SKELETON_BLOCK_COLOR = '#EAEAEA';

// 높이는 실제 행과 같아야 로딩이 끝나고 목록이 들어올 때 밀리지 않는다.
// 폭은 글자 수에 따라 달라지는 값이라 대표적인 길이로 둔다.
const ROW_PADDING_Y = 12;
const ROW_GAP = 16;
const LIST_GAP = 2;
const AVATAR_SIZE = 48;
const TEXT_BLOCK_HEIGHT = 38;
const TEXT_BLOCK_GAP = 8;
const NAME_WIDTH = 72;
const NAME_HEIGHT = 14;
const CODE_WIDTH = 96;
const CODE_HEIGHT = 12;
const BUTTON_WIDTH = 71;
const BUTTON_HEIGHT = 32;
const DEFAULT_COUNT = 6;

interface FriendListSkeletonProps {
  scale: number;
  count?: number;
}

/** 친구 목록이 로딩되는 동안 같은 자리·같은 크기로 놓이는 자리 표시. */
function FriendListSkeleton({
  scale,
  count = DEFAULT_COUNT,
}: FriendListSkeletonProps) {
  return (
    <div role="status" aria-label="친구 목록을 불러오는 중" aria-busy="true">
      <ul
        aria-hidden="true"
        className="flex animate-pulse flex-col"
        style={{ gap: LIST_GAP * scale }}
      >
        {Array.from({ length: count }, (_, index) => (
          <li
            key={index}
            className="flex items-center justify-between"
            style={{
              gap: ROW_GAP * scale,
              paddingBlock: ROW_PADDING_Y * scale,
            }}
          >
            <div className="flex items-center" style={{ gap: ROW_GAP * scale }}>
              <div
                className="shrink-0 rounded-full"
                style={{
                  width: AVATAR_SIZE * scale,
                  height: AVATAR_SIZE * scale,
                  backgroundColor: SKELETON_BLOCK_COLOR,
                }}
              />
              <div
                className="flex flex-col justify-center"
                style={{
                  gap: TEXT_BLOCK_GAP * scale,
                  height: TEXT_BLOCK_HEIGHT * scale,
                }}
              >
                <div
                  className="rounded-full"
                  style={{
                    width: NAME_WIDTH * scale,
                    height: NAME_HEIGHT * scale,
                    backgroundColor: SKELETON_BLOCK_COLOR,
                  }}
                />
                <div
                  className="rounded-full"
                  style={{
                    width: CODE_WIDTH * scale,
                    height: CODE_HEIGHT * scale,
                    backgroundColor: SKELETON_BLOCK_COLOR,
                  }}
                />
              </div>
            </div>
            <div
              className="shrink-0 rounded-full"
              style={{
                width: BUTTON_WIDTH * scale,
                height: BUTTON_HEIGHT * scale,
                backgroundColor: SKELETON_BLOCK_COLOR,
              }}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default FriendListSkeleton;
