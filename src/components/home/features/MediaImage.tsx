"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type MediaImageProps = {
  thumbnail: string | null | undefined;
  alt: string;
  className?: string;
};

function getMediaUuid(thumbnail: string | null | undefined): string | null {
  if (!thumbnail) {
    return null;
  }

  const match = thumbnail.match(/\/media\/([0-9a-fA-F-]{36})/);
  return match?.[1] ?? null;
}

export default function MediaImage({
  thumbnail,
  alt,
  className = "h-full w-full object-cover",
}: MediaImageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);

    if (!thumbnail) {
      setImageUrl(null);
      return;
    }

    if (thumbnail.startsWith("http://") || thumbnail.startsWith("https://")) {
      setImageUrl(thumbnail);
      return;
    }

    const mediaUuid = getMediaUuid(thumbnail);

    if (!mediaUuid) {
      setImageUrl(null);
      return;
    }

    setImageUrl(`/api/media/${mediaUuid}/file`);
  }, [thumbnail]);

  const finalSrc =
    !thumbnail || !imageUrl || hasError
      ? "/Image/default-food.png"
      : imageUrl;

  return (
    <Image
      src={finalSrc}
      alt={alt}
      fill
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
      draggable={false}
      onError={() => {
        setHasError(true);
      }}
      className={className}
    />
  );
}
