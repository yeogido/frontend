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
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10_000);

  try {
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error('이미지 업로드에 실패했습니다.');
    }
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === '이미지 업로드에 실패했습니다.'
    ) {
      throw error;
    }
    throw new Error('이미지 업로드에 실패했습니다.', { cause: error });
  } finally {
    clearTimeout(timeoutId);
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
