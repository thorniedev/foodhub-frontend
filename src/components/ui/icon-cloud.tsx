"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { renderToString } from "react-dom/server";

import { Button } from "@/components/ui/button";

interface CloudIcon {
  x: number;
  y: number;
  z: number;
  id: number;
}

interface IconCloudProps {
  icons?: React.ReactNode[];
  images?: string[];
  showControl?: boolean;
}

interface TargetRotation {
  x: number;
  y: number;
  startX: number;
  startY: number;
  startTime: number;
  duration: number;
}

/*
 * Keep the original 400 × 400 animation coordinate system.
 */
const LOGICAL_CANVAS_SIZE = 500;

const CLOUD_RADIUS = 200;

const ICON_SOURCE_SIZE = 256;
const ICON_DISPLAY_SIZE = 60;
const MIN_ICON_SCALE = 0.65;
const MAX_ICON_SCALE = 1.15;
const MIN_ICON_OPACITY = 0.55;
// Remove extra space inside each icon
const ICON_PADDING = 0;

/*
 * Automatic rotation speed.
 *
 * These values are applied at approximately 60 FPS.
 */
const AUTO_ROTATION_SPEED_X = 0.025;
const AUTO_ROTATION_SPEED_Y = 0.004;

/*
 * Speed while the mouse is hovering.
 *
 * 1    = normal speed
 * 0.5  = half speed
 * 0.2  = very slow
 * 0    = stop while hovering
 */
const HOVER_SPEED_MULTIPLIER = 0.5;

/*
 * Manual dragging speed.
 */
const DRAG_SPEED = 0.002;

// function easeOutCubic(t: number): number {
//   return 1 - Math.pow(1 - t, 3);
// }
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function getDepthScale(z: number): number {
  const normalizedDepth = Math.max(
    0,
    Math.min(1, (z + CLOUD_RADIUS) / (CLOUD_RADIUS * 2)),
  );

  return MIN_ICON_SCALE + normalizedDepth * (MAX_ICON_SCALE - MIN_ICON_SCALE);
}

export function IconCloud({
  icons,
  images,
  showControl = true,
}: IconCloudProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const animationFrameRef = useRef<number | null>(null);
  const previousFrameTimeRef = useRef<number | null>(null);

  const rotationRef = useRef({
    x: 0,
    y: 0,
  });

  const lastPointerPositionRef = useRef({
    x: 0,
    y: 0,
  });

  const isDraggingRef = useRef(false);
  const isHoveredRef = useRef(false);
  const isPausedRef = useRef(false);

  const targetRotationRef = useRef<TargetRotation | null>(null);

  const iconCanvasesRef = useRef<HTMLCanvasElement[]>([]);
  const imagesLoadedRef = useRef<boolean[]>([]);

  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const items = useMemo(() => icons ?? images ?? [], [icons, images]);

  /*
   * Generate positions using the same Fibonacci sphere structure.
   */
  const iconPositions = useMemo<CloudIcon[]>(() => {
    const numberOfIcons = items.length || 20;
    const positions: CloudIcon[] = [];

    const offset = 2 / numberOfIcons;
    const increment = Math.PI * (3 - Math.sqrt(5));

    for (let index = 0; index < numberOfIcons; index++) {
      const y = index * offset - 1 + offset / 2;

      const radius = Math.sqrt(Math.max(0, 1 - y * y));

      const angle = index * increment;

      positions.push({
        x: Math.cos(angle) * radius * CLOUD_RADIUS,
        y: y * CLOUD_RADIUS,
        z: Math.sin(angle) * radius * CLOUD_RADIUS,
        id: index,
      });
    }

    return positions;
  }, [items.length]);

  /*
   * Respect the user's reduced-motion setting.
   */
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const updateMotionPreference = (reduceMotion: boolean) => {
      isPausedRef.current = reduceMotion;
      setIsPaused(reduceMotion);
    };

    updateMotionPreference(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      updateMotionPreference(event.matches);
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  /*
   * Render the canvas at the real screen pixel density.
   *
   * The animation still uses a logical 400 × 400 coordinate system,
   * so its movement and spacing remain consistent.
   */
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;

    if (!container || !canvas) return;

    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();

      if (rect.width <= 0 || rect.height <= 0) {
        return;
      }

      const devicePixelRatio = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.round(rect.width * devicePixelRatio);

      canvas.height = Math.round(rect.height * devicePixelRatio);

      const context = canvas.getContext("2d");

      if (!context) return;

      context.setTransform(
        canvas.width / LOGICAL_CANVAS_SIZE,
        0,
        0,
        canvas.height / LOGICAL_CANVAS_SIZE,
        0,
        0,
      );

      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
    };

    resizeCanvas();

    const resizeObserver = new ResizeObserver(resizeCanvas);

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  /*
   * Convert each PNG or SVG into a high-resolution canvas.
   */
  useEffect(() => {
    imagesLoadedRef.current = new Array(items.length).fill(false);

    if (items.length === 0) {
      iconCanvasesRef.current = [];
      return;
    }

    const iconCanvases = items.map((item, index) => {
      const offscreenCanvas = document.createElement("canvas");

      offscreenCanvas.width = ICON_SOURCE_SIZE;
      offscreenCanvas.height = ICON_SOURCE_SIZE;

      const context = offscreenCanvas.getContext("2d");

      if (!context) {
        imagesLoadedRef.current[index] = true;
        return offscreenCanvas;
      }

      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";

      const image = new window.Image();

      image.decoding = "async";

      image.onload = () => {
        context.clearRect(0, 0, ICON_SOURCE_SIZE, ICON_SOURCE_SIZE);

        const sourceWidth = image.naturalWidth || ICON_SOURCE_SIZE;

        const sourceHeight = image.naturalHeight || ICON_SOURCE_SIZE;

        const availableSize = ICON_SOURCE_SIZE - ICON_PADDING * 2;

        /*
         * Keep the original image ratio.
         */
        const scale = Math.min(
          availableSize / sourceWidth,
          availableSize / sourceHeight,
        );

        const renderedWidth = sourceWidth * scale;

        const renderedHeight = sourceHeight * scale;

        const x = (ICON_SOURCE_SIZE - renderedWidth) / 2;

        const y = (ICON_SOURCE_SIZE - renderedHeight) / 2;

        context.drawImage(image, x, y, renderedWidth, renderedHeight);

        imagesLoadedRef.current[index] = true;
      };

      image.onerror = () => {
        console.error(`Failed to load icon: ${String(item)}`);

        imagesLoadedRef.current[index] = true;
      };

      if (images) {
        image.src = item as string;
      } else {
        const svgString = renderToString(item as React.ReactElement);

        image.src =
          "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgString);
      }

      return offscreenCanvas;
    });

    iconCanvasesRef.current = iconCanvases;
  }, [items, images]);

  /*
   * Convert browser pointer coordinates to the internal
   * logical 400 × 400 coordinate system.
   */
  const getLogicalPointerPosition = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return {
        x: 0,
        y: 0,
      };
    }

    const rect = canvas.getBoundingClientRect();

    if (rect.width === 0 || rect.height === 0) {
      return {
        x: 0,
        y: 0,
      };
    }

    return {
      x: (clientX - rect.left) * (LOGICAL_CANVAS_SIZE / rect.width),

      y: (clientY - rect.top) * (LOGICAL_CANVAS_SIZE / rect.height),
    };
  };

  /*
   * Rotate an icon using the current cloud rotation.
   *
   * This keeps the same rotation calculation as the old component.
   */
  const getRotatedPosition = (icon: CloudIcon) => {
    const cosX = Math.cos(rotationRef.current.x);

    const sinX = Math.sin(rotationRef.current.x);

    const cosY = Math.cos(rotationRef.current.y);

    const sinY = Math.sin(rotationRef.current.y);

    const rotatedX = icon.x * cosY - icon.z * sinY;

    const rotatedZ = icon.x * sinY + icon.z * cosY;

    const rotatedY = icon.y * cosX + rotatedZ * sinX;

    return {
      x: rotatedX,
      y: rotatedY,
      z: rotatedZ,
    };
  };

  /*
   * Clicking an icon rotates that icon toward the front.
   * Otherwise, pointer down starts dragging.
   */
  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const pointer = getLogicalPointerPosition(event.clientX, event.clientY);

    for (const icon of iconPositions) {
      const rotated = getRotatedPosition(icon);

      const screenX = LOGICAL_CANVAS_SIZE / 2 + rotated.x;

      const screenY = LOGICAL_CANVAS_SIZE / 2 + rotated.y;

      // const scale = (rotated.z + 200) / 300;
      const scale = getDepthScale(rotated.z);

      // const hitRadius = (ICON_DISPLAY_SIZE / 2) * scale;
      const hitRadius = (ICON_DISPLAY_SIZE / 2) * scale;

      const deltaX = pointer.x - screenX;

      const deltaY = pointer.y - screenY;

      if (deltaX * deltaX + deltaY * deltaY < hitRadius * hitRadius) {
        const targetX = -Math.atan2(
          icon.y,
          Math.sqrt(icon.x * icon.x + icon.z * icon.z),
        );

        const targetY = Math.atan2(icon.x, icon.z);

        const currentX = rotationRef.current.x;

        const currentY = rotationRef.current.y;

        const distance = Math.sqrt(
          Math.pow(targetX - currentX, 2) + Math.pow(targetY - currentY, 2),
        );

        targetRotationRef.current = {
          x: targetX,
          y: targetY,
          startX: currentX,
          startY: currentY,
          startTime: performance.now(),
          duration: Math.min(2000, Math.max(800, distance * 1000)),
        };

        return;
      }
    }

    isDraggingRef.current = true;

    lastPointerPositionRef.current = {
      x: event.clientX,
      y: event.clientY,
    };

    canvas.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;

    const deltaX = event.clientX - lastPointerPositionRef.current.x;

    const deltaY = event.clientY - lastPointerPositionRef.current.y;

    rotationRef.current = {
      x: rotationRef.current.x + deltaY * DRAG_SPEED,

      y: rotationRef.current.y + deltaX * DRAG_SPEED,
    };

    lastPointerPositionRef.current = {
      x: event.clientX,
      y: event.clientY,
    };
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;

    isDraggingRef.current = false;

    if (canvas?.hasPointerCapture(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId);
    }
  };

  const handlePointerEnter = () => {
    isHoveredRef.current = true;
    setIsHovered(true);
  };

  const handlePointerLeave = (event: React.PointerEvent<HTMLCanvasElement>) => {
    isHoveredRef.current = false;
    setIsHovered(false);

    if (isDraggingRef.current) {
      handlePointerUp(event);
    }
  };

  /*
   * Continuous animation.
   *
   * It runs automatically and does not use the mouse position.
   * Hovering only changes the speed multiplier.
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context) return;

    const animate = (currentTime: number) => {
      const previousTime = previousFrameTimeRef.current ?? currentTime;

      const deltaTime = currentTime - previousTime;

      previousFrameTimeRef.current = currentTime;

      /*
       * Normalize the speed for different monitor refresh rates.
       *
       * At 60 FPS this value is approximately 1.
       */
      const frameMultiplier = Math.min(3, deltaTime / (1000 / 60));

      context.clearRect(0, 0, LOGICAL_CANVAS_SIZE, LOGICAL_CANVAS_SIZE);

      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";

      const target = targetRotationRef.current;

      if (target) {
        const elapsed = currentTime - target.startTime;

        const progress = Math.min(1, elapsed / target.duration);

        const easedProgress = easeOutCubic(progress);

        rotationRef.current = {
          x: target.startX + (target.x - target.startX) * easedProgress,

          y: target.startY + (target.y - target.startY) * easedProgress,
        };

        if (progress >= 1) {
          targetRotationRef.current = null;
        }
      } else if (!isDraggingRef.current && !isPausedRef.current) {
        const hoverMultiplier = isHoveredRef.current
          ? HOVER_SPEED_MULTIPLIER
          : 1;

        rotationRef.current = {
          x:
            rotationRef.current.x +
            AUTO_ROTATION_SPEED_X * frameMultiplier * hoverMultiplier,

          y:
            rotationRef.current.y +
            AUTO_ROTATION_SPEED_Y * frameMultiplier * hoverMultiplier,
        };
      }

      const centerX = LOGICAL_CANVAS_SIZE / 2;

      const centerY = LOGICAL_CANVAS_SIZE / 2;

      iconPositions.forEach((icon, index) => {
        const rotated = getRotatedPosition(icon);

        const scale = getDepthScale(rotated.z);

        const normalizedDepth = Math.max(
          0,
          Math.min(1, (rotated.z + CLOUD_RADIUS) / (CLOUD_RADIUS * 2)),
        );

        const opacity =
          MIN_ICON_OPACITY + normalizedDepth * (1 - MIN_ICON_OPACITY);

        context.save();

        context.translate(centerX + rotated.x, centerY + rotated.y);

        context.scale(scale, scale);

        context.globalAlpha = opacity;

        const iconCanvas = iconCanvasesRef.current[index];

        if (iconCanvas && imagesLoadedRef.current[index]) {
          context.drawImage(
            iconCanvas,

            0,
            0,
            ICON_SOURCE_SIZE,
            ICON_SOURCE_SIZE,

            -ICON_DISPLAY_SIZE / 2,
            -ICON_DISPLAY_SIZE / 2,
            ICON_DISPLAY_SIZE,
            ICON_DISPLAY_SIZE,
          );
        } else if (items.length === 0) {
          context.beginPath();

          context.arc(0, 0, ICON_DISPLAY_SIZE / 2, 0, Math.PI * 2);

          context.fillStyle = "#4444ff";

          context.fill();

          context.fillStyle = "#ffffff";

          context.textAlign = "center";

          context.textBaseline = "middle";

          context.font = "16px Arial";

          context.fillText(`${icon.id + 1}`, 0, 0);
        }

        context.restore();
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    previousFrameTimeRef.current = null;

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [iconPositions, items.length]);

  const toggleAnimation = () => {
    const nextPausedState = !isPausedRef.current;

    isPausedRef.current = nextPausedState;

    setIsPaused(nextPausedState);
  };

  return (
    <div ref={containerRef} data-hovered={isHovered} className="">
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        className=" size-100  cursor-grab touch-none select-none rounded-lg active:cursor-grabbing"
        // aria-label="Interactive 3D technology icon cloud"
        role="img"
      />

      {/* {showControl && (
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={toggleAnimation}
          aria-label={isPaused ? "Play animation" : "Pause animation"}
          className="absolute right-2 top-2 z-10"
        >
          {isPaused ? (
            <Play className="size-4" />
          ) : (
            <Pause className="size-4" />
          )}
        </Button>
      )} */}
    </div>
  );
}
