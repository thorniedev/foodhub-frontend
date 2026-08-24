"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useScanQrCodeMutation,
  useSendFriendRequestMutation,
} from "@/app/store/friendsApi";
import {
  Camera,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Keyboard,
  Scan,
  Upload,
} from "lucide-react";

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (username?: string) => void;
}

type ApiErrorLike = {
  data?: {
    message?: string;
    error?: string;
  };
  message?: string;
};

function getApiErrorMessage(error: unknown, fallback: string): string {
  if (typeof error !== "object" || error === null) {
    return fallback;
  }

  const apiError = error as ApiErrorLike;
  return apiError.data?.message || apiError.data?.error || apiError.message || fallback;
}

export default function QrScannerModal({
  isOpen,
  onClose,
  onSuccess,
}: QrScannerModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [manualInput, setManualInput] = useState("");
  const [useManual, setUseManual] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [successText, setSuccessText] = useState<string | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);

  const [scanQrCode, { isLoading: isScanningQr }] = useScanQrCodeMutation();
  const [sendFriendRequest, { isLoading: isSendingRequest }] =
    useSendFriendRequestMutation();

  const isProcessing = isScanningQr || isSendingRequest;

  // Process a found QR token string or username
  const handleProcessToken = useCallback(
    async (rawCode: string) => {
      let token = rawCode.trim();
      if (!token) {
        setErrorText("កូដ QR មិនត្រឹមត្រូវ ឬទទេ។ សូមសាកល្បងម្តងទៀត។");
        return;
      }

      // Handle JSON payload if code contains JSON
      if (token.startsWith("{") && token.endsWith("}")) {
        try {
          const parsed = JSON.parse(token);
          token =
            parsed.qrCodeToken ||
            parsed.token ||
            parsed.username ||
            parsed.userUuid ||
            token;
        } catch {
          // continue
        }
      }

      // Extract token if embedded in URL or query parameter
      if (token.includes("token=")) {
        const match = token.match(/token=([a-zA-Z0-9_-]+)/);
        if (match && match[1]) {
          token = match[1];
        }
      } else if (token.includes("/friends?add=") || token.includes("/u/")) {
        const match = token.match(/(?:\/friends\?add=|\/u\/)([a-zA-Z0-9_.-]+)/);
        if (match && match[1]) {
          token = match[1];
        }
      }

      // Strip leading '@' if someone shared username
      if (token.startsWith("@")) {
        token = token.slice(1);
      }

      setErrorText(null);

      // If it looks like a QR token (fh_qr_... or qr_...)
      if (token.startsWith("fh_qr_") || token.includes("qr_")) {
        try {
          const res = await scanQrCode({ qrCodeToken: token }).unwrap();
          const message =
            (res as { message?: string })?.message ||
            "បានផ្ញើសំណើមិត្តភក្តិរួចរាល់។ កំពុងរង់ចាំការយល់ព្រម។";
          setSuccessText(message);
          if (onSuccess) onSuccess();
          setTimeout(() => {
            setSuccessText(null);
            onClose();
          }, 2500);
          return;
        } catch (err: unknown) {
          const errMsg = getApiErrorMessage(
            err,
            "មិនអាចដំណើរការ QR មិត្តភក្តិនេះបានទេ។",
          );
          setErrorText(errMsg);
          return;
        }
      }

      // Fallback: It might be a direct username or user UUID
      const isUuid = token.length > 20 && token.includes("-");
      try {
        await sendFriendRequest({
          ...(isUuid ? { friendUserUuid: token } : { friendUsername: token }),
        }).unwrap();

        setSuccessText(`បានផ្ញើសំណើទៅ "${token}" រួចរាល់។ កំពុងរង់ចាំការយល់ព្រម។`);
        if (onSuccess) onSuccess(token);
        setTimeout(() => {
          setSuccessText(null);
          onClose();
        }, 2500);
      } catch (err: unknown) {
        const errMsg = getApiErrorMessage(
          err,
          `មិនអាចផ្ញើសំណើទៅ "${token}" បានទេ។ សូមពិនិត្យកូដម្តងទៀត។`,
        );
        setErrorText(errMsg);
      }
    },
    [onClose, onSuccess, scanQrCode, sendFriendRequest],
  );

  // Setup camera stream when modal opens in camera mode
  useEffect(() => {
    if (!isOpen || useManual) {
      return;
    }

    let stream: MediaStream | null = null;
    let isCancelled = false;
    let animationFrameId: number;

    const startCamera = async () => {
      try {
        setCameraError(null);
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });

        if (isCancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();

          // Native BarcodeDetector API (supported in Chromium/Android/Chrome)
          if ("BarcodeDetector" in window) {
            // @ts-expect-error Native BarcodeDetector API
            const barcodeDetector = new window.BarcodeDetector({
              formats: ["qr_code"],
            });

            const detectLoop = async () => {
              if (
                !isCancelled &&
                videoRef.current &&
                videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA
              ) {
                try {
                  const barcodes = await barcodeDetector.detect(videoRef.current);
                  if (barcodes.length > 0) {
                    const detected = barcodes[0].rawValue;
                    if (detected) {
                      handleProcessToken(detected);
                      return;
                    }
                  }
                } catch {
                  // ignore frame error
                }
              }
              if (!isCancelled) {
                animationFrameId = requestAnimationFrame(detectLoop);
              }
            };
            detectLoop();
          }
        }
      } catch (err) {
        console.warn("[QR Scanner] Camera access error:", err);
        setCameraError(
          "មិនអាចប្រើកាមេរ៉ានៅលើឧបករណ៍នេះ ឬការអនុញ្ញាតត្រូវបានបដិសេធ។ អ្នកអាចបង្ហោះរូប QR ឬបញ្ចូលកូដដោយដៃ។"
        );
      }
    };

    startCamera();

    return () => {
      isCancelled = true;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [handleProcessToken, isOpen, useManual]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput.trim()) {
      handleProcessToken(manualInput.trim());
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorText(null);

    // If BarcodeDetector is available, decode the image
    if ("BarcodeDetector" in window) {
      try {
        const imageBitmap = await createImageBitmap(file);
        // @ts-expect-error Native BarcodeDetector API
        const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
        const barcodes = await detector.detect(imageBitmap);
        if (barcodes.length > 0 && barcodes[0].rawValue) {
          handleProcessToken(barcodes[0].rawValue);
          return;
        } else {
          setErrorText("រកមិនឃើញ QR ត្រឹមត្រូវក្នុងរូបនេះទេ។ សូមសាកល្បងរូបផ្សេង ឬបញ្ចូលដោយដៃ។");
        }
      } catch (err) {
        console.error("Failed to decode QR image:", err);
        setErrorText("មិនអាចស្កេនរូប QR បានទេ។ សូមបញ្ចូលកូដ ឬឈ្មោះអ្នកប្រើដោយដៃ។");
      }
    } else {
      setUseManual(true);
      setErrorText("កម្មវិធីរុករកនេះមិនគាំទ្រការស្កេនរូបដោយផ្ទាល់ទេ។ សូមបញ្ចូលកូដ ឬឈ្មោះអ្នកប្រើខាងក្រោម។");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 sm:p-8">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
            <Scan className="h-6 w-6" />
          </div>
          <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white">
            ស្កេន QR មិត្តភក្តិ
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500 dark:text-slate-400">
            ដាក់កាមេរ៉ាទៅលើ QR របស់មិត្តភក្តិ ឬបង្ហោះរូប ដើម្បីភ្ជាប់គ្នា។
          </DialogDescription>
        </DialogHeader>

        {successText ? (
          <div className="my-8 flex flex-col items-center justify-center text-center">
            <CheckCircle2 className="h-16 w-16 text-emerald-500 animate-bounce" />
            <p className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
              {successText}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {!useManual && !cameraError ? (
              <div className="relative mx-auto flex h-64 w-full max-w-xs items-center justify-center overflow-hidden rounded-2xl bg-slate-950 shadow-inner">
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className="h-full w-full object-cover"
                />

                {/* Animated scanner overlay reticle */}
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6">
                  <div className="relative h-48 w-48 rounded-2xl border-2 border-emerald-400/80 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                    <div className="absolute -top-1 -left-1 h-5 w-5 border-t-4 border-l-4 border-emerald-400" />
                    <div className="absolute -top-1 -right-1 h-5 w-5 border-t-4 border-r-4 border-emerald-400" />
                    <div className="absolute -bottom-1 -left-1 h-5 w-5 border-b-4 border-l-4 border-emerald-400" />
                    <div className="absolute -bottom-1 -right-1 h-5 w-5 border-b-4 border-r-4 border-emerald-400" />
                    <div className="h-0.5 w-full bg-emerald-400/90 shadow-[0_0_8px_#34d399] animate-pulse" />
                  </div>
                </div>

                {isProcessing && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-xs">
                    <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleManualSubmit} className="space-y-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
                  <label
                    htmlFor="qrTokenInput"
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                  >
                    កូដ QR តំណ ឬឈ្មោះអ្នកប្រើ
                  </label>
                  <input
                    id="qrTokenInput"
                    type="text"
                    placeholder="បិទភ្ជាប់កូដ ឈ្មោះអ្នកប្រើ ឬតំណ"
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!manualInput.trim() || isProcessing}
                  className="w-full rounded-2xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-md transition hover:bg-emerald-700 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> កំពុងផ្ញើសំណើ...
                    </span>
                  ) : (
                    "ផ្ញើសំណើមិត្តភក្តិ"
                  )}
                </button>
              </form>
            )}

            {errorText && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-700 dark:bg-red-950/40 dark:text-red-300">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorText}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 pt-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <Upload className="h-4 w-4" /> បង្ហោះរូប QR
              </button>

              <button
                type="button"
                onClick={() => {
                  setUseManual(!useManual);
                  setErrorText(null);
                }}
                className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                {useManual ? (
                  <>
                    <Camera className="h-4 w-4" /> ស្កេនដោយកាមេរ៉ា
                  </>
                ) : (
                  <>
                    <Keyboard className="h-4 w-4" /> បញ្ចូលដោយដៃ
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
