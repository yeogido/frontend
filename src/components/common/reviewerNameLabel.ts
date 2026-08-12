const MAX_REVIEWER_NAME_LENGTH = 3;
const MAX_TRUNCATED_REVIEWER_NAME_LENGTH = 2;

export function getReviewerNameLabel(nickname: string) {
  const characters = Array.from(nickname);
  const isTruncated = characters.length > MAX_REVIEWER_NAME_LENGTH;

  return {
    text: characters
      .slice(
        0,
        isTruncated
          ? MAX_TRUNCATED_REVIEWER_NAME_LENGTH
          : MAX_REVIEWER_NAME_LENGTH
      )
      .join(''),
    isTruncated,
  };
}
