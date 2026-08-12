const MAX_REVIEWER_NAME_LENGTH = 3;

export function getReviewerNameLabel(nickname: string) {
  const characters = Array.from(nickname);

  return {
    text: characters.slice(0, MAX_REVIEWER_NAME_LENGTH).join(''),
    isTruncated: characters.length > MAX_REVIEWER_NAME_LENGTH,
  };
}
