// 백엔드 presigned-url 발급이 실제로 받아주는 이미지 타입만 허용한다
// (pages/travel-record/photo-selection/photoValidation.ts와 동일한 목록).
// 예전엔 "image/*"만 확인해서 HEIC 등 다른 이미지 형식도 통과시켰는데,
// 그런 파일은 presigned-url 요청 자체가 "허용되지 않은 Content-Type"으로
// 거부돼 폼을 다 채운 뒤 등록 마지막 단계에서야 실패로 드러났다.
const SUPPORTED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

export const COVER_PHOTO_ACCEPT = 'image/jpeg,image/png,image/webp';

export const UNSUPPORTED_COVER_PHOTO_MESSAGE =
  'JPG, PNG, WebP 형식의 이미지만 등록할 수 있어요.';

export function isSupportedCoverPhoto(file: File) {
  return SUPPORTED_IMAGE_TYPES.has(file.type);
}
