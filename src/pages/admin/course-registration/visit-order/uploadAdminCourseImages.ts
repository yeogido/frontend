import {
  createPresignedUrl,
  uploadFileToPresignedUrl,
} from '../../../../apis/files.api';

// files.api.ts의 presigned-url 발급/업로드 함수는 라이브 OpenAPI 스키마
// ({fileName, contentType}, directory 필드 없음)와 정확히 일치해 이걸 쓴다.
// (apis/files.ts의 uploadCourseImages는 directory: 'COURSE'를 얹어 보내는데,
// 라이브 스키마에는 없는 필드다.) 파일명이 겹치는 걸 막기 위해 files.ts의
// uploadCourseImage와 동일하게 무작위 접두사를 붙인다.
async function uploadAdminCourseImage(file: File): Promise<string> {
  const uniqueFileName = `${crypto.randomUUID()}-${file.name}`;
  const { uploadUrl, objectKey } = await createPresignedUrl({
    fileName: uniqueFileName,
    contentType: file.type,
  });

  await uploadFileToPresignedUrl(uploadUrl, file, file.type);

  return objectKey;
}

export async function uploadAdminCourseImages(
  files: readonly File[]
): Promise<string[]> {
  return Promise.all(files.map(uploadAdminCourseImage));
}

// 장소를 추가할 때 사진을 직접 올리지 않고 구글 이미지로 넘어간 경우, imageSrc는
// 구글이 호스팅하는 원격 URL일 뿐 백엔드에 업로드된 파일이 아니다. 백엔드는
// imageKey(업로드된 오브젝트 키)만 받으므로 File이 필요한데, googleusercontent.com을
// 브라우저에서 직접 크로스오리진으로 fetch하면 CORS에 기대는 취약한 방식이 된다.
// 대신 같은 오리진의 /google-places/image 프록시(api/google-places/imageProxy.ts)를
// 거쳐 내려받는다 — 서버가 호스트를 검증한 뒤 대신 가져와 돌려준다.
export async function fetchImageAsFile(
  url: string,
  fileName: string
): Promise<File> {
  const proxiedUrl = `/google-places/image?url=${encodeURIComponent(url)}`;
  const response = await fetch(proxiedUrl);

  if (!response.ok) {
    throw new Error('구글 이미지를 불러오지 못했습니다.');
  }

  const blob = await response.blob();

  return new File([blob], fileName, { type: blob.type || 'image/jpeg' });
}
