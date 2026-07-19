interface ApiSuccessResponse<T> {
  isSuccess: true;
  code: string;
  message: string;
  result: T;
}

export interface ApiErrorResponse {
  isSuccess: false;
  code: string;
  message: string;
  result: null;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface CursorResponse<T, TCursorValue = unknown> {
  items: T[];
  cursorValue?: TCursorValue | null;
  cursorId?: number | null;
  hasNext: boolean;
}

export interface NormalizedApiError {
  code: string;
  message: string;
  status?: number;
}
