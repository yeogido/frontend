export const DEFAULT_TOAST_DURATION = 2000;

export interface ToastItem {
  id: number;
  message: string;
  duration: number;
}

let nextToastId = 1;

export const createToast = (
  message: string,
  duration = DEFAULT_TOAST_DURATION,
): ToastItem => ({
  id: nextToastId++,
  message,
  duration,
});
