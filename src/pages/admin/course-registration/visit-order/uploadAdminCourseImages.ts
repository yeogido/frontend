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
