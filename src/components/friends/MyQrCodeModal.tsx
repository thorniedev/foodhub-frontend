"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useGetMyQrCodeQuery,
  useRefreshQrCodeMutation,
} from "@/app/store/friendsApi";
import { useGetCurrentUserQuery } from "@/app/store/auth/currentUserApi";
import { QrCode, RefreshCw, Download, Check, User, Copy } from "lucide-react";

interface MyQrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MyQrCodeModal({ isOpen, onClose }: MyQrCodeModalProps) {
  const { data: qrData, isLoading, refetch } = useGetMyQrCodeQuery(undefined, {
    skip: !isOpen,
  });
  const { data: user } = useGetCurrentUserQuery();
  const [refreshQrCode, { isLoading: isRefreshing }] = useRefreshQrCodeMutation();
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState<string | null>(null);

  const origin =
    typeof window !== "undefined" && window.location.origin
      ? window.location.origin
      : "https://www.mhoubahar.store";

  const shareUrl = qrData?.qrCodeToken
    ? `${origin}/friends?token=${encodeURIComponent(qrData.qrCodeToken)}`
    : `${origin}/friends`;
  const qrValue = qrData?.qrContent || shareUrl;

  const displayName =
    qrData?.username ||
    user?.username ||
    user?.firstName ||
    "មិត្តភក្តិ";

  const handleRefresh = async () => {
    try {
      await refreshQrCode().unwrap();
      setRefreshMessage("បានបង្កើត QR ថ្មីរួចរាល់ (QR ចាស់ត្រូវបានបិទចោល)។");
      setTimeout(() => setRefreshMessage(null), 3500);
    } catch {
      // refetch query if mutation fails
      refetch();
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const svgElement = document.getElementById("my-friend-qr-svg");
      if (!svgElement) {
        setIsDownloading(false);
        return;
      }

      // 1. Serialize SVG without the broken external image tag inside SVG
      const svgClone = svgElement.cloneNode(true) as SVGElement;
      // Remove any internal <image> tags from the clone to prevent serialization errors
      const imagesInSvg = svgClone.querySelectorAll("image");
      imagesInSvg.forEach((img) => img.remove());

      const svgData = new XMLSerializer().serializeToString(svgClone);

      // 2. Load SVG Image and Logo Image concurrently
      const loadSvgPromise = new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src =
          "data:image/svg+xml;base64," +
          btoa(unescape(encodeURIComponent(svgData)));
      });

      const loadLogoPromise = new Promise<HTMLImageElement>((resolve, reject) => {
        const logo = new Image();
        logo.crossOrigin = "anonymous";
        logo.onload = () => resolve(logo);
        logo.onerror = () => {
          // If brand image fails to load, resolve with empty image
          resolve(logo);
        };
        logo.src = "/auth/mhoubahar-brand.png";
      });

      const [qrImg, logoImg] = await Promise.all([
        loadSvgPromise,
        loadLogoPromise,
      ]);

      // 3. Setup High-DPI Canvas Card
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setIsDownloading(false);
        return;
      }

      const width = 800;
      const height = 1040;
      canvas.width = width;
      canvas.height = height;

      // Card Background (Clean White with Emerald accent)
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, width, height);

      // Outer rounded border
      ctx.strokeStyle = "#E2E8F0";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(20, 20, width - 40, height - 40, 40);
      ctx.stroke();

      // Top Emerald Accent Bar
      ctx.fillStyle = "#059669";
      ctx.beginPath();
      ctx.roundRect(300, 36, 200, 8, 4);
      ctx.fill();

      // Top Header text
      ctx.textAlign = "center";
      ctx.fillStyle = "#047857";
      ctx.font = "bold 24px 'Kantumruy Pro', -apple-system, sans-serif";
      ctx.fillText("ម្ហូបអាហារ • MHOUBAHAR", width / 2, 85);

      ctx.fillStyle = "#0F172A";
      ctx.font = "bold 32px 'Kantumruy Pro', -apple-system, sans-serif";
      ctx.fillText("QR មិត្តភក្តិរបស់ខ្ញុំ", width / 2, 130);

      // QR Code Container background
      const qrBoxX = 100;
      const qrBoxY = 160;
      const qrBoxSize = 600;

      ctx.fillStyle = "#F8FAFC";
      ctx.beginPath();
      ctx.roundRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 28);
      ctx.fill();
      ctx.strokeStyle = "#E2E8F0";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw QR Code
      const qrPadding = 20;
      ctx.drawImage(
        qrImg,
        qrBoxX + qrPadding,
        qrBoxY + qrPadding,
        qrBoxSize - qrPadding * 2,
        qrBoxSize - qrPadding * 2,
      );

      // Draw Center Logo Badge
      const centerBadgeSize = 130;
      const centerX = qrBoxX + qrBoxSize / 2;
      const centerY = qrBoxY + qrBoxSize / 2;

      ctx.fillStyle = "#FFFFFF";
      ctx.shadowColor = "rgba(0, 0, 0, 0.12)";
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.roundRect(
        centerX - centerBadgeSize / 2,
        centerY - centerBadgeSize / 2,
        centerBadgeSize,
        centerBadgeSize,
        24,
      );
      ctx.fill();
      ctx.shadowColor = "transparent";

      ctx.strokeStyle = "#D1FAE5";
      ctx.lineWidth = 3;
      ctx.stroke();

      // Draw Logo in center
      if (logoImg && logoImg.width > 0) {
        const logoDrawSize = 100;
        ctx.drawImage(
          logoImg,
          centerX - logoDrawSize / 2,
          centerY - logoDrawSize / 2,
          logoDrawSize,
          logoDrawSize,
        );
      }

      // Bottom Username Pill
      const pillY = 800;
      const pillHeight = 72;
      const pillWidth = 560;
      const pillX = (width - pillWidth) / 2;

      ctx.fillStyle = "#ECFDF5";
      ctx.beginPath();
      ctx.roundRect(pillX, pillY, pillWidth, pillHeight, 36);
      ctx.fill();

      ctx.strokeStyle = "#10B981";
      ctx.lineWidth = 2;
      ctx.stroke();

      // User text
      ctx.fillStyle = "#065F46";
      ctx.font = "bold 26px -apple-system, sans-serif";
      ctx.fillText(`@${displayName}`, width / 2, pillY + 45);

      // Subtitle
      ctx.fillStyle = "#64748B";
      ctx.font = "20px 'Kantumruy Pro', -apple-system, sans-serif";
      ctx.fillText(
        "ឱ្យមិត្តភក្តិស្កេនកូដនេះ ដើម្បីភ្ជាប់គ្នាបានភ្លាមៗ",
        width / 2,
        920,
      );

      ctx.fillStyle = "#94A3B8";
      ctx.font = "16px -apple-system, sans-serif";
      ctx.fillText("www.mhoubahar.store", width / 2, 960);

      // Trigger Download
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `mhoubahar-qr-${displayName}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();

      setIsDownloading(false);
    } catch (error) {
      console.error("Failed to download QR code:", error);
      setIsDownloading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 sm:p-8">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
            <QrCode className="h-6 w-6" />
          </div>
          <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white">
            QR មិត្តភក្តិរបស់ខ្ញុំ
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500 dark:text-slate-400">
            ឱ្យមិត្តភក្តិស្កេនកូដនេះ ដើម្បីភ្ជាប់គ្នាបានភ្លាមៗ (គ្មានពេលកំណត់)។
          </DialogDescription>
        </DialogHeader>

        <div className="my-5 flex flex-col items-center justify-center">
          <div className="relative flex items-center justify-center rounded-3xl border-4 border-emerald-500/20 bg-white p-4 shadow-xl dark:border-emerald-500/30 sm:p-6">
            {isLoading ? (
              <div className="flex h-72 w-72 items-center justify-center">
                <RefreshCw className="h-9 w-9 animate-spin text-emerald-600" />
              </div>
            ) : (
              <div className="relative overflow-hidden rounded-2xl bg-white p-2">
                <QRCodeSVG
                  id="my-friend-qr-svg"
                  value={qrValue}
                  size={280}
                  level="H"
                  includeMargin={true}
                  imageSettings={{
                    src: "/auth/mhoubahar-brand.png",
                    x: undefined,
                    y: undefined,
                    height: 52,
                    width: 52,
                    excavate: true,
                  }}
                />
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center gap-2 text-base font-semibold text-slate-800 dark:text-slate-200">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm">
              <User className="h-4 w-4" />
            </div>
            <span>@{displayName}</span>
          </div>

          {refreshMessage && (
            <p className="mt-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              {refreshMessage}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-emerald-600" />
                បានចម្លងតំណ
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                ចម្លងតំណ
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownload}
            disabled={isDownloading || isLoading}
            className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-emerald-700 active:scale-95 disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            {isDownloading ? "កំពុងទាញយក..." : "ទាញយក QR"}
          </button>
        </div>

        <div className="mt-3 text-center">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition"
          >
            <RefreshCw
              className={`h-3 w-3 ${isRefreshing ? "animate-spin text-emerald-600" : ""}`}
            />
            បង្កើត QR ថ្មីឡើងវិញ (បើសង្ស័យថាបែកធ្លាយ)
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
