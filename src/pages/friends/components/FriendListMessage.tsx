const MESSAGE_TOP_SPACE = 110;
const LOAD_MORE_ERROR_TOP_SPACE = 16;
const MESSAGE_SIZE = 16;
const MESSAGE_LINE_HEIGHT = 22;
const RETRY_GAP = 16;
const RETRY_PADDING_X = 16;
const RETRY_PADDING_Y = 8;
const RETRY_TEXT_SIZE = 14;

const NO_RESULT_MESSAGE = '검색 결과가 없어요.';
const NO_RESULT_HINT = '이름이나 친구 코드를 정확히 입력해 주세요.';
const HINT_GAP = 4;
const HINT_SIZE = 14;

const DEFAULT_ERROR_MESSAGE = '친구 목록을 불러오지 못했어요.';

const EMPTY_MESSAGES = {
  empty: '아직 등록된 친구가 없어요',
  'search-empty': '일치하는 친구가 없어요',
} as const;

interface FriendListMessageProps {
  variant: 'empty' | 'search-empty' | 'no-result' | 'error' | 'load-more-error';
  scale: number;
  errorMessage?: string;
  onRetry?: () => void;
}

/**
 * 친구가 없거나, 검색 결과가 없거나(no-result는 내 친구와 새 친구 모두 없을 때), 불러오지 못했을 때 목록 자리에 놓인다.
 * load-more-error는 이미 받은 목록 아래에 붙어서, 목록 자리를 차지하는 나머지
 * 변형과 달리 위쪽 여백이 작다.
 */
function FriendListMessage({
  variant,
  scale,
  errorMessage = DEFAULT_ERROR_MESSAGE,
  onRetry,
}: FriendListMessageProps) {
  const isLoadMoreError = variant === 'load-more-error';
  const isError = variant === 'error' || isLoadMoreError;
  const isNoResult = variant === 'no-result';

  return (
    <section
      role={isError ? 'alert' : 'status'}
      className="flex flex-col items-center text-center"
      style={{
        paddingTop:
          (isLoadMoreError ? LOAD_MORE_ERROR_TOP_SPACE : MESSAGE_TOP_SPACE) *
          scale,
      }}
    >
      <p
        className="text-gray-4 font-medium"
        style={{
          fontSize: MESSAGE_SIZE * scale,
          lineHeight: `${MESSAGE_LINE_HEIGHT * scale}px`,
        }}
      >
        {variant === 'empty' || variant === 'search-empty'
          ? EMPTY_MESSAGES[variant]
          : isNoResult
            ? NO_RESULT_MESSAGE
            : errorMessage}
      </p>
      {isNoResult ? (
        <p
          className="text-gray-3 font-medium"
          style={{ marginTop: HINT_GAP * scale, fontSize: HINT_SIZE * scale }}
        >
          {NO_RESULT_HINT}
        </p>
      ) : null}
      {isError && onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="border-gray-2 text-gray-5 rounded-full border font-medium"
          style={{
            marginTop: RETRY_GAP * scale,
            padding: `${RETRY_PADDING_Y * scale}px ${RETRY_PADDING_X * scale}px`,
            fontSize: RETRY_TEXT_SIZE * scale,
          }}
        >
          다시 시도
        </button>
      ) : null}
    </section>
  );
}

export default FriendListMessage;
