import { normalizeApiError } from './common';
import { apiClient } from './common';

import type {
  PresignedUrlRequest,
  PresignedUrlResponse,
} from '../types/file.type';

export async function createPresignedUrl(
  request: PresignedUrlRequest,
): Promise<PresignedUrlResponse> {
  try {
    const { data } = await apiClient.post<PresignedUrlResponse>(
      '/files/presigned-url',
      request,
    );

    return data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function uploadFileToPresignedUrl(
  uploadUrl: string,
  file: File,
  // presigned URL 서명에 content-type이 포함돼 있어, 발급 요청에 보낸 값과
  // 여기서 보내는 값이 다르면 S3가 서명 불일치로 거부한다. 클립보드에서 온
  // File처럼 type이 비어 있을 수 있는 경우 호출부가 값을 고정해서 넘긴다.
  contentType?: string,
): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': contentType || file.type || 'application/octet-stream',
    },
    body: file,
  });

  if (!response.ok) {
    throw new Error(`Failed to upload file: ${response.status}`);
  }
}
