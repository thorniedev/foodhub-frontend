export interface ConvertToWebPOptions {
  quality?: number; // 0 to 1, default 0.85
  maxWidth?: number; // default 1920
  maxHeight?: number; // default 1920
}

/**
 * Converts an uploaded image file to a compressed WebP format client-side.
 * This function uses HTML5 Canvas to resize and compress the image before upload.
 * It will fall back to returning the original file if conversion fails,
 * or if the file is not an image that makes sense to compress (e.g. PDF, animated GIF).
 *
 * @param file - The original File from an <input type="file">
 * @param options - Configuration for resizing and quality
 * @returns A Promise resolving to the compressed WebP File, or the original File.
 */
export async function convertToWebP(
  file: File,
  options: ConvertToWebPOptions = {}
): Promise<File> {
  // Pass through if not running in a browser
  if (typeof window === "undefined" || typeof document === "undefined") {
    return file;
  }

  // Pass through if it's not an image, or if it's an animated format like GIF where static WebP conversion would ruin it
  if (!file.type.startsWith("image/") || file.type === "image/gif" || file.type === "image/svg+xml") {
    return file;
  }

  const { quality = 0.85, maxWidth = 1920, maxHeight = 1920 } = options;

  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;

      // Maintain aspect ratio while constraining to maxWidth and maxHeight
      if (width > maxWidth || height > maxHeight) {
        if (width / height > maxWidth / maxHeight) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        // Fallback to original file if canvas context is unavailable
        resolve(file);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          // If the converted blob is somehow larger than the original, and the original is already webp, keep original
          if (blob.size >= file.size && file.type === "image/webp") {
            resolve(file);
            return;
          }

          // Replace the extension with .webp
          const baseName = file.name.replace(/\.[^/.]+$/, "");
          const convertedFile = new File([blob], `${baseName}.webp`, {
            type: "image/webp",
            lastModified: Date.now(),
          });
          resolve(convertedFile);
        },
        "image/webp",
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      // Fallback to original file on error
      resolve(file);
    };

    img.src = objectUrl;
  });
}
