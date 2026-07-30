import { apiClient } from './common';

export type FileDirectory = 'COURSE';

export interface PresignedUrlRequest {
  directory: FileDirectory;
  fileName: string;
  contentType: string;
}

export interface PresignedUrlResult {
  uploadUrl: string;
  objectKey: string;
}

export async function getPresignedUrl(
  payload: PresignedUrlRequest
): Promise<PresignedUrlResult> {
  // apiClient's response interceptor already unwraps the { isSuccess,
  // result } envelope and rejects with a NormalizedApiError on failure.
  const { data } = await apiClient.post<PresignedUrlResult>(
    '/files/presigned-url',
    payload
  );

  return data;
}

async function putFileToPresignedUrl(
  uploadUrl: string,
  file: File
): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': file.type },
  });

  if (!response.ok) {
    throw new Error('이미지 업로드에 실패했습니다.');
  }
}

export async function uploadCourseImage(file: File): Promise<string> {
  const { uploadUrl, objectKey } = await getPresignedUrl({
    directory: 'COURSE',
    fileName: file.name,
    contentType: file.type,
  });

  await putFileToPresignedUrl(uploadUrl, file);

  return objectKey;
}
