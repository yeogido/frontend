const DEFAULT_MAX_SIZE_BYTES = 1024 * 1024;
const DEFAULT_MAX_DIMENSION = 1920;
const MIN_QUALITY = 0.5;
const QUALITY_STEP = 0.1;
const INITIAL_QUALITY = 0.9;

interface CompressImageOptions {
  maxSizeBytes?: number;
  maxDimension?: number;
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  quality: number
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob(resolve, 'image/jpeg', quality);
  });
}

// Downscales to maxDimension, then steps JPEG quality down until the blob
// fits maxSizeBytes or MIN_QUALITY is hit — whichever comes first.
export async function compressImage(
  file: File,
  options: CompressImageOptions = {}
): Promise<File> {
  const maxSizeBytes = options.maxSizeBytes ?? DEFAULT_MAX_SIZE_BYTES;
  const maxDimension = options.maxDimension ?? DEFAULT_MAX_DIMENSION;

  if (!file.type.startsWith('image/')) {
    return file;
  }

  try {
    const bitmap = await createImageBitmap(file);
    if (
      file.size <= maxSizeBytes &&
      bitmap.width <= maxDimension &&
      bitmap.height <= maxDimension
    ) {
      bitmap.close();
      return file;
    }
    const scale = Math.min(
      1,
      maxDimension / Math.max(bitmap.width, bitmap.height)
    );
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');

    if (!context) {
      bitmap.close();
      return file;
    }

    context.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    let quality = INITIAL_QUALITY;
    let blob = await canvasToBlob(canvas, quality);

    while (blob && blob.size > maxSizeBytes && quality > MIN_QUALITY) {
      quality -= QUALITY_STEP;
      blob = await canvasToBlob(canvas, quality);
    }

    if (!blob) {
      return file;
    }

    const compressedName = file.name.replace(/\.[^./]+$/, '.jpg');
    return new File([blob], compressedName, { type: 'image/jpeg' });
  } catch {
    return file;
  }
}
