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
  const timeoutId = setTimeout(() => controller.abort(), 30_000);

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
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error(
        '이미지 업로드 시간이 초과되었습니다. 네트워크를 확인한 뒤 다시 시도해 주세요.',
        {
          cause: error,
        }
      );
    }
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

const createUniqueFileName = (fileName: string) => {
  const suffix =
    typeof globalThis.crypto?.randomUUID === 'function'
      ? globalThis.crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return `${suffix}-${fileName}`;
};

export async function uploadCourseImage(file: File): Promise<string> {
  // 모바일 브라우저의 카메라 촬영 입력은 매 촬영마다 동일한 파일명
  // (예: image.jpg)을 주는 경우가 많다. presigned URL 요청의 fileName이
  // 곧 저장 키로 이어질 수 있어, 같은 등록 요청 안의 여러 업로드가 같은
  // 파일명을 갖더라도 서로 다른 objectKey를 받도록 항상 유일한 파일명을
  // 붙여 보낸다.
  const { uploadUrl, objectKey } = await getPresignedUrl({
    directory: 'COURSE',
    fileName: createUniqueFileName(file.name),
    contentType: file.type,
  });

  await putFileToPresignedUrl(uploadUrl, file);

  return objectKey;
}

// Files are compressed when users select them. Upload all prepared files in
// parallel and retain input ordering in the returned object keys.
export async function uploadCourseImages(
  files: readonly File[]
): Promise<string[]> {
  return Promise.all(files.map(uploadCourseImage));
}
