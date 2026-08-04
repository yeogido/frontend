const MOCK_REQUEST_DELAY = 300;
const MOCK_FAILURE_RATE = 0.2;

export async function mockLikeRequest(_nextLiked: boolean) {
  void _nextLiked;
  await new Promise((resolve) => setTimeout(resolve, MOCK_REQUEST_DELAY));

  if (Math.random() < MOCK_FAILURE_RATE) {
    throw new Error('좋아요 요청에 실패했습니다.');
  }
}
