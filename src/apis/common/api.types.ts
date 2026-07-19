export interface ApiResponse<T> {
  isSuccess: boolean;
  code: string;
  message: string;
  result: T;
}

export interface CursorResponse<T, TCursorValue = unknown> {
  items: T[];
  cursorValue?: TCursorValue | null;
  cursorId?: number | null;
  hasNext: boolean;
}

export interface ApiErrorResponse {
  isSuccess: false;
  code: string;
  message: string;
  result: null;
}

export interface NormalizedApiError {
  code: string;
  message: string;
  status?: number;
}
