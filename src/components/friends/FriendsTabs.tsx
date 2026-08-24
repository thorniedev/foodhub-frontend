"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  useGetFriendsQuery,
  useGetIncomingRequestsQuery,
  useGetOutgoingRequestsQuery,
  useSendFriendRequestMutation,
  useScanQrCodeMutation,
  useAcceptFriendRequestMutation,
  useRejectFriendRequestMutation,
} from "@/app/store/friendsApi";
import FriendCard from "./FriendCard";
import MyQrCodeModal from "./MyQrCodeModal";
import QrScannerModal from "./QrScannerModal";
import {
  Users,
  UserPlus,
  QrCode,
  Scan,
  Search,
  Check,
  X,
  Clock,
  Shield,
  Loader2,
  Inbox,
  Send,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

function FriendUrlParamsHandler({
  onToken,
  onUsername,
}: {
  onToken: (token: string) => void;
  onUsername: (username: string) => void;
}) {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!searchParams) return;
    const token = searchParams.get("token");
    const username = searchParams.get("username") || searchParams.get("add");

    if (token) {
      onToken(token);
    } else if (username) {
      onUsername(username);
    }
  }, [searchParams, onToken, onUsername]);

  return null;
}

export default function FriendsTabs() {
  const [activeTab, setActiveTab] = useState<"friends" | "pending" | "add">("friends");
  const [pendingSubTab, setPendingSubTab] = useState<"incoming" | "outgoing">("incoming");

  const [searchFriendTerm, setSearchFriendTerm] = useState("");
  const [filterFriendTerm, setFilterFriendTerm] = useState("");

  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const [sendSuccessMessage, setSendSuccessMessage] = useState<string | null>(null);
  const [sendErrorMessage, setSendErrorMessage] = useState<string | null>(null);

  // Queries
  const { data: friends = [], isLoading: isLoadingFriends } = useGetFriendsQuery();
  const { data: incoming = [], isLoading: isLoadingIncoming } = useGetIncomingRequestsQuery();
  const { data: outgoing = [], isLoading: isLoadingOutgoing } = useGetOutgoingRequestsQuery();

  // Mutations
  const [sendFriendRequest, { isLoading: isSendingRequest }] = useSendFriendRequestMutation();
  const [scanQrCode, { isLoading: isScanningQr }] = useScanQrCodeMutation();
  const [acceptFriendRequest, { isLoading: isAccepting }] = useAcceptFriendRequestMutation();
  const [rejectFriendRequest, { isLoading: isRejecting }] = useRejectFriendRequestMutation();

  const isSubmitting = isSendingRequest || isScanningQr;

  const handleUrlToken = useCallback(
    (token: string) => {
      setActiveTab("add");
      setSearchFriendTerm(token);
      void (async () => {
        try {
          await scanQrCode({ qrCodeToken: token }).unwrap();
          setSendSuccessMessage("Friend request sent successfully via scanned QR link!");
          setSearchFriendTerm("");
        } catch (err: any) {
          const msg = err?.data?.message || err?.message || "Could not process QR invitation.";
          setSendErrorMessage(msg);
        }
      })();
    },
    [scanQrCode],
  );

  const handleUrlUsername = useCallback((username: string) => {
    setActiveTab("add");
    setSearchFriendTerm(username);
  }, []);

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const raw = searchFriendTerm.trim();
    if (!raw) return;

    setSendSuccessMessage(null);
    setSendErrorMessage(null);

    let cleanTerm = raw;

    // Check if user pasted a link with token parameter
    if (cleanTerm.includes("token=")) {
      const match = cleanTerm.match(/token=([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        cleanTerm = match[1];
      }
    }

    // If it's a QR token, use scanQrCode mutation
    if (cleanTerm.startsWith("fh_qr_") || cleanTerm.includes("qr_")) {
      try {
        await scanQrCode({ qrCodeToken: cleanTerm }).unwrap();
        setSendSuccessMessage("Friend request sent successfully via QR token!");
        setSearchFriendTerm("");
        setTimeout(() => setSendSuccessMessage(null), 4000);
        return;
      } catch (err: any) {
        const msg = err?.data?.message || err?.message || "Invalid or expired QR token.";
        setSendErrorMessage(msg);
        return;
      }
    }

    // Strip leading '@' if user entered @username
    if (cleanTerm.startsWith("@")) {
      cleanTerm = cleanTerm.slice(1);
    }

    const isUuid = cleanTerm.length > 20 && cleanTerm.includes("-");

    try {
      await sendFriendRequest({
        ...(isUuid ? { receiverUuid: cleanTerm } : { receiverUsername: cleanTerm }),
      }).unwrap();

      setSendSuccessMessage(`Friend request sent to "${cleanTerm}"!`);
      setSearchFriendTerm("");
      setTimeout(() => setSendSuccessMessage(null), 4000);
    } catch (err: unknown) {
      const rawErr = err as any;
      const status = rawErr?.status || rawErr?.originalStatus;
      const serverMsg = rawErr?.data?.message || rawErr?.data?.error || rawErr?.message;

      let errMsg = `Could not send friend request to "${cleanTerm}". Please check username.`;
      if (serverMsg) {
        if (serverMsg.toLowerCase().includes("self") || serverMsg.toLowerCase().includes("same")) {
          errMsg = "You cannot send a friend request to yourself.";
        } else if (serverMsg.toLowerCase().includes("already") || serverMsg.toLowerCase().includes("exists") || status === 409) {
          errMsg = "A friend request or friendship already exists with this user.";
        } else if (serverMsg.toLowerCase().includes("not found") || status === 404) {
          errMsg = `User "${cleanTerm}" was not found. Please check spelling or scan their QR code.`;
        } else {
          errMsg = serverMsg;
        }
      }
      setSendErrorMessage(errMsg);
    }
  };

  const handleAccept = async (requestUuid: string) => {
    try {
      await acceptFriendRequest(requestUuid).unwrap();
    } catch (err) {
      console.error("Failed to accept friend request:", err);
    }
  };

  const handleReject = async (requestUuid: string) => {
    try {
      await rejectFriendRequest(requestUuid).unwrap();
    } catch (err) {
      console.error("Failed to reject friend request:", err);
    }
  };

  const filteredFriends = friends.filter((friend) =>
    friend.username.toLowerCase().includes(filterFriendTerm.toLowerCase()),
  );

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <Suspense fallback={null}>
        <FriendUrlParamsHandler
          onToken={handleUrlToken}
          onUsername={handleUrlUsername}
        />
      </Suspense>

      {/* Top Banner Actions: Search + QR Modals */}
      <div className="flex flex-col gap-4 rounded-3xl bg-linear-to-r from-emerald-800 to-teal-900 p-6 text-white shadow-xl sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div className="space-y-1">
          <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
            FoodHub Friends & Social
          </h2>
          <p className="text-sm text-emerald-100/90">
            Connect with friends, view dietary preferences, and plan group lunches effortlessly.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setIsQrModalOpen(true)}
            className="flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2.5 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20 active:scale-95"
          >
            <QrCode className="h-4 w-4" />
            My QR Code
          </button>

          <button
            type="button"
            onClick={() => setIsScannerOpen(true)}
            className="flex items-center gap-2 rounded-2xl bg-emerald-400 px-4 py-2.5 text-sm font-bold text-slate-950 shadow-md transition hover:bg-emerald-300 active:scale-95"
          >
            <Scan className="h-4 w-4" />
            Scan QR
          </button>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setActiveTab("friends")}
          className={`flex items-center gap-2.5 border-b-2 px-5 py-3.5 text-sm font-bold transition ${
            activeTab === "friends"
              ? "border-emerald-600 text-emerald-700 dark:border-emerald-400 dark:text-emerald-400"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Friends List</span>
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            {friends.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("pending")}
          className={`flex items-center gap-2.5 border-b-2 px-5 py-3.5 text-sm font-bold transition ${
            activeTab === "pending"
              ? "border-emerald-600 text-emerald-700 dark:border-emerald-400 dark:text-emerald-400"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          <Inbox className="h-4 w-4" />
          <span>Pending Requests</span>
          {incoming.length > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-xs font-extrabold text-white animate-pulse">
              {incoming.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("add")}
          className={`flex items-center gap-2.5 border-b-2 px-5 py-3.5 text-sm font-bold transition ${
            activeTab === "add"
              ? "border-emerald-600 text-emerald-700 dark:border-emerald-400 dark:text-emerald-400"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          <UserPlus className="h-4 w-4" />
          <span>Find Friends</span>
        </button>
      </div>

      {/* Tab 1: Friends List */}
      {activeTab === "friends" && (
        <div className="space-y-4">
          {/* Quick Search in existing friends */}
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search friends by name..."
              value={filterFriendTerm}
              onChange={(e) => setFilterFriendTerm(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            />
          </div>

          {isLoadingFriends ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
          ) : filteredFriends.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-800">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
                {filterFriendTerm ? "No matching friends found" : "No friends added yet"}
              </h3>
              <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
                {filterFriendTerm
                  ? "Try searching for a different username or add them by QR code."
                  : "Share your QR code or search by username to connect with your foodie squad!"}
              </p>
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsQrModalOpen(true)}
                  className="rounded-2xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-emerald-700"
                >
                  Share My QR
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("add")}
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200"
                >
                  Search Username
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredFriends.map((friend) => (
                <FriendCard key={friend.friendshipUuid} friend={friend} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Pending Requests */}
      {activeTab === "pending" && (
        <div className="space-y-6">
          {/* Sub-tabs: Incoming vs Outgoing */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPendingSubTab("incoming")}
              className={`rounded-2xl px-4 py-2 text-xs font-bold transition ${
                pendingSubTab === "incoming"
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              Incoming Requests ({incoming.length})
            </button>
            <button
              type="button"
              onClick={() => setPendingSubTab("outgoing")}
              className={`rounded-2xl px-4 py-2 text-xs font-bold transition ${
                pendingSubTab === "outgoing"
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              Outgoing Sent ({outgoing.length})
            </button>
          </div>

          {pendingSubTab === "incoming" ? (
            isLoadingIncoming ? (
              <div className="flex h-36 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
              </div>
            ) : incoming.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
                No pending incoming friend requests.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {incoming.map((req) => (
                  <div
                    key={req.requestUuid}
                    className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div>
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 font-bold text-white">
                          {req.senderUsername.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            @{req.senderUsername}
                          </h4>
                          <p className="text-xs text-slate-400">
                            Sent a friend request
                          </p>
                        </div>
                      </div>

                      {req.senderDefaultProfileName && (
                        <div className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          <Shield className="h-3 w-3" />
                          <span>{req.senderDefaultProfileName}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => handleAccept(req.requestUuid)}
                        disabled={isAccepting}
                        className="flex items-center justify-center gap-1.5 rounded-2xl bg-emerald-600 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-50"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Accept
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReject(req.requestUuid)}
                        disabled={isRejecting}
                        className="flex items-center justify-center gap-1.5 rounded-2xl border border-slate-200 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300"
                      >
                        <X className="h-3.5 w-3.5" />
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : isLoadingOutgoing ? (
            <div className="flex h-36 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
            </div>
          ) : outgoing.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
              No pending outgoing friend requests.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {outgoing.map((req) => (
                <div
                  key={req.requestUuid}
                  className="flex items-center justify-between rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-200 font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                      {req.receiverUsername.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        @{req.receiverUsername}
                      </h4>
                      <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                        <Clock className="h-3 w-3" />
                        <span>Awaiting Acceptance</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Search & Add Friends */}
      {activeTab === "add" && (
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <div className="max-w-xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Search and Add Friends
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Enter a FoodHub username or user UUID to send an instant invitation.
            </p>

            <form onSubmit={handleSendRequest} className="mt-6 flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Enter username (e.g. dara_foodie)..."
                  value={searchFriendTerm}
                  onChange={(e) => setSearchFriendTerm(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <button
                type="submit"
                disabled={!searchFriendTerm.trim() || isSendingRequest}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-emerald-700 disabled:opacity-50"
              >
                {isSendingRequest ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Send Request
              </button>
            </form>

            {sendSuccessMessage && (
              <div className="mt-4 flex items-center gap-2 rounded-2xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                <span>{sendSuccessMessage}</span>
              </div>
            )}

            {sendErrorMessage && (
              <div className="mt-4 flex items-center gap-2 rounded-2xl bg-rose-50 p-4 text-sm font-semibold text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
                <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
                <span>{sendErrorMessage}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <MyQrCodeModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
      />

      <QrScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
      />
    </div>
  );
}
