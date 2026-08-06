import type { GetMyPostsResponse } from '../types/user.type';

// apiClient를 import하지 않는다. 페이지를 이어 받는 반복 로직만 담아 Node
// 테스트 러너에서 그대로 검증할 수 있게 한다.
type FetchMyPostsPage = (
  cursorId: number | undefined,
) => Promise<GetMyPostsResponse>;

/**
 * 내가 쓴 리뷰의 ID를 전부 모은다.
 *
 * 리뷰 목록 응답에 작성자 식별자가 없어서 본인 여부를 판단할 방법이 이것뿐이다
 * (백엔드에 isMine 추가 요청 중). 목록이 커서 페이징이라 끝까지 따라간다.
 */
export const collectMyReviewIds = async (
  fetchPage: FetchMyPostsPage,
): Promise<Set<number>> => {
  const reviewIds = new Set<number>();
  const requestedCursors = new Set<number>();
  let cursorId: number | undefined;

  for (;;) {
    const page = await fetchPage(cursorId);

    page.items.forEach((item) => {
      if (item.review) {
        reviewIds.add(item.review.reviewId);
      }
    });

    // hasNext가 true여도 커서가 비어 오면 다음 페이지를 요청할 근거가 없다.
    const nextCursor = page.hasNext ? (page.cursorId ?? undefined) : undefined;

    // 이미 요청했던 커서가 다시 오면 서버가 같은 페이지를 계속 돌려주는
    // 상태다. 그대로 따라가면 응답이 끝나지 않는다.
    if (nextCursor === undefined || requestedCursors.has(nextCursor)) {
      return reviewIds;
    }

    requestedCursors.add(nextCursor);
    cursorId = nextCursor;
  }
};
