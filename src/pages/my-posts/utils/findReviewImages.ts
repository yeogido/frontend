import type {
  GetCourseReviewsResponse,
  ReviewImage,
} from '../../../types/review.type';

// apiClient를 import하지 않는다. 페이지를 이어 받는 반복 로직만 담아 Node
// 테스트 러너에서 그대로 검증할 수 있게 한다.
export interface CourseReviewsCursor {
  cursorValue: string;
  cursorId: number;
}

type FetchCourseReviewsPage = (
  cursor: CourseReviewsCursor | undefined,
) => Promise<GetCourseReviewsResponse>;

/** 한 코스의 후기가 아무리 많아도 이만큼만 훑는다. */
const MAX_PAGES = 5;

/**
 * 코스 후기 목록에서 특정 후기의 이미지를 찾는다.
 *
 * 내 게시물(GET /users/me/posts) 응답에는 리뷰 이미지가 없어서, 수정할 때
 * 유지할 사진의 imageKey를 알 수 없다. 코스 후기 목록은 imageKey까지 주므로
 * 그쪽에서 같은 리뷰를 찾아 온다.
 *
 * 못 찾으면 undefined다(그 코스의 후기가 많아 뒤 페이지에 있거나, 조회에
 * 실패한 경우). 호출부는 그때 사진을 건드리지 않는 수정만 허용한다.
 */
export async function findReviewImages(
  fetchPage: FetchCourseReviewsPage,
  reviewId: number,
): Promise<ReviewImage[] | undefined> {
  let cursor: CourseReviewsCursor | undefined;

  for (let page = 0; page < MAX_PAGES; page++) {
    const response = await fetchPage(cursor);
    const found = response.items.find((item) => item.reviewId === reviewId);

    if (found) {
      return found.images ?? [];
    }

    // cursorValue와 cursorId는 반드시 함께 보내야 한다. 하나만 가면 서버가
    // 400으로 처리하므로, 둘 다 온 경우에만 다음 페이지를 잇는다.
    if (
      !response.hasNext ||
      response.cursorId === null ||
      response.cursorValue === null
    ) {
      return undefined;
    }

    cursor = {
      cursorValue: String(response.cursorValue),
      cursorId: response.cursorId,
    };
  }

  return undefined;
}
