const MAX_SIZE_BYTES = 1024 * 1024;
const MAX_DIMENSION = 1920;

export async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith('image/') || file.size <= MAX_SIZE_BYTES) {
    return file;
  }

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(
      1,
      MAX_DIMENSION / Math.max(bitmap.width, bitmap.height)
    );
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const context = canvas.getContext('2d');
    if (!context) return file;

    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    let quality = 0.9;
    let blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', quality)
    );
    while (blob && blob.size > MAX_SIZE_BYTES && quality > 0.5) {
      quality -= 0.1;
      blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, 'image/jpeg', quality)
      );
    }

    return blob
      ? new File([blob], file.name.replace(/\.[^./]+$/, '.jpg'), {
          type: 'image/jpeg',
        })
      : file;
  } catch (error) {
    console.warn(
      'Image compression failed; uploading original file instead.',
      error
    );
    return file;
  }
}
