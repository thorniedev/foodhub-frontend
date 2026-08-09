"use client";

import { useEffect, useState } from "react";

type MediaImageProps = {
  thumbnail: string | null | undefined;
  alt: string;
  className?: string;
};

type MediaAccessResponse = {
  uuid: string;
  url: string;
  expiresAt: string;
};

function getMediaUuid(thumbnail: string | null | undefined): string | null {
  if (!thumbnail) {
    return null;
  }

  // Example:
  // /api/v1/media/b7ccff1e-90ee-49ea-b713-dbd8151be3e4

  const match = thumbnail.match(/\/media\/([0-9a-fA-F-]{36})/);

  return match?.[1] ?? null;
}

export default function MediaImage({
  thumbnail,
  alt,
  className = "",
}: MediaImageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);

    if (!thumbnail) {
      setImageUrl(null);
      return;
    }

    /*
     * If backend someday returns a real URL
     * instead of /api/v1/media/{uuid},
     * render it directly.
     */
    if (thumbnail.startsWith("http://") || thumbnail.startsWith("https://")) {
      setImageUrl(thumbnail);
      return;
    }

    const mediaUuid = getMediaUuid(thumbnail);

    if (!mediaUuid) {
      setImageUrl(null);
      return;
    }

    let cancelled = false;

    async function resolveMedia() {
      try {
        /*
         * Frontend:
         * /api/media/{uuid}/access-url
         *
         * Your catch-all proxy forwards this to:
         * /api/v1/media/{uuid}/access-url
         */
        const response = await fetch(`/api/media/${mediaUuid}/access-url`, {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Media request failed: ${response.status}`);
        }

        const data = (await response.json()) as MediaAccessResponse;

        if (!cancelled) {
          setImageUrl(data.url);
        }
      } catch (error) {
        console.error("[MEDIA IMAGE ERROR]", error);

        if (!cancelled) {
          setImageUrl(null);
          setHasError(true);
        }
      }
    }

    void resolveMedia();

    return () => {
      cancelled = true;
    };
  }, [thumbnail]);

  if (!thumbnail || !imageUrl || hasError) {
    return (
      <img
        src="/Image/default-food.png"
        alt={alt}
        draggable={false}
        className={className}
      />
    );
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      draggable={false}
      onError={() => {
        setHasError(true);
      }}
      className={className}
    />
  );
}
