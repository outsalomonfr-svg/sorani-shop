'use client';

/**
 * Compresse et redimensionne une image côté navigateur avant upload.
 * - Réduit la plus grande dimension à `maxDimension` (défaut 1600px)
 * - Réexporte en WebP à la qualité voulue (défaut 0.82)
 * - Ignore les SVG/GIF (animation) et renvoie l'original si la compression n'aide pas.
 */
export async function compressImage(
  file: File,
  opts: { maxDimension?: number; quality?: number } = {}
): Promise<File> {
  const maxDimension = opts.maxDimension ?? 1600;
  const quality = opts.quality ?? 0.82;

  if (
    typeof window === 'undefined' ||
    !file.type.startsWith('image/') ||
    file.type === 'image/svg+xml' ||
    file.type === 'image/gif'
  ) {
    return file;
  }

  try {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('read error'));
      reader.readAsDataURL(file);
    });

    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new window.Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('decode error'));
      image.src = dataUrl;
    });

    let width = img.naturalWidth;
    let height = img.naturalHeight;
    if (!width || !height) return file;

    if (width > maxDimension || height > maxDimension) {
      if (width >= height) {
        height = Math.round(height * (maxDimension / width));
        width = maxDimension;
      } else {
        width = Math.round(width * (maxDimension / height));
        height = maxDimension;
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/webp', quality);
    });

    // Si la conversion échoue ou n'allège pas, on garde l'original
    if (!blob || blob.size >= file.size) return file;

    const newName = file.name.replace(/\.[^.]+$/, '') + '.webp';
    return new File([blob], newName, { type: 'image/webp' });
  } catch {
    return file;
  }
}
