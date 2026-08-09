/**
 * 상세 조회가 이미지의 원본 S3 key를 따로 안 주고 완성된 URL만 줄 때, URL의
 * 경로 부분을 key로 유추한다. 실제로 key와 URL을 함께 주는 다른 응답(코스
 * 상세의 장소 이미지 imageKey/imageUrl)에서 둘이 정확히 일치하는 걸 확인한
 * 패턴이다. 형식이 예상과 다르면(파싱 실패) null을 반환해 새로 올리게 한다.
 */
export function deriveImageKeyFromUrl(
  url: string | null | undefined
): string | null {
  if (!url) return null;

  try {
    // pathname은 URL-인코딩된 상태라, key에 공백/한글 등이 있었다면 그대로
    // 쓰면 실제 key와 달라진다. decodeURIComponent로 원래 문자열로 되돌린다.
    return decodeURIComponent(new URL(url).pathname.replace(/^\//, ''));
  } catch {
    return null;
  }
}
