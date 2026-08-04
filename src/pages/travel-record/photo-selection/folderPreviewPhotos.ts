import type { SelectedPhoto } from './types';

/**
 * 폴더 미리보기에 보이는 사진 URL.
 *
 * 폴더는 앞의 두 장만 보여 준다. 선택한 순서를 그대로 따르므로 아래 목록에서
 * 순서를 바꾸면 미리보기도 함께 바뀐다.
 */
export const getFolderPreviewPhotoUrls = (photos: SelectedPhoto[]): string[] =>
  photos.slice(0, 2).map((photo) => photo.url);
