const MESSAGE_TOP_SPACE = 110;
const MESSAGE_SIZE = 16;
const MESSAGE_LINE_HEIGHT = 22;
const RETRY_GAP = 16;
const RETRY_PADDING_X = 16;
const RETRY_PADDING_Y = 8;
const RETRY_TEXT_SIZE = 14;

const DEFAULT_ERROR_MESSAGE = '친구 목록을 불러오지 못했어요.';

const EMPTY_MESSAGES = {
  empty: '아직 등록된 친구가 없어요',
  'search-empty': '일치하는 친구가 없어요',
} as const;

interface FriendListMessageProps {
  variant: 'empty' | 'search-empty' | 'error';
  scale: number;
  errorMessage?: string;
  onRetry?: () => void;
}

/** 친구가 없거나, 검색 결과가 없거나, 불러오지 못했을 때 목록 자리에 놓인다. */
function FriendListMessage({
  variant,
  scale,
  errorMessage = DEFAULT_ERROR_MESSAGE,
  onRetry,
}: FriendListMessageProps) {
  const isError = variant === 'error';

  return (
    <section
      role={isError ? 'alert' : 'status'}
      className="flex flex-col items-center text-center"
      style={{ paddingTop: MESSAGE_TOP_SPACE * scale }}
    >
      <p
        className="text-gray-4 font-medium"
        style={{
          fontSize: MESSAGE_SIZE * scale,
          lineHeight: `${MESSAGE_LINE_HEIGHT * scale}px`,
        }}
      >
        {isError ? errorMessage : EMPTY_MESSAGES[variant]}
      </p>
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
