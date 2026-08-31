"use client";

import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  Suspense,
  type FormEvent,
} from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  useGetFriendsQuery,
  useGetIncomingRequestsQuery,
  useGetOutgoingRequestsQuery,
  useSendFriendRequestMutation,
  useScanQrCodeMutation,
  useAcceptFriendRequestMutation,
  useRejectFriendRequestMutation,
} from "@/app/store/friendsApi";
import FriendCard, { FriendAvatar } from "./FriendCard";
import MyQrCodeModal from "./MyQrCodeModal";
import QrScannerModal from "./QrScannerModal";
import { parseFriendQrInput } from "@/lib/friends/qr-code";
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
  ArrowLeft,
  Utensils,
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

type ApiErrorLike = {
  status?: number;
  originalStatus?: number;
  data?: {
    message?: string;
    error?: string;
  };
  message?: string;
};

function getApiError(error: unknown): ApiErrorLike {
  return typeof error === "object" && error !== null
    ? (error as ApiErrorLike)
    : {};
}

function getApiErrorMessage(error: unknown, fallback: string): string {
  const apiError = getApiError(error);
  return apiError.data?.message || apiError.data?.error || apiError.message || fallback;
}

const FAVORITES_STORAGE_KEY = "foodhub_favorite_friend_uuids";

export default function FriendsTabs() {
  const [activeTab, setActiveTab] = useState<"friends" | "pending" | "add">(
    "friends",
  );
  const [pendingSubTab, setPendingSubTab] = useState<"incoming" | "outgoing">(
    "incoming",
  );

  const [searchFriendTerm, setSearchFriendTerm] = useState("");
  const [filterFriendTerm, setFilterFriendTerm] = useState("");

  // Selected friends for Group Dining invite
  const [selectedFriendUuids, setSelectedFriendUuids] = useState<string[]>([]);

  // Favorited friends with localStorage persistence
  const [favoriteUuids, setFavoriteUuids] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const [sendSuccessMessage, setSendSuccessMessage] = useState<string | null>(
    null,
  );
  const [sendErrorMessage, setSendErrorMessage] = useState<string | null>(null);

  // Queries
  const { data: friends = [], isLoading: isLoadingFriends } =
    useGetFriendsQuery();
  const { data: incoming = [], isLoading: isLoadingIncoming } =
    useGetIncomingRequestsQuery();
  const { data: outgoing = [], isLoading: isLoadingOutgoing } =
    useGetOutgoingRequestsQuery();

  // Mutations
  const [sendFriendRequest, { isLoading: isSendingRequest }] =
    useSendFriendRequestMutation();
  const [scanQrCode] = useScanQrCodeMutation();
  const [acceptFriendRequest, { isLoading: isAccepting }] =
    useAcceptFriendRequestMutation();
  const [rejectFriendRequest, { isLoading: isRejecting }] =
    useRejectFriendRequestMutation();

  const toggleFavorite = useCallback((uuid: string) => {
    setFavoriteUuids((prev) => {
      const next = new Set(prev);
      if (next.has(uuid)) {
        next.delete(uuid);
      } else {
        next.add(uuid);
      }
      try {
        localStorage.setItem(
          FAVORITES_STORAGE_KEY,
          JSON.stringify(Array.from(next)),
        );
      } catch (e) {
        console.error("Failed to save favorites to localStorage", e);
      }
      return next;
    });
  }, []);

  const toggleSelectFriend = useCallback((uuid: string) => {
    setSelectedFriendUuids((prev) =>
      prev.includes(uuid) ? prev.filter((id) => id !== uuid) : [...prev, uuid],
    );
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedFriendUuids([]);
  }, []);

  const handleUrlToken = useCallback(
    (token: string) => {
      setActiveTab("add");
      setSearchFriendTerm(token);
      void (async () => {
        try {
          await scanQrCode({ qrCodeToken: token }).unwrap();
          setSendSuccessMessage("បានផ្ញើសំណើមិត្តភក្តិតាមតំណ QR រួចរាល់។");
          setSearchFriendTerm("");
        } catch (err: unknown) {
          const msg = getApiErrorMessage(
            err,
            "មិនអាចដំណើរការការអញ្ជើញ QR បានទេ។",
          );
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

  const handleSendRequest = async (e: FormEvent) => {
    e.preventDefault();
    const raw = searchFriendTerm.trim();
    if (!raw) return;

    setSendSuccessMessage(null);
    setSendErrorMessage(null);

    const parsedInput = parseFriendQrInput(raw);
    if (!parsedInput) return;

    const cleanTerm = parsedInput.value;

    if (parsedInput.isQrToken) {
      try {
        await scanQrCode({ qrCodeToken: cleanTerm }).unwrap();
        setSendSuccessMessage("បានផ្ញើសំណើមិត្តភក្តិតាម QR រួចរាល់។");
        setSearchFriendTerm("");
        setTimeout(() => setSendSuccessMessage(null), 4000);
        return;
      } catch (err: unknown) {
        const msg = getApiErrorMessage(err, "QR មិនត្រឹមត្រូវ ឬផុតកំណត់។");
        setSendErrorMessage(msg);
        return;
      }
    }

    const isUuid = cleanTerm.length > 20 && cleanTerm.includes("-");

    try {
      await sendFriendRequest({
        ...(isUuid
          ? { friendUserUuid: cleanTerm }
          : { friendUsername: cleanTerm }),
      }).unwrap();

      setSendSuccessMessage(`បានផ្ញើសំណើទៅ "${cleanTerm}" រួចរាល់។`);
      setSearchFriendTerm("");
      setTimeout(() => setSendSuccessMessage(null), 6000);
    } catch (err: unknown) {
      const rawErr = getApiError(err);
      const status = rawErr?.status || rawErr?.originalStatus;
      const serverMsg =
        rawErr?.data?.message || rawErr?.data?.error || rawErr?.message;

      let errMsg = `មិនអាចផ្ញើសំណើទៅ "${cleanTerm}" បានទេ។ សូមពិនិត្យឈ្មោះអ្នកប្រើ។`;
      if (serverMsg) {
        if (
          serverMsg.toLowerCase().includes("self") ||
          serverMsg.toLowerCase().includes("same")
        ) {
          errMsg = "អ្នកមិនអាចផ្ញើសំណើទៅខ្លួនឯងបានទេ។";
        } else if (
          serverMsg.toLowerCase().includes("already") ||
          serverMsg.toLowerCase().includes("exists") ||
          status === 409
        ) {
          errMsg = "មានសំណើ ឬមិត្តភាពជាមួយអ្នកប្រើនេះរួចហើយ។";
        } else if (
          serverMsg.toLowerCase().includes("not found") ||
          status === 404
        ) {
          errMsg = `រកមិនឃើញអ្នកប្រើ "${cleanTerm}" ទេ។`;
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

  // Filtered friends list
  const filteredFriends = useMemo(() => {
    const term = filterFriendTerm.trim().toLowerCase();
    return friends.filter((friend) => {
      if (!term) return true;
      return (
        friend.username.toLowerCase().includes(term) ||
        (friend.defaultProfileName &&
          friend.defaultProfileName.toLowerCase().includes(term))
      );
    });
  }, [friends, filterFriendTerm]);

  // Alphabetically grouped friends for the Contact List view
  const groupedFriends = useMemo(() => {
    const groups: Record<string, typeof friends> = {};

    // Sort alphabetically
    const sorted = [...filteredFriends].sort((a, b) =>
      a.username.localeCompare(b.username, "km-KH", { sensitivity: "base" }),
    );

    sorted.forEach((friend) => {
      const char = (friend.username.charAt(0) || "#").toUpperCase();
      const letter = /[A-Z]/.test(char) ? char : char;
      if (!groups[letter]) {
        groups[letter] = [];
      }
      groups[letter].push(friend);
    });

    return groups;
  }, [filteredFriends]);

  const alphabetKeys = useMemo(
    () => Object.keys(groupedFriends).sort(),
    [groupedFriends],
  );

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 pb-24">
      <Suspense fallback={null}>
        <FriendUrlParamsHandler
          onToken={handleUrlToken}
          onUsername={handleUrlUsername}
        />
      </Suspense>

      {/* Header Area */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              title="ត្រឡប់ក្រោយ"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-[20px] font-black tracking-tight text-primary-800 dark:text-white sm:text-3xl">
              មិត្តភក្តិរបស់អ្នក
            </h1>
          </div>
          <p className="text-[17px] font-medium text-slate-500 dark:text-slate-400 pl-12">
            {friends.length} available • អាចណាត់ញ៉ាំអាហារជាក្រុមបាន
          </p>
        </div>

        {/* QR Actions Header */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsQrModalOpen(true)}
            className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <QrCode className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            <span className="text-[17px]">QR របស់ខ្ញុំ</span>
          </button>

          <button
            type="button"
            onClick={() => setIsScannerOpen(true)}
            className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-700 active:scale-95"
          >
            <Scan className="h-6 w-6" />
            <span className="text-[17px]">ស្កេន QR</span>
          </button>
        </div>
      </div>

      {/* Main Tabs Navigation (Mobile responsive with smooth scroll) */}
      <div className="flex border-b border-slate-200 overflow-x-auto no-scrollbar dark:border-slate-800">
        <button
          type="button"
          onClick={() => setActiveTab("friends")}
          className={`flex items-center justify-center gap-2 border-b-2 px-4 py-3 text-sm font-bold whitespace-nowrap transition shrink-0 sm:px-5 sm:py-3.5 sm:text-base md:text-lg ${
            activeTab === "friends"
              ? "border-emerald-600 text-emerald-700 dark:border-emerald-400 dark:text-emerald-400"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          <Users className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
          <span>បញ្ជីមិត្តភក្តិ</span>
          <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            {friends.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("pending")}
          className={`flex items-center justify-center gap-2 border-b-2 px-4 py-3 text-sm font-bold whitespace-nowrap transition shrink-0 sm:px-5 sm:py-3.5 sm:text-base md:text-lg ${
            activeTab === "pending"
              ? "border-emerald-600 text-emerald-700 dark:border-emerald-400 dark:text-emerald-400"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          <Inbox className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
          <span>សំណើកំពុងរង់ចាំ</span>
          {incoming.length > 0 && (
            <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-rose-500 px-1.5 text-xs font-extrabold text-white animate-pulse">
              {incoming.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("add")}
          className={`flex items-center justify-center gap-2 border-b-2 px-4 py-3 text-sm font-bold whitespace-nowrap transition shrink-0 sm:px-5 sm:py-3.5 sm:text-base md:text-lg ${
            activeTab === "add"
              ? "border-emerald-600 text-emerald-700 dark:border-emerald-400 dark:text-emerald-400"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          <UserPlus className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
          <span>ស្វែងរកមិត្តភក្តិ</span>
        </button>
      </div>

      {/* Pill Search Input */}
      {activeTab === "friends" && (
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="ស្វែងរកមិត្តភក្តិតាមឈ្មោះ..."
            value={filterFriendTerm}
            onChange={(e) => setFilterFriendTerm(e.target.value)}
            className="w-full rounded-full border border-slate-200/90 bg-white py-3.5 pl-12 pr-10 text-base font-medium text-slate-900 shadow-xs placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 sm:text-lg"
          />
          {filterFriendTerm && (
            <button
              type="button"
              onClick={() => setFilterFriendTerm("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {/* Tab Content: Friends List */}
      {activeTab === "friends" && (
        <div className="space-y-6">
          {/* Subheader Prompt */}
          <div className="flex items-center justify-between text-base font-semibold text-slate-500 dark:text-slate-400">
            <span>ជ្រើសរើសមិត្តភក្តិសម្រាប់ណាត់ញ៉ាំអាហារ:</span>
            {selectedFriendUuids.length > 0 && (
              <button
                type="button"
                onClick={clearSelection}
                className="text-base font-bold text-emerald-600 hover:underline dark:text-emerald-400"
              >
                សម្អាតការជ្រើសរើស ({selectedFriendUuids.length})
              </button>
            )}
          </div>

          {isLoadingFriends ? (
            <div className="flex h-48 flex-col items-center justify-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
              <p className="text-lg text-slate-400">កំពុងទាញយកបញ្ជីមិត្តភក្តិ...</p>
            </div>
          ) : alphabetKeys.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:p-16">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50">
                <Users className="h-10 w-10" />
              </div>
              <h3 className="mt-5 text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">
                {filterFriendTerm
                  ? "រកមិនឃើញមិត្តភក្តិ"
                  : "មិនទាន់មានមិត្តភក្តិនៅឡើយ"}
              </h3>
              <p className="mt-2 max-w-md text-base leading-relaxed text-slate-500 dark:text-slate-400 sm:text-lg">
                {filterFriendTerm
                  ? "សូមសាកល្បងស្វែងរកឈ្មោះផ្សេង។"
                  : "ស្កេន QR ឬផ្ញើសំណើដើម្បីភ្ជាប់ទំនាក់ទំនង។"}
              </p>
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsQrModalOpen(true)}
                  className="rounded-2xl bg-emerald-600 px-5 py-2.5 text-base font-bold text-white shadow-xs hover:bg-emerald-700"
                >
                  ចែករំលែក QR
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("add")}
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-base font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200"
                >
                  + បន្ថែមមិត្ត
                </button>
              </div>
            </div>
          ) : (
            /* Alphabetical Contact List Rows */
            <div className="space-y-6">
              {alphabetKeys.map((letter) => (
                <div key={letter} className="space-y-2">
                  {/* Letter Header Index */}
                  <div className="sticky top-16 z-10 flex items-center gap-2 bg-slate-50/90 py-1 text-base font-black text-slate-400 backdrop-blur-xs dark:bg-slate-950/90">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-200/80 text-sm font-black text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {letter}
                    </span>
                    <div className="h-px flex-1 bg-slate-200/80 dark:bg-slate-800" />
                  </div>

                  {/* Friend Items in this group */}
                  <div className="space-y-2.5">
                    {groupedFriends[letter].map((friend) => (
                      <FriendCard
                        key={friend.friendshipUuid}
                        friend={friend}
                        isSelected={selectedFriendUuids.includes(friend.userUuid)}
                        onToggleSelect={toggleSelectFriend}
                        isFavorite={favoriteUuids.has(friend.userUuid)}
                        onToggleFavorite={toggleFavorite}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Pending Requests */}
      {activeTab === "pending" && (
        <div className="space-y-6">
          {/* Sub-tabs: Incoming vs Outgoing */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPendingSubTab("incoming")}
              className={`rounded-2xl px-5 py-2.5 text-base font-bold transition sm:text-lg ${
                pendingSubTab === "incoming"
                  ? "bg-slate-900 text-white shadow-xs dark:bg-white dark:text-slate-900"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
              }`}
            >
              <span>សំណើចូល</span>
              <span className="ml-2 rounded-full bg-black/10 px-2 py-0.5 text-sm dark:bg-white/20">
                {incoming.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setPendingSubTab("outgoing")}
              className={`rounded-2xl px-5 py-2.5 text-base font-bold transition sm:text-lg ${
                pendingSubTab === "outgoing"
                  ? "bg-slate-900 text-white shadow-xs dark:bg-white dark:text-slate-900"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
              }`}
            >
              <span>សំណើបានផ្ញើ</span>
              <span className="ml-2 rounded-full bg-black/10 px-2 py-0.5 text-sm dark:bg-white/20">
                {outgoing.length}
              </span>
            </button>
          </div>

          {pendingSubTab === "incoming" ? (
            isLoadingIncoming ? (
              <div className="flex h-36 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
              </div>
            ) : incoming.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center text-lg text-slate-500 shadow-xs dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                មិនមានសំណើចូលកំពុងរង់ចាំទេ។
              </div>
            ) : (
              <div className="space-y-3.5">
                {incoming.map((req) => (
                  <div
                    key={req.requestUuid}
                    className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:p-5"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <FriendAvatar
                        username={req.senderUsername || "អ្នកប្រើ"}
                        avatarMediaKey={req.senderAvatarMediaKey}
                        avatarMediaUuid={req.senderAvatarMediaUuid}
                        avatarUrl={req.senderAvatarUrl}
                        size={44}
                      />
                      <div className="min-w-0 flex-1 space-y-1">
                        {req.senderDefaultProfileName && (
                          <div className="flex items-center">
                            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200/50 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/40">
                              <Shield className="h-3 w-3 shrink-0" />
                              <span className="truncate max-w-[150px] sm:max-w-[200px]">
                                {req.senderDefaultProfileName}
                              </span>
                            </span>
                          </div>
                        )}
                        <h4 className="truncate text-base font-bold text-slate-900 dark:text-white sm:text-lg">
                          @{req.senderUsername || "អ្នកប្រើ"}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => handleAccept(req.requestUuid)}
                        disabled={isAccepting}
                        className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-50 sm:rounded-2xl sm:px-5 sm:py-2.5 sm:text-base"
                      >
                        <Check className="h-4 w-4" />
                        យល់ព្រម
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReject(req.requestUuid)}
                        disabled={isRejecting}
                        className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 sm:rounded-2xl sm:px-5 sm:py-2.5 sm:text-base"
                      >
                        <X className="h-4 w-4" />
                        បដិសេធ
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : isLoadingOutgoing ? (
            <div className="flex h-36 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
          ) : outgoing.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center text-lg text-slate-500 shadow-xs dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
              មិនមានសំណើបានផ្ញើកំពុងរង់ចាំទេ។
            </div>
          ) : (
            <div className="space-y-3">
              {outgoing.map((req) => (
                <div
                  key={req.requestUuid}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <FriendAvatar
                      username={req.receiverUsername || "អ្នកប្រើ"}
                      avatarMediaKey={req.receiverAvatarMediaKey}
                      avatarMediaUuid={req.receiverAvatarMediaUuid}
                      avatarUrl={req.receiverAvatarUrl}
                      size={44}
                    />
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <h4 className="truncate text-base font-bold text-slate-900 dark:text-white sm:text-lg">
                        @{req.receiverUsername || "អ្នកប្រើ"}
                      </h4>
                      <div className="flex items-center gap-1.5 text-xs text-amber-600 whitespace-nowrap dark:text-amber-400 sm:text-sm">
                        <Clock className="h-3.5 w-3.5 shrink-0" />
                        <span>កំពុងរង់ចាំការយល់ព្រម</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Add Friends */}
      {activeTab === "add" && (
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <div className="max-w-xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              ស្វែងរក និងបន្ថែមមិត្តភក្តិ
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              បញ្ចូលឈ្មោះអ្នកប្រើ ឬលេខសម្គាល់ ដើម្បីផ្ញើការអញ្ជើញ។
            </p>

            <form
              onSubmit={handleSendRequest}
              className="mt-6 flex flex-col gap-3 sm:flex-row"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="បញ្ចូលឈ្មោះអ្នកប្រើ..."
                  value={searchFriendTerm}
                  onChange={(e) => setSearchFriendTerm(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <button
                type="submit"
                disabled={!searchFriendTerm.trim() || isSendingRequest}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3.5 text-base font-bold text-white shadow-md transition hover:bg-emerald-700 disabled:opacity-50 sm:text-lg"
              >
                {isSendingRequest ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
                ផ្ញើសំណើ
              </button>
            </form>

            {sendSuccessMessage && (
              <div className="mt-5 flex flex-col justify-between gap-3 rounded-2xl bg-emerald-50 p-4 text-base font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 sm:flex-row sm:items-center sm:text-lg">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                  <span>{sendSuccessMessage}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("pending");
                    setPendingSubTab("outgoing");
                  }}
                  className="inline-flex shrink-0 items-center justify-center rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-xs transition hover:bg-emerald-700"
                >
                  មើលសំណើបានផ្ញើ ({outgoing.length})
                </button>
              </div>
            )}

            {sendErrorMessage && (
              <div className="mt-5 flex items-center gap-2.5 rounded-2xl bg-rose-50 p-4 text-base font-semibold text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 sm:text-lg">
                <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
                <span>{sendErrorMessage}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Bottom Action Pill ("ណាត់ញ៉ាំអាហារជាក្រុម (3)") */}
      {selectedFriendUuids.length > 0 && (
        <div className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3">
          <Link
            href={`/meetup/create?friendUuids=${selectedFriendUuids.map(encodeURIComponent).join(",")}`}
            className="flex items-center gap-3 rounded-full bg-linear-to-r from-emerald-600 to-teal-600 px-8 py-4 text-base font-black text-white shadow-2xl shadow-emerald-900/30 transition-all hover:scale-105 active:scale-95 sm:text-lg"
          >
            <Utensils className="h-5 w-5" />
            <span>ណាត់ញ៉ាំអាហារជាក្រុម ({selectedFriendUuids.length})</span>
          </Link>
          <button
            type="button"
            onClick={clearSelection}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900/80 text-white shadow-lg backdrop-blur-md transition hover:bg-slate-900"
            title="បោះបង់ការជ្រើសរើស"
          >
            <X className="h-5 w-5" />
          </button>
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

