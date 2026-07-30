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
): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type || 'application/octet-stream',
    },
    body: file,
  });

  if (!response.ok) {
    throw new Error(`Failed to upload file: ${response.status}`);
  }
}
