const MESSAGE_TOP_SPACE = 80;
const MESSAGE_SIZE = 16;
const MESSAGE_LINE_HEIGHT = 22;

interface FriendProfileMessageProps {
  message: string;
  scale: number;
}

/** 탭 내용 자리에 놓이는 빈 상태·준비 중 안내. */
function FriendProfileMessage({ message, scale }: FriendProfileMessageProps) {
  return (
    <section
      role="status"
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
        {message}
      </p>
    </section>
  );
}

export default FriendProfileMessage;
