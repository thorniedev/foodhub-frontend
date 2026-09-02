"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Camera,
  Check,
  ChevronDown,
  Loader2,
  LogOut,
  Mail,
  Pencil,
  RefreshCw,
  Settings,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import {
  useGetCurrentUserQuery,
  useUpdateCurrentUserMutation,
} from "@/app/store/auth/currentUserApi";

import {
  useGetMemberProfilesQuery,
  useGetMediaAccessUrlQuery,
  useUploadMediaMutation,
  useUpdateMemberProfileMutation,
} from "@/app/store/memberProfileApi";

import type { MemberProfile } from "@/types/member-profile/member-profile";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";
import { LuLayoutDashboard } from "react-icons/lu";

interface DashboardUserProfileProps {
  avatarUrl?: string | null;
  showEmail?: boolean;
  alwaysShowText?: boolean;
}

interface ProfileFormState {
  firstName: string;
  lastName: string;
}

function getErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null && "data" in error) {
    const data = error.data;

    if (
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof data.message === "string"
    ) {
      return data.message;
    }
  }

  return "Could not update your profile.";
}

function formatDate(value?: string | null): string {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default function DashboardUserProfile({
  avatarUrl,
  showEmail = false,
  alwaysShowText = false,
}: DashboardUserProfileProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [form, setForm] = useState<ProfileFormState>({
    firstName: "",
    lastName: "",
  });

  const {
    data: user,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetCurrentUserQuery();
  console.log("current user data ,", user);
  const [updateCurrentUser, { isLoading: isUpdating }] =
    useUpdateCurrentUserMutation();

  /* Upload & update avatar */
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [uploadMedia, { isLoading: isUploadingAvatar }] =
    useUploadMediaMutation();
  const [updateMemberProfile, { isLoading: isUpdatingProfile }] =
    useUpdateMemberProfileMutation();

  /* Fetch default profile to get its avatarMediaUuid */
  const { data: profilesData, refetch: refetchProfiles } =
    useGetMemberProfilesQuery();
  const defaultProfile = useMemo<MemberProfile | undefined>(
    () => profilesData?.contents?.find((p) => p.isDefault),
    [profilesData],
  );

  /* Resolve avatar CDN URL from the default profile's avatarMediaUuid */
  const { data: avatarAccessUrlData } = useGetMediaAccessUrlQuery(
    defaultProfile?.avatarMediaUuid ?? "",
    { skip: !defaultProfile?.avatarMediaUuid },
  );

  /* Use fetched CDN URL, falling back to the avatarUrl prop */
  const resolvedAvatarUrl =
    avatarPreviewUrl || avatarAccessUrlData?.url || avatarUrl || null;

  const handleAvatarChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("សូមជ្រើសរើសរូបភាព JPG, PNG ឬ WebP");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("ទំហំរូបភាពមិនត្រូវលើសពី 5 MB ទេ");
      return;
    }

    setErrorMessage("");
    const objectUrl = URL.createObjectURL(file);
    setAvatarPreviewUrl(objectUrl);

    try {
      const mediaResult = await uploadMedia({
        file,
        purpose: "PROFILE_AVATAR",
      }).unwrap();

      if (defaultProfile?.uuid) {
        await updateMemberProfile({
          uuid: defaultProfile.uuid,
          body: { avatarMediaUuid: mediaResult.uuid },
        }).unwrap();
      }

      setSuccessMessage("បានផ្លាស់ប្ដូររូបតំណាងដោយជោគជ័យ។");
      void refetchProfiles();
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err: unknown) {
      URL.revokeObjectURL(objectUrl);
      setAvatarPreviewUrl(null);
      const msg =
        err && typeof err === "object" && "data" in err
          ? ((err as { data?: { message?: string } }).data?.message ??
            "មិនអាចផ្លាស់ប្ដូររូបតំណាងបានទេ")
          : "មិនអាចផ្លាស់ប្ដូររូបតំណាងបានទេ";
      setErrorMessage(msg);
    }
  };

  useEffect(() => {
    if (!user) {
      return;
    }

    setForm({
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
    });
  }, [user]);

  const userName = useMemo(() => {
    if (!user) {
      return "FoodHub User";
    }

    const fullName = [user.firstName, user.lastName]
      .filter((value): value is string => Boolean(value?.trim()))
      .join(" ")
      .trim();

    return fullName || user.username || user.primaryEmail || "FoodHub User";
  }, [user]);

  const avatarInitial = useMemo(() => {
    if (!user) {
      return "U";
    }

    const initialSource =
      user.firstName ||
      user.lastName ||
      user.username ||
      user.primaryEmail ||
      "U";

    return initialSource.trim().charAt(0).toUpperCase();
  }, [user]);

  const handleViewDetails = () => {
    setIsMenuOpen(false);
    setIsDetailsOpen(true);
    setIsEditing(false);
    setSuccessMessage("");
    setErrorMessage("");
  };

  const handleLogout = () => {
    setIsMenuOpen(false);
    window.location.assign("/api/auth/logout");
  };

  const handleCancelEditing = () => {
    setForm({
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
    });

    setIsEditing(false);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleSave = async () => {
    const firstName = form.firstName.trim();
    const lastName = form.lastName.trim();

    if (!firstName) {
      setErrorMessage("First name is required.");
      return;
    }

    if (!lastName) {
      setErrorMessage("Last name is required.");
      return;
    }

    try {
      await updateCurrentUser({
        firstName,
        lastName,
      }).unwrap();

      setIsEditing(false);
      setErrorMessage("");
      setSuccessMessage("Your profile was updated successfully.");
    } catch (error) {
      setSuccessMessage("");
      setErrorMessage(getErrorMessage(error));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-10 w-10 animate-pulse rounded-full bg-slate-200" />

        <div
          className={`space-y-1 ${
            alwaysShowText ? "block" : "hidden sm:block"
          }`}
        >
          <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />

          {showEmail && (
            <div className="h-4 w-32 animate-pulse rounded bg-slate-100" />
          )}
        </div>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <button
        type="button"
        onClick={() => refetch()}
        className="flex items-center gap-2 rounded-xl px-2 py-1.5 text-red-600 transition hover:bg-red-50"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
          <RefreshCw className="h-5 w-5" />
        </div>

        <span
          className={`text-base font-medium ${
            alwaysShowText ? "block" : "hidden sm:block"
          }`}
        >
          Retry profile
        </span>
      </button>
    );
  }

  return (
    <>
      <Popover open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <PopoverTrigger
          type="button"
          aria-label="Open user menu"
          aria-expanded={isMenuOpen}
          className="group flex max-w-64 items-center gap-1 rounded-xl px-2 py-1.5 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#136C34]/30 dark:hover:bg-slate-800"
        >
          <div className="relative shrink-0">
            {resolvedAvatarUrl ? (
              <Image
                src={resolvedAvatarUrl}
                alt={userName}
                width={40}
                height={40}
                className="h-10 w-10 rounded-full border border-slate-200 object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E36914] text-base font-bold text-white shadow-sm">
                {avatarInitial}
              </div>
            )}

            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-900" />
          </div>

          <div
            className={`min-w-0 flex-1 text-left ${
              alwaysShowText ? "block" : "hidden sm:block"
            }`}
          >
            {/* <p className="truncate text-base font-semibold text-slate-700 group-hover:text-[#136C34] dark:text-slate-200">
              {userName}
            </p> */}

            {showEmail && (
              <p className="truncate text-base text-slate-500">
                {user.primaryEmail}
              </p>
            )}
          </div>

          <ChevronDown
            className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${
              isMenuOpen ? "rotate-180" : ""
            } ${alwaysShowText ? "block" : "hidden sm:block"}`}
          />
        </PopoverTrigger>

        <PopoverContent
          align="end"
          sideOffset={10}
          className="w-72 rounded-2xl border border-slate-200 p-2 shadow-xl dark:border-slate-800"
        >
          <div className="flex items-center gap-3 border-b border-slate-100 p-3 dark:border-slate-800">
            {resolvedAvatarUrl ? (
              <Image
                src={resolvedAvatarUrl}
                alt={userName}
                width={48}
                height={48}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#E36914] text-lg font-bold text-white">
                {avatarInitial}
              </div>
            )}

            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-slate-900 dark:text-white">
                {userName}
              </p>

              <p className="truncate text-base text-slate-500">
                {user.primaryEmail}
              </p>
            </div>
          </div>

          <div className="mt-2 space-y-1">
            <button
              type="button"
              onClick={handleViewDetails}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-base font-medium text-slate-700 transition hover:bg-emerald-50 hover:text-[#136C34] dark:text-slate-200 dark:hover:bg-emerald-950/40"
            >
              <UserRound className="h-5 w-5" />

              <span className="flex-1"> គណនី</span>
            </button>
            <Link
              href="/dashboard"
              onClick={() => setIsMenuOpen(false)}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-base font-medium text-slate-700 transition hover:bg-emerald-50 hover:text-[#136C34] dark:text-slate-200 dark:hover:bg-emerald-950/40"
            >
              <LuLayoutDashboard className="h-5 w-5" />
              <span className="flex-1">ផ្ទាំងគ្រប់គ្រង</span>
            </Link>
            <Link
              href="/dashboard/settings"
              onClick={() => setIsMenuOpen(false)}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-base font-medium text-slate-700 transition hover:bg-emerald-50 hover:text-[#136C34] dark:text-slate-200 dark:hover:bg-emerald-950/40"
            >
              <Settings className="h-5 w-5" />
              <span className="flex-1">ការកំណត់</span>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-base font-medium text-red-600 transition hover:bg-red-50 dark:hover:bg-red-950/40"
            >
              <LogOut className="h-5 w-5" />

              <span className="flex-1">ចាកចេញ</span>
            </button>
          </div>
        </PopoverContent>
      </Popover>

      <Dialog
        open={isDetailsOpen}
        onOpenChange={(open) => {
          setIsDetailsOpen(open);

          if (!open) {
            setIsEditing(false);
            setErrorMessage("");
            setSuccessMessage("");
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          {/* <DialogHeader>
            <DialogTitle className="">My profile</DialogTitle>

            <DialogDescription className="text-base">
              View and update your FoodHub account.
            </DialogDescription>
          </DialogHeader> */}
          <div>
            <p className="text-2xl font-bold">My profile</p>
          </div>
          <div className="space-y-6">
            <div className="flex items-center gap-4 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => void handleAvatarChange(e)}
                disabled={isUploadingAvatar || isUpdatingProfile}
              />

              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={isUploadingAvatar || isUpdatingProfile}
                title="ផ្លាស់ប្ដូររូបតំណាង (ចុចដើម្បីផ្ទុករូបភាពថ្មី)"
                aria-label="ផ្លាស់ប្ដូររូបតំណាង"
                className="group relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl ring-2 ring-emerald-500/20 transition hover:ring-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {resolvedAvatarUrl ? (
                  <Image
                    src={resolvedAvatarUrl}
                    alt={userName}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[#E36914] text-2xl font-bold text-white">
                    {avatarInitial}
                  </div>
                )}

                {/* Upload spinner */}
                {(isUploadingAvatar || isUpdatingProfile) && (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <Loader2 className="h-6 w-6 animate-spin text-white" />
                  </span>
                )}

                {/* Hover camera edit overlay */}
                {!isUploadingAvatar && !isUpdatingProfile && (
                  <span className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                    <Camera className="h-5 w-5 text-white" />
                    <span className="text-[9px] font-semibold text-white">
                      Edit
                    </span>
                  </span>
                )}
              </button>

              <div className="min-w-0">
                <p className="truncate text-xl font-bold">{userName}</p>

                <p className="mt-1 truncate text-base text-slate-500">
                  {user.primaryEmail}
                </p>

                <span className="mt-2 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-base font-medium text-emerald-700">
                  <ShieldCheck className="h-4 w-4" />
                  {user.status}
                </span>
              </div>
            </div>

            {successMessage && (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-base text-emerald-700">
                <Check className="h-5 w-5 shrink-0" />
                {successMessage}
              </div>
            )}

            {errorMessage && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-base text-red-700">
                {errorMessage}
              </div>
            )}

            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Personal information</h3>

              {!isEditing && (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(true);
                    setErrorMessage("");
                    setSuccessMessage("");
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-base font-medium transition hover:border-[#136C34] hover:text-[#136C34]"
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </button>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-base font-medium">First name</span>

                <div className="relative">
                  <UserRound className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                  <input
                    type="text"
                    value={form.firstName}
                    disabled={!isEditing || isUpdating}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        firstName: event.target.value,
                      }))
                    }
                    className="h-11 w-full rounded-xl border bg-background pl-10 pr-3 text-base outline-none focus:border-[#136C34] focus:ring-2 focus:ring-[#136C34]/20 disabled:bg-slate-50 dark:disabled:bg-slate-900"
                  />
                </div>
              </label>

              <label className="space-y-2">
                <span className="text-base font-medium">Last name</span>

                <div className="relative">
                  <UserRound className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                  <input
                    type="text"
                    value={form.lastName}
                    disabled={!isEditing || isUpdating}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        lastName: event.target.value,
                      }))
                    }
                    className="h-11 w-full rounded-xl border bg-background pl-10 pr-3 text-base outline-none focus:border-[#136C34] focus:ring-2 focus:ring-[#136C34]/20 disabled:bg-slate-50 dark:disabled:bg-slate-900"
                  />
                </div>
              </label>
            </div>

            <label className="block space-y-2">
              <span className="text-base font-medium">Email</span>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                <input
                  type="email"
                  value={user.primaryEmail}
                  disabled
                  className="h-11 w-full rounded-xl border bg-slate-50 pl-10 pr-3 text-base text-slate-500 dark:bg-slate-900"
                />
              </div>
            </label>

            {isEditing && (
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleCancelEditing}
                  disabled={isUpdating}
                  className="rounded-xl border px-5 py-2.5 text-base font-semibold transition hover:bg-slate-50 dark:hover:bg-slate-900"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isUpdating}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#136C34] px-5 py-2.5 text-base font-semibold text-white transition hover:bg-[#0f592b] disabled:opacity-60"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="h-5 w-5" />
                      Save changes
                    </>
                  )}
                </button>
              </div>
            )}

            {/* <div className="rounded-2xl border p-4">
              <h3 className="text-lg font-semibold">Account details</h3>

              <dl className="mt-4 space-y-3 text-base">
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Username</dt>

                  <dd className="break-all text-right font-medium">
                    {user.username}
                  </dd>
                </div>

                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Email verified</dt>

                  <dd className="font-medium">
                    {user.emailVerified ? "Yes" : "No"}
                  </dd>
                </div>

                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Last login</dt>

                  <dd className="text-right font-medium">
                    {formatDate(user.lastLoginAt)}
                  </dd>
                </div>

                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Account created</dt>

                  <dd className="text-right font-medium">
                    {formatDate(user.createdAt)}
                  </dd>
                </div>
              </dl>
            </div> */}

            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center gap-2 text-base font-medium text-slate-600"
            >
              <RefreshCw
                className={`h-5 w-5 ${isFetching ? "animate-spin" : ""}`}
              />
              Refresh profile
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
