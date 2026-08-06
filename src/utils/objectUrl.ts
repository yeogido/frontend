export function revokeObjectUrl(url: string | null) {
  if (!url) return;

  URL.revokeObjectURL(url);
}
