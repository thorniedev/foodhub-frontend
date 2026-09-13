"use client";

import { useEffect, useState } from "react";
import { FaTelegram } from "react-icons/fa6";
import {
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Loader2,
  QrCode,
  Sparkles,
  Unlink,
  X,
  BellRing,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

import {
  useGetTelegramStatusQuery,
  useCreateTelegramLinkTokenMutation,
  useRevokeTelegramLinkMutation,
  useSendTelegramTestAlertMutation,
} from "@/app/store/notificationApi";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface TelegramConnectBannerProps {
  className?: string;
  compact?: boolean;
}

export default function TelegramConnectBanner({
  className = "",
  compact = false,
}: TelegramConnectBannerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRevokeConfirmOpen, setIsRevokeConfirmOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedCommand, setCopiedCommand] = useState(false);
  const [justConnected, setJustConnected] = useState(false);
  const [testAlertSent, setTestAlertSent] = useState(false);
  const [testAlertError, setTestAlertError] = useState(false);

  // Poll status while the connect modal is open
  const {
    data: status,
    isLoading: isLoadingStatus,
    refetch: refetchStatus,
  } = useGetTelegramStatusQuery(undefined, {
    pollingInterval: isModalOpen ? 2500 : 0,
  });

  const [createToken, { data: tokenData, isLoading: isCreatingToken }] =
    useCreateTelegramLinkTokenMutation();

  const [revokeLink, { isLoading: isRevoking }] = useRevokeTelegramLinkMutation();
  const [sendTestAlert, { isLoading: isSendingTest }] = useSendTelegramTestAlertMutation();

  const isLinked = Boolean(status?.linked && status?.status === "ACTIVE");

  // Handle successful linking while modal is open
  useEffect(() => {
    if (isModalOpen && isLinked) {
      setJustConnected(true);
      const timer = setTimeout(() => {
        setIsModalOpen(false);
        setJustConnected(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isModalOpen, isLinked]);

  const handleOpenConnect = async () => {
    try {
      await createToken().unwrap();
      setIsModalOpen(true);
    } catch (err) {
      console.error("Failed to generate telegram token", err);
    }
  };

  const handleCopyLink = () => {
    if (!tokenData?.botUrl) return;
    navigator.clipboard.writeText(tokenData.botUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCommand = () => {
    if (!tokenData?.linkToken) return;
    navigator.clipboard.writeText(`/start ${tokenData.linkToken}`);
    setCopiedCommand(true);
    setTimeout(() => setCopiedCommand(false), 2000);
  };

  const handleRevoke = async () => {
    try {
      await revokeLink().unwrap();
      setIsRevokeConfirmOpen(false);
      await refetchStatus();
    } catch (err) {
      console.error("Failed to revoke telegram link", err);
    }
  };

  const handleTestAlert = async () => {
    setTestAlertError(false);
    setTestAlertSent(false);
    try {
      await sendTestAlert().unwrap();
      setTestAlertSent(true);
      setTimeout(() => setTestAlertSent(false), 3000);
    } catch (err) {
      console.error("Failed to send test alert", err);
      setTestAlertError(true);
      setTimeout(() => setTestAlertError(false), 3000);
    }
  };

  if (isLoadingStatus) {
    return (
      <div
        className={`flex items-center justify-center p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 animate-pulse ${className}`}
      >
        <div className="flex items-center gap-3 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
          <span className="text-sm font-medium">កំពុងផ្ទុកព័ត៌មាន Telegram...</span>
        </div>
      </div>
    );
  }

  // If already linked
  if (isLinked) {
    return (
      <>
        <div
          className={`relative overflow-hidden rounded-2xl border border-emerald-200/80 bg-gradient-to-r from-emerald-50 via-teal-50/40 to-emerald-50/20 p-5 shadow-xs transition-all dark:border-emerald-900/50 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-emerald-950/10 ${className}`}
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3.5 min-w-0 flex-1">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
                <FaTelegram className="h-6 w-6" />
              </div>
              <div className="space-y-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    បានភ្ជាប់ជាមួយ Telegram រួចរាល់
                  </h4>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                    <Check className="h-3 w-3" />
                    សកម្ម (Active)
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 sm:text-sm">
                  អ្នកនឹងទទួលបានការជូនដំណឹងពី FoodHub (ការរំលឹកអាហារ និង ការអញ្ជើញ) តាមរយៈ bot{" "}
                  {/* <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                    @foodhub_cambodia_bot
                  </span> */}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
              {/* Test Alert button */}
              <button
                type="button"
                onClick={() => void handleTestAlert()}
                disabled={isSendingTest}
                title="ផ្ញើការជូនដំណឹងសាកល្បងទៅ Telegram"
                className={`inline-flex h-9 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border px-3.5 text-xs font-semibold shadow-xs transition-all duration-150 active:scale-[0.98] disabled:cursor-wait disabled:opacity-60 ${
                  testAlertSent
                    ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                    : testAlertError
                    ? "border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300"
                    : "border-slate-200/90 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                }`}
              >
                {isSendingTest ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-600 dark:text-slate-300" />
                ) : testAlertSent ? (
                  <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <BellRing className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                )}
                <span>{testAlertSent ? "បានផ្ញើ!" : testAlertError ? "បរាជ័យ" : "សាកល្បង"}</span>
              </button>

              {/* Open Bot button */}
              <a
                href="https://t.me/foodhub_cambodia_bot"
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border border-emerald-300/90 bg-white px-3.5 text-xs font-semibold text-emerald-700 shadow-xs transition-all duration-150 hover:border-emerald-400 hover:bg-emerald-50/80 hover:text-emerald-800 active:scale-[0.98] dark:border-emerald-800 dark:bg-slate-900 dark:text-emerald-300 dark:hover:bg-slate-800"
              >
                <ExternalLink className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>បើក Bot</span>
              </a>

              {/* Revoke button */}
              <button
                type="button"
                onClick={() => setIsRevokeConfirmOpen(true)}
                className="inline-flex h-9 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border border-rose-200/90 bg-white px-3.5 text-xs font-semibold text-rose-600 shadow-xs transition-all duration-150 hover:border-rose-300 hover:bg-rose-50/80 hover:text-rose-700 active:scale-[0.98] dark:border-rose-900/50 dark:bg-slate-900 dark:text-rose-400 dark:hover:bg-slate-800"
              >
                <Unlink className="h-3.5 w-3.5 text-rose-500 dark:text-rose-400" />
                <span>ផ្តាច់ការភ្ជាប់</span>
              </button>
            </div>
          </div>
        </div>

        {/* Confirmation Modal for Revoking */}
        <Dialog open={isRevokeConfirmOpen} onOpenChange={setIsRevokeConfirmOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
                តើអ្នកពិតជាចង់ផ្តាច់ការភ្ជាប់ Telegram មែនទេ?
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-600 dark:text-slate-300">
                បន្ទាប់ពីផ្តាច់ អ្នកនឹងលែងទទួលបានការរំលឹកអាហារ និងដំណឹងបន្ទាន់ៗតាមរយៈ Telegram ទៀតហើយ។
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsRevokeConfirmOpen(false)}
                disabled={isRevoking}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                បោះបង់
              </button>
              <button
                type="button"
                onClick={handleRevoke}
                disabled={isRevoking}
                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-rose-700 disabled:opacity-50"
              >
                {isRevoking ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                ផ្តាច់ការភ្ជាប់
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // If not linked yet
  return (
    <>
      <div
        className={`group relative overflow-hidden rounded-2xl border border-sky-200/80 bg-gradient-to-br from-white via-sky-50/40 to-blue-50/30 p-5 shadow-xs transition-all hover:shadow-md dark:border-sky-900/40 dark:from-slate-900 dark:via-sky-950/20 dark:to-blue-950/20 ${
          compact ? "p-4" : "p-5 sm:p-6"
        } ${className}`}
      >
        {/* Glow effect */}
        <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-sky-400/10 blur-2xl transition-all group-hover:bg-sky-400/20 dark:bg-sky-500/10" />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#0088cc] text-white shadow-lg shadow-[#0088cc]/25 transition-transform group-hover:scale-105">
              <FaTelegram className="h-7 w-7" />
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white sm:text-lg">
                  ភ្ជាប់ Telegram ដើម្បីទទួលការរំលឹកអាហារ
                </h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-semibold text-sky-800 dark:bg-sky-900/60 dark:text-sky-300">
                  <Sparkles className="h-3 w-3" />
                  រហ័ស & ឥតគិតថ្លៃ
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 sm:text-sm">
                កុំឱ្យរំលងម៉ោងបាយឆ្ងាញ់ៗ! ទទួលការរំលឹកអាហារប្រចាំថ្ងៃ ការអញ្ជើញញ៉ាំបាយជាមួយមិត្តភក្តិ និងប្រូម៉ូសិនពី{" "}
                <strong className="text-sky-700 dark:text-sky-400 font-semibold">
                  @foodhub_cambodia_bot
                </strong>{" "}
                ផ្ទាល់លើទូរស័ព្ទរបស់អ្នក។
              </p>

              {!compact && (
                <div className="flex flex-wrap gap-2 pt-1 text-xs text-slate-500 dark:text-slate-400">
                  <span className="inline-flex items-center gap-1 rounded-md bg-white/80 px-2 py-1 shadow-2xs dark:bg-slate-800/80">
                    🍜 រំលឹកម៉ោងបាយ
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md bg-white/80 px-2 py-1 shadow-2xs dark:bg-slate-800/80">
                    👥 ការអញ្ជើញជួបជុំក្រុម
                  </span>
                  {/* <span className="inline-flex items-center gap-1 rounded-md bg-white/80 px-2 py-1 shadow-2xs dark:bg-slate-800/80">
                    🎁 ប្រូម៉ូសិនពិសេស
                  </span> */}
                </div>
              )}
            </div>
          </div>

          <div className="shrink-0 self-start sm:self-center">
            <button
              type="button"
              onClick={handleOpenConnect}
              disabled={isCreatingToken}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0088cc] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#0088cc]/25 transition-all hover:bg-[#0077b5] active:scale-98 disabled:opacity-60"
            >
              {isCreatingToken ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FaTelegram className="h-4 w-4" />
              )}
              ភ្ជាប់ Telegram ឥឡូវនេះ
            </button>
          </div>
        </div>
      </div>

      {/* Connect QR Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-[#0088cc] dark:bg-sky-950/40">
              <FaTelegram className="h-8 w-8" />
            </div>
            <DialogTitle className="text-center text-xl font-bold text-slate-900 dark:text-white">
              {justConnected ? "ភ្ជាប់បានជោគជ័យ! 🎉" : "ភ្ជាប់ជាមួយ FoodHub Bot"}
            </DialogTitle>
            <DialogDescription className="text-center text-sm text-slate-600 dark:text-slate-300">
              {justConnected
                ? "គណនីរបស់អ្នកត្រូវបានភ្ជាប់ដោយជោគជ័យ។ អ្នកនឹងទទួលបានការជូនដំណឹងចាប់ពីពេលនេះតទៅ!"
                : "ស្កេន QR Code ឬចុចប៊ូតុងខាងក្រោមដើម្បីភ្ជាប់ Telegram ផ្ទាល់ខ្លួន"}
            </DialogDescription>
          </DialogHeader>

          {justConnected ? (
            <div className="my-6 flex flex-col items-center justify-center gap-3 py-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                <CheckCircle2 className="h-10 w-10 animate-bounce" />
              </div>
              <p className="font-semibold text-emerald-700 dark:text-emerald-300">
                បានភ្ជាប់រួចរាល់ហើយ!
              </p>
            </div>
          ) : tokenData?.botUrl ? (
            <div className="my-2 space-y-4">
              {/* QR Code Container */}
              <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-white p-4 shadow-inner dark:border-slate-800 dark:bg-slate-950">
                <div className="rounded-xl bg-white p-2.5 shadow-xs">
                  <QRCodeSVG
                    value={tokenData.botUrl}
                    size={180}
                    level="M"
                    includeMargin={false}
                  />
                </div>
                <span className="mt-2.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                  ស្កេនជាមួយកាមេរ៉ាទូរស័ព្ទដើម្បីបើក Telegram
                </span>
              </div>

              {/* Steps guide */}
              <div className="rounded-xl bg-slate-50 p-3.5 text-xs text-slate-600 dark:bg-slate-800/60 dark:text-slate-300 space-y-1.5">
                <div className="flex items-start gap-2">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-sky-600 text-[10px] font-bold text-white">
                    1
                  </span>
                  <span>
                    ស្កេន QR Code ឬចុចបើកកម្មវិធី Telegram
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-sky-600 text-[10px] font-bold text-white">
                    2
                  </span>
                  <span>
                    ចុចពាក្យ <strong>&quot;START&quot;</strong> នៅក្នុង Telegram Bot
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-sky-600 text-[10px] font-bold text-white">
                    3
                  </span>
                  <span>ប្រព័ន្ធនឹងភ្ជាប់គណនីរបស់អ្នកដោយស្វ័យប្រវត្តិ!</span>
                </div>
              </div>

              {/* Manual Command if Bot was already opened before */}
              {tokenData?.linkToken && (
                <div className="rounded-xl border border-sky-100 bg-sky-50/60 p-3 text-xs dark:border-sky-900/50 dark:bg-sky-950/30">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        បើធ្លាប់បើក Bot រួចហើយ សូមផ្ញើសារនេះទៅកាន់ Bot៖
                      </p>
                      <code className="mt-1 block truncate rounded-md bg-white px-2 py-1 font-mono text-xs font-bold text-sky-700 shadow-2xs dark:bg-slate-900 dark:text-sky-300">
                        /start {tokenData.linkToken}
                      </code>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyCommand}
                      className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-sky-600 px-2.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-sky-700 active:scale-95"
                    >
                      {copiedCommand ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          <span>ចម្លងរួច</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>ចម្លងកូដ</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Waiting status indicator */}
              <div className="flex items-center justify-center gap-2 rounded-xl bg-sky-50 py-2 text-xs font-medium text-sky-700 dark:bg-sky-950/40 dark:text-sky-300">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-sky-600" />
                កំពុងរង់ចាំការចុច START ពី Telegram...
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 pt-1 sm:flex-row">
                <a
                  href={tokenData.botUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#0088cc] px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition-all hover:bg-[#0077b5]"
                >
                  <FaTelegram className="h-4 w-4" />
                  បើកកម្មវិធី Telegram
                </a>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-600" />
                      ចម្លងរួចរាល់!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      ចម្លងតំណភ្ជាប់
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
