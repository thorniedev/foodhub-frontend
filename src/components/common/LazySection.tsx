"use client";

import React, { useEffect, useRef, useState, type ReactNode } from "react";

interface LazySectionProps {
  children: ReactNode;
  minHeight?: string | number;
  rootMargin?: string;
  className?: string;
}

/**
 * Defers rendering of below-the-fold content until the user scrolls within
 * `rootMargin` of the section. Preserves vertical space with a placeholder
 * to prevent layout shifts (CLS = 0).
 */
export default function LazySection({
  children,
  minHeight = "350px",
  rootMargin = "350px",
  className = "",
}: LazySectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible) return;

    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );

    const el = containerRef.current;
    if (el) {
      observer.observe(el);
    }

    return () => {
      observer.disconnect();
    };
  }, [isVisible, rootMargin]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={
        isVisible
          ? undefined
          : {
              minHeight: typeof minHeight === "number" ? `${minHeight}px` : minHeight,
            }
      }
    >
      {isVisible ? children : null}
    </div>
  );
}
