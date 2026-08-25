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
import { QrCode, RefreshCw, Share2, Check, User } from "lucide-react";

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
  const [refreshMessage, setRefreshMessage] = useState<string | null>(null);

  const origin =
    typeof window !== "undefined" && window.location.origin
      ? window.location.origin
      : "https://foodhub.app";

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
      setRefreshMessage("បានបង្កើត QR ថ្មីរួចរាល់។");
      setTimeout(() => setRefreshMessage(null), 3000);
    } catch {
      // refetch query if mutation fails
      refetch();
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `បន្ថែម ${displayName} នៅម្ហូបអាហារ`,
          text: `ស្កេន QR របស់ខ្ញុំ ឬចុចតំណ ដើម្បីភ្ជាប់ជាមួយ @${displayName}`,
          url: shareUrl,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
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
            ឱ្យមិត្តភក្តិស្កេនកូដនេះ ដើម្បីភ្ជាប់គ្នាបានភ្លាមៗ។
          </DialogDescription>
        </DialogHeader>

        <div className="my-6 flex flex-col items-center justify-center">
          <div className="relative flex items-center justify-center rounded-3xl border-4 border-emerald-500/20 bg-white p-6 shadow-lg dark:border-emerald-500/30">
            {isLoading ? (
              <div className="flex h-56 w-56 items-center justify-center">
                <RefreshCw className="h-8 w-8 animate-spin text-emerald-600" />
              </div>
            ) : (
              <div className="relative">
                <QRCodeSVG
                  value={qrValue}
                  size={220}
                  level="H"
                  includeMargin={false}
                  imageSettings={{
                    src: "/Image/foodHub-logo.png",
                    x: undefined,
                    y: undefined,
                    height: 42,
                    width: 42,
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
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? "animate-spin text-emerald-600" : ""}`}
            />
            បង្កើត QR ថ្មី
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-emerald-700 active:scale-95"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                បានចម្លង
              </>
            ) : (
              <>
                <Share2 className="h-4 w-4" />
                ចែករំលែក QR
              </>
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
