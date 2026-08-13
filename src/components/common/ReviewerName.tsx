import { getReviewerNameLabel } from './reviewerNameLabel';

const REVIEWER_NAME_SLOT_WIDTH = 36;
const REVIEWER_NAME_ELLIPSIS_SIZE = 6;

interface ReviewerNameProps {
  readonly nickname: string;
  readonly className: string;
}

/**
 * 작성자 메타 줄에서 이름이 길어져도 나이·성별 시작 위치를 유지한다.
 * 세 글자 이하는 그대로 보이고, 긴 이름은 36px 슬롯 안에서
 * 두 글자와 작은 말줄임표를 함께 표시한다.
 */
function ReviewerName({ nickname, className }: ReviewerNameProps) {
  const { text, isTruncated } = getReviewerNameLabel(nickname);

  return (
    <span
      className={`inline-block shrink-0 overflow-hidden whitespace-nowrap ${className}`}
      style={{ width: REVIEWER_NAME_SLOT_WIDTH }}
      title={isTruncated ? nickname : undefined}
    >
      {text}
      {isTruncated ? (
        <span className="align-baseline" style={{ fontSize: REVIEWER_NAME_ELLIPSIS_SIZE }}>
          …
        </span>
      ) : null}
    </span>
  );
}

export default ReviewerName;
